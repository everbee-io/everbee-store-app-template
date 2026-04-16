import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/jwt'
import { User } from '../models'

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        email: string
        storeId: string
      }
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    const user = await User.findById(payload.userId).populate('storeId')

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      storeId: user.storeId.toString(),
    }

    next()
  } catch (error: any) {
    console.error('Authentication error:', error.message)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const payload = verifyToken(token)

      req.user = {
        userId: payload.userId,
        email: payload.email,
        storeId: payload.storeId,
      }
    }
  } catch (error) {
    // Ignore errors for optional auth
  }

  next()
}
