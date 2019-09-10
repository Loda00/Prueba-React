import { combineReducers } from 'redux';

export function formTime(state = 0, action) {
  switch (action.type) {
    case 'DOCUMENT_TIMER':
      return action.counter;

    default:
      return state;
  }
}

export default combineReducers({
  formTime,
});
