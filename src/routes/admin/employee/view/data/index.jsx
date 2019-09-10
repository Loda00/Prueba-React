import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { retrieve as retrieveEmployeeData, reset as resetEmployeeData } from 'actions/employee-data/show';

import ShowEmployeeData from './synthesis/show';
import EditEmployeeData from './synthesis/edit';
import ShowEmployeeSchedule from './schedule/show';
import EditEmployeeSchedule from './schedule/edit';
import NotFound from '../../../404';

class ViewEmployee extends Component {
  componentDidMount() {
    const { getEmployeeData, selectedEmployee, selectedFiscalYear } = this.props;

    getEmployeeData(`/employee_datas?employee=${selectedEmployee.id}&fiscalYear=${selectedFiscalYear.id}`);
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  render() {
    return (
      <React.Fragment>
        <Switch>
          <Route exact path="/employees/:id/data-synthesis" component={ShowEmployeeData} />
          <Route exact path="/employees/:id/work-schedule" component={ShowEmployeeSchedule} />
          <Route exact path="/employees/:id/data-synthesis/edit" component={EditEmployeeData} />
          <Route exact path="/employees/:id/work-schedule/edit" component={EditEmployeeSchedule} />
          <Route component={NotFound} />
        </Switch>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  getEmployeeData: page => dispatch(retrieveEmployeeData(page)),
  reset: () => dispatch(resetEmployeeData()),
});

const mapStateToProps = state => ({
  selectedEmployee: state.userCompanies.select.selectedEmployee,
  selectedFiscalYear: state.userCompanies.select.selectedFiscalYear,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(ViewEmployee);

export default withNamespaces('translation')(withRouter(Main));
