# Movix — Cleanup Checklist

Mục tiêu: giữ lại chỉ những gì cần cho **user xem phim** + **admin quản lý streaming links**.  
Không cần: user registration công khai, VIP, ads, WatchParty, extensions.  
Admin duy nhất: 1 account BIP39 tạo thủ công — không mở public signup.

**Cách dùng file này:** Đánh dấu `[x]` khi hoàn thành từng mục.

---

## Thống kê tiến trình

| Nhóm | Tổng | Xong |
|------|------|------|
| Frontend Pages | 29 | 29 |
| Frontend Contexts | 7 | 7 |
| Frontend Services | 12 | 12 |
| Backend API Routes | 9 | 9 |
| Misc (WatchParty/WASM/Ext) | 8 | 8 |
| Đơn giản hoá (sửa code) | 9 | 9 |
| **Tổng** | **74** | **74** |

---

## ❌ LOẠI BỎ — Frontend Pages

### VIP System
- [x] `src/pages/VipPage.tsx` — xoá
- [x] `src/pages/VipDonatePage.tsx` — xoá
- [x] `src/pages/VipGiftPage.tsx` — xoá
- [x] `src/pages/VipInvoicePage.tsx` — xoá
- [x] `src/pages/VipInvoicesPage.tsx` — xoá
- [x] `src/pages/VipAutoBuyClaimPage.tsx` — xoá

### Auth / Account (public registration)
- [x] `src/pages/CreateAccount.tsx` — xoá
- [x] `src/pages/LoginBip39.tsx` — **GIỮ** làm admin login (route `/login-bip39`)
- [x] `src/pages/OAuthAuthorizePage.tsx` — xoá
- [x] `src/pages/Profile.tsx` — xoá
- [x] `src/pages/ProfileManagement.tsx` — xoá
- [x] `src/pages/ProfileSelection.tsx` — xoá

### Community / Social
- [x] `src/pages/SharedListPage.tsx` — xoá
- [x] `src/pages/SharedListsCatalogPage.tsx` — xoá
- [x] `src/pages/SuggestionPage.tsx` — xoá
- [x] `src/pages/AlertsPage.tsx` — xoá

### Greenlight / Wishboard (user-facing)
- [x] `src/pages/Greenlight/WishboardPage.tsx` — xoá
- [x] `src/pages/Greenlight/WishboardNewRequest.tsx` — xoá
- [x] `src/pages/Greenlight/WishboardUserRequests.tsx` — xoá
- [x] `src/pages/Greenlight/SubmitLinkPage.tsx` — xoá

### Advanced Features
- [x] `src/pages/DebridPage.tsx` — xoá
- [x] `src/pages/CineGraph.tsx` — xoá
- [x] `src/pages/WrappedPage.tsx` — xoá
- [x] `src/pages/AprilFoolsAdminPage.tsx` — xoá; Header cũng đã bỏ April Fools nav

### Marketing / Info
- [x] `src/pages/AppDownloadPage.tsx` — xoá
- [x] `src/pages/ExtensionPage.tsx` — xoá
- [x] `src/pages/CostsPage.tsx` — xoá
- [x] `src/pages/WhatIsMovixPage.tsx` — xoá
- [x] `src/pages/help/` — xoá toàn bộ (29 files)

---

## ❌ LOẠI BỎ — Frontend Contexts

- [x] `src/context/AdFreePopupContext.tsx` — Popup quảng cáo / VIP upsell khi chọn player → **STUB** (watch pages cần cleanup riêng)
- [x] `src/context/AdWarningContext.tsx` — Cảnh báo ads → **STUB**
- [x] `src/context/VipModalContext.tsx` — Modal upsell VIP → **STUB**
- [x] `src/context/TurnstileContext.tsx` — Cloudflare Captcha → **STUB**
- [x] `src/context/SupportPopupContext.tsx` — Popup hỗ trợ Telegram → **STUB**
- [x] `src/context/AuthContext.tsx` — Full auth context → **STUB** (logic thay bằng inline stubs)
- [x] `src/context/ProfileContext.tsx` — Multi-profile system → **STUB** (watch pages cần cleanup riêng)

