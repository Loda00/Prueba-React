import React, { Component } from 'react';
import { NavLink, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { withNamespaces } from 'react-i18next';
import { change } from 'actions/quote/change';
import { selectDocument, reset } from 'actions/user-companies/select';
import { create as createStockBooking, success, error, loading } from 'actions/stock-booking/create';
import { Form, Header, Modal } from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import { EssorButton, toast } from 'components';

import HomeBusiness from './home';
import Invoice from './invoice';
import PurchaseOrder from './purchase-order';
import Quotes from './quote';
import Models from './document-model';
import NotFound from '../404';

class Business extends Component {
  state = {
    openStockModal: false,
    date: null,
    dateError: false,
    duplicateChange: false,
    toConvert: null,
  };

  componentDidUpdate(prevProps) {
    const { duplicateChange, toConvert } = this.state;
    const { changed, history, selectDocument } = this.props;


    if (prevProps.changed !== changed && duplicateChange && changed) {
      selectDocument(changed);
      history.push(`/business/quotes/${changed.id}`);
    }

    if (!isEmpty(toConvert) && (prevProps.changed !== changed)) {
      history.push(`/business${changed['@id']}/edit`);
    }
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  convert = (link, toConvert) => {
    const { postChange, selectedDocument } = this.props;
    postChange(`${selectedDocument['@id']}${link}`);

    if (toConvert) {
      this.setState({
        toConvert,
      });
    }
  };

  duplicateQuote = (id) => {
    const { duplicateChange } = this.state;
    const { postChange } = this.props;
    postChange(`quotes/${id}/duplicate`);
    this.setState({
      duplicateChange: !duplicateChange,
    });
  };

  handleDateChange = (date) => {
    this.setState({
      date,
    });
  };

  openStockModal = () => {
    this.setState({
      openStockModal: true,
      date: null,
      dateError: false,
    });
  };

  closeStockModal = () => {
    this.setState({
      openStockModal: false,
    });
  };

  handleOnStockBookingSubmit = () => {
    const { date } = this.state;
    const { selectedDocument, selectedCompany, postStockBooking, t } = this.props;

    this.setState({
      dateError: false,
    });

    let isValid = true;

    if (!date) {
      isValid = false;

      this.setState({
        dateError: true,
      });
    }

    if (!isValid) return;

    const toBooking = [];
    const promises = [];

    for (let i = 0; i < selectedDocument.content.body.length; i++) {
      if (selectedDocument.content.body[i].type === 'Product' && selectedDocument.content.body[i].stockManagement) {
        toBooking.push({
          product: selectedDocument.content.body[i].id,
          quantity: selectedDocument.content.body[i].quantity,
        });
      }
    }

    toBooking.forEach((item) => {
      const data = {
        estimatedDate: date,
        product: item.product,
        company: selectedCompany['@id'],
        quantity: parseFloat(item.quantity).toString(),
        purchaseOrder: selectedDocument['@id'],
      };

      promises.push(postStockBooking(data));
    });

    Promise.all(promises)
      .then(() => toast.success(t('stockBookingCreateSuccess')));
  };

  render() {
    const {
      selectedCompany,
      selectedDocument,
      loadingStockBooking,
      t,
    } = this.props;

    const { openStockModal, date, dateError } = this.state;

    let canBooking = false;

    const documentType = !isEmpty(selectedDocument)
      ? selectedDocument['@type']
      : '';

    if (!isEmpty(selectedDocument) && selectedDocument['@type'] === 'PurchaseOrder') {
      for (let i = 0; i < selectedDocument.content.body.length; i++) {
        if (selectedDocument.content.body[i].type === 'Product' && selectedDocument.content.body[i].stockManagement) {
          canBooking = true;
          break;
        }
      }
    }

    const selectedTypeMenu = item => (
      <React.Fragment>
        <li>
          <Header as="h4" className="menu-item">Transform</Header>
          <ul className="business-list__document">
            <li className="menu-item">
              <div onClick={() => { this.duplicateQuote(selectedDocument.id); }}>
                {t(`${item}Duplicate`)}
              </div>
            </li>
            <li className="menu-item">
              <div onClick={() => { this.convert('/to_invoice', 'invoice'); }}>
                {t('quoteInvoice')}
              </div>
            </li>

            <li className="menu-item">
              <div onClick={() => { this.convert('/to_purchase_order', 'purchase'); }}>
                {t('quotePurchaseOrder')}
              </div>
            </li>

            {(canBooking && selectedDocument.status >= 4)
            && (
              <li className="menu-item">
                <div onClick={this.openStockModal}>
                  {t('purchaseOrderStockBooking')}
                </div>
              </li>
            )}
          </ul>
        </li>
      </React.Fragment>
    );

    return (
      <React.Fragment>
        { selectedCompany
        && (
          <div className="sub-nav">
            <ul className="business-list">
              <li className="menu-item menu-title">
                {t('companiesBusinessManagement')}
              </li>
              <li>
                <div>
                  <NavLink
                    to="/business/quotes"
                    activeClassName="active"
                    className="menu-item"
                  >
                    {t('quotesHomeTitle')}
                  </NavLink>
                </div>
              </li>
              <li>
                <NavLink
                  to="/business/quotes/create"
                  activeClassName="active"
                  className="menu-item"
                >
                  {t('quotesCreateTitle')}
                </NavLink>
              </li>
              {
                documentType === 'Quote' && (
                  selectedTypeMenu(documentType)
                )
              }
              <li className="menu-title">
                <NavLink
                  to="/business/purchase-orders"
                  activeClassName="active"
                  className="menu-item"
                >
                  {t('purchaseOrderHomeTitle')}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/business/purchase-orders/create"
                  activeClassName="active"
                  className="menu-item"
                >
                  {t('purchaseOrdersCreateTitle')}
                </NavLink>
              </li>
              {
                documentType === 'PurchaseOrder' && (
                  selectedTypeMenu(documentType)
                )
              }
              <li className="menu-title">
                <NavLink
                  to="/business/invoices"
                  activeClassName="active"
                  className="menu-item"
                >
                  {t('invoiceHomeTitle')}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/business/invoices/create"
                  activeClassName="active"
                  className="menu-item"
                >
                  {t('invoicesCreateTitle')}
                </NavLink>
              </li>

              {
                documentType === 'Invoice' && (
                  selectedTypeMenu(documentType)
                )
              }
              <li className="menu-title">
                <NavLink
                  to="/business/models"
                  activeClassName="active"
                  className="menu-item"
                >
                  {t('modelHomeTitle')}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/business/models/create"
                  activeClassName="active"
                  className="menu-item"
                >
                  {t('modelCreateTitle')}
                </NavLink>
              </li>

              <li className="menu-title">
                <NavLink
                  to="/"
                  activeClassName="active"
                  className="menu-item"
                >
                  Commandes Fournisseurs
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/"
                  activeClassName="active"
                  className="menu-item"
                >
                  Ajouter une commande F/seur
                </NavLink>
              </li>

              <li className="menu-title">
                <NavLink
                  to="/"
                  activeClassName="active"
                  className="menu-item"
                >
                  Export en compta
                </NavLink>
              </li>
            </ul>
          </div>
        )}

        <Modal
          open={openStockModal}
          closeOnEscape={false}
          closeOnDimmerClick={false}
          className="mid-content"
        >
          <Modal.Header>Modal edit</Modal.Header>
          <Modal.Content scrolling>
            <Modal.Description>

              <Form className="margin-top-bot main-form" size="small">
                <Form.Group inline>
                  <Form.Input
                    label={t('formDate')}
                    name="date"
                    control={DatePicker}
                    selected={date}
                    onChange={this.handleDateChange}
                    locale="fr"
                    autoComplete="off"
                    error={dateError}
                  />
                </Form.Group>
              </Form>
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <EssorButton disabled={loadingStockBooking} secondary type="x" size="small" onClick={this.closeStockModal}>
              {t('buttonCancel')}
            </EssorButton>

            <EssorButton disabled={loadingStockBooking} type="plus" size="small" onClick={this.handleOnStockBookingSubmit}>
              {t('buttonSave')}
            </EssorButton>
          </Modal.Actions>
        </Modal>

        <Switch>
          <Route exact path="/business" component={HomeBusiness} />
          <Route path="/business/invoices" component={Invoice} />
          <Route path="/business/purchase-orders" component={PurchaseOrder} />
          <Route path="/business/quotes" component={Quotes} />
          <Route path="/business/models" component={Models} />
          <Route component={NotFound} />
        </Switch>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  postStockBooking: data => dispatch(createStockBooking(data)),
  postChange: data => dispatch(change(data)),
  selectDocument: quote => dispatch(selectDocument(quote)),
  reset: () => {
    dispatch(reset());
    dispatch(success(null));
    dispatch(error(null));
    dispatch(loading(false));
  },
});

const mapStateToProps = state => ({
  selectedCompany: state.userCompanies.select.selectedCompany,
  selectedFiscalYear: state.userCompanies.select.selectedFiscalYear,
  createdQuote: state.quote.create.created,
  selectedDocument: state.userCompanies.select.selectedDocument,
  changed: state.quote.change.changed,
  success: state.quote.change.success,

  createdStockBooking: state.stockBooking.create.created,
  loadingStockBooking: state.stockBooking.create.loading,
  errorStockBooking: state.stockBooking.create.error,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(Business);

export default withNamespaces('translation')(Main);
