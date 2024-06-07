import { AppAuthorization } from "../models/app-authorization";
import { dataSource } from "../loaders/database";

export const AppAuthorizationRepository =
  dataSource.getRepository(AppAuthorization);
export default AppAuthorizationRepository;
