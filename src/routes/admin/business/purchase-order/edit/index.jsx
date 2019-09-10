import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import moment from 'moment';
import { isEmpty, find, findIndex } from 'lodash';
import { reset as resetPurchaseOrderList } from 'actions/purchase-order/list';
import { list as listCustomer, reset as resetListCustomer } from 'actions/customer/list';
import { list as listCompanySettings, reset as resetCompanySettings } from 'actions/company-settings/list';
import { create as createPurchaseOrder, success as successPurchaseOrder, loading as loadingPurchaseOrder, error as errorPurchaseOrder } from 'actions/purchase-order/create';
import { change as changePurchaseOrder, success as successChangePurchaseOrder, loading as loadingChangePurchaseOrder, error as errorChangePurchaseOrder } from 'actions/purchase-order/change';
import { retrieve as retrievePurchaseOrder, update as updatePurchaseOrder, reset as resetPurchaseOrder, retrieveSuccess } from 'actions/purchase-order/update';
import { list as listArticle, reset as resetArticle } from 'actions/article/list';
import { list as listModel, reset as resetModel } from 'actions/document-model/list';
import { list as listEmployee, reset as resetEmployee } from 'actions/employee/list';
import { selectDocument } from 'actions/user-companies/select';
import { Form, Grid, Header, Dropdown, Modal, Icon, Table } from 'semantic-ui-react';
import { EssorButton, Document, CreateCustomer, DocumentTimer } from 'components';
import DatePicker from 'react-datepicker';
import Cleave from 'cleave.js/react';
import NotFound from '../../../404';

import 'moment/locale/fr';

moment.locale('fr');

class EditPurchaseOrder extends Component {
  state = {
    isValid: true,

    status: null,
    purchaseOrderId: null,
    documentData: {},

    modelList: null,
    selectedModel: null,
    customerList: null,
    selectedCustomer: null,
    openCustomerModal: false,

    orderReason: null,
    estimatedStartingDate: null,
    comment: '',
    selectedEmployee: null,
    employeeHours: '',

    orderReasonError: false,
    selectedEmployeeError: false,
    employeeHoursError: false,

    employeeList: null,
    staff: [],

    isCreate: false,
    timeSpent: 0,
    loadedPurchase: false,
  };

