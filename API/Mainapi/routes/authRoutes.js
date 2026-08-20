/**
 * Authentication routes — BIP39 admin login only.
 * Mount point: app.use('/api/auth', router)
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bip39 = require('bip39');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

const { issueJwt } = require('../middleware/auth');
const { getPool } = require('../mysqlPool');
const { createRedisRateLimitStore } = require('../utils/redisRateLimitStore');
const { verifyTurnstileFromRequest } = require('../utils/turnstile');
const { readUserData, writeUserData } = require('./sync');

// Rate limiter — 10 tentatives par IP toutes les 15 minutes
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  store: createRedisRateLimitStore({ prefix: 'rate-limit:auth:login:' }),
  passOnStoreError: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
  },
  keyGenerator: (req) => req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for']?.split(',')[0].trim() || ipKeyGenerator(req.ip),
  validate: { xForwardedForHeader: false, ip: false }
});

const frenchWordlist = bip39.wordlists.french;
const DEFAULT_AVATAR = 'https://as2.ftcdn.net/v2/jpg/05/89/93/27/1000_F_589932782_vQAEAZhHnq1QCGu5ikwrYaQD0Mmurm0N.webp';

// === Helpers ===

function normalizeMnemonic(mnemonic) {
  return mnemonic.normalize('NFKD').toLowerCase().trim().replace(/\s+/g, ' ');
}

function validateBip39Mnemonic(mnemonic) {
  return bip39.validateMnemonic(mnemonic, frenchWordlist) || bip39.validateMnemonic(mnemonic);
}

function createBip39UserId(normalizedMnemonic) {
  return crypto.createHash('sha256').update(normalizedMnemonic).digest('hex').substring(0, 16);
}

function buildBip39Profile(userId, username, avatar, existingProfile = null) {
  return {
    id: userId,
    username: (username || existingProfile?.username || `Utilisateur-${userId.substring(0, 8)}`).trim(),
    avatar: avatar || existingProfile?.avatar || DEFAULT_AVATAR,
    provider: 'bip39',
    createdAt: existingProfile?.createdAt || new Date().toISOString(),
  };
}

const generateDeviceFingerprint = (userAgent, ip) =>
  crypto.createHash('sha256')
    .update(`${userAgent}-${ip || 'unknown'}-${Date.now()}`)
    .digest('hex')
    .substring(0, 32);

const encryptDeviceInfo = (deviceInfo) => {
  const algorithm = 'aes-256-cbc';
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(process.env.JWT_SECRET, salt, 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(deviceInfo, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return `${salt.toString('base64')}.${iv.toString('base64')}.${encrypted}`;
};

const createUserSession = async (userType, userId, req) => {
  try {
    const pool = getPool();
    if (!pool) { console.error('MySQL pool not ready for session creation'); return null; }
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress || 'Unknown';
    const sessionId = uuidv4();
    const encryptedDevice = encryptDeviceInfo(generateDeviceFingerprint(userAgent, ip));
    await pool.execute(
      'INSERT INTO user_sessions (id, user_id, user_type, device, user_agent) VALUES (?, ?, ?, ?, ?)',
      [sessionId, userId, userType, encryptedDevice, userAgent]
    );
    return sessionId;
  } catch (error) {
    console.error('Error creating user session:', error);
    return null;
  }
};

async function getOrCreateBip39Account({ mnemonic, username = null, avatar = null, overwriteProfile = false }) {
  const normalizedMnemonic = normalizeMnemonic(mnemonic);
  if (!validateBip39Mnemonic(normalizedMnemonic)) {
    return { success: false, error: 'Phrase secrète invalide' };
  }
  const userId = createBip39UserId(normalizedMnemonic);
  const userData = await readUserData('bip39', userId) || {};
  let existingProfile = null;
  if (userData.auth) {
    try { existingProfile = JSON.parse(userData.auth)?.userProfile || null; } catch { /* ignore */ }
  }
  const userProfile = buildBip39Profile(userId, username, avatar, existingProfile);
  if (overwriteProfile || !existingProfile) {
    userData.auth = JSON.stringify({ userProfile, provider: 'bip39' });
    userData.bip39_auth = 'true';
    userData.lastUpdated = Date.now();
    await writeUserData('bip39', userId, userData);
  }
  return { success: true, normalizedMnemonic, userId, userProfile };
}

// === Routes ===

// GET /bip39/generate
router.get('/bip39/generate', (req, res) => {
  try {
    const mnemonic = bip39.generateMnemonic(128, undefined, frenchWordlist);
    res.status(200).json({ success: true, mnemonic });
  } catch (error) {
    console.error('Error generating mnemonic:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la génération de la phrase secrète' });
  }
});

// POST /bip39/create — create admin account (manual, one-time)
router.post('/bip39/create', authRateLimit, async (req, res) => {
  try {
    const { mnemonic, username, avatar, turnstileToken } = req.body;
    if (!mnemonic || !username) {
      return res.status(400).json({ success: false, error: 'Phrase secrète et nom d\'utilisateur requis' });
    }
    const turnstileResult = await verifyTurnstileFromRequest(req, turnstileToken);
    if (!turnstileResult.valid) {
      return res.status(turnstileResult.status).json({ success: false, error: turnstileResult.error });
    }
    const account = await getOrCreateBip39Account({ mnemonic, username, avatar, overwriteProfile: true });
    if (!account.success) {
      return res.status(400).json({ success: false, error: account.error });
    }
    const sessionId = await createUserSession('bip39', account.userId, req);
    const token = issueJwt('bip39', account.userId, sessionId, 'bip39');
    return res.status(200).json({
      success: true,
      token,
      sessionId,
      userId: account.userId,
      userProfile: account.userProfile,
      authData: { userProfile: account.userProfile, provider: 'bip39' },
      account: { userType: 'bip39', userId: account.userId },
      message: 'Compte créé avec succès',
    });
  } catch (error) {
    console.error('Error creating BIP39 account:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la création du compte' });
  }
});

// POST /bip39/login
router.post('/bip39/login', authRateLimit, async (req, res) => {
  try {
    const { mnemonic, turnstileToken } = req.body;
    if (!mnemonic) {
      return res.status(400).json({ success: false, error: 'Phrase secrète requise' });
    }
    const turnstileResult = await verifyTurnstileFromRequest(req, turnstileToken);
    if (!turnstileResult.valid) {
      return res.status(turnstileResult.status).json({ success: false, error: turnstileResult.error });
    }
    const account = await getOrCreateBip39Account({ mnemonic });
    if (!account.success) {
      return res.status(400).json({ success: false, error: account.error });
    }
    const sessionId = await createUserSession('bip39', account.userId, req);
    const token = issueJwt('bip39', account.userId, sessionId, 'bip39');
    return res.status(200).json({
      success: true,
      token,
      sessionId,
      userId: account.userId,
      userProfile: account.userProfile,
      authData: { userProfile: account.userProfile, provider: 'bip39' },
      account: { userType: 'bip39', userId: account.userId },
      message: 'Connexion réussie',
    });
  } catch (error) {
    console.error('Error logging in with BIP39:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la connexion' });
  }
});

module.exports = router;
