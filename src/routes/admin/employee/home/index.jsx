import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { selectEmployee } from 'actions/user-companies/select';
import { list, reset } from 'actions/employee/list';
import { TableList } from 'components';
import { Header } from 'semantic-ui-react';
import { withNamespaces } from 'react-i18next';

class HomeEmployee extends Component {
  state = {
    data: {},
  };

  componentDidMount() {
    const { getEmployees, selectedCompany } = this.props;

    getEmployees(`/employees?company=${selectedCompany.id}`);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.data) && !nextProps.data['hydra:member'] !== prevState.data) {
      return {
        data: nextProps.data['hydra:member'],
      };
    }
    return null;
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  setSelectedEmployee = (employee) => {
    const { selectEmployee, history } = this.props;

    selectEmployee(employee);
    history.push(`/employees/${employee.id}`);
  };

  render() {
    const { data } = this.state;

    const { loading, t } = this.props;

    const columns = [
      {
        name: t('formFirstName'),
        attribute: 'firstName',
        filterable: true,
        sortable: true,
      },
      {
        name: t('formLastName'),
        attribute: 'lastName',
        filterable: true,
        sortable: true,
      },
      {
        name: t('formJobTitle'),
        attribute: 'jobTitle',
        filterable: false,
        sortable: true,
      },
    ];

    return (
      <div className="section-container">
        <div className="section-general section-list">
          <Header as="h3">{t('staff')}</Header>
          <TableList
            columns={columns}
            filterBtn
            exportBtn
            addLink="/employees/create"
            loading={loading}
            data={data}
            onView={this.setSelectedEmployee}
          />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  selectEmployee: employee => dispatch(selectEmployee(employee)),
  getEmployees: page => dispatch(list(page)),
  reset: () => dispatch(reset()),
});

const mapStateToProps = state => ({
  data: state.employee.list.data,
  loading: state.employee.list.loading,
  error: state.employee.list.error,
  selectedCompany: state.userCompanies.select.selectedCompany,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(HomeEmployee);

export default withNamespaces('translation')(withRouter(Main));
