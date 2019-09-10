import React, { Component } from 'react';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { retrieve as retrieveSelfFinancing, reset as resetSelfFinancing } from 'actions/self-financing/show';
import { Dimmer, Loader, Segment } from 'semantic-ui-react';

import ShowSelfFinancing from './show';
import EditSelfFinancing from './edit';
import NotFound from '../../404';

class SelfFinancing extends Component {
  componentDidMount() {
    const { getSelfFinancing, selectedFiscalYear } = this.props;

    getSelfFinancing(`/self_financings?fiscalYear=${selectedFiscalYear.id}`);
  }

  componentDidUpdate(prevProps) {
    const { updated, created, getSelfFinancing, selectedFiscalYear } = this.props;

    if (
      (!isEmpty(updated) && updated !== prevProps.updated)
      || (!isEmpty(created) && created !== prevProps.created)
    ) {
      getSelfFinancing(`/self_financings?fiscalYear=${selectedFiscalYear.id}`);
    }
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  render() {
    const { retrievedSelfFinancing, loadingSelfFinancing, t } = this.props;

    if (loadingSelfFinancing || isEmpty(retrievedSelfFinancing)) {
      return (
        <div className="section-container">
          <Segment
            basic
            className="section-loading"
          >
            <Dimmer active={loadingSelfFinancing} inverted>
              <Loader>{t('loading')}</Loader>
            </Dimmer>
          </Segment>
        </div>
      );
    }

    return (
      <React.Fragment>
        <Switch>
          <Route exact path="/forecast/self-financing" component={ShowSelfFinancing} />
          <Route
            exact
            path="/forecast/self-financing/create"
            render={(props) => {
              if (!isEmpty(retrievedSelfFinancing['hydra:member'])) {
                return (
                  <Redirect to="/forecast/self-financing/edit" />
                );
              }

              return (
                <EditSelfFinancing {...props} />
              );
            }}
          />
          <Route
            exact
            path="/forecast/self-financing/edit"
            render={(props) => {
              if (isEmpty(retrievedSelfFinancing['hydra:member'])) {
                return (
                  <Redirect to="/forecast/self-financing/create" />
                );
              }

              return (
                <EditSelfFinancing {...props} />
              );
            }}
          />
          <Route component={NotFound} />
        </Switch>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  getSelfFinancing: page => dispatch(retrieveSelfFinancing(page)),
  reset: () => {
    dispatch(resetSelfFinancing());
  },
});

const mapStateToProps = state => ({
  retrievedSelfFinancing: state.selfFinancing.show.retrieved,
  loadingSelfFinancing: state.selfFinancing.show.loading,
  errorSelfFinancing: state.selfFinancing.show.error,

  updated: state.selfFinancing.update.updated,
  created: state.selfFinancing.create.created,

  selectedCompany: state.userCompanies.select.selectedCompany,
  selectedFiscalYear: state.userCompanies.select.selectedFiscalYear,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(SelfFinancing);

export default withNamespaces('translation')(withRouter(Main));
