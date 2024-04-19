import "reflect-metadata"
import { Router } from "express"
import middlewares, { transformQuery } from "../../../middlewares"
import { Chat } from "../../../../models"
import { GetChatParams } from "./get-chat"

export default (app) => {
  const route = Router()
  app.use("/chat", route)
  route.post("/", middlewares.wrap(require("./create-chat").default))
  route.get("/", middlewares.wrap(require("./list-chats").default))

  route.get(
    "/:id", 
    transformQuery(GetChatParams, {
      defaultRelations: defaultChatRelations,
      defaultFields: defaultChatFields,
      isList: false,
    }),
    middlewares.wrap(require("./get-chat").default)
  )


  route.post("/:id/message", middlewares.wrap(require("./create-message").default))

  return app
}

export * from "./create-chat"
export * from "./get-chat"
export * from "./list-chats"
export * from "./create-message"


export const defaultChatRelations = [
  "messages",
]

export const defaultChatFields: (keyof Chat)[] = [
  "id",
  "name",
  "organisation_id",
  "user_id",
  "created_at",
  "updated_at",
]




