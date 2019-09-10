import React from 'react';
import { Route, Switch, NavLink, withRouter, Redirect } from 'react-router-dom';
import { withNamespaces } from 'react-i18next';
import { Menu } from 'semantic-ui-react';
import BankAccounts from './bank-accounts/index';
import CompanyDetails from './company-details/index';
import ContactInformation from './contact-information/index';
import SubscribedOptions from './subscribed-option/index';
import SubscriptionData from './subscription-data/index';

import NotFound from '../../404/index';

const Settings = (props) => {
  const { match, location, t } = props;
  const { office } = location;

  return (
    <React.Fragment>
      {!office
        && (
        <Menu pointing>
          <Menu.Item
            as={NavLink}
            to={`/offices/${match.params.id}/settings/contact-information`}
            name={t('officesContactInformation')}
            activeClassName="active"
          />
          <Menu.Item
            as={NavLink}
            to={`/offices/${match.params.id}/settings/company-details`}
            name={t('officesCompanyDetails')}
            activeClassName="active"
          />
          <Menu.Item
            as={NavLink}
            to={`/offices/${match.params.id}/settings/bank-accounts`}
            name={t('officesBankAccounts')}
            activeClassName="active"
          />
          <Menu.Item
            as={NavLink}
            to={`/offices/${match.params.id}/settings/subscription-data`}
            name={t('officesSubscriptionData')}
            activeClassName="active"
          />
          <Menu.Item
            as={NavLink}
            to={`/offices/${match.params.id}/settings/subscribed-option`}
            name={t('officesSubscribedOption')}
            activeClassName="active"
          />
        </Menu>
        )
      }

      <Switch>
        <Route
          exact
          path="/offices/:id/settings"
          render={() => (
            <Redirect
              to={{
                pathname: `/offices/${match.params.id}/settings/contact-information`,
                office,
              }}
            />
          )}
        />
        <Route
          exact
          path="/offices/:id/settings/contact-information"
          render={props => (
            <ContactInformation {...props} office={office} />
          )}
        />
        <Route
          exact
          path="/offices/:id/settings/company-details"
          render={props => (
            <CompanyDetails {...props} office={office} />
          )}
        />
        <Route
          exact
          path="/offices/:id/settings/bank-accounts"
          render={props => (
            <BankAccounts {...props} office={office} />
          )}
        />
        <Route
          exact
          path="/offices/:id/settings/subscription-data"
          render={props => (
            <SubscriptionData {...props} office={office} />
          )}
        />
        <Route
          exact
          path="/offices/:id/settings/subscribed-option"
          render={props => (
            <SubscribedOptions {...props} office={office} />
          )}
        />
        <Route component={NotFound} />
      </Switch>
    </React.Fragment>
  );
};

export default withNamespaces('translation')(withRouter(Settings));
