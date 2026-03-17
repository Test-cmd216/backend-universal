const REQUIRED_VARS = [
  'JWT_SECRET',
  'ALLOWED_ORIGINS',
];

export default function validateEnv() {
  const missing = REQUIRED_VARS.filter(k => !process.env[k]);
  if (missing.length) {
    console.error('\n❌  Missing required environment variables:\n');
    missing.forEach(k => console.error(`   • ${k}`));
    console.error('\nCopy .env.example to .env and fill in every value.\n');
    process.exit(1);
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.error('\n❌  JWT_SECRET must be at least 32 characters. Generate one with:');
    console.error("   node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"\n");
    process.exit(1);
  }
}
