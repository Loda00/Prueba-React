import React from 'react';
import { Route, Switch } from 'react-router-dom';

import ShowStock from './show';
import EditStock from './edit';
import NotFound from '../../../404';

const Product = () => (
  <React.Fragment>
    <Switch>
      <Route exact path="/articles/products/:productId/stock/:stockId/edit" component={EditStock} />
      <Route exact path="/articles/products/:productId/stock/:stockId" component={ShowStock} />
      <Route component={NotFound} />
    </Switch>
  </React.Fragment>
);

export default Product;
