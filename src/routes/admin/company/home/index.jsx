/* eslint-disable */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { selectCompany } from 'actions/user-companies/select';
import { TableList } from 'components';
import { Header } from 'semantic-ui-react';
import { withNamespaces } from 'react-i18next';
import classnames from "classnames";

class HomeCompanies extends Component {
  state = {
    data : [],
  };
  componentDidMount() {
    const { userCompanies } = this.props;

    if(!isEmpty(userCompanies)){
      this.setState({
        data : userCompanies['hydra:member'],
      })
    }
  }

  setSelectedCompany = (company) => {
    const { selectCompany, history } = this.props;

    selectCompany(company);
    history.push('/company');
  };

  render() {
    const { data } = this.state;
    const { t, selectedCompany, loadingUserCompanies, userCompanies } = this.props;

    const columns = [
      {
        name: t('formName'),
        attribute: 'name',
        filterable: true,
        sortable: false,
      },
    ];

    return (
      <div
        className={classnames({
          "section-container": selectedCompany,
        })}
        style={selectedCompany ? {} : {width:'100%'}}
      >
        <div
          className={classnames("section-general section-list", {
            "no-margin": selectedCompany
          })}
        >
          <Header as="h3">{t('companiesHomeTitle')}</Header>
          <TableList
            columns={columns}
            filterBtn
            exportBtn
            addLink="/companies/create"
            loading={loadingUserCompanies}
            data={data}
            onView={this.setSelectedCompany}
          />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  selectCompany: company => dispatch(selectCompany(company)),
});

const mapStateToProps = state => ({
  selectedCompany: state.userCompanies.select.selectedCompany,
  userCompanies: state.userCompanies.list.data,
  loadingUserCompanies: state.userCompanies.list.loading,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(HomeCompanies);

export default withNamespaces('translation')(withRouter(Main));
