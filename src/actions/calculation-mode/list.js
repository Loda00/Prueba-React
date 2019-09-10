import { toast } from 'components';
import i18n from 'i18n';
import fetch from '../../utils/fetch';

export function error(error) {
  return {
    type: 'CALCULATION_LIST_ERROR', error,
  };
}

export function loading(loading) {
  return {
    type: 'CALCULATION_LIST_LOADING', loading,
  };
}

export function success(data) {
  return {
    type: 'CALCULATION_LIST_SUCCESS', data,
  };
}

export function list(page = '/calculation_modes') {
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
    type: 'CALCULATION_LIST_RESET',
  };
}

export function errorPrev(error) {
  return {
    type: 'PREV_CALCULATION_LIST_ERROR', error,
  };
}

export function loadingPrev(loading) {
  return {
    type: 'PREV_CALCULATION_LIST_LOADING', loading,
  };
}

export function successPrev(data) {
  return {
    type: 'PREV_CALCULATION_LIST_SUCCESS', data,
  };
}

export function listPrev(page = '/calculation_modes') {
  return (dispatch) => {
    dispatch(loadingPrev(true));
    dispatch(errorPrev(''));

    fetch(page)
      .then(response => response.json())
      .then((data) => {
        dispatch(loadingPrev(false));
        dispatch(successPrev(data));
      })
      .catch((e) => {
        toast.error(i18n.t('toastError'));
        dispatch(loadingPrev(false));
        dispatch(errorPrev(e.message));
      });
  };
}

export function resetActual() {
  return {
    type: 'CALCULATION_LIST_RESET',
  };
}

export function resetPrev() {
  return {
    type: 'PREV_CALCULATION_LIST_RESET',
  };
}
