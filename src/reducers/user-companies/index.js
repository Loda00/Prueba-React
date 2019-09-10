import { combineReducers } from 'redux';
import list from './list';
import select from './select';
import role from './role';

export default combineReducers({
  list, select, role,
});
