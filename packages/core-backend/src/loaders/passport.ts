import { Express } from "express"
import passport from "passport"
import { Strategy as CustomStrategy } from "passport-custom"
import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt"
import { Strategy as LocalStrategy } from "passport-local"
import { ConfigModule } from "../types/config-module"
import {  AutoflowContainer} from "@ocular-ai/types"
import { AuthService } from "../services"
import { AutoflowRequest } from "../types/routing"

export default async ({
  app,
  container,
  configModule,
}: {
  app: Express
  container: AutoflowContainer
  configModule: ConfigModule
}): Promise<void> => {
  const authService = container.resolve<AuthService>("authService")

  // For good old email password authentication
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const { success, user } = await authService.authenticate(
            email,
            password
          )
          if (success) {
            return done(null, user)
          } else {
            return done("Incorrect Username / Password")
          }
        } catch (error) {
          return done(error)
        }
      }
    )
  )

  // After a user has authenticated a JWT will be placed on a cookie, all
  // calls will be authenticated based on the JWT
  const { jwt_secret } = configModule.projectConfig
  passport.use(
    "user-session",
    new CustomStrategy(async (req:AutoflowRequest, done) => {
      // @ts-ignore
      if (req.session?.user_id) {
        // @ts-ignore
        return done(null, { userId: req.session.user_id })
      }

      return done(null, false)
    })
  )

  // Bearer JWT token authentication strategy, best suited for web SPAs or mobile apps
  passport.use(
    "bearer-token",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: jwt_secret,
      },
      (token, done) => {
        if (!token.user_id) {
          done(null, false)
          return
        }

        done(null, { userId: token.user_id })
      }
    )
  )

  app.use(passport.initialize())
  app.use(passport.session())
}