  componentDidMount() {
    const {
      getPurchaseOrder,
      getModelList,
      getEmployeeList,
      getCustomerList,
      getCompanySettings,
      selectedCompany,
      getArticles,
      dataPurchaseOrder,
      match,
    } = this.props;

    if (match.params.id) {
      if (find(dataPurchaseOrder['hydra:member'], {
        id: parseInt(match.params.id, 10),
      })) {
        getPurchaseOrder(`/purchase_orders/${match.params.id}`);
      } else {
        this.setState({
          isValid: false,
        });

        return;
      }
    }

    if (match.path === '/business/purchase-orders/create') {
      this.setState({
        isCreate: true,
      });
    }

    getEmployeeList(`/employees?company=${selectedCompany.id}`);
    getModelList(`/document_models?company=${selectedCompany.id}`);
    getCompanySettings(`/company_settings?company=${selectedCompany.id}&name[]=COMPANY_DETAILS&name[]=CONTACT_INFORMATION&name[]=VAT_RATES&name[]=OFFER_REASONS`);
    getCustomerList(`/customers?company=${selectedCompany.id}`);
    getArticles(`/articles/${selectedCompany.id}`);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.retrievedPurchaseOrder)
      && !isEmpty(nextProps.match.params)
      && nextProps.retrievedPurchaseOrder.id !== prevState.purchaseOrderId
    ) {
      const documentData = {
        documentId: nextProps.retrievedPurchaseOrder.id,
        content: nextProps.retrievedPurchaseOrder.content,
        reference: nextProps.retrievedPurchaseOrder.reference,
        creationDate: moment(nextProps.retrievedPurchaseOrder.creationDate),
        responseDate: moment(nextProps.retrievedPurchaseOrder.responseDate),
      };

      return {
        documentData,
        purchaseOrderId: nextProps.retrievedPurchaseOrder.id,
        status: nextProps.retrievedPurchaseOrder.status,
        selectedCustomer: nextProps.retrievedPurchaseOrder.customer['@id'],
        orderReason: nextProps.retrievedPurchaseOrder.orderReason,
        comment: nextProps.retrievedPurchaseOrder.comment || '',
        estimatedStartingDate: nextProps.retrievedPurchaseOrder.estimatedStartingDate
          ? moment(nextProps.retrievedPurchaseOrder.estimatedStartingDate)
          : null,
        staff: nextProps.retrievedPurchaseOrder.staff,
        timeSpent: prevState.isCreate ? 0 : nextProps.retrievedPurchaseOrder.timeSpent,
        loadedQuote: true,
      };
    }

    if (!isEmpty(nextProps.listCustomer) && nextProps.listCustomer['hydra:member'] !== prevState.customerList) {
      return {
        customerList: nextProps.listCustomer['hydra:member'],
      };
    }

    if (!isEmpty(nextProps.listEmployee) && nextProps.listEmployee['hydra:member'] !== prevState.employeeList) {
      return {
        employeeList: nextProps.listEmployee['hydra:member'],
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

    return null;
  }

  componentDidUpdate(prevProps) {
    const {
      selectDocument,
      retrievedPurchaseOrder,
      setPurchaseOrder,
      createdPurchaseOrder,
      updatedPurchaseOrder,
      changePurchaseOrder,
      history,
      resetPurchaseOrderList,
    } = this.props;

    const { submitAction } = this.state;

    if (!isEmpty(retrievedPurchaseOrder)
      && retrievedPurchaseOrder !== prevProps.retrievedPurchaseOrder) {
      selectDocument(retrievedPurchaseOrder);
    }

    if (isEmpty(retrievedPurchaseOrder)
      && retrievedPurchaseOrder !== prevProps.retrievedPurchaseOrder) {
      selectDocument(null);
    }

    if (!isEmpty(createdPurchaseOrder) && createdPurchaseOrder !== prevProps.createdPurchaseOrder) {
      switch (submitAction) {
        case 'save':
          history.push('/business/purchase-orders');
          break;
        case 'edit':
          resetPurchaseOrderList();
          setPurchaseOrder(createdPurchaseOrder);
          history.push(`/business/purchase-orders/${createdPurchaseOrder.id}/edit`);
          break;
        case 'validate':
          changePurchaseOrder(`/purchase_orders/${createdPurchaseOrder.id}/to_pending`);
          break;
        default: break;
      }
    }

    if (!isEmpty(updatedPurchaseOrder) && updatedPurchaseOrder !== prevProps.updatedPurchaseOrder) {
      switch (submitAction) {
        case 'save':
          history.push('/business/purchase-orders');
          break;
        case 'validate':
          changePurchaseOrder(`/purchase_orders/${updatedPurchaseOrder.id}/to_pending`);
          break;
        default: break;
      }
    }
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  onHoursCleaveInit = (cleave) => {
    this.setState({
      hoursCleave: cleave,
    });
  };

  handleSelectChange = (e, { value, name }) => {
    this.setState({
      [name]: value,
    });
  };

  handleEstimateDateChange = (date) => {
    this.setState({
      estimatedStartingDate: date,
    });
  };

  handleEmployeeSelect = (e, obj) => {
    e.preventDefault();

    this.setState({
      selectedEmployee: obj.value,
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

  handleDelete = (e, index) => {
    const { staff } = this.state;

    staff.splice(index, 1);

    this.setState({
      staff,
    });
  };

  handleAddStaff = () => {
    const {
      hoursCleave,
      selectedEmployee,
      employeeHours,
      staff,
    } = this.state;

    let isValid = true;

    this.setState({
      selectedEmployeeError: false,
      employeeHoursError: false,
    });

    if (!selectedEmployee) {
      isValid = false;

      this.setState({
        selectedEmployeeError: true,
      });
    }

    if (employeeHours === '') {
      isValid = false;

      this.setState({
        employeeHoursError: true,
      });
    }

    if (!isValid) return;

    const employee = JSON.parse(selectedEmployee);

    if (!find(staff, {
      employee: employee['@id'],
    })) {
      const data = {
        employee: employee['@id'],
        hours: employeeHours,
      };

      staff.push(data);

      this.setState({
        staff,
        warningMessage: false,
        selectedEmployee: null,
        employeeHours: '',
      });

      hoursCleave.setRawValue('');
    } else {
      this.setState({
        warningMessage: true,
      });
    }
  };

  addHours = () => {
    const {
      hoursCleave,
      selectedEmployee,
      employeeHours,
      staff,
    } = this.state;

    const employee = JSON.parse(selectedEmployee);
    const index = findIndex(staff, {
      employee: employee['@id'],
    });

    staff[index] = {
      employee: employee['@id'],
      hours: parseInt(staff[index].hours, 10) + parseInt(employeeHours, 10),
    };

    this.setState({
      staff,
      warningMessage: false,
      selectedEmployee: null,
      employeeHours: '',
    });

    hoursCleave.setRawValue('');
  };

  dismissWarning = () => {
    this.setState({
      selectedEmployee: null,
      employeeHours: '',
      warningMessage: false,
    });
  };

  onSubmit = (data) => {
    this.setState({
      validDocument: false,
    });

    const {
      status,
      selectedCustomer,
      orderReason,
      estimatedStartingDate,
      comment,
      staff,
    } = this.state;

    const {
      postPurchaseOrder,
      formTime,
      updatePurchaseOrder,
      retrievedPurchaseOrder,
      selectedCompany,
    } = this.props;

    this.setState({
      orderReasonError: false,
    });

    let isValid = true;

    if (status >= 4) {
      if (orderReason === null) {
        isValid = false;

        this.setState({
          orderReasonError: true,
        });
      }
    }

    if (!isValid || !data) return;

    data.customer = selectedCustomer;
    data.company = selectedCompany['@id'];
    data.timeSpent = formTime;

    if (comment.trim() !== '') {
      data.comment = comment;
    }

    if (estimatedStartingDate) {
      data.estimatedStartingDate = estimatedStartingDate.format();
    }

    if (!isEmpty(staff)) {
      data.staff = staff;
    }

    if (status >= 4) {
      data.orderReason = orderReason;
    }

    retrievedPurchaseOrder
      ? updatePurchaseOrder(retrievedPurchaseOrder, data)
      : postPurchaseOrder(data);
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

      employeeList,
      modelList,
      selectedModel,
      customerList,
      selectedCustomer,
      openCustomerModal,

      orderReason,
      estimatedStartingDate,
      comment,
      selectedEmployee,
      employeeHours,
      staff,

      orderReasonError,
      selectedEmployeeError,
      employeeHoursError,

      validDocument,
      validContent,

      isCreate,
      timeSpent,
      loadedPurchase,
      warningMessage,
    } = this.state;

    const {
      listCompanySettings,
      loadingListModel,
      loadingListEmployee,
      loadingListCustomer,
      loadingCompanySettings,
      loadingRetrievePurchaseOrder,
      loadingCreatePurchaseOrder,
      loadingUpdatePurchaseOrder,
      loadingChangePurchaseOrder,
      match,
      t,
    } = this.props;

    let customers = [];
    let models = [];
    let employees = [];
    let staffShow = [];
    let customerObject = null;
    let offerReasons = null;

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

    if (employeeList && employeeList.length > 0) {
      employees = employeeList.map(employee => ({
        key: employee['@id'],
        text: `${employee.firstName} ${employee.lastName}`,
        value: JSON.stringify(employee),
      }));
    }

    if (selectedCustomer) {
      customerObject = find(customerList, {
        '@id': selectedCustomer,
      });
    }

    if (!isEmpty(listCompanySettings)) {
      offerReasons = find(listCompanySettings['hydra:member'], {
        name: 'OFFER_REASONS',
      });
      offerReasons = offerReasons.value;
    }

    if (!isEmpty(offerReasons)) {
      offerReasons = offerReasons.map((reasons, index) => ({
        key: `reasons${index}`,
        text: reasons.label,
        value: index,
      }));
    }

    if (!isEmpty(staff) && employeeList && employeeList.length > 0) {
      staffShow = staff.map((item) => {
        const employee = find(employeeList, {
          '@id': item.employee,
        });

        return {
          employee,
          hours: item.hours,
        };
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
        { (loadedPurchase || isCreate)
        && (
          <DocumentTimer
            isCreate={isCreate}
            timeSpentTimer={timeSpent}
            loadingQuote={loadingRetrievePurchaseOrder}
          />
        )}
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">
              {match.params.id ? t('purchaseOrdersUpdateTitle') : t('purchaseOrdersCreateTitle')}
            </Header>

            <EssorButton
              as={Link}
              to="/business/purchase-orders/"
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
                type="purchaseOrder"
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
                <Form className="margin-top-bot main-form" loading={false} size="small">

                  <Grid>

                    <Grid.Row>
                      <Grid.Column width={12}>
                        <Form.Group inline>
                          <Form.Select
                            label={t('formPurchaseOrderReason')}
                            control={Dropdown}
                            placeholder={t('formPHSelect')}
                            fluid
                            search
                            selection
                            loading={loadingCompanySettings}
                            disabled={loadingCompanySettings}
                            noResultsMessage="No results"
                            options={offerReasons}
                            name="orderReason"
                            onChange={this.handleSelectChange}
                            value={orderReason}
                            error={orderReasonError}
                          />
                        </Form.Group>

                        <Form.Group inline>
                          <Form.Input
                            label={t('formEstimatedDate')}
                            name="estimatedStartingDate"
                            isClearable
                            control={DatePicker}
                            selected={estimatedStartingDate}
                            onChange={this.handleEstimateDateChange}
                            locale="fr"
                            autoComplete="off"
                          />
                        </Form.Group>

                        <Form.Group inline>
                          <Form.TextArea
                            label={t('formComments')}
                            name="comment"
                            placeholder={t('formPHComments')}
                            value={comment}
                            onChange={this.handleInputChange}
                          />
                        </Form.Group>
                      </Grid.Column>
                    </Grid.Row>

                    <Grid.Row>
                      <Grid.Column width={7}>
                        <Form.Group className="select-list">
                          <Form.Select
                            label={t('formStaffAttribution')}
                            onChange={this.handleEmployeeSelect}
                            control={Dropdown}
                            placeholder={t('formPHSelect')}
                            fluid
                            search
                            selection
                            loading={loadingListEmployee}
                            disabled={loadingListEmployee}
                            noResultsMessage="No results"
                            options={employees}
                            value={selectedEmployee}
                            error={selectedEmployeeError}
                          />
                        </Form.Group>
                      </Grid.Column>

                      <Grid.Column width={3}>
                        <h5 style={{
                          fontSize: '12px',
                        }}
                        >
                          {t('companiesHours')}
                        </h5>
                        <Form.Input
                          disabled={loadingListEmployee}
                          error={employeeHoursError}
                        >
                          <Cleave
                            options={{
                              numeral: true,
                              numeralThousandsGroupStyle: 'none',
                              numeralDecimalScale: 2,
                            }}
                            name="employeeHours"
                            value={employeeHours}
                            onInit={this.onHoursCleaveInit}
                            onChange={this.handleInputChange}
                          />
                        </Form.Input>
                      </Grid.Column>

                      <Grid.Column width={2}>
                        <Form.Group className="select-list">
                          <Form.Field>
                            <label>{' '}</label>
                            <EssorButton
                              size="small"
                              fluid
                              icon
                              type="plus"
                              onClick={this.handleAddStaff}
                            />
                          </Form.Field>
                        </Form.Group>
                      </Grid.Column>
                    </Grid.Row>

                    <Modal
                      open={warningMessage}
                      closeOnEscape={false}
                      closeOnDimmerClick={false}
                      onClose={this.dismissWarning}
                    >
                      <Modal.Header>{t('warning')}</Modal.Header>
                      <Modal.Content scrolling>
                        <Modal.Description>
                          <p>{t('addHoursMessage')}</p>
                        </Modal.Description>
                      </Modal.Content>
                      <Modal.Actions>
                        <div>
                          <EssorButton type="check" onClick={this.addHours} size="small">
                            {t('buttonYes')}
                          </EssorButton>
                          <EssorButton secondary type="x" size="small" onClick={this.dismissWarning}>
                            {t('buttonCancel')}
                          </EssorButton>
                        </div>
                      </Modal.Actions>
                    </Modal>

                    {!isEmpty(staffShow)
                    && (
                      <Grid.Row>
                        <Grid.Column width={12}>
                          <div className="select-list">
                            <label>{t('purchaseOrderStaff')}</label>

                            <Table celled structured className="margin-bot">
                              <Table.Header>
                                <Table.Row>
                                  <Table.HeaderCell>{t('employeesShowTitle')}</Table.HeaderCell>
                                  <Table.HeaderCell>{t('companiesHours')}</Table.HeaderCell>
                                  <Table.HeaderCell />
                                </Table.Row>
                              </Table.Header>

                              <Table.Body>
                                {staffShow.map((item, index) => (
                                  <Table.Row key={item.employee['@id']}>
                                    <Table.Cell>
                                      {`${item.employee.firstName} ${item.employee.lastName}`}
                                    </Table.Cell>
                                    <Table.Cell collapsing textAlign="center">
                                      {item.hours}
                                    </Table.Cell>
                                    <Table.Cell collapsing textAlign="center">
                                      <Icon name="x" onClick={e => this.handleDelete(e, index)} />
                                    </Table.Cell>
                                  </Table.Row>
                                ))}
                              </Table.Body>
                            </Table>
                          </div>
                        </Grid.Column>
                      </Grid.Row>
                    )}
                  </Grid>
                </Form>
              )}

              <Grid>
                <Grid.Row>
                  <Grid.Column width={16}>
                    {status < 4
                    && (
                      <EssorButton
                        disabled={
                          loadingCreatePurchaseOrder
                          || loadingUpdatePurchaseOrder
                          || loadingChangePurchaseOrder
                        }
                        loading={
                          loadingCreatePurchaseOrder
                          || loadingUpdatePurchaseOrder
                          || loadingChangePurchaseOrder
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
                        loadingCreatePurchaseOrder
                        || loadingUpdatePurchaseOrder
                        || loadingChangePurchaseOrder
                      }
                      loading={
                        loadingCreatePurchaseOrder
                        || loadingUpdatePurchaseOrder
                        || loadingChangePurchaseOrder
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
                        loadingCreatePurchaseOrder
                        || loadingUpdatePurchaseOrder
                        || loadingChangePurchaseOrder
                      }
                      loading={
                        loadingCreatePurchaseOrder
                        || loadingUpdatePurchaseOrder
                        || loadingChangePurchaseOrder
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
  getPurchaseOrder: page => dispatch(retrievePurchaseOrder(page)),
  getCustomerList: page => dispatch(listCustomer(page)),
  getModelList: page => dispatch(listModel(page)),
  getEmployeeList: page => dispatch(listEmployee(page)),
  getCompanySettings: page => dispatch(listCompanySettings(page)),
  getArticles: page => dispatch(listArticle(page)),
  postPurchaseOrder: data => dispatch(createPurchaseOrder(data)),
  updatePurchaseOrder: (item, data) => dispatch(updatePurchaseOrder(item, data)),
  changePurchaseOrder: route => dispatch(changePurchaseOrder(route)),
  setPurchaseOrder: purchaseOrder => dispatch(retrieveSuccess(purchaseOrder)),
  selectDocument: document => dispatch(selectDocument(document)),
  reset: () => {
    dispatch(resetListCustomer());
    dispatch(resetCompanySettings());

    dispatch(resetArticle());
    dispatch(resetModel());
    dispatch(resetEmployee());

    dispatch(successPurchaseOrder(null));
    dispatch(loadingPurchaseOrder(false));
    dispatch(errorPurchaseOrder(null));

    dispatch(successChangePurchaseOrder(null));
    dispatch(loadingChangePurchaseOrder(false));
    dispatch(errorChangePurchaseOrder(null));

    dispatch(resetPurchaseOrder());
  },
  resetPurchaseOrderList: () => dispatch(resetPurchaseOrderList()),
});

const mapStateToProps = state => ({
  dataPurchaseOrder: state.purchaseOrder.list.data,
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

  createdPurchaseOrder: state.purchaseOrder.create.created,
  loadingCreatePurchaseOrder: state.purchaseOrder.create.loading,
  errorCreatePurchaseOrder: state.purchaseOrder.create.error,

  retrievedPurchaseOrder: state.purchaseOrder.update.retrieved,
  loadingRetrievePurchaseOrder: state.purchaseOrder.update.retrieveLoading,
  errorRetrievePurchaseOrder: state.purchaseOrder.update.retrieveError,
  updatedPurchaseOrder: state.purchaseOrder.update.updated,
  loadingUpdatePurchaseOrder: state.purchaseOrder.update.updateLoading,
  errorUpdatePurchaseOrder: state.purchaseOrder.update.updateError,

  changedPurchaseOrder: state.purchaseOrder.change.changed,
  loadingChangePurchaseOrder: state.purchaseOrder.change.loading,

  listEmployee: state.employee.list.data,
  loadingListEmployee: state.employee.list.loading,
  errorListEmployee: state.employee.list.error,

  formTime: state.counterForm.create.formTime,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(EditPurchaseOrder);

export default withNamespaces('translation')(withRouter(Main));
