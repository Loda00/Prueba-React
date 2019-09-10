import { combineReducers } from 'redux';
import { reducer as form } from 'redux-form';
import { routerReducer as routing } from 'react-router-redux';

import layout, { layoutRight } from './layout';
import auth from './auth';
import office from './office';
import expert from './expert';
import employee from './employee';
import company from './company';
import companySettings from './company-settings';
import officeSettings from './office-settings';
import ensemble from './ensemble';
import product from './product';
import service from './service';
import stock from './stock';
import supplier from './supplier';
import media from './media';
import fiscalYear from './fiscal-year';
import workingCapital from './working-capital';
import holiday from './holiday';
import selfFinancing from './self-financing';
import budget from './budget';
import hourSynthesis from './hour-synthesis';
import employeeData from './employee-data';
import calculationMode from './calculation-mode';
import forecast from './forecast';
import userCompanies from './user-companies';
import quote from './quote';
import customer from './customer';
import counterForm from './document-timer';
import article from './article';
import purchaseOrder from './purchase-order';
import documentNumbering from './document-numbering';
import followUp from './follow-up';
import model from './document-model';
import invoice from './invoice';
import stockBooking from './stock-booking';

const EssorApp = combineReducers({
  routing,
  form,
  layout,
  layoutRight,
  auth,
  office,
  expert,
  employee,
  company,
  companySettings,
  officeSettings,
  ensemble,
  product,
  service,
  stock,
  supplier,
  media,
  fiscalYear,
  workingCapital,
  holiday,
  selfFinancing,
  budget,
  hourSynthesis,
  employeeData,
  calculationMode,
  forecast,
  userCompanies,
  quote,
  customer,
  counterForm,
  article,
  purchaseOrder,
  documentNumbering,
  followUp,
  model,
  invoice,
  stockBooking,
});

const rootReducer = (state, action) => {
  if (action.type === 'LOG_OUT') {
    localStorage.removeItem('EssorAppStorage');

    return {
      ...state,
      auth: {
        created: null,
        error: null,
        loading: false,
      },
      userCompanies: {
        list: {
          data: null,
          error: null,
          loading: false,
        },
        select: {
          selectedCompany: null,
          selectedFiscalYear: null,
          selectedDocument: null,
          selectedEmployee: null,
        },
        role: {
          userRole: null,
        },
      },
    };
  }

  return EssorApp(state, action);
};

export default rootReducer;
