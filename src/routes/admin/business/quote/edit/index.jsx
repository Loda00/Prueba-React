import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import moment from 'moment';
import { isEmpty, find } from 'lodash';
import { reset as resetQuoteList } from 'actions/quote/list';
import { list as listCustomer, reset as resetListCustomer } from 'actions/customer/list';
import { list as listCompanySettings, reset as resetCompanySettings } from 'actions/company-settings/list';
import { create as createQuote, success as successQuote, loading as loadingQuote, error as errorQuote } from 'actions/quote/create';
import { change as changeQuote, success as successChangeQuote, loading as loadingChangeQuote, error as errorChangeQuote } from 'actions/quote/change';
import { retrieve as retrieveQuote, update as updateQuote, reset as resetQuote, retrieveSuccess } from 'actions/quote/update';
import { list as listArticle, reset as resetArticle } from 'actions/article/list';
import { list as listModel, reset as resetModel } from 'actions/document-model/list';
import { create as createFollowUp, success as successFollowUp, loading as loadingFollowUp, error as errorFollowUp } from 'actions/follow-up/create';
import { selectDocument } from 'actions/user-companies/select';
import { Form, Grid, Header, Dropdown, Modal } from 'semantic-ui-react';
import { EssorButton, Document, CreateCustomer, DocumentTimer } from 'components';
import DatePicker from 'react-datepicker';
import NotFound from '../../../404';

import 'moment/locale/fr';

moment.locale('fr');

class EditQuote extends Component {
  state = {
    isValid: true,

    status: null,
    quoteId: null,
    documentData: {},

    modelList: null,
    selectedModel: null,
    customerList: null,
    selectedCustomer: null,
    openCustomerModal: false,

    followUpDate: null,
    followUpType: null,
    followUpComment: '',
    estimation: null,
    quoteReason: null,
    decisionFactors: '',

    followUpDateError: false,
    followUpTypeError: false,
    estimationError: false,
    quoteReasonError: false,
    decisionFactorsError: false,

    isCreate: false,
    timeSpent: 0,
    loadedQuote: false,
  };

