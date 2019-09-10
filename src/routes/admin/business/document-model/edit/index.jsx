import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import { find, isEmpty } from 'lodash';
import { list as listCompanySettings, reset as resetCompanySettings } from 'actions/company-settings/list';
import { retrieve as retrieveModel, update as updateModel, reset as resetModel } from 'actions/document-model/update';
import { list as listArticle, reset as resetArticle } from 'actions/article/list';
import { selectDocument } from 'actions/user-companies/select';
import { Grid, Header } from 'semantic-ui-react';
import { EssorButton, Document, DocumentTimer } from 'components';
import { withNamespaces } from 'react-i18next';
import NotFound from '../../../404';

import 'moment/locale/fr';

moment.locale('fr');

class EditInvoice extends Component {
  state = {
    isValid: true,

    status: null,
    modelId: null,
    documentData: {},

    isCreate: false,
    timeSpent: 0,
    loadedInvoice: false,
  };

  componentDidMount() {
    const {
      getModel,
      getCompanySettings,
      selectedCompany,
      getArticles,
      dataDocumentModel,
      match,
    } = this.props;

    if (match.params.id) {
      if (find(dataDocumentModel['hydra:member'], {
        id: parseInt(match.params.id, 10),
      })) {
        getModel(`/document_models/${match.params.id}`);
      } else {
        this.setState({
          isValid: false,
        });

        return;
      }
    }

    if (match.path === '/business/models/create') {
      this.setState({
        isCreate: true,
      });
    }

    getCompanySettings(`/company_settings?company=${selectedCompany.id}&name=VAT_RATES`);
    getArticles(`/articles/${selectedCompany.id}`);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.retrievedModel)
      && nextProps.retrievedModel.id !== prevState.modelId
    ) {
      const documentData = {
        content: nextProps.retrievedModel.content,
      };

      return {
        documentData,
        modelId: nextProps.retrievedModel.id,
        status: nextProps.retrievedModel.status,
        timeSpent: prevState.isCreate ? 0 : nextProps.retrievedModel.timeSpent,
        loadedModel: true,
      };
    }

    return null;
  }

  componentDidUpdate(prevProps) {
    const {
      selectDocument,
      retrievedModel,
      updatedModel,
      history,
    } = this.props;

    const { submitAction } = this.state;

    if (!isEmpty(retrievedModel)
      && retrievedModel !== prevProps.retrievedModel) {
      selectDocument(retrievedModel);
    }

    if (!isEmpty(updatedModel) && updatedModel !== prevProps.updatedModel) {
      switch (submitAction) {
        case 'save':
          history.push('/business/models');
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

    const {
      formTime,
      updateModel,
      retrievedModel,
      selectedCompany,
    } = this.props;

    if (!data) return;

    data.timeSpent = formTime;
    data.company = selectedCompany['@id'];

    updateModel(retrievedModel, data);
  };

  handleOnSubmit = (action) => {
    this.setState({
      validDocument: true,
      submitAction: action,
    });
  };

  render() {
    const {
      isValid,
      status,
      documentData,

      validDocument,
      isCreate,
      timeSpent,
      loadedInvoice,
    } = this.state;

    const {
      loadingRetrieveModel,
      loadingUpdateModel,
      match,
      t,
    } = this.props;

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
            loadingQuote={loadingRetrieveModel}
          />
        )}
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">
              {match.params.id ? t('invoicesUpdateTitle') : t('invoicesCreateTitle')}
            </Header>

            <EssorButton
              as={Link}
              to="/business/models/"
              type="chevron left"
              size="tiny"
              floated="right"
            >
              {t('buttonBack')}
            </EssorButton>
          </div>

          <Document
            type="model"
            status={status}
            documentData={documentData}
            validData={validDocument}
            getData={documentData => this.onSubmit(documentData)}
          />

          <Grid>
            <Grid.Row>
              <Grid.Column width={16}>
                <EssorButton
                  disabled={loadingRetrieveModel || loadingUpdateModel}
                  loading={loadingRetrieveModel || loadingUpdateModel}
                  type="check"
                  size="tiny"
                  floated="right"
                  onClick={() => this.handleOnSubmit('edit')}
                >
                  {t('buttonSaveAndEdit')}
                </EssorButton>

                <EssorButton
                  disabled={loadingRetrieveModel || loadingUpdateModel}
                  loading={loadingRetrieveModel || loadingUpdateModel}
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
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  getModel: page => dispatch(retrieveModel(page)),
  getCompanySettings: page => dispatch(listCompanySettings(page)),
  getArticles: page => dispatch(listArticle(page)),
  updateModel: (item, data) => dispatch(updateModel(item, data)),
  selectDocument: document => dispatch(selectDocument(document)),
  reset: () => {
    dispatch(resetArticle());
    dispatch(resetModel());
    dispatch(resetCompanySettings());
  },
});

const mapStateToProps = state => ({
  dataDocumentModel: state.model.list.data,
  selectedCompany: state.userCompanies.select.selectedCompany,

  retrievedModel: state.model.update.retrieved,
  loadingRetrieveModel: state.model.update.retrieveLoading,
  errorRetrieveModel: state.model.update.retrieveError,
  updatedModel: state.model.update.updated,
  loadingUpdateModel: state.model.update.updateLoading,
  errorUpdateModel: state.model.update.updateError,

  formTime: state.counterForm.create.formTime,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(EditInvoice);

export default withNamespaces('translation')(withRouter(Main));
