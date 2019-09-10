import React from 'react';
import { Route, Switch } from 'react-router-dom';

import CreateExpert from './create';
import HomeExpert from './home';
import ShowExpert from './show';
import NotFound from '../404';

const Office = () => (
  <React.Fragment>
    <Switch>
      <Route exact path="/experts/create" component={CreateExpert} />
      <Route exact path="/experts/:id/edit" component={CreateExpert} />
      <Route exact path="/experts/:id" component={ShowExpert} />
      <Route exact path="/experts" component={HomeExpert} />
      <Route component={NotFound} />
    </Switch>
  </React.Fragment>
);

export default Office;
