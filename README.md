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

## Metadata Fields (All Multi-Value)

All metadata fields support multiple values and are stored reliably in EXIF fields that guarantee array support.

| Field | EXIF Mapping | Format | Purpose |
|-------|-------------|---------|---------|
| `category` | IPTC:Keywords | `category:value` | Image categories (portraits, warehouse, etc.) |
| `person` | IPTC:Keywords | `person:name` | People in the image (Jimmy, Marcus, Sasha) |
| `tags` | IPTC:Keywords | `value` | Descriptive keywords (no prefix) |
| `product` | XMP:HierarchicalSubject | `product\|name` | Product associations |

### Adding Metadata

Use EXIF/XMP keywords with prefixes to organize metadata:

```bash
# Categories with prefix
category:portrait
category:warehouse

# People with prefix
person:Jimmy
person:Marcus

# Regular tags (no prefix)
outdoor
professional
equipment

# Products (hierarchical)
product|laptop
product|camera
```

## Workflow

1. **Upload images** to `/assets/**`
2. **GitHub Action** reads EXIF → builds manifest
3. **Frontend** loads manifest for fast browsing
4. **Edit metadata** via UI (requires password)
5. **Changes embedded** in image files via exiftool
6. **Download variants** generated on-demand

## License

MIT