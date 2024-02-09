import { AppService } from "../../../services"
import { FindParams } from "../../../types/common"

export default async (req, res) => {
  const { id } = req.params

  const appService: AppService = req.scope.resolve("appService")
  const app = await appService.retrieve(id, req.retrieveConfig)

  res.status(200).json({ app })
}

export class GetAppParams extends FindParams {}