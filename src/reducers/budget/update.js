import { combineReducers } from 'redux';

export function retrieveError(state = null, action) {
  switch (action.type) {
    case 'BUDGET_UPDATE_RETRIEVE_ERROR':
      return action.retrieveError;

    case 'BUDGET_UPDATE_RESET':
      return null;

    default:
      return state;
  }
}

export function retrieveLoading(state = false, action) {
  switch (action.type) {
    case 'BUDGET_UPDATE_RETRIEVE_LOADING':
      return action.retrieveLoading;

    case 'BUDGET_UPDATE_RESET':
      return false;

    default:
      return state;
  }
}

export function retrieved(state = null, action) {
  switch (action.type) {
    case 'BUDGET_UPDATE_RETRIEVE_SUCCESS':
      return action.retrieved;

    case 'BUDGET_UPDATE_RESET':
      return null;

    default:
      return state;
  }
}

export function updateError(state = null, action) {
  switch (action.type) {
    case 'BUDGET_UPDATE_UPDATE_ERROR':
      return action.updateError;

    case 'BUDGET_UPDATE_RESET':
      return null;

    default:
      return state;
  }
}

export function updateLoading(state = false, action) {
  switch (action.type) {
    case 'BUDGET_UPDATE_UPDATE_LOADING':
      return action.updateLoading;

    case 'BUDGET_UPDATE_RESET':
      return false;

    default:
      return state;
  }
}

export function updated(state = null, action) {
  switch (action.type) {
    case 'BUDGET_UPDATE_UPDATE_SUCCESS':
      return action.updated;

    case 'BUDGET_UPDATE_RESET':
      return null;

    default:
      return state;
  }
}

export default combineReducers({
  retrieveError, retrieveLoading, retrieved, updateError, updateLoading, updated,
});
