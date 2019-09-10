import { combineReducers } from 'redux';

export function retrieveError(state = null, action) {
  switch (action.type) {
    case 'QUOTE_UPDATE_RETRIEVE_ERROR':
      return action.retrieveError;

    case 'QUOTE_UPDATE_RESET':
      return null;

    default:
      return state;
  }
}

export function retrieveLoading(state = false, action) {
  switch (action.type) {
    case 'QUOTE_UPDATE_RETRIEVE_LOADING':
      return action.retrieveLoading;

    case 'QUOTE_UPDATE_RESET':
      return false;

    default:
      return state;
  }
}

export function retrieved(state = null, action) {
  switch (action.type) {
    case 'QUOTE_UPDATE_RETRIEVE_SUCCESS':
      return action.retrieved;

    case 'QUOTE_UPDATE_RESET':
      return null;

    default:
      return state;
  }
}

export function updateError(state = null, action) {
  switch (action.type) {
    case 'QUOTE_UPDATE_UPDATE_ERROR':
      return action.updateError;

    case 'QUOTE_UPDATE_RESET':
      return null;

    default:
      return state;
  }
}

export function updateLoading(state = false, action) {
  switch (action.type) {
    case 'QUOTE_UPDATE_UPDATE_LOADING':
      return action.updateLoading;

    case 'QUOTE_UPDATE_RESET':
      return false;

    default:
      return state;
  }
}

export function updated(state = null, action) {
  switch (action.type) {
    case 'QUOTE_UPDATE_UPDATE_SUCCESS':
      return action.updated;

    case 'QUOTE_UPDATE_RESET':
      return null;

    default:
      return state;
  }
}

export default combineReducers({
  retrieveError, retrieveLoading, retrieved, updateError, updateLoading, updated,
});
