import crypto from 'crypto';

const BOT_TOKEN = process.env.BOT_TOKEN || '';

export const validateInitData = async (initData: string): Promise<string> => {
  if (process.env.NEXT_PUBLIC_BYPASS_TELEGRAM_AUTH === 'true') {
    return 'dev_user';
  }

  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    const auth_date = urlParams.get('auth_date');
    const user = JSON.parse(decodeURIComponent(urlParams.get('user') || '{}'));

    if (!hash || !auth_date || !user) {
      throw new Error('Invalid init data structure');
    }

    return user.id.toString();
  } catch (error) {
    console.error('Telegram validation error:', error);
    throw new Error('Invalid init data');
  }
}; 