import { toast } from 'components';
import i18n from 'i18n';
import fetch from '../../utils/fetch';

export function error(error) {
  return {
    type: 'SELF_FINANCING_DELETE_ERROR', error,
  };
}

export function loading(loading) {
  return {
    type: 'SELF_FINANCING_DELETE_LOADING', loading,
  };
}

export function success(deleted) {
  return {
    type: 'SELF_FINANCING_DELETE_SUCCESS', deleted,
  };
}

export function del(item) {
  return (dispatch) => {
    dispatch(loading(true));

    return fetch(item['@id'], {
      method: 'DELETE',
    })
      .then(() => {
        toast.success(i18n.t('selfFinancingDeleteSuccess'));
        dispatch(loading(false));
        dispatch(success(item));
      })
      .catch((e) => {
        toast.error(i18n.t('toastError'));
        dispatch(loading(false));
        dispatch(error(e.message));
      });
  };
}
