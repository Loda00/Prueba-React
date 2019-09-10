import { SubmissionError } from 'redux-form';
import fetch from '../../utils/fetch';

export function error(error) {
  return {
    type: 'PURCHASE__ORDER_CHANGE_ERROR', error,
  };
}

export function loading(loading) {
  return {
    type: 'PURCHASE__ORDER_CHANGE_LOADING', loading,
  };
}

export function success(changed) {
  return {
    type: 'PURCHASE__ORDER_CHANGE_SUCCESS', changed,
  };
}

export function change(route) {
  return (dispatch) => {
    dispatch(loading(true));

    return fetch(route, {
      method: 'POST',
      body: JSON.stringify({}),
    })
      .then((response) => {
        dispatch(loading(false));

        return response.json();
      })
      .then((data) => {
        dispatch(success(data));
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
