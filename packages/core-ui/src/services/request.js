import axios from "axios"
import { CORE_BACKEND_URL } from "../constants/core-backend-url"

const client = axios.create({ baseURL: CORE_BACKEND_URL })

export default function coreBackendRequest(method, path = "", payload = {}) {
  const options = {
    method,
    withCredentials: true,
    url: path,
    data: payload,
    json: true,
  }
  return client(options)
}