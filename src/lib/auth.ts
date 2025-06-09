import { getServerSession } from "next-auth"
import { authOptions } from "./auth.config"

export const auth = async () => {
  const session = await getServerSession(authOptions)
  return session
}