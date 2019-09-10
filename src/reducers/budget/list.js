import { combineReducers } from 'redux';

export function error(state = null, action) {
  switch (action.type) {
    case 'BUDGET_LIST_ERROR':
      return action.error;

    case 'BUDGET_LIST_RESET':
      return null;

    default:
      return state;
  }
}

export function loading(state = false, action) {
  switch (action.type) {
    case 'BUDGET_LIST_LOADING':
      return action.loading;

    case 'BUDGET_LIST_RESET':
      return false;

    default:
      return state;
  }
}

export function data(state = {}, action) {
  switch (action.type) {
    case 'BUDGET_LIST_SUCCESS':
      return action.data;

    case 'BUDGET_LIST_RESET':
      return {};

    default:
      return state;
  }
}

export function errorPrev(state = null, action) {
  switch (action.type) {
    case 'PREV_BUDGET_LIST_ERROR':
      return action.error;

    case 'PREV_BUDGET_LIST_RESET':
      return null;

    default:
      return state;
  }
}

export function loadingPrev(state = false, action) {
  switch (action.type) {
    case 'PREV_BUDGET_LIST_LOADING':
      return action.loading;

    case 'PREV_BUDGET_LIST_RESET':
      return false;

    default:
      return state;
  }
}

export function dataPrev(state = {}, action) {
  switch (action.type) {
    case 'PREV_BUDGET_LIST_SUCCESS':
      return action.data;

    case 'PREV_BUDGET_LIST_RESET':
      return {};

    default:
      return state;
  }
}

export default combineReducers({
  error, loading, data, errorPrev, loadingPrev, dataPrev,
});
