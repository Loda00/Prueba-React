import React from 'react';
import { Route, Switch } from 'react-router-dom';

import CreateProduct from './create';
import HomeProduct from './home';
import ShowProduct from './show';
import Stock from './stock';
import NotFound from '../../404';

const Product = () => (
  <React.Fragment>
    <Switch>
      <Route exact path="/articles/products/create" component={CreateProduct} />
      <Route exact path="/articles/products/:id/edit" component={CreateProduct} />
      <Route exact path="/articles/products/:id" component={ShowProduct} />
      <Route exact path="/articles/products" component={HomeProduct} />
      <Route path="/articles/products/:id/stock" component={Stock} />
      <Route component={NotFound} />
    </Switch>
  </React.Fragment>
);

export default Product;
