import  ResendService  from "../services/resend"
import { EventBusService } from "@ocular/ocular"


type InjectedDependencies = {
    resendService: ResendService
    eventBusService: EventBusService
}

class InviteSubscriber {
  private readonly resendService_: ResendService
  private readonly eventBus_: EventBusService

  constructor({ resendService, eventBusService }: InjectedDependencies) {
     this.resendService_ = resendService
  
     this.eventBus_ = eventBusService
  
     this.eventBus_.subscribe("user.invite", async (data) => {
        await this.resendService_.sendNotification(
           "user.created",
           data,
           null
        )
     })
  }
}

export default InviteSubscriber