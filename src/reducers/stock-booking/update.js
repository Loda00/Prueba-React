import { combineReducers } from 'redux';

export function retrieveError(state = null, action) {
  switch (action.type) {
    case 'STOCK_BOOKING_UPDATE_RETRIEVE_ERROR':
      return action.retrieveError;

    case 'STOCK_BOOKING_UPDATE_RESET':
      return null;

    default:
      return state;
  }
}

export function retrieveLoading(state = false, action) {
  switch (action.type) {
    case 'STOCK_BOOKING_UPDATE_RETRIEVE_LOADING':
      return action.retrieveLoading;

    case 'STOCK_BOOKING_UPDATE_RESET':
      return false;

    default:
      return state;
  }
}

export function retrieved(state = null, action) {
  switch (action.type) {
    case 'STOCK_BOOKING_UPDATE_RETRIEVE_SUCCESS':
      return action.retrieved;

    case 'STOCK_BOOKING_UPDATE_RESET':
      return null;

    default:
      return state;
  }
}

export function updateError(state = null, action) {
  switch (action.type) {
    case 'STOCK_BOOKING_UPDATE_UPDATE_ERROR':
      return action.updateError;

    case 'STOCK_BOOKING_UPDATE_RESET':
      return null;

    default:
      return state;
  }
}

export function updateLoading(state = false, action) {
  switch (action.type) {
    case 'STOCK_BOOKING_UPDATE_UPDATE_LOADING':
      return action.updateLoading;

    case 'STOCK_BOOKING_UPDATE_RESET':
      return false;

    default:
      return state;
  }
}

export function updated(state = null, action) {
  switch (action.type) {
    case 'STOCK_BOOKING_UPDATE_UPDATE_SUCCESS':
      return action.updated;

    case 'STOCK_BOOKING_UPDATE_RESET':
      return null;

    default:
      return state;
  }
}

export default combineReducers({
  retrieveError, retrieveLoading, retrieved, updateError, updateLoading, updated,
});
