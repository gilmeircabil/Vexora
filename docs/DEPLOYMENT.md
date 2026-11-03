# Vexora Production Deployment Guide

**Cloudflare Pages (Frontend) + Render (Backend) + Cloudflare R2 (Storage) + MongoDB Atlas**

This guide provides the complete, production-tested walkthrough to deploy Vexora for **$0/month** using modern cloud architecture.

---

## Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │              User Browser              │
                      └──────────────────┬─────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
      ┌─────────────────────┐                         ┌─────────────────────┐
      │  Cloudflare Pages   │                         │  Render Web Service │
      │  (Frontend React)   │ ──── /api/* Proxy ────▶ │  (Node.js / Express)│
      │   Global Edge CDN   │                         │ Sharp Image Engine  │
      └─────────────────────┘                         └──────────┬──────────┘
                                                                 │
                                         ┌───────────────────────┴───────────────────────┐
                                         ▼                                               ▼
                              ┌─────────────────────┐                         ┌─────────────────────┐
                              │    Cloudflare R2    │                         │    MongoDB Atlas    │
                              │ (10GB Asset Storage)│                         │   (Cloud Database)  │
                              └─────────────────────┘                         └─────────────────────┘
```

---

## Phase 1: Cloud Database (MongoDB Atlas)

1. Sign up or log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Cluster** (Shared, $0/month).
3. Under **Security → Database Access**:
   - Add a new database user with password authentication (e.g., username `vexora_admin`).
4. Under **Security → Network Access**:
   - Add IP Address `0.0.0.0/0` (Allows cloud providers like Render to connect).
5. Under **Database → Connect → Drivers**:
   - Copy your connection string:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/vexoramods?retryWrites=true&w=majority
     ```

---

## Phase 2: Cloudflare Services (R2 & Turnstile)

Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/):

### A. Cloudflare R2 (10 GB Free Storage)

1. In the sidebar, go to **R2 Object Storage** → **Create bucket**.
2. Name your bucket: `vexora-assets` (Location: **Automatic**) → Click **Create Bucket**.
3. Under Account Details, copy your **Account ID**. Your endpoint is:
   `https://<account_id>.r2.cloudflarestorage.com`
4. Go to **Manage R2 API Tokens** → **Create API Token**:
   - Permissions: **Object Read & Write**
   - Bucket: `vexora-assets`
   - Copy **Access Key ID** (`S3_ACCESS_KEY`) and **Secret Access Key** (`S3_SECRET_KEY`).

### B. Cloudflare Turnstile (Free Bot Protection)

1. In the sidebar, go to **Turnstile** → **Add widget manually**.
2. Widget Name: `Vexora`
3. Domains:
   - `localhost`
   - `127.0.0.1`
   - `onrender.com`
   - `pages.dev`
4. Widget Mode: **Managed (Recommended)** → Click **Create**.
5. Copy your **Site Key** (`TURNSTILE_SITE_KEY`) and **Secret Key** (`TURNSTILE_SECRET_KEY`).

---

## Phase 3: Backend Deployment (Render Web Service)

1. Go to [dashboard.render.com](https://dashboard.render.com) and click **New +** → **Web Service**.
2. Connect your GitHub repository (`Vexora`).
3. Fill in the settings:
   - **Name:** `vexora-backend` _(or your preferred name)_
   - **Region:** Choose closest to your users (e.g., Singapore, Frankfurt, Oregon)
   - **Branch:** `main`
   - **Root Directory:** _(leave blank)_
   - **Runtime:** `Node`
   - **Build Command:**
     ```bash
     npm install && npm run build:server
     ```
   - **Start Command:**
     ```bash
     npm run start:server
     ```
   - **Instance Type:** `Free`

4. Add **Environment Variables**:

   | Variable               | Value                                           | Notes                                    |
   | :--------------------- | :---------------------------------------------- | :--------------------------------------- |
   | `NODE_ENV`             | `production`                                    | Enables production hardening             |
   | `PORT`                 | `10000`                                         | Render standard port                     |
   | `MONGODB_URI`          | `mongodb+srv://...`                             | From Atlas Phase 1                       |
   | `JWT_SECRET`           | _(Random 32+ character string)_                 | Sign access tokens                       |
   | `JWT_REFRESH_SECRET`   | _(Random 32+ character string)_                 | Sign refresh tokens                      |
   | `CLIENT_URL`           | `https://vexora.pages.dev`                      | Your Cloudflare Pages URL (from Phase 4) |
   | `APP_URL`              | `https://vexora.pages.dev`                      | App URL                                  |
   | `STORAGE_PROVIDER`     | `s3`                                            | Uses Cloudflare R2                       |
   | `STORAGE_MAX_GB`       | `9.5`                                           | Safety stop below 10 GB limit            |
   | `S3_BUCKET`            | `vexora-assets`                                 | R2 bucket name                           |
   | `S3_ENDPOINT`          | `https://<account_id>.r2.cloudflarestorage.com` | R2 endpoint URL                          |
   | `S3_REGION`            | `auto`                                          | Cloudflare auto region                   |
   | `S3_ACCESS_KEY`        | _(Your R2 Access Key)_                          | From Phase 2A                            |
   | `S3_SECRET_KEY`        | _(Your R2 Secret Key)_                          | From Phase 2A                            |
   | `TURNSTILE_SITE_KEY`   | _(Your Turnstile Site Key)_                     | From Phase 2B                            |
   | `TURNSTILE_SECRET_KEY` | _(Your Turnstile Secret Key)_                   | From Phase 2B                            |
   | `GEMINI_API_KEY`       | _(Optional free AI key)_                        | From Google AI Studio                    |
   | `GROQ_API_KEY`         | _(Optional free AI key)_                        | From Groq Console                        |

5. Click **Create Web Service**. Wait 2–3 minutes for deployment to finish.
6. Copy your assigned Render backend URL (e.g., `https://vexora-backend.onrender.com`).

---

## Phase 4: Frontend Deployment (Cloudflare Pages)

1. Open your local `client/public/_redirects` file and add the proxy rule pointing to your Render backend URL:

   ```
   /api/* https://vexora-backend.onrender.com/api/:splat 200
   /* /index.html 200
   ```

   _(Commit and push this change to GitHub)_:

   ```bash
   git add client/public/_redirects
   git commit -m "chore: configure cloudflare pages api proxy and spa routing"
   git push origin main
   ```

2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → In sidebar, click **Workers & Pages**.
3. Click **Create Application** → Select **Pages** tab → Click **Connect to Git**.
4. Select your GitHub repository (`Vexora`).
5. Fill in the build settings:
   - **Project Name:** `vexora` _(assigns `vexora.pages.dev`)_
   - **Production branch:** `main`
   - **Framework preset:** `None` (or `Vite`)
   - **Build command:**
     ```bash
     npm install && npm run build:client
     ```
   - **Build output directory:** `client/dist`
   - **Root directory:** _(leave blank)_

6. Click **Save and Deploy**. Cloudflare will build and publish your frontend to a global edge URL (e.g. `https://vexora.pages.dev`).

---

## Phase 5: Final Handshake

1. Go back to **Render** → Your `vexora-backend` service → **Environment**.
2. Make sure `CLIENT_URL` and `APP_URL` match your exact Cloudflare Pages URL:
   ```env
   CLIENT_URL=https://vexora.pages.dev
   APP_URL=https://vexora.pages.dev
   ```
3. Save changes (Render will quickly redeploy).

---

## Phase 6: Production Verification Checklist

- [ ] **SPA Routing:** Visit `https://vexora.pages.dev/tools/image-converter` and refresh the page (verifies `/* /index.html 200` rewrite prevents 404s).
- [ ] **Bot Defense:** Visit the Registration page and verify the Cloudflare Turnstile checkbox loads cleanly.
- [ ] **API Authentication:** Register a new user account (verifies frontend → Cloudflare proxy → Render API → MongoDB).
- [ ] **Cloud Storage Upload:** Upload an avatar in user settings or an image in Design Studio (verifies Cloudflare R2 upload and Sharp thumbnail generation).
- [ ] **Safety Cap:** The backend automatically rejects uploads if total assets near 9.5 GB, keeping your deployment completely free.
