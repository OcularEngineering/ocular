import { AppAuthorization } from "../models/oauth"
import { dataSource } from "../loaders/database"

export const AppAuthorizationRepository = dataSource.getRepository(AppAuthorization);
export default AppAuthorizationRepository;