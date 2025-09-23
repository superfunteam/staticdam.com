# Static DAM

A Git-native Digital Asset Management system with EXIF-only metadata storage.

## Features

- **Git-native**: All images and metadata stored in Git
- **EXIF-embedded metadata**: All taxonomy lives inside image files (portable)
- **Static site**: Fast React frontend with Vite + Tailwind + ShadCN
- **On-demand exports**: Dynamic resize/transcode without repo bloat
- **Simple auth**: Single shared password for write access
- **Public gallery**: Read access is fully public

## Architecture

```
GitHub Repo → Netlify Deploy
├─ /assets/**        # Original images with embedded metadata
├─ /data/manifest    # Generated index (cache)
├─ /site             # React frontend
└─ /netlify/functions # API endpoints
```

## Setup

### 1. Environment Variables (Netlify)

```bash
SHARED_WRITE_HASH=         # Argon2 hash of shared password
SESSION_SIGNING_KEY=       # Random 32+ byte key
GITHUB_APP_ID=            # GitHub App ID
GITHUB_INSTALLATION_ID=   # GitHub App Installation ID
GITHUB_PRIVATE_KEY=       # GitHub App private key
REPO_OWNER=              # GitHub username/org
REPO_NAME=               # Repository name
PUBLIC_BASE_URL=         # Deployed site URL
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Development

```bash
pnpm dev
```

## Editable Metadata Fields

| Field | EXIF/XMP Mapping | Purpose |
|-------|-----------------|---------|
| `category` | XMP-photoshop:Category | Single category label |
| `tags` | XMP-dc:subject, IPTC:Keywords | Multi-value tags |
| `subject` | XMP-photoshop:Headline | Short subject line |
| `product` | XMP:HierarchicalSubject | Product association |

## Workflow

1. **Upload images** to `/assets/**`
2. **GitHub Action** reads EXIF → builds manifest
3. **Frontend** loads manifest for fast browsing
4. **Edit metadata** via UI (requires password)
5. **Changes embedded** in image files via exiftool
6. **Download variants** generated on-demand

## License

MIT