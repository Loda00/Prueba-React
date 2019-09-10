import React from 'react';
import { NavLink, Redirect, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';

import Services from './service';
import Ensemble from './ensemble';
import Product from './product';
import NotFound from '../404';


const Articles = ({ selectedCompany, userRole, t }) => (
  <React.Fragment>
    { selectedCompany
    && (
      <div className="sub-nav">
        <ul>
          <li className="menu-item menu-title">
            {t('articlesShowTitle')}
          </li>
          {userRole !== 'ROLE_EMPLOYEE'
          && (
            <li>
              <NavLink
                to="/articles/products"
                activeClassName="active"
                className="menu-item"
              >
                {t('productsShowTitle')}
              </NavLink>
            </li>
          )}
          <li>
            <NavLink
              to="/articles/ensembles"
              activeClassName="active"
              className="menu-item"
            >
              {t('ensemblesShowTitle')}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/articles/services"
              activeClassName="active"
              className="menu-item"
            >
              {t('servicesShowTitle')}
            </NavLink>
          </li>
        </ul>
      </div>
    )}
    <Switch>
      <Route
        exact
        path="/articles/"
        render={() => (
          <Redirect
            to={{
              pathname: '/articles/products',
            }}
          />
        )}
      />
      <Route path="/articles/services" component={Services} />
      <Route path="/articles/ensembles" component={Ensemble} />
      <Route path="/articles/products" component={Product} />
      <Route component={NotFound} />
    </Switch>
  </React.Fragment>
);
const mapStateToProps = state => ({
  selectedCompany: state.userCompanies.select.selectedCompany,
  userRole: state.userCompanies.role.userRole,
});

const Main = connect(mapStateToProps)(Articles);

export default withNamespaces('translation')(Main);
