import ocularRequest from './request';
import ocularStreamingRequest from './streaming-request';

export default {
  apps: {
    installApp(data) {
      const path = `/oauth`;
      return ocularRequest('POST', path, data);
    },
    listInstalled() {
      const path = `/oauth`;
      return ocularRequest('GET', path);
    },
    list() {
      const path = `/apps`;
      return ocularRequest('GET', path);
    },
    retrieve(id) {
      const path = `/apps/${id}`;
      return ocularRequest('GET', path);
    },
  },
  auth: {
    authenticate(details) {
      const path = `/auth`;
      return ocularRequest('POST', path, details);
    },
    deauthenticate() {
      const path = `/auth`;
      return ocularRequest('DELETE', path);
    },
    loggedInUserDetails() {
      const path = `/auth`;
      return ocularRequest('GET', path);
    },
  },
  chats: {
    create(data) {
      const path = `/chat`;
      return ocularRequest('POST', path, data);
    },
    delete(data) {
      const path = `/chat`;
      return ocularRequest('DELETE', path, data);
    },
    sendMessage(id, data, cancelToken) {
      console.log('controller', cancelToken);
      const path = `/chat/${id}/message`;
      console.log('path', data);
      return ocularRequest('POST', path, data, false, cancelToken);
    },
    getMessages(id) {
      const path = `/chat/${id}/messages`;
      return ocularRequest('GET', path);
    },
    list(search = '') {
      const path = `/chat/${search}`;
      return ocularRequest('GET', path);
    },
    retrieve(id) {
      const path = `/chat/${id}`;
      return ocularRequest('GET', path);
    },
  },
  components: {
    create(data) {
      const path = `/components`;
      return ocularRequest('POST', path, data);
    },
    list(search = '') {
      const path = `/components/${search}`;
      return ocularRequest('GET', path);
    },
    retrieve(id) {
      const path = `/components/${id}`;
      return ocularRequest('GET', path);
    },
  },
  invites: {
    create(data) {
      const path = `/invites`;
      return ocularRequest('POST', path, data);
    },
    list() {
      const path = `/invites`;
      return ocularRequest('GET', path);
    },
    accept(data) {
      const path = `/invites/accept`;
      return ocularRequest('POST', path, data);
    },
  },
  search: {
    ask(q, sources, date,stream=false) {
      const path = `/ask`;
      const body = {
        context: {
          top: 5,
          stream:stream
        },
        q: q
      };
      if (date.from || date.to) {
        body.context.date = date;
      }
      if (sources && sources.length > 0) {
        body.context.sources = sources;
      }
      console.log("Calling Ask AI")
      return ocularStreamingRequest("POST", path, body,stream);
    },
    search(q, sources, date) {
      const path = `/search`;
      const body = {
        context: {
          top: 20,
        },
        q: q
      };
      if (date.from || date.to) {
        body.context.date = date;
      }
      if (sources && sources.length > 0) {
        body.context.sources = sources;
      }
      return ocularRequest("POST", path, body);
    },
  },
  users: {
    create(data) {
      const path = `/users`;
      return ocularRequest('POST', path, data);
    },
  },
};
