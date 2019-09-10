import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { selectDocument } from 'actions/user-companies/select';
import { list as listQuotes, reset as resetQuoteList } from 'actions/quote/list';
import { Dimmer, Loader, Segment } from 'semantic-ui-react';

import ListQuote from './list';
import CreateQuote from './edit';
import ShowQuote from './show';
import NotFound from '../../404';

class Quote extends Component {
  componentDidMount() {
    const { getQuotes, selectedCompany, selectDocument } = this.props;

    selectDocument(null);
    getQuotes(`/quotes?company=${selectedCompany.id}`);
  }

  componentDidUpdate(prevProps) {
    const { updated, created, getQuotes, selectedCompany } = this.props;

    if (
      (!isEmpty(updated) && updated !== prevProps.updated)
      || (!isEmpty(created) && created !== prevProps.created)
    ) {
      getQuotes(`/quotes?company=${selectedCompany.id}`);
    }
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  render() {
    const { dataQuote, loadingQuote, t } = this.props;

    if (loadingQuote || isEmpty(dataQuote)) {
      return (
        <div className="section-container">
          <Segment
            basic
            className="section-loading"
          >
            <Dimmer active={loadingQuote} inverted>
              <Loader>{t('loading')}</Loader>
            </Dimmer>
          </Segment>
        </div>
      );
    }

    return (
      <React.Fragment>
        <Switch>
          <Route exact path="/business/quotes" component={ListQuote} />
          <Route key="edit" exact path="/business/quotes/create" component={CreateQuote} />
          <Route key="create" exact path="/business/quotes/:id/edit" component={CreateQuote} />
          <Route exact path="/business/quotes/:id" component={ShowQuote} />
          <Route component={NotFound} />
        </Switch>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  getQuotes: page => dispatch(listQuotes(page)),
  selectDocument: quote => dispatch(selectDocument(quote)),
  reset: () => {
    dispatch(resetQuoteList());
  },
});

const mapStateToProps = state => ({
  dataQuote: state.quote.list.data,
  loadingQuote: state.quote.list.loading,
  errorQuote: state.quote.list.error,

  selectedCompany: state.userCompanies.select.selectedCompany,

  updated: state.quote.update.updated,
  created: state.quote.create.created,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(Quote);

export default withNamespaces('translation')(withRouter(Main));
