// Ocular uses Axios on all its services to make HTTP requests. However Axios does support client streaming in the
//browser so we created this stream api as a workaround.

// The streaming api is a simple wrapper around the fetch api that allows you to make streaming requests to the server.
export const OCULAR_BACKEND_URL =
  process.env.OCULAR_BACKEND_URL || 'http://localhost:9000/v1';

export default async function ocularStreamingRequest(
  method:
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'PATCH'
    | 'OPTIONS'
    | 'HEAD'
    | 'CONNECT'
    | 'TRACE',
  path = '',
  payload = {},
  stream = false,
  cancelTokenSource: AbortController | null
) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  const options = {
    method,
    headers,
    credentials: 'include',
    body: JSON.stringify(payload),
    signal: cancelTokenSource ? cancelTokenSource.signal : undefined,
  };

  if (method === 'GET') {
    delete options.body;
  }

  const response = await fetch(`${OCULAR_BACKEND_URL}${path}`, options);

  if (!response.ok) {
    const error = await response.text();
    console.error('Error', error);
    throw new Error(error);
  }

  return response;
}
