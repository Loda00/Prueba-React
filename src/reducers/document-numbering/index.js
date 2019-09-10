import { combineReducers } from 'redux';
import create from './create';
import list from './list';
import update from './update';
import show from './show';

export default combineReducers({
  create, list, update, show,
});
