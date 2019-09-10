import { toast } from 'components';
import i18n from 'i18n';
import { SubmissionError } from 'redux-form';
import fetch from '../../utils/fetch';

export function error(error) {
  return {
    type: 'FOLLOW_UP_CREATE_ERROR', error,
  };
}

export function loading(loading) {
  return {
    type: 'FOLLOW_UP_CREATE_LOADING', loading,
  };
}

export function success(created) {
  return {
    type: 'FOLLOW_UP_CREATE_SUCCESS', created,
  };
}

export function create(values) {
  return (dispatch) => {
    dispatch(loading(true));

    return fetch('/follow_ups', {
      method: 'POST', body: JSON.stringify(values),
    })
      .then((response) => {
        dispatch(loading(false));

        return response.json();
      })
      .then((data) => {
        toast.success(i18n.t('followUpCreateSuccess'));
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
