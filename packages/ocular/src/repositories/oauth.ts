import { OAuth } from "../models/oauth"
import { dataSource } from "../loaders/database"

export const OAuthRepository = dataSource.getRepository(OAuth)
export default OAuthRepository