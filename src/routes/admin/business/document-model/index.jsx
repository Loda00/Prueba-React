import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { selectDocument } from 'actions/user-companies/select';
import { list as listModel, reset as resetModelList } from 'actions/document-model/list';
import { Dimmer, Loader, Segment } from 'semantic-ui-react';

import ListModel from './list';
import EditModel from './edit';
import ShowModel from './show';
import NotFound from '../../404';

class Model extends Component {
  componentDidMount() {
    const { getDocumentModels, selectedCompany, selectDocument } = this.props;

    selectDocument(null);
    getDocumentModels(`/document_models?company=${selectedCompany.id}`);
  }

  componentDidUpdate(prevProps) {
    const { updated, created, getDocumentModels, selectedCompany } = this.props;

    if (
      (!isEmpty(updated) && updated !== prevProps.updated)
      || (!isEmpty(created) && created !== prevProps.created)
    ) {
      getDocumentModels(`/document_models?company=${selectedCompany.id}`);
    }
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  render() {
    const { dataDocumentModel, loadingDocumentModel, t } = this.props;

    if (loadingDocumentModel || isEmpty(dataDocumentModel)) {
      return (
        <div className="section-container">
          <Segment
            basic
            className="section-loading"
          >
            <Dimmer active={loadingDocumentModel} inverted>
              <Loader>{t('loading')}</Loader>
            </Dimmer>
          </Segment>
        </div>
      );
    }

    return (
      <Switch>
        <Route exact path="/business/models" component={ListModel} />
        <Route exact path="/business/models/:id/edit" component={EditModel} />
        <Route exact path="/business/models/:id" component={ShowModel} />
        <Route component={NotFound} />
      </Switch>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  getDocumentModels: page => dispatch(listModel(page)),
  selectDocument: quote => dispatch(selectDocument(quote)),
  reset: () => {
    dispatch(resetModelList());
  },
});

const mapStateToProps = state => ({
  dataDocumentModel: state.model.list.data,
  loadingDocumentModel: state.model.list.loading,
  errorDocumentModel: state.model.list.error,

  selectedCompany: state.userCompanies.select.selectedCompany,

  updated: state.model.update.updated,
  created: state.model.create.created,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(Model);

export default withNamespaces('translation')(withRouter(Main));
