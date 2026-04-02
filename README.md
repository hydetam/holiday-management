# 假期管理系統

## 部署步驟

### 1. 上傳到 GitHub
```bash
git init
git add .
git commit -m "init"
git branch -M main
git remote add origin https://github.com/你的帳號/leave-management.git
git push -u origin main
```

### 2. Firebase Firestore 設定
1. 打開 [Firebase Console](https://console.firebase.google.com)
2. 選擇你的專案 `holiday-management-1a582`
3. 左側選單 → **Firestore Database** → 建立資料庫
4. 選 **Production mode**，地區選 `asia-east1`（台灣最近）
5. 建立完後，點左側 **規則（Rules）**，把規則改成：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
> ⚠️ 這是開放規則，方便使用。若需要安全性，之後可加入 Firebase Authentication。

### 3. 部署到 Vercel
1. 打開 [vercel.com](https://vercel.com)，用 GitHub 帳號登入
2. 點 **Add New → Project**
3. 選你剛剛上傳的 `leave-management` repo
4. Framework Preset 選 **Vite**
5. 點 **Deploy**，等待 1~2 分鐘
6. 完成！Vercel 會給你一個網址，分享給員工即可

## 本地開發
```bash
npm install
npm run dev
```
