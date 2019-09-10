export function selectCompany(company) {
  return {
    type: 'USER_COMPANY_SELECT_COMPANY_SUCCESS', company,
  };
}

export function selectFiscalYear(fiscalYear) {
  return {
    type: 'USER_COMPANY_SELECT_FISCAL_YEAR_SUCCESS', fiscalYear,
  };
}

export function selectEmployee(employee) {
  return {
    type: 'USER_COMPANY_SELECT_EMPLOYEE_SUCCESS', employee,
  };
}

export function selectDocument(quote) {
  return {
    type: 'USER_COMPANY_SELECT_QUOTE_SUCCESS', quote,
  };
}

export function reset() {
  return {
    type: 'DOCUMENT_TYPE_RESET',
  };
}
