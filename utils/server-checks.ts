import crypto from 'crypto';

interface ValidatedData {
  [key: string]: string;
}

interface User {
  id?: string;
  username?: string;
}

export function validateTelegramWebAppData(telegramInitData: string): { validatedData: ValidatedData | null, user: User } {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const BYPASS_AUTH = process.env.BYPASS_TELEGRAM_AUTH === 'true';

  console.log("Validating Telegram data:");
  console.log("BOT_TOKEN exists:", !!BOT_TOKEN);
  console.log("BYPASS_AUTH:", BYPASS_AUTH);
  console.log("telegramInitData:", telegramInitData);

  let validatedData: ValidatedData | null = null;
  let user: User = {};

  if (BYPASS_AUTH) {
    validatedData = { temp: '' };
    user = { id: 'undefined', username: 'Unknown User' }
  } else {
    try {
      const initData = new URLSearchParams(telegramInitData);
      const hash = initData.get('hash');
      
      if (!hash) {
        console.error('No hash found in initData');
        return { validatedData: null, user: {} };
      }

      initData.delete('hash');
      
      const sortedParams = Array.from(initData).sort((a, b) => a[0].localeCompare(b[0]));
      let dataCheckString = sortedParams.map(([key, value]) => `${key}=${value}`).join('\n');

      if (!BOT_TOKEN) {
        console.error('BOT_TOKEN is not set');
        return { validatedData: null, user: {} };
      }

      const secret = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
      const calculatedHash = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');

      console.log('Calculated hash:', calculatedHash);
      console.log('Received hash:', hash);

      if (calculatedHash === hash) {
        validatedData = Object.fromEntries(sortedParams);
        const userString = validatedData['user'];
        if (userString) {
          try {
            user = JSON.parse(userString);
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
        }
      } else {
        console.error('Hash validation failed');
      }
    } catch (error) {
      console.error('Validation error:', error);
    }
  }

  return { validatedData, user };
}