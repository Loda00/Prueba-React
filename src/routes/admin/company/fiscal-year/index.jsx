import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { list, reset as resetFiscalYear } from 'actions/fiscal-year/list';
import { Dimmer, Loader, Segment } from 'semantic-ui-react';

import ListFiscalYear from './list';
import CreateFiscalYear from './create';
import ShowFiscalYear from './show';
import NotFound from '../../404';

class FiscalYear extends Component {
  componentDidMount() {
    const { getFiscalYears, selectedCompany } = this.props;

    getFiscalYears(`/fiscal_years?company=${selectedCompany.id}`);
  }

  componentDidUpdate(prevProps) {
    const { updated, created, getFiscalYears, selectedCompany } = this.props;

    if (
      (!isEmpty(updated) && updated !== prevProps.updated)
      || (!isEmpty(created) && created !== prevProps.created)
    ) {
      console.log('refresh');
      getFiscalYears(`/fiscal_years?company=${selectedCompany.id}`);
    }
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  render() {
    const { dataFiscalYear, loadingFiscalYear, t } = this.props;

    if (loadingFiscalYear || isEmpty(dataFiscalYear)) {
      return (
        <div className="section-container">
          <Segment
            basic
            className="section-loading"
          >
            <Dimmer active={loadingFiscalYear} inverted>
              <Loader>{t('loading')}</Loader>
            </Dimmer>
          </Segment>
        </div>
      );
    }

    return (
      <React.Fragment>
        <Switch>
          <Route exact path="/company/fiscal_years" component={ListFiscalYear} />
          <Route exact path="/company/fiscal_years/create" component={CreateFiscalYear} />
          <Route exact path="/company/fiscal_years/:fiscalYearId/edit" component={CreateFiscalYear} />
          <Route exact path="/company/fiscal_years/:fiscalYearId" component={ShowFiscalYear} />
          <Route component={NotFound} />
        </Switch>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  getFiscalYears: page => dispatch(list(page)),
  reset: () => {
    dispatch(resetFiscalYear());
  },
});

const mapStateToProps = state => ({
  dataFiscalYear: state.fiscalYear.list.data,
  loadingFiscalYear: state.fiscalYear.list.loading,
  errorFiscalYear: state.fiscalYear.list.error,

  selectedCompany: state.userCompanies.select.selectedCompany,

  updated: state.fiscalYear.update.updated,
  created: state.fiscalYear.create.created,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(FiscalYear);

export default withNamespaces('translation')(withRouter(Main));
