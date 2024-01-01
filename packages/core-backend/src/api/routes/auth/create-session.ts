import { IsEmail, IsNotEmpty, IsString } from "class-validator"

import _ from "lodash"
import { EntityManager } from "typeorm"

import { validator } from "../../../utils/validator"
import { AuthService } from "../../../services"

export default async (req, res) => {
  const validated = await validator(AdminPostAuthReq, req.body)

  const authService: AuthService = req.scope.resolve("authService")
  const manager: EntityManager = req.scope.resolve("manager")
  const result = await manager.transaction(async (transactionManager) => {
    return await authService
      .withTransaction(transactionManager)
      .authenticate(validated.email, validated.password)
  })

  if (result.success && result.user) {
    // Set user id on session, this is stored on the server.
    req.session.user_id = result.user.id

    const cleanRes = _.omit(result.user, ["password_hash"])

    res.json({ user: cleanRes })
  } else {
    res.sendStatus(401)
  }
}

export class AdminPostAuthReq {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  password: string
}