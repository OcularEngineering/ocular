import  ResendService  from "../services/resend"
import { EventBusService } from "@ocular/ocular"


type InjectedDependencies = {
    resendService: ResendService
    eventBusService: EventBusService
}

class UserSubscriber {
  private readonly resendService_: ResendService
  private readonly eventBus_: EventBusService

  constructor({ resendService, eventBusService }: InjectedDependencies) {
     this.resendService_ = resendService
  
     this.eventBus_ = eventBusService
  
     this.eventBus_.subscribe("invite.created", async (data) => {
      console.log("User created event received",data)
        await this.resendService_.sendNotification(
           "invite.created",
           data,
           null
        )
     })
  }
}

export default UserSubscriber