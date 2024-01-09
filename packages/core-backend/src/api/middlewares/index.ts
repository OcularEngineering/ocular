import { default as authenticate } from "./authenticate"
import { default as wrap } from "./await-middleware"
import { default as registeredLoggedinUser } from "./logged-in-user"

export default {
  authenticate,
  registeredLoggedinUser,
  wrap
}