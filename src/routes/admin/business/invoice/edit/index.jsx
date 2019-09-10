import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import moment from 'moment';
import { isEmpty, find } from 'lodash';
import { reset as resetInvoiceList } from 'actions/invoice/list';
import { list as listCustomer, reset as resetListCustomer } from 'actions/customer/list';
import { list as listCompanySettings, reset as resetCompanySettings } from 'actions/company-settings/list';
import { create as createInvoice, success as successInvoice, loading as loadingInvoice, error as errorInvoice } from 'actions/invoice/create';
import { change as changeInvoice, success as successChangeInvoice, loading as loadingChangeInvoice, error as errorChangeInvoice } from 'actions/invoice/change';
import { retrieve as retrieveInvoice, update as updateInvoice, reset as resetInvoice, retrieveSuccess } from 'actions/invoice/update';
import { list as listArticle, reset as resetArticle } from 'actions/article/list';
import { list as listModel, reset as resetModel } from 'actions/document-model/list';
import { selectDocument } from 'actions/user-companies/select';
import { Form, Grid, Header, Dropdown, Modal } from 'semantic-ui-react';
import { EssorButton, Document, CreateCustomer, DocumentTimer } from 'components';
import NotFound from '../../../404';

import 'moment/locale/fr';

moment.locale('fr');

class EditInvoice extends Component {
  state = {
    isValid: true,

    status: null,
    invoiceId: null,
    documentData: {},

    modelList: null,
    selectedModel: null,
    customerList: null,
    selectedCustomer: null,
    openCustomerModal: false,

    isCreate: false,
    timeSpent: 0,
    loadedInvoice: false,
  };

