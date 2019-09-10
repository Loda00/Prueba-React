import { combineReducers } from 'redux';
import create from './create';
import update from './update';

export default combineReducers({
  create, update,
});