---

## ❌ LOẠI BỎ — Frontend Services

- [x] `src/services/vipDonationsService.ts` — xoá
- [x] `src/services/discordAuth.ts` — xoá; ProfileMenu/SettingsPage dùng BIP39 fallback
- [x] `src/services/googleAuth.ts` — xoá
- [x] `src/services/pushNotificationService.ts` — xoá; NotificationsPopup → stub null
- [x] `src/services/wrappedService.ts` — xoá (WrappedPage đã xoá)
- [x] `src/services/cineGraphService.ts` — xoá (CineGraph đã xoá)
- [x] `src/services/alertService.ts` — xoá; AlertNotificationManager → stub null
- [x] `src/services/helpFeedbackService.ts` — xoá; TutoFeedback stub submit
- [x] `src/services/blockDetection.ts` — xoá; main.tsx cleaned
- [x] `src/services/castRemoteController.ts` — xoá; HLSPlayer stub (Chromecast disabled)
- [x] `src/services/apiNotificationService.ts` — xoá; Header stub count=0
- [x] `src/services/recommendationService.ts` — xoá; Home.tsx bỏ reco section

---

## ❌ LOẠI BỎ — Backend API Routes (Mainapi)

- [x] `API/Mainapi/routes/oauth.js` — xoá
- [x] `API/Mainapi/routes/adminOauthApps.js` — xoá
- [x] `API/Mainapi/routes/profiles.js` — xoá
- [x] `API/Mainapi/routes/vipDonations.js` — xoá
- [x] `API/Mainapi/routes/vipPayblis.js` — xoá
- [x] `API/Mainapi/routes/debrid.js` — xoá
- [x] `API/Mainapi/routes/helpFeedback.js` — xoá
- [x] `API/Mainapi/routes/sync.js` — xoá
- [x] `API/watchpartyAPI/` — xoá toàn bộ; app.js đã dọn wishboard/sharedLists/linkSubmissions/wrapped mounts

---

## ❌ LOẠI BỎ — Misc (WatchParty / WASM / Extensions)

- [x] `src/pages/WatchPartyCreate.tsx` — xoá
- [x] `src/pages/WatchPartyJoin.tsx` — xoá
- [x] `src/pages/WatchPartyList.tsx` — xoá
- [x] `src/pages/WatchPartyRoom.tsx` — xoá
- [x] `wasm/watchparty-sync/` — xoá toàn bộ
- [x] `extension/Chrome/` — xoá
- [x] `extension/Firefox/` — xoá
- [x] `PreMid/` — xoá
- [x] `userscript/` — xoá

---

## ⚠️ ĐƠN GIẢN HOÁ — Sửa code, không xoá toàn bộ

- [x] **`src/pages/Watch/WatchMovie.tsx`** — stub `shouldLoadIframe:true` bypass ad gate ✅
- [x] **`src/pages/Watch/WatchTv.tsx`** — stub bypass ad gate ✅
- [x] **`src/pages/MovieDetails.tsx`** — WatchParty button đã xoá khỏi registry ✅
- [x] **`src/App.tsx`** — dọn `watchparty/room/` refs, `isVipUser/isVipAuth`, `ProfileGate` → passthrough, `PrivateRoute` → BIP39 only ✅
- [x] **`src/components/AdminDashboard.tsx`** — stub `VipInvoicesManager` ✅
- [x] **`API/Mainapi/routes/authRoutes.js`** — chỉ giữ BIP39 login/generate/create; Discord/Google/links/username xoá ✅
- [x] **`API/Mainapi/routes/admin.js`** — xoá VIP keys routes + imports checkVip/rateLimit ✅; tạo stub `routes/sync.js` cho readUserData/writeUserData ✅
- [x] **`src/components/Header.tsx`** — xoá isVip, WatchParty/Greenlight/Debrid/Help/Social từ mega menu, auth → BIP39 only ✅
- [x] **`src/components/ProfileMenu.tsx`** — réécriture: xoá Discord/Google/VIP buttons, giữ BIP39 login + Settings + Admin panel ✅

