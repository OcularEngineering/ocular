// Import appMentionCallback from './app_mention_callback.js'
import { appMentionCallback } from './app_mention_callback.js';

// Define register function
const register = (app) => {
  app.event('app_mention', appMentionCallback);
};

// Export register as default
export default register;