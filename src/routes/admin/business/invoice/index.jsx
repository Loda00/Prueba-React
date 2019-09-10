import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { selectDocument } from 'actions/user-companies/select';
import { list as listInvoices, reset as resetInvoiceList } from 'actions/invoice/list';
import { Dimmer, Loader, Segment } from 'semantic-ui-react';
import ListInvoice from './list';
import CreateInvoice from './edit';
import ShowInvoice from './show';
import NotFound from '../../404';

class Invoice extends Component {
  componentDidMount() {
    const { getInvoices, selectedCompany, selectDocument } = this.props;

    selectDocument(null);
    getInvoices(`/invoices?company=${selectedCompany.id}`);
  }

  componentDidUpdate(prevProps) {
    const { updated, created, getInvoices, selectedCompany } = this.props;

    if (
      (!isEmpty(updated) && updated !== prevProps.updated)
      || (!isEmpty(created) && created !== prevProps.created)
    ) {
      getInvoices(`/invoices?company=${selectedCompany.id}`);
    }
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  render() {
    const { dataInvoice, loadingInvoice, t } = this.props;

    if (loadingInvoice || isEmpty(dataInvoice)) {
      return (
        <div className="section-container">
          <Segment
            basic
            className="section-loading"
          >
            <Dimmer active={loadingInvoice} inverted>
              <Loader>{t('loading')}</Loader>
            </Dimmer>
          </Segment>
        </div>
      );
    }

    return (
      <React.Fragment>
        <Switch>
          <Route exact path="/business/invoices" component={ListInvoice} />
          <Route key="create" exact path="/business/invoices/create" component={CreateInvoice} />
          <Route key="edit" exact path="/business/invoices/:id/edit" component={CreateInvoice} />
          <Route exact path="/business/invoices/:id" component={ShowInvoice} />
          <Route component={NotFound} />
        </Switch>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  getInvoices: page => dispatch(listInvoices(page)),
  selectDocument: quote => dispatch(selectDocument(quote)),
  reset: () => {
    dispatch(resetInvoiceList());
  },
});

const mapStateToProps = state => ({
  dataInvoice: state.invoice.list.data,
  loadingInvoice: state.invoice.list.loading,
  errorInvoice: state.invoice.list.error,

  selectedCompany: state.userCompanies.select.selectedCompany,

  updated: state.invoice.update.updated,
  created: state.invoice.create.created,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(Invoice);

export default withNamespaces('translation')(withRouter(Main));
