/**
 * sync.js — utility exports only (HTTP sync routes removed).
 * Provides readUserData / writeUserData used by authRoutes.js and admin.js.
 */

const path = require('path');
const fsp = require('fs').promises;

const { safeWriteJsonFile } = require('../utils/safeFile');
const {
  SyncPolicyError,
  assertUserDataSize,
  getUserDataFilePath,
  getProfileFilePath,
} = require('../utils/syncPolicy');

// === Data directories ===
const USER_DATA_DIR = path.join(__dirname, '..', 'data');
const GUESTS_DIR = path.join(USER_DATA_DIR, 'guests');
const USERS_DIR = path.join(USER_DATA_DIR, 'users');

// Ensure directories exist
(async () => {
  for (const dir of [USER_DATA_DIR, GUESTS_DIR, USERS_DIR]) {
    try {
      await fsp.access(dir);
    } catch {
      await fsp.mkdir(dir, { recursive: true });
    }
  }
})();

function normalizeStoredProfiles(data) {
  if (data.profiles && Array.isArray(data.profiles)) {
    data.profiles.forEach((profile) => {
      if (profile.avatar && !profile.avatar.startsWith('/avatars/') && profile.avatar !== '') {
        profile.avatar = '/avatars/disney/disney_avatar_1.png';
      }
    });
  }
  return data;
}

async function readUserData(userType, userId) {
  const filePath = getUserDataFilePath({ usersDir: USERS_DIR, guestsDir: GUESTS_DIR }, userType, userId);
  try {
    const fileContent = await fsp.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    return normalizeStoredProfiles(data && typeof data === 'object' ? data : {});
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    console.error(`Erreur lecture données ${userType}:${userId}:`, error.message);
    return {};
  }
}

async function writeUserData(userType, userId, data) {
  try {
    const filePath = getUserDataFilePath({ usersDir: USERS_DIR, guestsDir: GUESTS_DIR }, userType, userId);
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new SyncPolicyError('Données utilisateur invalides', 400, 'INVALID_USER_DATA');
    }
    assertUserDataSize(data);
    const success = await safeWriteJsonFile(filePath, data);
    if (!success) {
      console.error(`Erreur sauvegarde atomique ${userType}:${userId}`);
    }
    return success;
  } catch (error) {
    console.error(`Erreur sauvegarde ${userType}:${userId}:`, error.message);
    return false;
  }
}

async function readProfileData(userType, userId, profileId) {
  const profilePath = getProfileFilePath(USERS_DIR, userType, userId, profileId);
  try {
    const fileContent = await fsp.readFile(profilePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    console.error(`Erreur lecture profil ${userType}:${userId}:${profileId}:`, error.message);
    return {};
  }
}

async function writeProfileData(userType, userId, profileId, data) {
  try {
    const profilePath = getProfileFilePath(USERS_DIR, userType, userId, profileId);
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new SyncPolicyError('Données de profil invalides', 400, 'INVALID_PROFILE_DATA');
    }
    return await safeWriteJsonFile(profilePath, data);
  } catch (error) {
    console.error(`Erreur sauvegarde profil ${profileId}:`, error.message);
    return false;
  }
}

// No-op stubs for graceful-shutdown hooks (used by server.js if referenced)
const isShuttingDown = () => false;
const startOperation = () => {};
const endOperation = () => {};
const waitForOperations = async () => {};

module.exports = {
  readUserData,
  writeUserData,
  readProfileData,
  writeProfileData,
  isShuttingDown,
  startOperation,
  endOperation,
  waitForOperations,
  USERS_DIR,
};