  componentDidMount() {
    const {
      getQuote,
      getModelList,
      getCustomerList,
      getCompanySettings,
      getArticles,
      selectedCompany,
      dataQuote,
      match,
    } = this.props;

    if (match.params.id) {
      if (find(dataQuote['hydra:member'], {
        id: parseInt(match.params.id, 10),
      })) {
        getQuote(`/quotes/${match.params.id}`);
      } else {
        this.setState({
          isValid: false,
        });

        return;
      }
    }

    if (match.path === '/business/quotes/create') {
      this.setState({
        isCreate: true,
      });
    }

    getModelList(`/document_models?company=${selectedCompany.id}`);
    getCompanySettings(`/company_settings?company=${selectedCompany.id}&name[]=COMPANY_DETAILS&name[]=CONTACT_INFORMATION&name[]=VAT_RATES&name[]=OFFER_REASONS`);
    getCustomerList(`/customers?company=${selectedCompany.id}`);
    getArticles(`/articles/${selectedCompany.id}`);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.retrievedQuote)
      && !isEmpty(nextProps.match.params)
      && nextProps.retrievedQuote.id !== prevState.quoteId) {
      const documentData = {
        documentId: nextProps.retrievedQuote.id,
        content: nextProps.retrievedQuote.content,
        reference: nextProps.retrievedQuote.reference,
        note: nextProps.retrievedQuote.note,
        creationDate: moment(nextProps.retrievedQuote.creationDate),
        responseDate: moment(nextProps.retrievedQuote.responseDate),
      };

      return {
        documentData,
        quoteId: nextProps.retrievedQuote.id,
        status: nextProps.retrievedQuote.status,
        selectedCustomer: nextProps.retrievedQuote.customer['@id'],
        quoteReason: nextProps.retrievedQuote.quoteReason || null,
        estimation: nextProps.retrievedQuote.estimation || null,
        decisionFactors: nextProps.retrievedQuote.decisionFactors || '',
        timeSpent: prevState.isCreate ? 0 : nextProps.retrievedQuote.timeSpent,
        loadedQuote: true,
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

    if (!isEmpty(nextProps.changedQuote) && nextProps.changedQuote.status >= 4) {
      return {
        status: nextProps.changedQuote.status,
      };
    }

    if (!isEmpty(nextProps.createdFollowUp)) {
      return {
        followUpComment: '',
        followUpDate: null,
        followUpType: null,
      };
    }

    return null;
  }

  componentDidUpdate(prevProps) {
    const {
      selectDocument,
      retrievedQuote,
      resetFollowUp,
      setQuote,
      createdQuote,
      updatedQuote,
      changeQuote,
      createdFollowUp,
      history,
      resetQuoteList,
    } = this.props;

    const { submitAction } = this.state;

    if (!isEmpty(retrievedQuote) && retrievedQuote !== prevProps.retrievedQuote) {
      selectDocument(retrievedQuote);
    }

    if (isEmpty(retrievedQuote) && retrievedQuote !== prevProps.retrievedQuote) {
      selectDocument(null);
    }

    if (!isEmpty(createdQuote) && createdQuote !== prevProps.createdQuote) {
      switch (submitAction) {
        case 'save':
          history.push('/business/quotes');
          break;
        case 'edit':
          resetQuoteList();
          setQuote(createdQuote);
          history.push(`/business/quotes/${createdQuote.id}/edit`);
          break;
        case 'validate':
          changeQuote(`/quotes/${createdQuote.id}/to_pending`);
          break;
        default: break;
      }
    }

    if (!isEmpty(updatedQuote) && updatedQuote !== prevProps.updatedQuote) {
      switch (submitAction) {
        case 'save':
          history.push('/business/quotes');
          break;
        case 'validate':
          changeQuote(`/quotes/${updatedQuote.id}/to_pending`);
          break;
        default: break;
      }
    }

    if (!isEmpty(createdFollowUp) && createdFollowUp !== prevProps.createdFollowUp) {
      resetFollowUp();
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

  handleFollowUpDateChange = (date) => {
    this.setState({
      followUpDate: date,
    });
  };

  onSubmit = (data) => {
    this.setState({
      validDocument: false,
    });

    const {
      status,
      selectedCustomer,
      estimation,
      quoteReason,
      decisionFactors,
    } = this.state;

    const {
      postQuote,
      formTime,
      updateQuote,
      retrievedQuote,
      selectedCompany,
    } = this.props;

    this.setState({
      followUpDateError: false,
      followUpTypeError: false,
      estimationError: false,
      quoteReasonError: false,
      decisionFactorsError: false,
    });

    let isValid = true;

    if (status >= 4) {
      if (!estimation) {
        isValid = false;

        this.setState({
          estimationError: true,
        });
      }

      if (!quoteReason) {
        isValid = false;

        this.setState({
          quoteReasonError: true,
        });
      }

      if (decisionFactors.trim() === '') {
        isValid = false;

        this.setState({
          decisionFactorsError: true,
        });
      }
    }

    if (!isValid || !data) return;

    data.customer = selectedCustomer;
    data.timeSpent = formTime;
    data.company = selectedCompany['@id'];
    if (status >= 4) {
      data.quoteReason = quoteReason;
      data.estimation = estimation;
      data.decisionFactors = decisionFactors;
    }

    retrievedQuote ? updateQuote(retrievedQuote, data) : postQuote(data);
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

  handleFollowUpSubmit = () => {
    const {
      followUpDate,
      followUpType,
      followUpComment,
    } = this.state;

    const { postFollowUp, retrievedQuote, selectedCompany } = this.props;

    this.setState({
      followUpDateError: false,
      followUpTypeError: false,
    });

    let isValid = true;

    if (!followUpDate) {
      isValid = false;

      this.setState({
        followUpDateError: true,
      });
    }

    if (!followUpType) {
      isValid = false;

      this.setState({
        followUpTypeError: true,
      });
    }

    if (!isValid) return;

    const data = {
      quote: retrievedQuote['@id'],
      company: selectedCompany['@id'],
      date: followUpDate.format(),
      type: followUpType.toString(),
    };

    if (followUpComment.trim() !== '') {
      data.comment = followUpComment;
    }

    postFollowUp(data);
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

      followUpDate,
      followUpType,
      followUpComment,
      estimation,
      quoteReason,
      decisionFactors,

      followUpDateError,
      followUpTypeError,
      estimationError,
      quoteReasonError,
      decisionFactorsError,

      validDocument,
      validContent,
      isCreate,
      timeSpent,
      loadedQuote,
    } = this.state;

    const {
      listCompanySettings,
      loadingListModel,
      loadingListCustomer,
      loadingCompanySettings,
      loadingRetrieveQuote,
      loadingCreateQuote,
      loadingUpdateQuote,
      loadingChangeQuote,
      loadingCreateFollowUp,
      match,
      t,
    } = this.props;

    let customers = [];
    let models = [];
    let customerObject = null;
    let offerReasons = [];

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

    const followUpTypeOptions = [
      {
        key: 'postal',
        text: t('quotePostalMail'),
        value: 1,
      },
      {
        key: 'email',
        text: t('quoteEmail'),
        value: 2,
      },
      {
        key: 'call',
        text: t('quotePhoneCall'),
        value: 3,
      },
      {
        key: 'meeting',
        text: t('quoteMeeting'),
        value: 4,
      },
    ];

    const estimationOptions = [
      {
        key: 'agreement',
        text: t('quoteAgreement'),
        value: 1,
      },
      {
        key: 'list',
        text: t('quoteShortList'),
        value: 2,
      },
      {
        key: 'undecided',
        text: t('quoteUndecided'),
        value: 3,
      },
      {
        key: 'unlikely',
        text: t('quoteUnlikely'),
        value: 4,
      },
    ];

    if (!isEmpty(listCompanySettings)) {
      offerReasons = find(listCompanySettings['hydra:member'], {
        name: 'OFFER_REASONS',
      });
      offerReasons = offerReasons.value;
    }

    if (!isEmpty(offerReasons)) {
      offerReasons = offerReasons.map(reasons => ({
        key: `reasons${reasons.id}`,
        text: reasons.label,
        value: reasons.id,
      }));
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
        { (loadedQuote || isCreate)
          && (
            <DocumentTimer
              isCreate={isCreate}
              timeSpentTimer={timeSpent}
              loadingQuote={loadingRetrieveQuote}
            />
          )
        }
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">
              {match.params.id ? t('quotesUpdateTitle') : t('quotesCreateTitle')}
            </Header>

            <EssorButton
              as={Link}
              to="/business/quotes/"
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
                  type="quote"
                  status={status}
                  documentData={documentData}
                  customer={customerObject}
                  validData={validDocument}
                  validContent={validContent}
                  getData={documentData => this.onSubmit(documentData)}
                  getContent={content => this.onModelChange(content)}
                />

                {(status && status >= 4)
                && (
                  <Grid>
                    <Grid.Row>
                      <Grid.Column width={12}>
                        <Form className="margin-top-bot main-form" loading={loadingUpdateQuote} size="small">
                          <Form.Group inline>
                            <Form.Select
                              label={t('formQuoteReason')}
                              control={Dropdown}
                              placeholder={t('formPHSelect')}
                              fluid
                              search
                              selection
                              loading={loadingCompanySettings}
                              disabled={loadingCompanySettings}
                              noResultsMessage="No results"
                              options={offerReasons}
                              name="quoteReason"
                              onChange={this.handleSelectChange}
                              value={quoteReason}
                              error={quoteReasonError}
                            />
                          </Form.Group>

                          <Form.Group inline>
                            <Form.Select
                              label={t('formEstimation')}
                              control={Dropdown}
                              placeholder={t('formPHSelect')}
                              fluid
                              selection
                              options={estimationOptions}
                              name="estimation"
                              onChange={this.handleSelectChange}
                              value={estimation}
                              error={estimationError}
                            />
                          </Form.Group>

                          <Form.Group inline>
                            <Form.TextArea
                              label={t('quoteDecisionFactors')}
                              name="decisionFactors"
                              value={decisionFactors}
                              onChange={this.handleInputChange}
                              error={decisionFactorsError}
                            />
                          </Form.Group>
                        </Form>
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                )}

                <Grid>
                  <Grid.Row>
                    <Grid.Column width={16}>
                      {status < 4
                      && (
                        <EssorButton
                          disabled={loadingCreateQuote || loadingUpdateQuote || loadingChangeQuote}
                          loading={loadingCreateQuote || loadingUpdateQuote || loadingChangeQuote}
                          type="check"
                          size="tiny"
                          floated="right"
                          onClick={() => this.handleOnSubmit('validate')}
                        >
                          {t('buttonSaveValidate')}
                        </EssorButton>
                      )}

                      <EssorButton
                        disabled={loadingCreateQuote || loadingUpdateQuote || loadingChangeQuote}
                        loading={loadingCreateQuote || loadingUpdateQuote || loadingChangeQuote}
                        type="check"
                        size="tiny"
                        floated="right"
                        onClick={() => this.handleOnSubmit('edit')}
                      >
                        {t('buttonSaveAndEdit')}
                      </EssorButton>

                      <EssorButton
                        disabled={loadingCreateQuote || loadingUpdateQuote || loadingChangeQuote}
                        loading={loadingCreateQuote || loadingUpdateQuote || loadingChangeQuote}
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
            )
          }
        </div>

        {(status && status >= 4)
        && (
          <div className="section-general">
            <div className="option-buttons-container clearfix">
              <Header as="h3">
                {t('followUpCreateTitle')}
              </Header>
            </div>
            <Grid>
              <Grid.Row>
                <Grid.Column width={12}>
                  <Form className="margin-top-bot main-form" loading={loadingCreateFollowUp} size="small">

                    <Form.Group inline>
                      <Form.Input
                        label={t('formFollowUpDate')}
                        name="followUpDate"
                        control={DatePicker}
                        selected={followUpDate}
                        minDate={moment()}
                        onChange={this.handleFollowUpDateChange}
                        locale="fr"
                        autoComplete="off"
                        error={followUpDateError}
                      />
                    </Form.Group>

                    <Form.Group inline>
                      <Form.Select
                        label={t('formFollowUpType')}
                        control={Dropdown}
                        placeholder={t('formPHSelect')}
                        fluid
                        selection
                        options={followUpTypeOptions}
                        name="followUpType"
                        onChange={this.handleSelectChange}
                        value={followUpType}
                        error={followUpTypeError}
                      />
                    </Form.Group>

                    <Form.Group inline>
                      <Form.TextArea
                        label={t('formComments')}
                        name="followUpComment"
                        value={followUpComment}
                        onChange={this.handleInputChange}
                      />
                    </Form.Group>

                    <EssorButton
                      submit
                      type="check"
                      size="small"
                      onClick={this.handleFollowUpSubmit}
                    >
                      {t('buttonSave')}
                    </EssorButton>
                  </Form>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </div>
        )}
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  getQuote: page => dispatch(retrieveQuote(page)),
  getCustomerList: page => dispatch(listCustomer(page)),
  getModelList: page => dispatch(listModel(page)),
  getCompanySettings: page => dispatch(listCompanySettings(page)),
  getArticles: page => dispatch(listArticle(page)),
  postQuote: data => dispatch(createQuote(data)),
  updateQuote: (item, data) => dispatch(updateQuote(item, data)),
  changeQuote: route => dispatch(changeQuote(route)),
  postFollowUp: data => dispatch(createFollowUp(data)),
  setQuote: quote => dispatch(retrieveSuccess(quote)),
  selectDocument: document => dispatch(selectDocument(document)),
  resetFollowUp: () => {
    dispatch(successFollowUp(null));
    dispatch(loadingFollowUp(false));
    dispatch(errorFollowUp(null));
  },
  reset: () => {
    dispatch(resetListCustomer());
    dispatch(resetCompanySettings());

    dispatch(resetArticle());
    dispatch(resetModel());

    dispatch(successQuote(null));
    dispatch(loadingQuote(false));
    dispatch(errorQuote(null));

    dispatch(successChangeQuote(null));
    dispatch(loadingChangeQuote(false));
    dispatch(errorChangeQuote(null));

    dispatch(successFollowUp(null));
    dispatch(loadingFollowUp(false));
    dispatch(errorFollowUp(null));

    dispatch(resetQuote());
  },
  resetQuoteList: () => dispatch(resetQuoteList()),
});

const mapStateToProps = state => ({
  dataQuote: state.quote.list.data,
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

  createdQuote: state.quote.create.created,
  loadingCreateQuote: state.quote.create.loading,
  errorCreateQuote: state.quote.create.error,

  retrievedQuote: state.quote.update.retrieved,
  loadingRetrieveQuote: state.quote.update.retrieveLoading,
  errorRetrieveQuote: state.quote.update.retrieveError,
  updatedQuote: state.quote.update.updated,
  loadingUpdateQuote: state.quote.update.updateLoading,
  errorUpdateQuote: state.quote.update.updateError,

  changedQuote: state.quote.change.changed,
  loadingChangeQuote: state.quote.change.loading,

  createdFollowUp: state.followUp.create.created,
  loadingCreateFollowUp: state.followUp.create.loading,

  formTime: state.counterForm.create.formTime,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(EditQuote);

export default withNamespaces('translation')(withRouter(Main));