  componentDidMount() {
    const {
      getInvoice,
      getModelList,
      getCustomerList,
      getCompanySettings,
      selectedCompany,
      getArticles,
      dataInvoice,
      match,
    } = this.props;

    if (match.params.id) {
      if (find(dataInvoice['hydra:member'], {
        id: parseInt(match.params.id, 10),
      })) {
        getInvoice(`/invoices/${match.params.id}`);
      } else {
        this.setState({
          isValid: false,
        });

        return;
      }
    }

    if (match.path === '/business/invoices/create') {
      this.setState({
        isCreate: true,
      });
    }

    getModelList(`/document_models?company=${selectedCompany.id}`);
    getCompanySettings(`/company_settings?company=${selectedCompany.id}&name[]=COMPANY_DETAILS&name[]=CONTACT_INFORMATION&name[]=VAT_RATES`);
    getCustomerList(`/customers?company=${selectedCompany.id}`);
    getArticles(`/articles/${selectedCompany.id}`);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.retrievedInvoice)
      && !isEmpty(nextProps.match.params)
      && nextProps.retrievedInvoice.id !== prevState.invoiceId
    ) {
      const documentData = {
        documentId: nextProps.retrievedInvoice.id,
        content: nextProps.retrievedInvoice.content,
        reference: nextProps.retrievedInvoice.reference,
        note: nextProps.retrievedInvoice.customerComment,
        creationDate: moment(nextProps.retrievedInvoice.creationDate),
        responseDate: moment(nextProps.retrievedInvoice.responseDate),
        paymentDate: moment(nextProps.retrievedInvoice.paymentDate),
      };

      return {
        documentData,
        invoiceId: nextProps.retrievedInvoice.id,
        status: nextProps.retrievedInvoice.status,
        selectedCustomer: nextProps.retrievedInvoice.customer['@id'],
        timeSpent: prevState.isCreate ? 0 : nextProps.retrievedInvoice.timeSpent,
        loadedInvoice: true,
      };
    }

    if (!isEmpty(nextProps.listCustomer) && nextProps.listCustomer['hydra:member'] !== prevState.customerList) {
      return {
        customerList: nextProps.listCustomer['hydra:member'],
      };
    }

    if (!isEmpty(nextProps.listModel) && nextProps.listModel['hydra:member'] !== prevState.modelList) {
      return {
        modelList: nextProps.listModel['hydra:member'],
      };
    }

    if (!isEmpty(nextProps.changedInvoice) && nextProps.changedInvoice.status >= 4) {
      return {
        status: nextProps.changedInvoice.status,
      };
    }

    return null;
  }

  componentDidUpdate(prevProps) {
    const {
      selectDocument,
      retrievedInvoice,
      setInvoice,
      createdInvoice,
      updatedInvoice,
      changeInvoice,
      history,
      resetInvoiceList,
    } = this.props;

    const { submitAction } = this.state;

    if (!isEmpty(retrievedInvoice)
      && retrievedInvoice !== prevProps.retrievedInvoice) {
      selectDocument(retrievedInvoice);
    }

    if (isEmpty(retrievedInvoice) && retrievedInvoice !== prevProps.retrievedInvoice) {
      selectDocument(null);
    }

    if (!isEmpty(createdInvoice) && createdInvoice !== prevProps.createdInvoice) {
      switch (submitAction) {
        case 'save':
          history.push('/business/invoices');
          break;
        case 'edit':
          resetInvoiceList();
          setInvoice(createdInvoice);
          history.push(`/business/invoices/${createdInvoice.id}/edit`);
          break;
        case 'validate':
          changeInvoice(`/invoices/${createdInvoice.id}/to_pending`);
          break;
        default: break;
      }
    }

    if (!isEmpty(updatedInvoice) && updatedInvoice !== prevProps.updatedInvoice) {
      switch (submitAction) {
        case 'save':
          history.push('/business/invoices');
          break;
        case 'validate':
          changeInvoice(`/invoices/${updatedInvoice.id}/to_pending`);
          break;
        default: break;
      }
    }
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  handleSelectChange = (e, { value, name }) => {
    this.setState({
      [name]: value,
    });
  };

  handleOpenCreateCustomer = (e) => {
    e.preventDefault();

    this.setState({
      openCustomerModal: true,
    });
  };

  closeCustomerModal = () => {
    this.setState({
      openCustomerModal: false,
    });
  };

  customerCreateSuccess = (customer) => {
    const { customerList } = this.state;

    customerList.push(customer);

    this.setState({
      customerList,
      selectedCustomer: customer['@id'],
    });
  };

  handleInputChange = (e) => {
    e.preventDefault();

    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  onSubmit = (data) => {
    this.setState({
      validDocument: false,
    });

    const { selectedCustomer } = this.state;

    const {
      postInvoice,
      formTime,
      updateInvoice,
      retrievedInvoice,
      selectedCompany,
    } = this.props;

    const isValid = true;

    if (!isValid || !data) return;

    data.customer = selectedCustomer;
    data.timeSpent = formTime;
    data.company = selectedCompany['@id'];

    retrievedInvoice ? updateInvoice(retrievedInvoice, data) : postInvoice(data);
  };

  handleOnSubmit = (action) => {
    this.setState({
      validDocument: true,
      submitAction: action,
    });
  };

  onModelChange = (content) => {
    this.setState({
      validContent: false,
    });

    if (content.length > 0) {
      this.setState({
        warningContentModal: true,
      });
    } else {
      this.setModelContent();
    }
  };

  onWarningClose = () => {
    this.setState({
      selectedModel: null,
      warningContentModal: false,
    });
  };

  setModelContent = () => {
    const { selectedModel, modelList, documentData } = this.state;

    const model = find(modelList, {
      '@id': selectedModel,
    });

    documentData.content = model.content;

    this.setState({
      documentData,
      warningContentModal: false,
    });
  };

  handleModelChange = (e, { value }) => {
    this.setState({
      selectedModel: value,
      validContent: true,
    });
  };

  render() {
    const {
      isValid,
      status,
      documentData,

      warningContentModal,

      modelList,
      selectedModel,
      customerList,
      selectedCustomer,
      openCustomerModal,

      validDocument,
      validContent,
      isCreate,
      timeSpent,
      loadedInvoice,
    } = this.state;

    const {
      loadingListModel,
      loadingListCustomer,
      loadingRetrieveInvoice,
      loadingCreateInvoice,
      loadingUpdateInvoice,
      loadingChangeInvoice,
      match,
      t,
    } = this.props;

    let customers = [];
    let models = [];
    let customerObject = null;

    if (customerList && customerList.length > 0) {
      customers = customerList.map((customer, index) => ({
        key: index,
        text: customer.companyName,
        value: customer['@id'],
      }));
    }

    if (modelList && modelList.length > 0) {
      models = modelList.map((model, index) => ({
        key: index,
        text: model.label,
        value: model['@id'],
      }));
    }

    if (selectedCustomer) {
      customerObject = find(customerList, {
        '@id': selectedCustomer,
      });
    }

    if (!isValid) {
      return (
        <div className="section-container">
          <NotFound />
        </div>
      );
    }

    return (
      <div className="section-container">
        { (loadedInvoice || isCreate)
        && (
          <DocumentTimer
            isCreate={isCreate}
            timeSpentTimer={timeSpent}
            loadingQuote={loadingRetrieveInvoice}
          />
        )}
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">
              {match.params.id ? t('invoicesUpdateTitle') : t('invoicesCreateTitle')}
            </Header>

            <EssorButton
              as={Link}
              to="/business/invoices/"
              type="chevron left"
              size="tiny"
              floated="right"
            >
              {t('buttonBack')}
            </EssorButton>
          </div>

          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form className="margin-top-bot main-form" loading={false} size="small">
                  <Form.Group inline>
                    <Form.Select
                      label={t('formExistingCustomer')}
                      control={Dropdown}
                      placeholder={t('formPHSelect')}
                      fluid
                      search
                      selection
                      loading={loadingListCustomer}
                      disabled={loadingListCustomer}
                      noResultsMessage="No results"
                      options={customers}
                      name="selectedCustomer"
                      onChange={this.handleSelectChange}
                      value={selectedCustomer}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formNewCustomer')}</label>
                      <EssorButton
                        icon
                        type="plus"
                        onClick={this.handleOpenCreateCustomer}
                      />
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Select
                      label={t('quoteModel')}
                      control={Dropdown}
                      placeholder={t('formPHSelect')}
                      fluid
                      search
                      selection
                      loading={loadingListModel}
                      disabled={loadingListModel}
                      noResultsMessage="No results"
                      options={models}
                      name="selectedModel"
                      onChange={this.handleModelChange}
                      value={selectedModel}
                    />
                  </Form.Group>

                  <CreateCustomer
                    modalOpen={openCustomerModal}
                    onClose={this.closeCustomerModal}
                    onSuccess={customer => this.customerCreateSuccess(customer)}
                  />

                  <Modal
                    open={warningContentModal}
                    closeOnEscape={false}
                    closeOnDimmerClick={false}
                    onClose={this.onWarningClose}
                  >
                    <Modal.Header>{t('warning')}</Modal.Header>
                    <Modal.Content scrolling>
                      <Modal.Description>
                        <p>{t('replaceItemsMessage')}</p>
                      </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                      <div>
                        <EssorButton type="check" onClick={this.setModelContent} size="small">
                          {t('buttonYes')}
                        </EssorButton>
                        <EssorButton secondary type="x" size="small" onClick={this.onWarningClose}>
                          {t('buttonCancel')}
                        </EssorButton>
                      </div>
                    </Modal.Actions>
                  </Modal>

                </Form>
              </Grid.Column>
            </Grid.Row>
          </Grid>

          <hr />

          {customerObject
          && (
            <React.Fragment>
              <Document
                type="invoice"
                status={status}
                documentData={documentData}
                customer={customerObject}
                validData={validDocument}
                validContent={validContent}
                getData={documentData => this.onSubmit(documentData)}
                getContent={content => this.onModelChange(content)}
              />

              <Grid>
                <Grid.Row>
                  <Grid.Column width={16}>
                    {status < 4
                    && (
                      <EssorButton
                        disabled={
                          loadingCreateInvoice
                          || loadingUpdateInvoice
                          || loadingChangeInvoice
                        }
                        loading={
                          loadingCreateInvoice
                          || loadingUpdateInvoice
                          || loadingChangeInvoice
                        }
                        type="check"
                        size="tiny"
                        floated="right"
                        onClick={() => this.handleOnSubmit('validate')}
                      >
                        {t('buttonSaveValidate')}
                      </EssorButton>
                    )}

                    <EssorButton
                      disabled={
                        loadingCreateInvoice
                        || loadingUpdateInvoice
                        || loadingChangeInvoice
                      }
                      loading={
                        loadingCreateInvoice
                        || loadingUpdateInvoice
                        || loadingChangeInvoice
                      }
                      type="check"
                      size="tiny"
                      floated="right"
                      onClick={() => this.handleOnSubmit('edit')}
                    >
                      {t('buttonSaveAndEdit')}
                    </EssorButton>

                    <EssorButton
                      disabled={
                        loadingCreateInvoice
                        || loadingUpdateInvoice
                        || loadingChangeInvoice
                      }
                      loading={
                        loadingCreateInvoice
                        || loadingUpdateInvoice
                        || loadingChangeInvoice
                      }
                      type="check"
                      size="tiny"
                      floated="right"
                      onClick={() => this.handleOnSubmit('save')}
                    >
                      {t('buttonSave')}
                    </EssorButton>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </React.Fragment>
          )}
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  getInvoice: page => dispatch(retrieveInvoice(page)),
  getCustomerList: page => dispatch(listCustomer(page)),
  getModelList: page => dispatch(listModel(page)),
  getCompanySettings: page => dispatch(listCompanySettings(page)),
  getArticles: page => dispatch(listArticle(page)),
  postInvoice: data => dispatch(createInvoice(data)),
  updateInvoice: (item, data) => dispatch(updateInvoice(item, data)),
  changeInvoice: route => dispatch(changeInvoice(route)),
  setInvoice: invoice => dispatch(retrieveSuccess(invoice)),
  selectDocument: document => dispatch(selectDocument(document)),
  reset: () => {
    dispatch(resetListCustomer());
    dispatch(resetCompanySettings());

    dispatch(resetArticle());
    dispatch(resetModel());

    dispatch(successInvoice(null));
    dispatch(loadingInvoice(false));
    dispatch(errorInvoice(null));

    dispatch(successChangeInvoice(null));
    dispatch(loadingChangeInvoice(false));
    dispatch(errorChangeInvoice(null));

    dispatch(resetInvoice());
  },
  resetInvoiceList: () => dispatch(resetInvoiceList()),
});

const mapStateToProps = state => ({
  dataInvoice: state.invoice.list.data,
  selectedCompany: state.userCompanies.select.selectedCompany,

  listCompanySettings: state.companySettings.list.data,
  loadingCompanySettings: state.companySettings.list.loading,
  errorCompanySettings: state.companySettings.list.error,

  listCustomer: state.customer.list.data,
  loadingListCustomer: state.customer.list.loading,
  errorListCustomer: state.customer.list.error,

  listModel: state.model.list.data,
  loadingListModel: state.model.list.loading,
  errorListModel: state.model.list.error,

  createdInvoice: state.invoice.create.created,
  loadingCreateInvoice: state.invoice.create.loading,
  errorCreateInvoice: state.invoice.create.error,

  retrievedInvoice: state.invoice.update.retrieved,
  loadingRetrieveInvoice: state.invoice.update.retrieveLoading,
  errorRetrieveInvoice: state.invoice.update.retrieveError,
  updatedInvoice: state.invoice.update.updated,
  loadingUpdateInvoice: state.invoice.update.updateLoading,
  errorUpdateInvoice: state.invoice.update.updateError,

  changedInvoice: state.invoice.change.changed,
  loadingChangeInvoice: state.invoice.change.loading,

  formTime: state.counterForm.create.formTime,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(EditInvoice);

export default withNamespaces('translation')(withRouter(Main));
