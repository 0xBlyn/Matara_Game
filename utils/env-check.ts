export function checkEnvironment() {
  // Skip checks in development
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  const required = [
    'DATABASE_URL',
    'TELEGRAM_BOT_TOKEN',
    'NEXT_PUBLIC_BYPASS_TELEGRAM_AUTH'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}
