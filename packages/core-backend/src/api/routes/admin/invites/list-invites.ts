import {InviteService} from "../../../../services"

export default async (req, res) => {
  const inviteService: InviteService = req.scope.resolve("inviteService")
  const invites = await inviteService.list({})
  res.status(200).json({ invites })
}