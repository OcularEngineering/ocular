import { App } from "../models"
import { dataSource } from "../loaders/database"

export const AppRepository = dataSource.getRepository(App)
export default AppRepository