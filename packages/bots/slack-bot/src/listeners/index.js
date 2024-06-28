// Import eventsListener from './events'
import eventsListener from './events/index.js';

// Define registerListeners function
const registerListeners = (app) => {
  eventsListener(app);
};

// Export registerListeners as default
export default registerListeners;