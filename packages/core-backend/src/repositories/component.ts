import { Component } from "../models"
import { dataSource } from "../loaders/database"

export const ComponentRepository = dataSource.getRepository(Component)
export default ComponentRepository