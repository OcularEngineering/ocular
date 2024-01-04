import {UserService} from "../../../services"
import _ from "lodash"

/**
 * @oas [get] /admin/auth
 * operationId: "GetAuth"
 * summary: "Get Current User"
 * x-authenticated: true
 * description: "Get the currently logged in user's details."
 * x-codegen:
 *   method: getSession
 * x-codeSamples:
 *   - lang: Shell
 *     label: cURL
 *     source: |
 *       curl '{backend_url}/admin/auth' \
 *       -H 'x-access-token: {api_token}'
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 *   - jwt_token: []
 * tags:
 *   - Auth
 * responses:
 *  "200":
 *    description: OK
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/AdminAuthRes"
 *  "400":
 *    $ref: "#/components/responses/400_error"
 *  "401":
 *    $ref: "#/components/responses/unauthorized"
 *  "404":
 *    $ref: "#/components/responses/not_found_error"
 *  "409":
 *    $ref: "#/components/responses/invalid_state_error"
 *  "422":
 *    $ref: "#/components/responses/invalid_request_error"
 *  "500":
 *    $ref: "#/components/responses/500_error"
 */
export default async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId

    const userService = req.scope.resolve("userService")
    const user = await userService.retrieve(userId)

    const cleanRes = _.omit(user, ["password_hash"])
    res.status(200).json({ user: cleanRes })
  } catch (err) {
    res.sendStatus(400)
  }
}