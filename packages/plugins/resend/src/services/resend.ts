import { Resend } from 'resend'
import Handlebars from 'handlebars'
import path from 'path'
import fs from 'fs'
import { humanizeAmount, zeroDecimalCurrencies } from 'medusa-core-utils'
import { NotificationService } from 'ocular-ai/types'
// import { MedusaError } from "@medusajs/utils"
import {AutoflowAiError, AutoflowAiErrorTypes} from "@ocular-ai/utils"


type InjectedDependencies = {
   userService: UserService
}

type SendOptions = {
   to: string
   from: string
   subject?: string
   html?: string
   text?: string
   react?: string
   attachments?: Array<{
      content: string
      filename: string
   }>
}



class ResendService extends NotificationService {
   static identifier = "resend"

   /**
      * @param {Object} options - options defined in `core-config.js`
      *    e.g.
      *    {
      *      api_key: process.env.RESEND_API_KEY,
      *      from: process.env.RESEND_FROM,
      *      enable_endpoint: process.env.RESEND_ENABLE_ENDPOINT,
      *		 subject_template_type: process.env.RESEND_SUBJECT_TEMPLATE_TYPE,
      *		 body_template_type: process.env.RESEND_BODY_TEMPLATE_TYPE,
      *      template_path: process.env.RESEND_TEMPLATE_PATH,
      *      user_verification_template: 'order_placed',
      *    }
      */
   protected apiKey_: string
   protected from_: string
   protected enableEndpoint_: string
   protected subjectTemplateType_: string
   protected bodyTemplateType_: string
   protected userVerificationTemplate_: string
   protected templatePath_: string
   protected userService_: UserService
   protected resendClient_: Resend

   constructor({
         userService
      }: InjectedDependencies, options) {

      super({},options)

      this.apiKey_ = options.api_key
      this.from_ = options.from
      this.enableEndpoint_ = options.enable_endpoint
      this.subjectTemplateType_ = options.subject_template_type
      this.bodyTemplateType_ = options.body_template_type
      this.userVerificationTemplate_ = options.user_verification_template

      this.templatePath_ = (options.template_path.startsWith('/')) ?
      path.resolve(options.template_path) : // The path given in options is absolute
      path.join(__dirname, '../../..', options.template_path) // The path given in options is relative

      this.userService_ = userService
      this.resendClient_ = new Resend(this.apiKey_)
   }

   async sendNotification(event, eventData, attachmentGenerator) {
      let templateId = this.getTemplateId(event)
      if (!templateId) { 
         throw new AutoflowAiError(AutoflowAiErrorTypes.INVALID_DATA, "Resend service: No template was set for this event")
      }

      const data = await this.fetchData(event, eventData, attachmentGenerator)
      if (!data) {
         throw new AutoflowAiError(AutoflowAiErrorTypes.INVALID_DATA, "Resend service: Invalid event data was received")
      }

      const sendOptions: SendOptions = {
         to: data.email,
         from: this.from_
      }

      if (this.subjectTemplateType_ === 'text') {
         sendOptions.subject = fs.existsSync(path.join(this.templatePath_, templateId, 'subject.txt'))?
            fs.readFileSync(path.join(this.templatePath_, templateId, 'subject.txt'), "utf8") : null
      } else {
         sendOptions.subject = await this.compileSubjectTemplate(templateId, data)
      }

      if (this.bodyTemplateType_=== 'react') {
         const react = await this.compileReactTemplate(templateId, data)
         if (react) sendOptions.react = react
      } else {
         const { html, text } = await this.compileBodyTemplate(templateId, data)
         if (html) sendOptions.html = html
         if (text) sendOptions.text = text
      }

      if (!sendOptions.subject || (!sendOptions.html && !sendOptions.text && !sendOptions.react)) { 
         throw new AutoflowAiError(AutoflowAiErrorTypes.INVALID_DATA, "Resend service: The requested templates were not found. Check template path in config.") 	
      }

      let status
      await this.resendClient_.sendEmail(sendOptions)
      .then(() => { status = "sent" })
      .catch((error) => { status = "failed"; console.log(error) })

      // We don't want heavy docs stored in DB
      delete sendOptions.attachments

      return { to: data.email, status, data: sendOptions }
   }

