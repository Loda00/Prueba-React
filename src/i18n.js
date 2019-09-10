import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import findKey from 'lodash';
import { reactI18nextModule } from 'react-i18next';

import translationEN from 'lang/en/translation';
import translationENDashboard from 'lang/en/dashboard';
import translationENUtil from 'lang/en/util';
import translationENForm from 'lang/en/form';
import translationENButton from 'lang/en/buttons';
import translationENExpert from 'lang/en/experts';
import translationENCompany from 'lang/en/companies';
import translationENEmployee from 'lang/en/employees';
import translationENEnsemble from 'lang/en/ensembles';
import translationENOffice from 'lang/en/offices';
import translationENProduct from 'lang/en/products';
import translationENStock from 'lang/en/stocks';
import translationENSupplier from 'lang/en/suppliers';
import translationENService from 'lang/en/services';
import translationENFiscalYear from 'lang/en/fiscal-years';
import translationENSelfFinancing from 'lang/en/self-financings';
import translationENHoliday from 'lang/en/holidays';
import translationENWorkingCapitals from 'lang/en/working-capitals';
import translationENBudget from 'lang/en/budgets';
import translationENSidebar from 'lang/en/sidebar';
import translationENArticles from 'lang/en/articles';
import translationENForecast from 'lang/en/forecast';
import translationENDocuments from 'lang/en/documents';
import translationENDocumentNumbering from 'lang/en/document-numbering';
import translationENContacts from 'lang/en/contacts';
import translationENCustomer from 'lang/en/customer';


import translationFR from 'lang/fr/translation';
import translationFRDashboard from 'lang/fr/dashboard';
import translationFRUtil from 'lang/fr/util';
import translationFRForm from 'lang/fr/form';
import translationFRButton from 'lang/fr/buttons';
import translationFRExpert from 'lang/fr/experts';
import translationFRCompany from 'lang/fr/companies';
import translationFREmployee from 'lang/fr/employees';
import translationFREnsemble from 'lang/fr/ensembles';
import translationFROffice from 'lang/fr/offices';
import translationFRProduct from 'lang/fr/products';
import translationFRStock from 'lang/fr/stocks';
import translationFRSupplier from 'lang/fr/suppliers';
import translationFRService from 'lang/fr/services';
import translationFRFiscalYear from 'lang/fr/fiscal-years';
import translationFRSelfFinancing from 'lang/fr/self-financings';
import translationFRHoliday from 'lang/fr/holidays';
import translationFRWorkingCapitals from 'lang/fr/working-capitals';
import translationFRBudget from 'lang/fr/budgets';
import translationFRSidebar from 'lang/fr/sidebar';
import translationFRArticles from 'lang/fr/articles';
import translationFRForecast from 'lang/fr/forecast';
import translationFRDocuments from 'lang/fr/documents';
import translationFRDocumentNumbering from 'lang/fr/document-numbering';
import translationFRContacts from 'lang/fr/contacts';
import translationFRCustomer from 'lang/fr/customer';

// the translations

const enResult = {
  ...translationEN,
  ...translationENDashboard,
  ...translationENUtil,
  ...translationENForm,
  ...translationENButton,
  ...translationENCompany,
  ...translationENExpert,
  ...translationENEmployee,
  ...translationENEnsemble,
  ...translationENOffice,
  ...translationENProduct,
  ...translationENStock,
  ...translationENSupplier,
  ...translationENService,
  ...translationENFiscalYear,
  ...translationENSelfFinancing,
  ...translationENHoliday,
  ...translationENWorkingCapitals,
  ...translationENBudget,
  ...translationENSidebar,
  ...translationENArticles,
  ...translationENForecast,
  ...translationENDocuments,
  ...translationENDocumentNumbering,
  ...translationENContacts,
  ...translationENCustomer,
};

const frResult = {
  ...translationFR,
  ...translationFRDashboard,
  ...translationFRUtil,
  ...translationFRForm,
  ...translationFRButton,
  ...translationFRExpert,
  ...translationFRCompany,
  ...translationFREmployee,
  ...translationFREnsemble,
  ...translationFROffice,
  ...translationFRProduct,
  ...translationFRStock,
  ...translationFRSupplier,
  ...translationFRService,
  ...translationFRFiscalYear,
  ...translationFRSelfFinancing,
  ...translationFRHoliday,
  ...translationFRWorkingCapitals,
  ...translationFRBudget,
  ...translationFRSidebar,
  ...translationFRArticles,
  ...translationFRForecast,
  ...translationFRDocuments,
  ...translationFRDocumentNumbering,
  ...translationFRContacts,
  ...translationFRCustomer,
};

const resources = {
  en: {
    translation: enResult,
  },
  fr: {
    translation: frResult,
  },
};

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to the react-i18next components.
  // Alternative use the I18nextProvider: https://react.i18next.com/components/i18nextprovider
  .use(reactI18nextModule)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    resources,
    fallbackLng: 'en',
    debug: true,
    saveMissing: true,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },

    // special options for react-i18next
    // learn more: https://react.i18next.com/components/i18next-instance
    react: {
      wait: true,
    },
  });

const fixLanguage = () => {
  const getLanguage = i18n.language;

  const fixLanguage = getLanguage.substr(0, getLanguage.indexOf('-'));

  const filterResources = findKey(resources, ['translation', fixLanguage]);

  if (filterResources === undefined) {
    i18n.changeLanguage('en');
  } else if (getLanguage.includes('-')) {
    i18n.changeLanguage(fixLanguage);
  }
};

fixLanguage();

export default i18n;
