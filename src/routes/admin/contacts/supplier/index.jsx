import React from 'react';
import { Route, Switch } from 'react-router-dom';

// import { list } from 'actions/supplier/list';
import CreateSupplier from './create';
import HomeSupplier from './home';
import ShowSupplier from './show';
import NotFound from '../../404';

const Supplier = () => (
  <React.Fragment>
    <Switch>
      <Route exact path="/contacts/suppliers/create" component={CreateSupplier} />
      <Route exact path="/contacts/suppliers/:id/edit" component={CreateSupplier} />
      <Route exact path="/contacts/suppliers/:id" component={ShowSupplier} />
      <Route exact path="/contacts/suppliers" component={HomeSupplier} />
      <Route component={NotFound} />
    </Switch>
  </React.Fragment>
);

export default Supplier;
