# Setup Credentials

## ✅ Environment Variables Set in Netlify

The following have been configured:
- `SHARED_WRITE_HASH` - Password hash for authentication
- `SESSION_SIGNING_KEY` - JWT signing key
- `REPO_OWNER` - superfunteam
- `REPO_NAME` - staticdam.com
- `DEFAULT_BRANCH` - main
- `PUBLIC_BASE_URL` - https://staticdam.netlify.app

## 🔑 Your Admin Password

**IMPORTANT: Save this password! It's the only way to edit metadata.**

```
ULujUXgRpwpi9wMh
```

Use this password when logging in to the Admin interface at `/admin`

## 🚨 GitHub App Setup Required

You still need to create a GitHub App to enable metadata editing. Here's how:

### Step 1: Create GitHub App

1. Go to: https://github.com/settings/apps/new
2. Fill in:
   - **GitHub App name**: StaticDAM Bot (or any unique name)
   - **Homepage URL**: https://staticdam.netlify.app
   - **Webhook**: Uncheck "Active"

3. Set Permissions:
   - **Repository permissions**:
     - Contents: Read & Write
     - Actions: Write
   - **Where can this GitHub App be installed**: Only on this account

4. Click "Create GitHub App"

### Step 2: Install the App

1. After creating, you'll see your App's page
2. Note down the **App ID** (shown at the top)
3. Click "Install App" in the sidebar
4. Select "Only select repositories"
5. Choose `superfunteam/staticdam.com`
6. Click Install
7. After installation, look at the URL - it will be like:
   `https://github.com/settings/installations/12345678`
   The number at the end is your **Installation ID**

### Step 3: Generate Private Key

1. Go back to your App settings
2. Scroll to "Private keys"
3. Click "Generate a private key"
4. A `.pem` file will download

### Step 4: Add to Netlify

Run these commands with your values:

```bash
# Set your App ID (example: 123456)
netlify env:set GITHUB_APP_ID 'YOUR_APP_ID'

# Set your Installation ID (example: 45678901)
netlify env:set GITHUB_INSTALLATION_ID 'YOUR_INSTALLATION_ID'

# Set your private key (copy the entire contents of the .pem file)
netlify env:set GITHUB_PRIVATE_KEY 'PASTE_YOUR_PRIVATE_KEY_HERE'
```

**Tip for private key**: You can use this command to set it:
```bash
netlify env:set GITHUB_PRIVATE_KEY "$(cat ~/Downloads/your-app-name.*.private-key.pem)"
```

### Step 5: Trigger Deploy

After setting all variables:

```bash
netlify deploy --build --prod
```

## Testing

1. Visit https://staticdam.netlify.app
2. Go to `/admin`
3. Enter password: `ULujUXgRpwpi9wMh`
4. Try the "Trigger Reindex" button

If everything is set up correctly, it should trigger a GitHub Action to rebuild the manifest!