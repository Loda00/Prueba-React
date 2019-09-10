import React from 'react';
import { Route, Switch, NavLink } from 'react-router-dom';
import { withNamespaces } from 'react-i18next';

import HomeContacts from './home/index';
import Suppliers from './supplier';
import Recipients from './recipients';
import NotFound from '../404';

const Contacts = ({ t }) => (
  <React.Fragment>
    <div className="sub-nav">
      <ul>
        <li className="menu-item menu-title">
          {t('contacts')}
        </li>
        <li>
          <NavLink
            to="/contacts/recipients"
            activeClassName="active"
            className="menu-item"
          >
            {t('contactsRecipient')}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/contacts/recipients/create"
            activeClassName="active"
            className="menu-item"
          >
            {t('contactsAddRecipient')}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/contacts/suppliers"
            activeClassName="active"
            className="menu-item"
          >
            {t('contactsSupplier')}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/contacts/suppliers/create"
            activeClassName="active"
            className="menu-item"
          >
            {t('contactsAddSupplier')}
          </NavLink>
        </li>
      </ul>
    </div>
    <Switch>
      <Route exact path="/contacts" component={HomeContacts} />
      <Route path="/contacts/suppliers" component={Suppliers} />
      <Route path="/contacts/recipients" component={Recipients} />
      <Route component={NotFound} />
    </Switch>
  </React.Fragment>
);


export default withNamespaces('translation')(Contacts);
