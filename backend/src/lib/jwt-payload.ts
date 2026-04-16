import type { IStore } from '../models/Store'
import type { IUser } from '../models/User'
import { getStoreMongoIdString } from './store-id'
import type { JwtPayload } from './jwt'

export function buildTokenPayload(user: IUser, store: IStore | null): JwtPayload {
  return {
    userId: user._id.toString(),
    email: user.email,
    storeId: getStoreMongoIdString(user),
    ...(store?.storeId ? { everbeeStoreId: store.storeId } : {}),
  }
}
