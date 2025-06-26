import prisma from '../libs/prisma';
import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    console.log('Received cookies:', req.cookies);
    const token =
      req.cookies['access_token'] ||
      req.cookies['seller_access_token'] ||
      req.headers.authorization?.split(' ')[1];

    if (!token) {
      console.log('No token found in cookies or headers.');
      return res.status(401).json({ message: `Unauthorized! Token missing` });
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as { id: string; role: 'user' | 'seller' };

    console.log('Decoded token:', decoded);

    if (!decoded) {
      console.log('JWT verification failed.');
      return res.status(401).json({ message: `Unauthorized! Invalid token` });
    }

    let account;

    if (decoded.role === 'user') {
      account = await prisma.users.findUnique({
        where: { id: decoded.id },
      });
      req.user = account;
    } else if (decoded.role === 'seller') {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
      });
      req.seller = account;
    }

    console.log('Fetched account:', account);

    if (!account) {
      console.log('No account found for decoded token.');
      return res.status(401).json({ message: `Account not found` });
    }

    req.role = decoded.role;

    return next();
  } catch (err) {
    console.log('Authentication error:', err);
    return res
      .status(401)
      .json({ message: `Unauthorized!Token expired or invalid` });
  }
};

export default isAuthenticated;
