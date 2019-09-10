import { combineReducers } from 'redux';

export function error(state = null, action) {
  switch (action.type) {
    case 'INVOICE_CHANGE_ERROR':
      return action.error;

    default:
      return state;
  }
}

export function loading(state = false, action) {
  switch (action.type) {
    case 'INVOICE_CHANGE_LOADING':
      return action.loading;

    default:
      return state;
  }
}

export function changed(state = null, action) {
  switch (action.type) {
    case 'INVOICE_CHANGE_SUCCESS':
      return action.changed;

    default:
      return state;
  }
}

export default combineReducers({
  error, loading, changed,
});
