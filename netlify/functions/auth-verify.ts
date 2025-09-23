const { Handler } = require('@netlify/functions')
const { verify } = require('@node-rs/argon2')
const jwt = require('jsonwebtoken')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  const sharedHash = process.env.SHARED_WRITE_HASH
  const signingKey = process.env.SESSION_SIGNING_KEY

  if (!sharedHash || !signingKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server not configured' }),
    }
  }

  try {
    const token = event.headers['x-shared-token']
    if (!token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No token provided' }),
      }
    }

    const isValid = await verify(sharedHash, token)
    if (!isValid) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid password' }),
      }
    }

    // Create a session token
    const sessionToken = jwt.sign({ authenticated: true }, signingKey, {
      expiresIn: '8h',
    })

    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': `sf_dam_auth=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=28800; Path=/`,
      },
      body: JSON.stringify({ success: true }),
    }
  } catch (error) {
    console.error('Auth verification error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}