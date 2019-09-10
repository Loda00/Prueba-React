import React from 'react';
import { Route, Switch } from 'react-router-dom';

import CreateService from './create';
import ShowService from './show';
import HomeService from './home';
import NotFound from '../../404';

const Service = () => (
  <React.Fragment>
    <Switch>
      <Route exact path="/articles/services/create" component={CreateService} />
      <Route exact path="/articles/services/:id/edit" component={CreateService} />
      <Route exact path="/articles/services/:id" component={ShowService} />
      <Route exact path="/articles/services" component={HomeService} />
      <Route component={NotFound} />
    </Switch>
  </React.Fragment>
);

export default Service;