   async resendNotification(notification, config, attachmentGenerator) {
      const sendOptions = {
         ...notification.data,
         to: config.to || notification.to,
      }

      let status
      await this.resendClient_.sendMail(sendOptions)
      .then(() => { status = "sent" })
      .catch((error) => { status = "failed"; console.log(error) })

      return { to: sendOptions.to, status, data: sendOptions }
   }

   /**
      * Sends an email using Resend.
      * @param {string} template_id - id of template to use
      * @param {string} from - sender of email
      * @param {string} to - receiver of email
      * @param {Object} data - data to send in mail (match with template)
      * @return {Promise} result of the send operation
      */
   async sendEmail(templateId , from, to, data) {
      // This function is used by the /resend/send API endpoint included in this plugin.
      // It is disabled by default.
      // This endpoint may be useful for testing purposes and for use by related applications.
      // There is NO SECURITY on the endpoint by default.
      // Most people will NOT need to enable it.
      // If you are certain that you want to enable it and that you know what you are doing,
      // set the environment variable RESEND_ENABLE_ENDPOINT to "42" (a string, not an int).
      // The unsual setting is meant to prevent enabling by accident or without thought.
      if (this.resendClient_.enable_endpoint !== '42') { return false }

      try {
         const sendOptions: SendOptions = {
            to: to,
            from: from
         }

         if (this.subjectTemplateType_ === 'text') {
            sendOptions.subject = fs.existsSync(path.join(this.templatePath_, templateId, 'subject.txt'))?
               fs.readFileSync(path.join(this.templatePath_, templateId, 'subject.txt'), "utf8") : null
         } else {
            sendOptions.subject = await this.compileSubjectTemplate(templateId, data)
         }
   
         if (this.bodyTemplateType_=== 'react') {
            const react = await this.compileReactTemplate(templateId, data)
            if (react) sendOptions.react = react
         } else {
            const { html, text } = await this.compileBodyTemplate(templateId, data)
            if (html) sendOptions.html = html
            if (text) sendOptions.text = text
         }
   
         if (!sendOptions.subject || (!sendOptions.html && !sendOptions.text && !sendOptions.react)) {
            return { 
               message: "Message not sent. Templates were not found or a compile error was encountered.",
               results: {
                  sendOptions
               }
            }
         }
         //return sendOptions.react
         return this.resendClient_.sendEmail(sendOptions)
      } catch (error) {
         throw error
      }
   }

   async compileSubjectTemplate(templateId, data) {
      const subjectTemplate = fs.existsSync(path.join(this.templatePath_, templateId, 'subject.hbs')) ?
         Handlebars.compile(fs.readFileSync(path.join(this.templatePath_, templateId, 'subject.hbs'), "utf8")) : null

      if (subjectTemplate) return subjectTemplate(data)
      else return null
   }

   async compileBodyTemplate(templateId, data) {
      const htmlTemplate = fs.existsSync(path.join(this.templatePath_, templateId, 'html.hbs')) ?
         Handlebars.compile(fs.readFileSync(path.join(this.templatePath_, templateId, 'html.hbs'), "utf8")) : null

      const textTemplate = fs.existsSync(path.join(this.templatePath_, templateId, 'text.hbs')) ?
         Handlebars.compile(fs.readFileSync(path.join(this.templatePath_, templateId, 'text.hbs'), "utf8")) : null

      return { 
         html: htmlTemplate? htmlTemplate(data) : null, 
         text: textTemplate? textTemplate(data) : null
      }
   }

   async compileReactTemplate(templateId, data) {
      if (fs.existsSync(path.join(this.templatePath_, templateId, 'html.js'))) {
         let EmailTemplate = await import(path.join(this.templatePath_, templateId, 'html.js'))
         return EmailTemplate.default(data)
      }
   }

   getTemplateId(event) {
      switch (event) {
         case "user.sign_up":
            return this.userVerificationTemplate_
         default:
            return null
      }
   }


   async fetchData(event, eventData, attachmentGenerator) {
      switch (event) {
         case "user.sign_up":
            return eventData
         default:
            return {}
      }
   }

   
}

export default ResendService