import { IsEmail, IsNotEmpty, IsString } from "class-validator"

import _ from "lodash"
import { EntityManager } from "typeorm"

import { validator } from "@ocular/utils"
import { AuthService } from "../../../../services"

// * description: "Log a User in and includes the Cookie session in the response header. The cookie session can be used in subsequent requests to authorize the user to perform admin functionalities.

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
    // Set user id and role on session, this is stored on the server.
    req.session.user = { user_id: result.user.id, user_role: result.user.role}

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