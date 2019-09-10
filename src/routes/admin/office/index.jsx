import React from 'react';
import { Route, Switch } from 'react-router-dom';

import CreateOffice from './create';
import OfficeSettings from './settings';
import HomeOffice from './home';
import ShowOffice from './show';
import NotFound from '../404';

const Office = () => (
  <React.Fragment>
    <Switch>
      <Route exact path="/offices/create" component={CreateOffice} />
      <Route exact path="/offices/:id/edit" component={CreateOffice} />
      <Route exact path="/offices/:id" component={ShowOffice} />
      <Route exact path="/offices" component={HomeOffice} />
      <Route path="/offices/:id/settings" component={OfficeSettings} />
      <Route component={NotFound} />
    </Switch>
  </React.Fragment>
);

export default Office;
