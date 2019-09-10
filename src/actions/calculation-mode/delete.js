import { toast } from 'components';
import fetch from '../../utils/fetch';

export function error(error) {
  return {
    type: 'CALCULATION_DELETE_ERROR', error,
  };
}

export function loading(loading) {
  return {
    type: 'CALCULATION_DELETE_LOADING', loading,
  };
}

export function success(deleted) {
  return {
    type: 'CALCULATION_DELETE_SUCCESS', deleted,
  };
}

export function del(item) {
  return (dispatch) => {
    dispatch(loading(true));

    return fetch(item['@id'], {
      method: 'DELETE',
    })
      .then(() => {
        toast.success('Delete calculation mode success');
        dispatch(loading(false));
        dispatch(success(item));
      })
      .catch((e) => {
        dispatch(loading(false));
        dispatch(error(e.message));
      });
  };
}
