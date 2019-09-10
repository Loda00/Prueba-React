import { combineReducers } from 'redux';
import list from './list';
import update from './update';
import show from './show';

export default combineReducers({
  list, update, show,
});
