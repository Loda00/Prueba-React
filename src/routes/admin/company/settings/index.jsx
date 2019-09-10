import React from 'react';
import { Route, Switch, withRouter, Redirect } from 'react-router-dom';
import { withNamespaces } from 'react-i18next';

import CompanyDetailsShow from './show/company-details';
import ContactInformationShow from './show/contact-information';
import OpeningHoursShow from './show/opening-hours';
import VatRatesShow from './show/vat-rates';
import DayOffReasonsShow from './show/day-off-reasons';
import UnitsShow from './show/units';
import ContractTypesShow from './show/contract-types';
import OfferReasonsShow from './show/offer-reasons';
import QuoteWonReasonsShow from './show/quote-won-reasons';
import VarianceReasonsShow from './show/variance-reasons';
import QuoteLostReasonsShow from './show/quote-lost-reasons';
import CompanySharesShow from './show/company-shares';
import BankAccountsShow from './show/bank-accounts';
import DocumentFootersShow from './show/document-footers';

import CompanyDetailsEdit from './edit/company-details';
import ContactInformationEdit from './edit/contact-information';
import OpeningHoursEdit from './edit/opening-hours';
import VatRatesEdit from './edit/vat-rates';
import DayOffReasonsEdit from './edit/day-off-reasons';
import UnitsEdit from './edit/units';
import ContractTypesEdit from './edit/contract-types';
import OfferReasonsEdit from './edit/offer-reasons';
import QuoteWonReasonsEdit from './edit/quote-won-reasons';
import VarianceReasonsEdit from './edit/variance-reasons';
import QuoteLostReasonsEdit from './edit/quote-lost-reasons';
import CompanySharesEdit from './edit/company-shares';
import BankAccountsEdit from './edit/bank-accounts';
import DocumentFootersEdit from './edit/document-footers';
import NotFound from '../../404/index';

const Settings = (props) => {
  const { match, location: { company } } = props;

  return (
    <React.Fragment>

      <Switch>
        <Route
          exact
          path="/company/settings"
          render={() => (
            <Redirect
              to={{
                pathname: `/offices/${match.params.id}/settings/contact-information`,
                company,
              }}
            />
          )}
        />
        <Route exact path="/company/settings/contact-information" component={ContactInformationShow} />
        <Route exact path="/company/settings/company-details" component={CompanyDetailsShow} />
        <Route exact path="/company/settings/opening-hours" component={OpeningHoursShow} />
        <Route exact path="/company/settings/vat-rates" component={VatRatesShow} />
        <Route exact path="/company/settings/day-off-reasons" component={DayOffReasonsShow} />
        <Route exact path="/company/settings/units" component={UnitsShow} />
        <Route exact path="/company/settings/contract-types" component={ContractTypesShow} />
        <Route exact path="/company/settings/offer-reasons" component={OfferReasonsShow} />
        <Route exact path="/company/settings/quote-won-reasons" component={QuoteWonReasonsShow} />
        <Route exact path="/company/settings/variance-reasons" component={VarianceReasonsShow} />
        <Route exact path="/company/settings/quote-lost-reasons" component={QuoteLostReasonsShow} />
        <Route exact path="/company/settings/company-shares" component={CompanySharesShow} />
        <Route exact path="/company/settings/bank-accounts" component={BankAccountsShow} />
        <Route exact path="/company/settings/document-footers" component={DocumentFootersShow} />
        <Route
          exact
          path="/company/settings/contact-information/edit"
          render={props => (
            <ContactInformationEdit {...props} company={company} />
          )}
        />
        <Route
          exact
          path="/company/settings/company-details/edit"
          render={props => (
            <CompanyDetailsEdit {...props} company={company} />
          )}
        />
        <Route exact path="/company/settings/opening-hours/edit" component={OpeningHoursEdit} />
        <Route exact path="/company/settings/vat-rates/edit" component={VatRatesEdit} />
        <Route exact path="/company/settings/day-off-reasons/edit" component={DayOffReasonsEdit} />
        <Route exact path="/company/settings/units/edit" component={UnitsEdit} />
        <Route exact path="/company/settings/contract-types/edit" component={ContractTypesEdit} />
        <Route exact path="/company/settings/offer-reasons/edit" component={OfferReasonsEdit} />
        <Route exact path="/company/settings/quote-won-reasons/edit" component={QuoteWonReasonsEdit} />
        <Route exact path="/company/settings/variance-reasons/edit" component={VarianceReasonsEdit} />
        <Route exact path="/company/settings/quote-lost-reasons/edit" component={QuoteLostReasonsEdit} />
        <Route exact path="/company/settings/company-shares/edit" component={CompanySharesEdit} />
        <Route exact path="/company/settings/bank-accounts/edit" component={BankAccountsEdit} />
        <Route exact path="/company/settings/document-footers/edit" component={DocumentFootersEdit} />
        <Route component={NotFound} />
      </Switch>
    </React.Fragment>
  );
};

export default withNamespaces('translation')(withRouter(Settings));
