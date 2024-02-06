import cors from "cors"
import configLoader from "@medusajs/medusa/dist/loaders/config"
import { Router } from "express"
import bodyParser from "body-parser"
import { MedusaError } from "@medusajs/utils"
import { z } from "zod"

const router = Router()

export default (rootDirectory) => {
   const config = configLoader(rootDirectory)
   const storeCorsOptions = { origin: config.projectConfig.store_cors.split(","), credentials: true, }
   const adminCorsOptions = { origin: config.projectConfig.admin_cors.split(","), credentials: true, }

   router.use("resend/send", bodyParser.json())
   router.post("/resend/send", cors(storeCorsOptions), (req, res) => {
      const resendService = req.scope.resolve("resendService")

      const schema = z.object({
         template_id: z.string().min(1),
         from: z.string().min(1),
         to: z.string().min(1),
         data: z.object({}).passthrough(),
      })

      const { success, error, data } = schema.safeParse(req.body)
      if (!success) {
         throw new MedusaError(MedusaError.Types.INVALID_DATA, error)
      }
      
      resendService.sendEmail(data.template_id, data.from, data.to, data.data).then((result) => {
         return res.json({
            result
         })
      })
   })

   return router
}