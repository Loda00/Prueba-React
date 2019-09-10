import React from 'react';
import { Route, Switch } from 'react-router-dom';

import CreateEnsemble from './create';
import HomeEnsemble from './home';
import ShowEnsemble from './show';
import NotFound from '../../404';

const Ensemble = () => (
  <React.Fragment>
    <Switch>
      <Route exact path="/articles/ensembles/create" component={CreateEnsemble} />
      <Route exact path="/articles/ensembles/:id/edit" component={CreateEnsemble} />
      <Route exact path="/articles/ensembles/:id" component={ShowEnsemble} />
      <Route exact path="/articles/ensembles" component={HomeEnsemble} />
      <Route component={NotFound} />
    </Switch>
  </React.Fragment>
);

export default Ensemble;
