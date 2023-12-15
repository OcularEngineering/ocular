import { Organisation } from "../models"
import { dataSource } from "../loaders/database"

export const  OrganisationRepository = dataSource.getRepository(Organisation)
export default  OrganisationRepository