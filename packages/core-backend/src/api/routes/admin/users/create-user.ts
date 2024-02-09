import { 
  IsEmail, 
  IsEnum, 
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,} from "class-validator"
  import { Type } from "class-transformer"
import { UserRoles } from "../../../../models/user"
import UserService from "../../../../services/user"
import _ from "lodash"
import { validator } from "../../../../utils/validator"
import { EntityManager } from "typeorm"

//"Create a User.
export default async (req, res) => {
  const validated = await validator(UserCreateUserReq, req.body)

  const userService: UserService = req.scope.resolve("userService")
  const data = _.omit(validated, ["password"])

  const manager: EntityManager = req.scope.resolve("manager")
  const user = await manager.transaction(async (transactionManager) => {
    return await userService
      .withTransaction(transactionManager)
      .createOrganisationAdmin(data, validated.password)
  })

  res.status(200).json({ user: _.omit(user, ["password_hash"]) })
}

class OrganisationCreateReq {
  @IsString()
  name: string
}

export class UserCreateUserReq{
  @IsEmail()
  email: string

  @IsOptional()
  @IsString()
  first_name?: string

  @IsOptional()
  @IsString()
  last_name?: string
  
  @IsString()
  password: string

  @IsObject()
  @ValidateNested()
  @Type(() => OrganisationCreateReq)
  @ValidateNested({ each: true })
  organisation: OrganisationCreateReq
}

