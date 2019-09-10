import { toast } from 'components';
import i18n from 'i18n';
import fetch from '../../utils/fetch';

export function error(error) {
  return {
    type: 'SERVICE_DELETE_ERROR', error,
  };
}

export function loading(loading) {
  return {
    type: 'SERVICE_DELETE_LOADING', loading,
  };
}

export function success(deleted) {
  return {
    type: 'SERVICE_DELETE_SUCCESS', deleted,
  };
}

export function del(item) {
  return (dispatch) => {
    dispatch(loading(true));

    return fetch(item['@id'], {
      method: 'DELETE',
    })
      .then(() => {
        toast.success(i18n.t('serviceDeleteSuccess'));
        dispatch(loading(false));
        dispatch(success(item));
      })
      .catch((e) => {
        dispatch(loading(false));
        dispatch(error(e.message));
      });
  };
}
