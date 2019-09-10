import { SubmissionError } from 'redux-form';
import fetch from '../../utils/fetch';

export function error(error) {
  return {
    type: 'MEDIA_CREATE_ERROR', error,
  };
}

export function loading(loading) {
  return {
    type: 'MEDIA_CREATE_LOADING', loading,
  };
}

export function success(created) {
  return {
    type: 'MEDIA_CREATE_SUCCESS', created,
  };
}

export function create(values) {
  return (dispatch) => {
    dispatch(loading(true));

    return fetch('/media_objects', {
      method: 'POST', body: values,
    })
      .then((response) => {
        dispatch(loading(false));

        return response.json();
      })
      .then(data => dispatch(success(data)))
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
