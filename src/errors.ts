/**
 * Returns an http error object following [RFC9457](https://www.rfc-editor.org/rfc/rfc9457.html#name-type) standard
 */
export function httpError(options: {
  status: number;
  title?: string;
  detail?: string;
}) {
  return {
    status: options.status,
    title: options.title,
    detail: options.detail,
  };
}

export function notFound(options: { detail: string }) {
  return httpError({ status: 404, title: 'Entity not found', ...options });
}

export function badRequest(options: { detail: string }) {
  return httpError({ status: 400, title: 'Bad Request', ...options });
}