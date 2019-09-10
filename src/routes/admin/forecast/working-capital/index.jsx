import React, { Component } from 'react';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { retrieve as retrieveWorkingCapital, reset as resetWorkingCapital } from 'actions/working-capital/show';
import { Dimmer, Loader, Segment } from 'semantic-ui-react';

import ShowWorkingCapital from './show';
import EditWorkingCapital from './edit';
import NotFound from '../../404';

class WorkingCapital extends Component {
  componentDidMount() {
    const { getWorkingCapital, selectedFiscalYear } = this.props;

    getWorkingCapital(`/working_capitals?fiscalYear=${selectedFiscalYear.id}`);
  }

  componentDidUpdate(prevProps) {
    const { updated, created, getWorkingCapital, selectedFiscalYear } = this.props;

    if (
      (!isEmpty(updated) && updated !== prevProps.updated)
      || (!isEmpty(created) && created !== prevProps.created)
    ) {
      getWorkingCapital(`/working_capitals?fiscalYear=${selectedFiscalYear.id}`);
    }
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  render() {
    const { retrievedWorkingCapital, loadingWorkingCapital, t } = this.props;

    if (loadingWorkingCapital || isEmpty(retrievedWorkingCapital)) {
      return (
        <div className="section-container">
          <Segment
            basic
            className="section-loading"
          >
            <Dimmer active={loadingWorkingCapital} inverted>
              <Loader>{t('loading')}</Loader>
            </Dimmer>
          </Segment>
        </div>
      );
    }

    return (
      <React.Fragment>
        <Switch>
          <Route exact path="/forecast/working-capital" component={ShowWorkingCapital} />
          <Route
            exact
            path="/forecast/working-capital/create"
            render={(props) => {
              if (!isEmpty(retrievedWorkingCapital['hydra:member'])) {
                return (
                  <Redirect to="/forecast/working-capital/edit" />
                );
              }

              return (
                <EditWorkingCapital {...props} />
              );
            }}
          />
          <Route
            exact
            path="/forecast/working-capital/edit"
            render={(props) => {
              if (isEmpty(retrievedWorkingCapital['hydra:member'])) {
                return (
                  <Redirect to="/forecast/working-capital/create" />
                );
              }

              return (
                <EditWorkingCapital {...props} />
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
  getWorkingCapital: page => dispatch(retrieveWorkingCapital(page)),
  reset: () => {
    dispatch(resetWorkingCapital());
  },
});

const mapStateToProps = state => ({
  retrievedWorkingCapital: state.workingCapital.show.retrieved,
  loadingWorkingCapital: state.workingCapital.show.loading,
  errorWorkingCapital: state.workingCapital.show.error,

  updated: state.workingCapital.update.updated,
  created: state.workingCapital.create.created,

  selectedCompany: state.userCompanies.select.selectedCompany,
  selectedFiscalYear: state.userCompanies.select.selectedFiscalYear,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(WorkingCapital);

export default withNamespaces('translation')(withRouter(Main));
