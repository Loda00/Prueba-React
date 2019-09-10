import React, { Fragment } from 'react';
import { NavLink, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';

import CreateDocumentNumbering from './document-numbering';
import CreateCompany from './create';
import HomeCompanies from './home';
import ShowCompany from './show';
import FiscalYear from './fiscal-year';
import Holidays from './holidays';
import CompanySettings from './settings';
import NotFound from '../404';

const Company = ({ selectedCompany, selectedFiscalYear, userRole, t }) => (
  <Fragment>
    {selectedCompany
      && (
        <div className="sub-nav">
          <ul>
            <li className="menu-item menu-title">
              {t('companies')}
            </li>
            {userRole !== 'ROLE_EMPLOYEE'
              && (
                <Fragment>
                  <li>
                    <NavLink
                      to="/companies"
                      activeClassName="active"
                      className="menu-item"
                    >
                      {t('companiesList')}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/companies/create"
                      activeClassName="active"
                      className="menu-item"
                    >
                      {t('companiesAddCompany')}
                    </NavLink>
                  </li>
                </Fragment>
              )}
            <li>
              <NavLink
                to="/company"
                activeClassName="active"
                className="menu-item"
              >
                {t('currentCompany')}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/company/fiscal_years"
                activeClassName="active"
                className="menu-item"
              >
                {t('fiscalYearsHomeTitle')}
              </NavLink>
            </li>
            <li className="menu-item menu-title">
              Données
            </li>
            <li>
              <NavLink
                to="/company/settings/contact-information"
                activeClassName="active"
                className="menu-item"
              >
                {t('companiesContactInformation')}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/company/settings/company-details"
                activeClassName="active"
                className="menu-item"
              >
                {t('companiesCompanyDetails')}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/company/settings/company-shares"
                activeClassName="active"
                className="menu-item"
              >
                {t('companiesCompanyShares')}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/company/settings/bank-accounts"
                activeClassName="active"
                className="menu-item"
              >
                {t('companiesBankAccounts')}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/company/settings/opening-hours"
                activeClassName="active"
                className="menu-item"
              >
                {t('companiesOpeningHours')}
              </NavLink>
            </li>

            <React.Fragment>
              <li className="menu-item menu-title">
                {t('companiesSettings')}
              </li>
              <li>
                <NavLink
                  to="/company/settings/vat-rates"
                  activeClassName="active"
                  className="menu-item"
                >
                  {t('companiesVatRates')}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/company/settings/units"
                  activeClassName="active"
                  className="menu-item"
                >
                  {t('companiesUnits')}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/company/settings/contract-types"
                  activeClassName="active"
                  className="menu-item"
                >
                  {t('companiesContractTypes')}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={selectedFiscalYear ? '/company/holidays' : '/company/fiscal_years/create'}
                  activeClassName="active"
                  className="menu-item"
                >
                  {t('holidaysShowTitle')}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/company/settings/day-off-reasons"
                  activeClassName="active"
                  className="menu-item"
                >
                  {t('companiesDayOffReasons')}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/company/settings/offer-reasons"
                  activeClassName="active"
                  className="menu-item"
                >
                  {t('companiesOfferReasons')}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/company/settings/quote-won-reasons"
                  activeClassName="active"
                  className="menu-item"
                >
                  {t('companiesQuoteWonReasons')}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/company/settings/quote-lost-reasons"
                  activeClassName="active"
                  className="menu-item"
                >
                  {t('companiesQuoteLostReasons')}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/company/settings/variance-reasons"
                  activeClassName="active"
                  className="menu-item"
                >
                  {t('companiesVarianceReasons')}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/company/settings/document-footers"
                  activeClassName="active"
                  className="menu-item"
                >
                  {t('companiesDocumentFooters')}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={selectedFiscalYear ? '/company/document_numbering' : '/company/fiscal_years/create'}
                  activeClassName="active"
                  className="menu-item"
                >
                  {t('documentNumberingTitle')}
                </NavLink>
              </li>
            </React.Fragment>
          </ul>
        </div>
      )}

    <Switch>
      <Route exact path="/company" component={ShowCompany} />
      <Route exact path="/company/edit" component={CreateCompany} />
      <Route path="/company/fiscal_years" component={FiscalYear} />
      <Route path="/company/settings" component={CompanySettings} />
      <Route exact path="/company/holidays" component={Holidays} />
      <Route exact path="/company/document_numbering" component={CreateDocumentNumbering} />
      <Route
        exact
        path="/companies"
        render={(props) => {
          if (userRole === 'ROLE_EMPLOYEE') {
            return (<NotFound />);
          }
          return (<HomeCompanies {...props} />);
        }}
      />
      <Route
        exact
        path="/companies/create"
        render={(props) => {
          if (userRole === 'ROLE_EMPLOYEE') {
            return (<NotFound />);
          }
          return (<CreateCompany {...props} />);
        }}
      />
      <Route component={NotFound} />
    </Switch>
  </Fragment>
);

const mapStateToProps = state => ({
  selectedCompany: state.userCompanies.select.selectedCompany,
  selectedFiscalYear: state.userCompanies.select.selectedFiscalYear,
  userRole: state.userCompanies.role.userRole,
});

const Main = connect(mapStateToProps)(Company);

export default withNamespaces('translation')(Main);
