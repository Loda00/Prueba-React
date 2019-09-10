import React from 'react';
import { NavLink, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';

import CreateEmployee from './create';
import HomeEmployee from './home';
import ViewEmployee from './view';
import NotFound from '../404/index';

const Employee = ({ selectedEmployee, loadingEmployee, t }) => (
  <React.Fragment>
    <div className="sub-nav">
      <ul>
        <li className="menu-item menu-title">
          {t('employees')}
        </li>

        <li>
          <NavLink
            to="/employees"
            activeClassName="active"
            className="menu-item"
          >
            {t('employeeList')}
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/employees/create"
            activeClassName="active"
            className="menu-item"
          >
            {t('employeeAdd')}
          </NavLink>
        </li>

        {(selectedEmployee && !loadingEmployee)
        && (
          <React.Fragment>
            <li className="menu-item menu-title">
              {`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
            </li>

            <li>
              <NavLink
                to={`/employees/${selectedEmployee.id}`}
                activeClassName="active"
                className="menu-item"
              >
                {t('employeeContractInformation')}
              </NavLink>
            </li>

            <li>
              <NavLink
                to={`/employees/${selectedEmployee.id}/work-schedule`}
                activeClassName="active"
                className="menu-item"
              >
                {t('employeeWorkSchedule')}
              </NavLink>
            </li>

            <li>
              <NavLink
                to={`/employees/${selectedEmployee.id}/data-synthesis`}
                activeClassName="active"
                className="menu-item"
              >
                {t('employeeDataAndSynthesis')}
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/employees/view"
                activeClassName="active"
                className="menu-item"
              >
                {t('employeeLeavesManagement')}
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/employees/view"
                activeClassName="active"
                className="menu-item"
              >
                {t('employeeProfileAndRoles')}
              </NavLink>
            </li>

          </React.Fragment>
        )}
      </ul>
    </div>

    <Switch>
      <Route exact path="/employees/create" component={CreateEmployee} />
      <Route exact path="/employees" component={HomeEmployee} />
      <Route path="/employees/:id" component={ViewEmployee} />
      <Route component={NotFound} />
    </Switch>
  </React.Fragment>
);

const mapStateToProps = state => ({
  loadingEmployee: state.employee.show.loading,
  selectedEmployee: state.userCompanies.select.selectedEmployee,
  userRole: state.userCompanies.role.userRole,
});

const Main = connect(mapStateToProps)(Employee);

export default withNamespaces('translation')(Main);
