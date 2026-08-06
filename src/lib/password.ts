import { hash, compare } from "bcryptjs"

const BCRYPT_ROUNDS = process.env.NODE_ENV === "test" ? 4 : 12

export async function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_ROUNDS)
}

export { compare as comparePassword }
