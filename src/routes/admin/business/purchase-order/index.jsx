import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { selectDocument } from 'actions/user-companies/select';
import { list as listPurchaseOrder, reset as resetPurchaseOrderList } from 'actions/purchase-order/list';
import { Dimmer, Loader, Segment } from 'semantic-ui-react';

import ListPurchaseOrder from './list';
import CreatePurchaseOrder from './edit';
import ShowPurchaseOrder from './show';
import NotFound from '../../404';

class PurchaseOrder extends Component {
  componentDidMount() {
    const { getPurchaseOrders, selectedCompany, selectDocument } = this.props;

    selectDocument(null);
    getPurchaseOrders(`/purchase_orders?company=${selectedCompany.id}`);
  }

  componentDidUpdate(prevProps) {
    const { updated, created, getPurchaseOrders, selectedCompany } = this.props;

    if (
      (!isEmpty(updated) && updated !== prevProps.updated)
      || (!isEmpty(created) && created !== prevProps.created)
    ) {
      getPurchaseOrders(`/purchase_orders?company=${selectedCompany.id}`);
    }
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  render() {
    const { dataPurchaseOrder, loadingPurchaseOrder, t } = this.props;

    if (loadingPurchaseOrder || isEmpty(dataPurchaseOrder)) {
      return (
        <div className="section-container">
          <Segment
            basic
            className="section-loading"
          >
            <Dimmer active={loadingPurchaseOrder} inverted>
              <Loader>{t('loading')}</Loader>
            </Dimmer>
          </Segment>
        </div>
      );
    }

    return (
      <React.Fragment>
        <Switch>
          <Route exact path="/business/purchase-orders" component={ListPurchaseOrder} />
          <Route key="edit" exact path="/business/purchase-orders/create" component={CreatePurchaseOrder} />
          <Route key="create" exact path="/business/purchase-orders/:id/edit" component={CreatePurchaseOrder} />
          <Route exact path="/business/purchase-orders/:id" component={ShowPurchaseOrder} />
          <Route component={NotFound} />
        </Switch>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  getPurchaseOrders: page => dispatch(listPurchaseOrder(page)),
  selectDocument: quote => dispatch(selectDocument(quote)),
  reset: () => {
    dispatch(resetPurchaseOrderList());
  },
});

const mapStateToProps = state => ({
  dataPurchaseOrder: state.purchaseOrder.list.data,
  loadingPurchaseOrder: state.purchaseOrder.list.loading,
  errorPurchaseOrder: state.purchaseOrder.list.error,

  selectedCompany: state.userCompanies.select.selectedCompany,

  updated: state.purchaseOrder.update.updated,
  created: state.purchaseOrder.create.created,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(PurchaseOrder);

export default withNamespaces('translation')(withRouter(Main));
