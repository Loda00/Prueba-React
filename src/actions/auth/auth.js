import { SubmissionError } from 'redux-form';
import fetch from 'utils/fetch';

export function error(error) {
  return {
    type: 'AUTH_POST_ERROR', error,
  };
}

export function loading(loading) {
  return {
    type: 'AUTH_POST_LOADING', loading,
  };
}

export function success(created) {
  return {
    type: 'AUTH_POST_SUCCESS', created,
  };
}

export function logout() {
  return {
    type: 'LOG_OUT',
  };
}

export function auth(values) {
  return (dispatch) => {
    dispatch(loading(true));

    return fetch('/login_check', {
      method: 'POST', body: JSON.stringify(values),
    })
      .then((response) => {
        dispatch(loading(false));
        return response.json();
      })
      .then((data) => {
        const { token } = data;
        const refreshToken = data.refresh_token;
        const date = new Date();
        const auth = {
          token,
          refresh_token: refreshToken,
          date,
        };

        return dispatch(success(auth));
      })
      .catch((e) => {
        dispatch(loading(false));

        if (e instanceof SubmissionError) {
          dispatch(error(e.errors._error));
          throw e;
        }

        dispatch(error(e.message));
      });
  };
}

export function refresh(values) {
  return (dispatch) => {
    dispatch(loading(true));

    return fetch('/refresh', {
      method: 'POST', body: JSON.stringify(values),
    })
      .then((response) => {
        dispatch(loading(false));
        return response.json();
      })
      .then((data) => {
        const { token } = data;
        const refreshToken = data.refresh_token;
        const date = new Date();
        const auth = {
          token,
          refresh_token: refreshToken,
          date,
        };

        return dispatch(success(auth));
      })
      .catch((e) => {
        dispatch(loading(false));
        dispatch(error(e.message));
        dispatch(logout());
      });
  };
}
