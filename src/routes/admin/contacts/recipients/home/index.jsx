import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { list as listCustomer, reset } from 'actions/customer/list';
import { TableList } from 'components';
import { Header, Message } from 'semantic-ui-react';
import { withNamespaces } from 'react-i18next';

class HomeSupplier extends Component {
  state = {
    data: {},
    isLoaded: false,
  };

  componentDidMount() {
    const { getCustomerList, selectedCompany } = this.props;

    getCustomerList(`/customers?company=${selectedCompany['@id']}`);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.data) && !prevState.isLoaded) {
      return {
        data: nextProps.data['hydra:member'],
        isLoaded: true,
      };
    }
    return null;
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }


  onView = (data) => {
    const { history } = this.props;
    history.push(`/contacts/recipients/${data.id}`);
  }

  render() {
    const { data } = this.state;
    const { loading, location, t } = this.props;

    const columns = [
      {
        name: t('customerCompanyName'),
        attribute: 'companyName',
        filterable: true,
        sortable: true,
      },
      {
        name: t('customerContactName'),
        attribute: 'contactName',
        filterable: true,
        sortable: true,
      },
    ];

    return (
      <div className="section-container">
        <div className="section-general section-list">
          <Header as="h3">{t('coustomerHome')}</Header>

          {location.message
            && (
              <Message
                positive={location.message.type === 'positive'}
                negative={location.message.type === 'negative'}
              >
                <p>{location.message.text}</p>
              </Message>
            )
          }
          {
            // eslint-disable-next-line no-console
            console.log('data', data)
          }
          <TableList
            columns={columns}
            filterBtn
            exportBtn
            addLink="/contacts/recipients/create"
            loading={loading}
            data={data}
            onView={this.onView}
          />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  getCustomerList: () => dispatch(listCustomer()),
  reset: () => dispatch(reset()),
});

const mapStateToProps = state => ({
  data: state.customer.list.data,
  loading: state.customer.list.loading,
  error: state.customer.list.error,
  selectedCompany: state.userCompanies.select.selectedCompany,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(HomeSupplier);

export default withNamespaces('translation')(withRouter(Main));
