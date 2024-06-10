import axios, { CancelTokenSource } from 'axios';

axios.defaults.withCredentials = true;

export const OCULAR_BACKEND_URL =
  process.env.OCULAR_BACKEND_URL || 'http://localhost:9000/v1';

const client = axios.create({ baseURL: OCULAR_BACKEND_URL });

export default function ocularRequest(
  method: string,
  path = '',
  payload: any = {},
  stream = false,
  cancelTokenSource: CancelTokenSource | null = null
) {
  const isFormData = payload instanceof FormData;
  const options = {
    method,
    url: path,
    data: payload,
    responseType: stream ? 'stream' : 'json',
    cancelToken: cancelTokenSource ? cancelTokenSource.token : undefined,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
    },
    withCredentials: true,
  };

  return client(options).catch((error) => {
    console.error('Error', error);
    throw error;
  });
}
