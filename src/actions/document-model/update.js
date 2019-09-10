import { toast } from 'components';
import i18n from 'i18n';
import { SubmissionError } from 'redux-form';
import fetch from '../../utils/fetch';

export function retrieveError(retrieveError) {
  return {
    type: 'DOCUMENT_MODEL_UPDATE_RETRIEVE_ERROR', retrieveError,
  };
}

export function retrieveLoading(retrieveLoading) {
  return {
    type: 'DOCUMENT_MODEL_UPDATE_RETRIEVE_LOADING', retrieveLoading,
  };
}

export function retrieveSuccess(retrieved) {
  return {
    type: 'DOCUMENT_MODEL_UPDATE_RETRIEVE_SUCCESS', retrieved,
  };
}

export function retrieve(id) {
  return (dispatch) => {
    dispatch(retrieveLoading(true));

    return fetch(id)
      .then(response => response.json())
      .then((data) => {
        dispatch(retrieveLoading(false));
        dispatch(retrieveSuccess(data));
      })
      .catch((e) => {
        toast.error(i18n.t('toastError'));
        dispatch(retrieveLoading(false));
        dispatch(retrieveError(e.message));
      });
  };
}

export function updateError(updateError) {
  return {
    type: 'DOCUMENT_MODEL_UPDATE_UPDATE_ERROR', updateError,
  };
}

export function updateLoading(updateLoading) {
  return {
    type: 'DOCUMENT_MODEL_UPDATE_UPDATE_LOADING', updateLoading,
  };
}

export function updateSuccess(updated) {
  return {
    type: 'DOCUMENT_MODEL_UPDATE_UPDATE_SUCCESS', updated,
  };
}

export function update(item, values) {
  return (dispatch) => {
    dispatch(updateError(null));
    dispatch(updateLoading(true));

    return fetch(item['@id'], {
      method: 'PUT',
      headers: new Headers({
        'Content-Type': 'application/ld+json',
      }),
      body: JSON.stringify(values),
    })
      .then(response => response.json())
      .then((data) => {
        toast.success(i18n.t('modelUpdateSuccess'));
        dispatch(updateLoading(false));
        dispatch(updateSuccess(data));
      })
      .catch((e) => {
        dispatch(updateLoading(false));

        if (e instanceof SubmissionError) {
          dispatch(updateError(e.errors._error));
          throw e;
        }

        dispatch(updateError(e.message));
      });
  };
}

export function reset() {
  return {
    type: 'DOCUMENT_MODEL_UPDATE_RESET',
  };
}
