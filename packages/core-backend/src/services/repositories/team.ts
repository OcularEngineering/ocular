import { Team } from "../models"
import { dataSource } from "../loaders/database"

export const TeamRepository = dataSource.getRepository(Team)
export default TeamRepository