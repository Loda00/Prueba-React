import React from 'react';
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory'; // eslint-disable-line
import { syncHistoryWithStore } from 'react-router-redux';
import configureStore from '../store/configureStore';
import Web from './web/index';
import Admin from './admin/index';

const store = configureStore();

const history = syncHistoryWithStore(createBrowserHistory(), store);

const Routes = () => (
  <Router history={history}>
    <Switch>
      <Route path="/login" component={Web} />
      <Route path="/" component={Admin} />
    </Switch>
  </Router>
);

export default Routes;
