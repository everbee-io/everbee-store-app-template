import mongoose from 'mongoose'

/**
 * `User.storeId` may be a raw ObjectId or a populated Store document.
 * JWT claims and Mongo queries must use the Store document's 24-char hex id.
 */
export function getStoreMongoIdString(user: { storeId: unknown }): string {
  const sid = user.storeId
  if (sid == null) return ''

  if (sid instanceof mongoose.Types.ObjectId) {
    return sid.toHexString()
  }

  if (typeof sid === 'object' && '_id' in (sid as object)) {
    const id = (sid as { _id: mongoose.Types.ObjectId })._id
    if (id instanceof mongoose.Types.ObjectId) return id.toHexString()
    return String(id)
  }

  return String(sid)
}

export function toStoreObjectId(storeIdHex: string): mongoose.Types.ObjectId {
  if (!mongoose.Types.ObjectId.isValid(storeIdHex)) {
    throw new Error('Invalid store id')
  }
  return new mongoose.Types.ObjectId(storeIdHex)
}
