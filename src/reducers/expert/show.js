import { combineReducers } from 'redux';

export function error(state = null, action) {
  switch (action.type) {
    case 'EXPERT_SHOW_ERROR':
      return action.error;

    case 'EXPERT_SHOW_RESET':
      return null;

    default:
      return state;
  }
}

export function loading(state = false, action) {
  switch (action.type) {
    case 'EXPERT_SHOW_LOADING':
      return action.loading;

    case 'EXPERT_SHOW_RESET':
      return false;

    default:
      return state;
  }
}

export function retrieved(state = null, action) {
  switch (action.type) {
    case 'EXPERT_SHOW_RETRIEVED_SUCCESS':
      return action.retrieved;

    case 'EXPERT_SHOW_RESET':
      return null;

    default:
      return state;
  }
}

export default combineReducers({
  error, loading, retrieved,
});
