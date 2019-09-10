import { combineReducers } from 'redux';

export function error(state = null, action) {
  switch (action.type) {
    case 'CALCULATION_LIST_ERROR':
      return action.error;

    case 'CALCULATION_LIST_RESET':
      return null;

    default:
      return state;
  }
}

export function loading(state = false, action) {
  switch (action.type) {
    case 'CALCULATION_LIST_LOADING':
      return action.loading;

    case 'CALCULATION_LIST_RESET':
      return false;

    default:
      return state;
  }
}

export function data(state = {}, action) {
  switch (action.type) {
    case 'CALCULATION_LIST_SUCCESS':
      return action.data;

    case 'CALCULATION_LIST_RESET':
      return {};

    default:
      return state;
  }
}

export function errorPrev(state = null, action) {
  switch (action.type) {
    case 'PREV_CALCULATION_LIST_ERROR':
      return action.error;

    case 'PREV_CALCULATION_LIST_RESET':
      return null;

    default:
      return state;
  }
}

export function loadingPrev(state = false, action) {
  switch (action.type) {
    case 'PREV_CALCULATION_LIST_LOADING':
      return action.loading;

    case 'PREV_CALCULATION_LIST_RESET':
      return false;

    default:
      return state;
  }
}

export function dataPrev(state = {}, action) {
  switch (action.type) {
    case 'PREV_CALCULATION_LIST_SUCCESS':
      return action.data;

    case 'PREV_CALCULATION_LIST_RESET':
      return {};

    default:
      return state;
  }
}

export default combineReducers({
  error, loading, data, errorPrev, loadingPrev, dataPrev,
});
