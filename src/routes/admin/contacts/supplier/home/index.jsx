import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { list, reset } from 'actions/supplier/list';
import { TableList } from 'components';
import { Header, Message } from 'semantic-ui-react';
import { withNamespaces } from 'react-i18next';

class HomeSupplier extends Component {
  state = {
    data: {},
    isLoaded: false,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.data) && !prevState.isLoaded) {
      return {
        data: nextProps.data['hydra:member'],
        isLoaded: true,
      };
    }
    return null;
  }

  componentDidMount() {
    const { getSuppliers, selectedCompany } = this.props;

    getSuppliers(`/suppliers?company=${selectedCompany['@id']}`);
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  onView = (item) => {
    const { history } = this.props;
    history.push(`/contacts/suppliers/${item.id}`);
  }

  render() {
    const { data } = this.state;
    const { loading, location, t } = this.props;

    const columns = [
      {
        name: t('formSupplierName'),
        attribute: 'supplierName',
        filterable: true,
        sortable: true,
      },
      {
        name: t('formContactName'),
        attribute: 'contactName',
        filterable: true,
        sortable: true,
      },
      {
        name: t('formStreetName'),
        attribute: 'streetName',
        filterable: false,
        sortable: true,
      },
      {
        name: t('formWebsite'),
        attribute: 'website',
        filterable: false,
        sortable: true,
      },
    ];

    return (
      <div className="section-container">
        <div className="section-general section-list">
          <Header as="h3">{t('suppliersHomeTitle')}</Header>

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
          <TableList
            columns={columns}
            filterBtn
            exportBtn
            addLink="/contacts/suppliers/create"
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
  getSuppliers: page => dispatch(list(page)),
  reset: () => dispatch(reset()),
});

const mapStateToProps = state => ({
  data: state.supplier.list.data,
  loading: state.supplier.list.loading,
  error: state.supplier.list.error,
  selectedCompany: state.userCompanies.select.selectedCompany,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(HomeSupplier);

export default withNamespaces('translation')(withRouter(Main));
