import axios, { CancelTokenSource } from 'axios';

axios.defaults.withCredentials = true;

export const OCULAR_BACKEND_URL =
  process.env.OCULAR_BACKEND_URL || 'http://localhost:9000/v1';

const client = axios.create({ baseURL: OCULAR_BACKEND_URL });

export default function ocularRequest(
  method,
  path = '',
  payload = {},
  stream = false,
  cancelTokenSource: CancelTokenSource | null
) {
  const options = {
    method,
    url: path,
    data: payload,
    responseType: stream ? 'stream' : 'json',
    cancelToken: cancelTokenSource ? cancelTokenSource.token : undefined,
    json: true,
    withCredentials: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  };
  return client(options).catch((error) => {
    console.error('Error', error);
    throw error;
  });
}
