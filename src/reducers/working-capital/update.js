import { combineReducers } from 'redux';

export function retrieveError(state = null, action) {
  switch (action.type) {
    case 'WORKING_CAPITAL_UPDATE_RETRIEVE_ERROR':
      return action.retrieveError;

    case 'WORKING_CAPITAL_UPDATE_RESET':
      return null;

    default:
      return state;
  }
}

export function retrieveLoading(state = false, action) {
  switch (action.type) {
    case 'WORKING_CAPITAL_UPDATE_RETRIEVE_LOADING':
      return action.retrieveLoading;

    case 'WORKING_CAPITAL_UPDATE_RESET':
      return false;

    default:
      return state;
  }
}

export function retrieved(state = null, action) {
  switch (action.type) {
    case 'WORKING_CAPITAL_UPDATE_RETRIEVE_SUCCESS':
      return action.retrieved;

    case 'WORKING_CAPITAL_UPDATE_RESET':
      return null;

    default:
      return state;
  }
}

export function updateError(state = null, action) {
  switch (action.type) {
    case 'WORKING_CAPITAL_UPDATE_UPDATE_ERROR':
      return action.updateError;

    case 'WORKING_CAPITAL_UPDATE_RESET':
      return null;

    default:
      return state;
  }
}

export function updateLoading(state = false, action) {
  switch (action.type) {
    case 'WORKING_CAPITAL_UPDATE_UPDATE_LOADING':
      return action.updateLoading;

    case 'WORKING_CAPITAL_UPDATE_RESET':
      return false;

    default:
      return state;
  }
}

export function updated(state = null, action) {
  switch (action.type) {
    case 'WORKING_CAPITAL_UPDATE_UPDATE_SUCCESS':
      return action.updated;

    case 'WORKING_CAPITAL_UPDATE_RESET':
      return null;

    default:
      return state;
  }
}

export default combineReducers({
  retrieveError, retrieveLoading, retrieved, updateError, updateLoading, updated,
});
