import { Response } from 'express';

export const setCookie = (res: Response, name: string, value: string) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(name, value, {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction, // true if HTTPS/production, false for local dev
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
