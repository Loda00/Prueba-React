import { combineReducers } from 'redux';

export function userRole(state = null, action) {
  switch (action.type) {
    case 'USER_COMPANY_SET_ROLE_SUCCESS':
      return action.role;

    default:
      return state;
  }
}

export function userID(state = null, action) {
  switch (action.type) {
    case 'USER_COMPANY_SET_ID_SUCCESS':
      return action.id;

    default:
      return state;
  }
}

export default combineReducers({
  userRole, userID,
});
