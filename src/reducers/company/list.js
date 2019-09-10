import { combineReducers } from 'redux';

export function error(state = null, action) {
  switch (action.type) {
    case 'COMPANY_LIST_ERROR':
      return action.error;

    case 'COMPANY_LIST_RESET':
      return null;

    default:
      return state;
  }
}

export function loading(state = false, action) {
  switch (action.type) {
    case 'COMPANY_LIST_LOADING':
      return action.loading;

    case 'COMPANY_LIST_RESET':
      return false;

    default:
      return state;
  }
}

export function data(state = {}, action) {
  switch (action.type) {
    case 'COMPANY_LIST_SUCCESS':
      return action.data;

    case 'COMPANY_LIST_RESET':
      return {};

    default:
      return state;
  }
}

export default combineReducers({
  error, loading, data,
});
