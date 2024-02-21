import ocularRequest from "./request"

export default {
  apps: {
    installApp(data) {
      const path = `/oauth`
      return ocularRequest("POST", path, data)
    },
    listInstalled() {
      const path = `/oauth`
      return ocularRequest("GET", path)
    },
    list() {
      const path = `/apps`
      return ocularRequest("GET", path)
    },
    retrieve(id) {
      const path = `/apps/${id}`
      return ocularRequest("GET", path)
    },
  },
  auth: {
    authenticate(details) {
      const path = `/auth`
      return ocularRequest("POST", path, details)
    },
    deauthenticate() {
      const path = `/auth`
      return ocularRequest("DELETE", path)
    },
    loggedInUserDetails() {
      const path = `/auth`
      return ocularRequest("GET", path)
    },
  },
  components:{
    create(data) {
      const path = `/components`
      return  ocularRequest("POST", path, data)
    },
    list(search="") {
      const path = `/components/${search}`
      return  ocularRequest("GET", path)
    },
    retrieve(id) {
      const path = `/components/${id}`
      return  ocularRequest("GET", path)
    }
  },
  invites: {
    create(data) {
      const path = `/invites`
      return  ocularRequest("POST", path, data)
    },
    list() {
      const path = `/invites`
      return  ocularRequest("GET", path)
    },
    accept(data) {
      const path = `/invites/accept`
      return ocularRequest("POST", path, data)
    },
  },
  search: {
    query(data) {
      const path = `/search`
      return  ocularRequest("POST", path)
    }
  },
  users:{
    create(data) {
      const path = `/users`
      return  ocularRequest("POST", path, data)
    },
  }
}