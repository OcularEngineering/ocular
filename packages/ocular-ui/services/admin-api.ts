import ocularRequest from './request';
import { id } from 'date-fns/locale';

export default {
  apps: {
    installApp(data) {
      const path = `/admin/oauth`;
      return ocularRequest('POST', path, data);
    },
    authorizeApp(data) {
      const path = `/admin/apps/authorize`;
      return ocularRequest('POST', path, data);
    },
    listInstalled() {
      const path = `/admin/apps/installed`;
      return ocularRequest('GET', path);
    },
    list() {
      const path = `/admin/apps`;
      return ocularRequest('GET', path);
    },
    retrieveApp(data) {
      const path = `/admin/apps/getapp`;
      return ocularRequest('POST', path, data);
    },
    updateApp(data: any) {
      const path = `/admin/apps/updateapp`;
      return ocularRequest('POST', path, data);
    },
  },
  invites: {
    create(data) {
      const path = `/admin/invites`;
      return ocularRequest('POST', path, data);
    },
    list() {
      const path = `/admin/invites`;
      return ocularRequest('GET', path);
    },
  },
  organisation: {
    retrive(id, search = {}) {
      const params = Object.keys(search)
        .map((k) => {
          if (search[k] === '' || search[k] === null) {
            return null;
          }
          return `${k}=${search[k]}`;
        })
        .filter((s) => !!s)
        .join('&');
      const path = `/admin/organisation/${id}${params && `?${params}`}`;
      return ocularRequest('GET', path);
    },
  },
  teams: {
    create(data) {
      const path = `/admin/teams`;
      return ocularRequest('POST', path, data);
    },
    list() {
      const path = `/admin/teams`;
      return ocularRequest('GET', path);
    },
    retrieve(id, search = {}) {
      const params = Object.keys(search)
        .map((k) => {
          if (search[k] === '' || search[k] === null) {
            return null;
          }
          return `${k}=${search[k]}`;
        })
        .filter((s) => !!s)
        .join('&');
      const path = `/admin/teams/${id}${params && `?${params}`}`;
      return ocularRequest('GET', path);
    },
    delete(id) {
      const path = `/admin/teams/${id}`;
      return ocularRequest('DELETE', path);
    },
    addmembers(id, data) {
      const path = `/admin/teams/${id}/members`;
      return ocularRequest('POST', path, data);
    },
    removeMembers(id, data) {
      const path = `/admin/teams/${id}/members`;
      return ocularRequest('DELETE', path, data);
    },
  },
  users: {
    create(data) {
      const path = `/admin/users`;
      return ocularRequest('POST', path, data);
    },
    retrieve(id, search = {}) {
      const params = Object.keys(search)
        .map((k) => {
          if (search[k] === '' || search[k] === null) {
            return null;
          }
          return `${k}=${search[k]}`;
        })
        .filter((s) => !!s)
        .join('&');
      const path = `/admin/users/${id}${params && `?${params}`}`;
      return ocularRequest('GET', path);
    },
  },
};
