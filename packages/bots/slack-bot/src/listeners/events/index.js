import { appMentionCallback } from './app_mention_callback.js';

// Define register function
const register = (app,container) => {
  this.container = container;
  app.event('app_mention', ((event, context, client, say) => {
    const params = {
      event: event,
      context: context,
      client: client,
      say: say
    };
    appMentionCallback(params,this.container);
  }).bind(this));
};

// Export register as default
export default register;

