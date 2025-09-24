const { verify } = require('@node-rs/argon2')
const jwt = require('jsonwebtoken')
const { App } = require('@octokit/app')

// Type definition for payload structure
// edits: Array of objects with path and optional metadata fields
// mode: 'merge' or 'replace' for handling existing metadata

const validateAuth = async (event) => {
  const sharedHash = process.env.SHARED_WRITE_HASH
  const signingKey = process.env.SESSION_SIGNING_KEY

  if (!sharedHash || !signingKey) {
    console.error('Auth not configured')
    return false
  }

  const token = event.headers['x-shared-token']
  if (token) {
    try {
      return await verify(sharedHash, token)
    } catch {
      return false
    }
  }

  const cookies = event.headers.cookie?.split(';').map(c => c.trim()) || []
  const authCookie = cookies.find(c => c.startsWith('sf_dam_auth='))
  if (authCookie) {
    try {
      const cookieValue = authCookie.split('=')[1]
      jwt.verify(cookieValue, signingKey)
      return true
    } catch {
      return false
    }
  }

  return false
}

const triggerGitHubAction = async (payload) => {
  if (!process.env.GITHUB_APP_ID || !process.env.GITHUB_INSTALLATION_ID || !process.env.GITHUB_PRIVATE_KEY) {
    console.error('Missing GitHub App credentials')
    throw new Error('GitHub App not configured')
  }

  const app = new App({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_PRIVATE_KEY!,
  })

  const octokit = await app.getInstallationOctokit(
    parseInt(process.env.GITHUB_INSTALLATION_ID!)
  )

  await octokit.rest.repos.createDispatchEvent({
    owner: process.env.REPO_OWNER!,
    repo: process.env.REPO_NAME!,
    event_type: 'embed_metadata',
    client_payload: {
      ...payload,
      message: `feat(meta): update metadata for ${payload.edits.length} image(s)`,
    },
  })
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  const authorized = await validateAuth(event)
  if (!authorized) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    }
  }

  try {
    const payload = JSON.parse(event.body || '{}')

    if (!payload.edits || !Array.isArray(payload.edits)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid payload' }),
      }
    }

    for (const edit of payload.edits) {
      if (!edit.path?.startsWith('assets/')) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid path' }),
        }
      }
    }

    await triggerGitHubAction(payload)

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    }
  } catch (error) {
    console.error('Edit metadata error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        details: errorMessage
      }),
    }
  }
}