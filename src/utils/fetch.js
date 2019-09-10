import API_ENTRYPOINT from '../config/_entrypoint';

const jsonLdMimeType = 'application/ld+json';

export default function (id, options = {}) {
  if (typeof options.headers === 'undefined') options.headers = new Headers();
  if (options.headers.get('Accept') === null) options.headers.set('Accept', jsonLdMimeType);

  if (options.body !== 'undefined' && !(options.body instanceof FormData) && options.headers.get('Content-Type') === null) {
    options.headers.set('Content-Type', jsonLdMimeType);
  }

  const tokenAuth = localStorage.getItem('EssorAppStorage');
  const token = JSON.parse(tokenAuth).auth.created
    ? JSON.parse(tokenAuth).auth.created.token : null;

  if (tokenAuth !== undefined && tokenAuth !== null && token !== null) {
    options.headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(new URL(id, API_ENTRYPOINT).toString(), options).then((response) => {
    if (response.ok) return response;

    return response
      .json()
      .then((json) => {
        const error = json['hydra:description'] || response.statusText;

        throw Error(error);
      });
  });
}