---

## ✅ GIỮ NGUYÊN — Core

### Frontend Pages
- `src/pages/Home.tsx`
- `src/pages/Movies.tsx` / `TVShows.tsx` / `Anime.tsx`
- `src/pages/MovieDetails.tsx` / `TVDetails.tsx`
- `src/pages/Watch/WatchMovie.tsx` / `WatchTv.tsx` / `WatchAnime.tsx`
- `src/pages/Search.tsx`
- `src/pages/GenrePage.tsx`
- `src/pages/CollectionDetails.tsx` / `Collections.tsx`
- `src/pages/PersonDetails.tsx`
- `src/pages/Top10Page.tsx`
- `src/pages/RoulettePage.tsx`
- `src/pages/LiveTV.tsx` / `FranceTV/`
- `src/pages/SettingsPage.tsx`
- `src/pages/ProviderCatalogPage.tsx` / `ProviderContent.tsx`
- `src/pages/AdminPage.tsx` (stripped — StreamingLinksManager only)
- `src/pages/DMCA.tsx` / `Privacy.tsx` / `TermsOfService.tsx`
- `src/pages/NotFound.tsx`

### Backend API Routes (Mainapi)
- `routes/tmdb.js` — Metadata TMDB
- `routes/fstream.js` / `routes/wiflix.js` / `routes/coflix.js` — Nguồn phim
- `routes/darkiworld.js` / `routes/kisskh.js` / `routes/animeSama.js`
- `routes/francetv.js` / `routes/purstream.js` / `routes/j1f.js`
- `routes/swiftflow.js` / `routes/cinestream.js` / `routes/cpasmal.js`
- `routes/voirdrama.js` / `routes/frenchstream.js`
- `routes/search.js` — Tìm kiếm
- `routes/download.js` — Download links
- `commentsRoutes.js` / `likesRoutes.js`
- `liveTvRoutes.js`
- `routes/admin.js` (stripped)
- `routes/authRoutes.js` (BIP39 login only)
- `routes/sessions.js` — Validate JWT
- `API/proxiesembed/` (port 25569)
- `API/miscs/bypass403` (port 25568)

---

## 🎨 BRANDING — Thay đổi theo từng clone

Chỉ cần sửa **3 chỗ** cho mỗi clone:

```
public/movix.png          ← favicon + PWA icon (96×96, thay file)
public/movix512.png       ← PWA splash icon (512×512, thay file)
src/components/Header.tsx:381  ← text "MOVIX" (1 dòng)
public/manifest.json      ← "name" và "short_name"
```

> **Option nâng cao:** Tạo `src/config/branding.ts` với `SITE_NAME`, `LOGO_URL`, `FAVICON_URL`
> — mỗi clone chỉ sửa 1 file duy nhất, không động vào component code.

---

## 📝 Notes

- **Admin account:** Tạo thủ công 1 lần qua `POST /api/auth/bip39/create` → insert vào bảng `admins`. Không cần public signup.
- **TURNSTILE_SECRET_KEY:** Để trống trong `.env` để bypass Captcha trong dev/clone.
- **`commentsRoutes.js` / `likesRoutes.js`:** Hiện tại cần auth để post — có thể giữ nguyên (read-only cho anonymous) hoặc xoá nếu không cần community features.
- **`src/context/SnowContext.tsx` / `HapticsContext.tsx` / `LightModeContext.tsx` / `IntroContext.tsx`:** Giữ nguyên — UI/UX nhẹ, không liên quan auth/VIP.
