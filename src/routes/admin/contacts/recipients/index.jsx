import React from 'react';
import { Route, Switch } from 'react-router-dom';

import CreateRecipient from './create/index';
import HomeRecipient from './home/index';
import ShowRecipient from './show';
import NotFound from '../../404';

const Recipient = () => (
  <React.Fragment>
    <Switch>
      <Route exact path="/contacts/recipients/create" component={CreateRecipient} />
      <Route exact path="/contacts/recipients/:id/edit" component={CreateRecipient} />
      <Route exact path="/contacts/recipients/:id" component={ShowRecipient} />
      <Route exact path="/contacts/recipients" component={HomeRecipient} />
      <Route component={NotFound} />
    </Switch>
  </React.Fragment>
);

export default Recipient;
