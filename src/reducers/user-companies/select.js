import { combineReducers } from 'redux';

export function selectedCompany(state = null, action) {
  switch (action.type) {
    case 'USER_COMPANY_SELECT_COMPANY_SUCCESS':
      return action.company;

    default:
      return state;
  }
}

export function selectedFiscalYear(state = null, action) {
  switch (action.type) {
    case 'USER_COMPANY_SELECT_FISCAL_YEAR_SUCCESS':
      return action.fiscalYear;

    default:
      return state;
  }
}

export function selectedDocument(state = null, action) {
  switch (action.type) {
    case 'USER_COMPANY_SELECT_QUOTE_SUCCESS':
      return action.quote;
    case 'DOCUMENT_TYPE_RESET':
      return null;
    default:
      return state;
  }
}

export function selectedEmployee(state = null, action) {
  switch (action.type) {
    case 'USER_COMPANY_SELECT_EMPLOYEE_SUCCESS':
      return action.employee;

    default:
      return state;
  }
}

export default combineReducers({
  selectedCompany, selectedFiscalYear, selectedDocument, selectedEmployee,
});
