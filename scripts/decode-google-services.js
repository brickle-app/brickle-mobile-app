#!/usr/bin/env node

/**
 * Decodes GOOGLE_SERVICES_JSON base64 env var into google-services.json
 * Called automatically via "postinstall" script in package.json
 *
 * In development: set GOOGLE_SERVICES_JSON in your .env file (value from `base64 -i google-services.json`)
 * In CI/EAS Build: set as EAS Secret (eas secret:create --scope project --name GOOGLE_SERVICES_JSON)
 */

const fs = require('fs');
const path = require('path');

const base64 = process.env.GOOGLE_SERVICES_JSON;

if (!base64) {
  console.warn(
    '[decode-google-services] WARNING: GOOGLE_SERVICES_JSON env var is not set. ' +
    'Skipping google-services.json generation. Android builds will fail without this file.'
  );
  process.exit(0);
}

try {
  const decoded = Buffer.from(base64, 'base64').toString('utf-8');
  const targetPath = path.resolve(__dirname, '..', 'google-services.json');

  // Validate it's valid JSON
  JSON.parse(decoded);

  fs.writeFileSync(targetPath, decoded, 'utf-8');
  console.log('[decode-google-services] google-services.json written successfully.');
} catch (err) {
  console.error('[decode-google-services] ERROR: Failed to decode GOOGLE_SERVICES_JSON:', err.message);
  process.exit(1);
}