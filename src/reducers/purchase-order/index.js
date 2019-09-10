import { combineReducers } from 'redux';
import create from './create';
import list from './list';
import show from './show';
import update from './update';
import change from './change';

export default combineReducers({
  create, list, show, update, change,
});
