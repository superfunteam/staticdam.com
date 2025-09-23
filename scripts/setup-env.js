#!/usr/bin/env node

import crypto from 'crypto';
import { hash } from '@node-rs/argon2';

async function generateEnvVars() {
  console.log('🔐 Generating environment variables...\n');

  // Generate a secure random password
  const password = crypto.randomBytes(16).toString('base64').replace(/[=+/]/g, '').substring(0, 16);
  console.log('📝 Generated Admin Password (SAVE THIS!):', password);
  console.log('   Use this password to login to the admin interface\n');

  // Generate Argon2 hash
  const passwordHash = await hash(password, {
    memoryCost: 65536,
    timeCost: 3,
    outputLen: 32,
    parallelism: 4,
  });
  console.log('🔒 Password Hash Generated\n');

  // Generate session signing key
  const signingKey = crypto.randomBytes(32).toString('base64');
  console.log('🔑 Session Signing Key Generated\n');

  // Return the environment variables
  return {
    SHARED_WRITE_HASH: passwordHash,
    SESSION_SIGNING_KEY: signingKey,
    REPO_OWNER: 'superfunteam',
    REPO_NAME: 'staticdam.com',
    DEFAULT_BRANCH: 'main',
    PUBLIC_BASE_URL: 'https://staticdam.netlify.app',
  };
}

async function main() {
  try {
    const envVars = await generateEnvVars();

    console.log('📋 Environment Variables to Set:\n');
    console.log('----------------------------------------');

    for (const [key, value] of Object.entries(envVars)) {
      console.log(`${key}="${value}"`);
    }

    console.log('----------------------------------------\n');
    console.log('📌 Next Steps:');
    console.log('1. Create a GitHub App at: https://github.com/settings/apps/new');
    console.log('2. Set the following permissions:');
    console.log('   - Repository permissions:');
    console.log('     • Contents: Read & Write');
    console.log('     • Actions: Write');
    console.log('   - Where can this GitHub App be installed: Only on this account');
    console.log('3. After creating, install it on the superfunteam/staticdam.com repo');
    console.log('4. Note down the App ID and Installation ID');
    console.log('5. Generate a private key and download it');
    console.log('\n✅ Script complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();