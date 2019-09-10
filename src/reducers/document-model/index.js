import { combineReducers } from 'redux';
import create from './create';
import list from './list';
import show from './show';
import update from './update';

export default combineReducers({
  list, show, update, create,
});
