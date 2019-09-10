import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';

import { DashboardWeb } from 'layouts';

import Login from './login/index';

const Routes = () => (
  <DashboardWeb>
    <Switch>
      <Route exact path="/login" component={Login} />
    </Switch>
  </DashboardWeb>
);

export default withRouter(Routes);
