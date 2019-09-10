import React from 'react';
import { NavLink, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';

import Welcome from './welcome';
import Budgets from './budgets';
import HourSynthesis from './hour-synthesis';
import ForecastTable from './table';
import BreakEven from './break-even';
import SelfFinancing from './self-financing';
import WorkingCapital from './working-capital';
import NotFound from '../404/index';
import SidebarInfo from './sidebar-info';

const Forecast = ({ t, selectedFiscalYear }) => (
  <React.Fragment>
    <div className="sub-nav">
      <ul>
        <li className="menu-item menu-title">
          {t('forecast')}
          <p>{selectedFiscalYear.label}</p>
        </li>

        <li>
          <NavLink
            to="/forecast/budgets"
            activeClassName="active"
            className="menu-item"
          >
            {t('forecastBudgets')}
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/forecast/hour-synthesis"
            activeClassName="active"
            className="menu-item"
          >
            {t('forecastHourSynthesis')}
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/forecast/table"
            activeClassName="active"
            className="menu-item"
          >
            {t('forecastTable')}
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/forecast/break-even"
            activeClassName="active"
            className="menu-item"
          >
            {t('forecastBreakEven')}
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/forecast/self-financing"
            activeClassName="active"
            className="menu-item"
          >
            {t('forecastSelfFinancing')}
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/forecast/working-capital"
            activeClassName="active"
            className="menu-item"
          >
            {t('forecastWorkingCapital')}
          </NavLink>
        </li>
      </ul>
    </div>

    <Switch>
      <Route exact path="/forecast" component={Welcome} />
      <Route exact path="/forecast/budgets" component={Budgets} />
      <Route exact path="/forecast/hour-synthesis" component={HourSynthesis} />
      <Route exact path="/forecast/table" component={ForecastTable} />
      <Route exact path="/forecast/break-even" component={BreakEven} />
      <Route path="/forecast/self-financing" component={SelfFinancing} />
      <Route path="/forecast/working-capital" component={WorkingCapital} />
      <Route component={NotFound} />
    </Switch>
    <SidebarInfo />
  </React.Fragment>
);

const mapStateToProps = state => ({
  loadingEmployee: state.employee.show.loading,
  selectedEmployee: state.userCompanies.select.selectedEmployee,
  userRole: state.userCompanies.role.userRole,

  selectedFiscalYear: state.userCompanies.select.selectedFiscalYear,
});

const Main = connect(mapStateToProps)(Forecast);

export default withNamespaces('translation')(Main);
