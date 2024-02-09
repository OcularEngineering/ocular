import { UserRepository } from "../../repositories/user"
import { User } from "../../models/user"

export  default async (req, res, next) =>  {
  let loggedInUser: User | null = null

  console.log("req.user", req.user)

  if (req.user && req.user.userId) {

    const userRepo: typeof UserRepository =
      req.scope.resolve("userRepository")

    loggedInUser = await userRepo.findOne({
      where: { id: req.user.userId },
      relations: ["organisation"],
    })
  }

  req.scope.register({
    loggedInUser: {
      resolve: () => loggedInUser,
    },
  })

  next()
}