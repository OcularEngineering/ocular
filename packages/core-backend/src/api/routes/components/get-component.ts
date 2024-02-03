import { ComponentService } from "../../../services"
import { FindParams } from "../../../types/common"

export default async (req, res) => {
  const { id } = req.params

  const componentService: ComponentService = req.scope.resolve("componentService")
  const component = await componentService.retrieve(id, req.retrieveConfig)

  res.status(200).json({ component })
}

export class GetComponentParams extends FindParams {}