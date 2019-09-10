import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { reset as resetEmployee, retrieve as retrieveEmployee } from 'actions/employee/show';
import { selectEmployee } from 'actions/user-companies/select';
import { Dimmer, Loader, Segment } from 'semantic-ui-react';

import ShowEmployee from './show';
import CreateEmployee from '../create';
import EmployeeData from './data';
import NotFound from '../../404';

class ViewEmployee extends Component {
  state = {
    isValid: true,
    retrievedEmployee: null,
  };

  componentDidMount() {
    const { selectedEmployee, getEmployee, match } = this.props;

    if (isEmpty(selectedEmployee) || selectedEmployee.id !== parseInt(match.params.id, 10)) {
      getEmployee(`/employees/${match.params.id}`);
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.retrieved) && nextProps.retrieved !== prevState.retrievedEmployee) {
      return {
        isValid: nextProps.retrieved.company === nextProps.selectedCompany['@id'],
        retrievedEmployee: nextProps.retrieved,
      };
    }

    return null;
  }

  componentDidUpdate(prevProps) {
    const { isValid } = this.state;
    const { retrieved, selectEmployee, reset } = this.props;

    if (prevProps.retrieved !== retrieved) {
      if (isValid) {
        selectEmployee(retrieved);
      } else {
        reset();
        selectEmployee(null);
      }
    }
  }

  render() {
    const { selectedEmployee, loading, t } = this.props;
    const { isValid } = this.state;

    if (!isValid) {
      return (
        <div className="section-container">
          <NotFound />
        </div>
      );
    }

    if (loading || !selectedEmployee) {
      return (
        <div className="section-container">
          <Segment
            basic
            className="section-loading"
          >
            <Dimmer active={loading} inverted>
              <Loader>{t('loading')}</Loader>
            </Dimmer>
          </Segment>
        </div>
      );
    }

    if (selectedEmployee) {
      return (
        <React.Fragment>
          <Switch>
            <Route exact path="/employees/:id/edit" component={CreateEmployee} />
            <Route exact path="/employees/:id" component={ShowEmployee} />
            <Route path="/employees/:id/data-synthesis" component={EmployeeData} />
            <Route path="/employees/:id/work-schedule" component={EmployeeData} />
            <Route component={NotFound} />
          </Switch>
        </React.Fragment>
      );
    }
  }
}

const mapDispatchToProps = dispatch => ({
  selectEmployee: employee => dispatch(selectEmployee(employee)),
  getEmployee: page => dispatch(retrieveEmployee(page)),
  reset: () => dispatch(resetEmployee()),
});

const mapStateToProps = state => ({
  error: state.employee.show.error,
  loading: state.employee.show.loading,
  retrieved: state.employee.show.retrieved,
  selectedEmployee: state.userCompanies.select.selectedEmployee,
  selectedCompany: state.userCompanies.select.selectedCompany,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(ViewEmployee);

export default withNamespaces('translation')(withRouter(Main));
