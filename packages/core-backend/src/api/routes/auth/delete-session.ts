/**
 * @oas [delete] /admin/auth
 * operationId: "DeleteAuth"
 * summary: "User Logout"
 * x-authenticated: true
 * description: "Delete the current session for the logged in user. This will only work if you're using Cookie session for authentication."
 */
export default async (req, res) => {
  delete req.session.user_id
  req.session.destroy()
  res.sendStatus(200)
}