import { toast } from 'components';
import i18n from 'i18n';
import fetch from '../../utils/fetch';

export function error(error) {
  return {
    type: 'FOLLOW_UP_LIST_ERROR', error,
  };
}

export function loading(loading) {
  return {
    type: 'FOLLOW_UP_LIST_LOADING', loading,
  };
}

export function success(data) {
  return {
    type: 'FOLLOW_UP_LIST_SUCCESS', data,
  };
}

export function list(page = '/follow_ups') {
  return (dispatch) => {
    dispatch(loading(true));
    dispatch(error(''));

    fetch(page)
      .then(response => response.json())
      .then((data) => {
        dispatch(loading(false));
        dispatch(success(data));
      })
      .catch((e) => {
        toast.error(i18n.t('toastError'));
        dispatch(loading(false));
        dispatch(error(e.message));
      });
  };
}

export function reset() {
  return {
    type: 'FOLLOW_UP_LIST_RESET',
  };
}
