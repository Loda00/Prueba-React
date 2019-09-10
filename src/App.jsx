import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import 'react-toastify/dist/ReactToastify.min.css';
import 'assets/styles/index.scss';

import { I18nextProvider, withNamespaces } from 'react-i18next';

import i18n from 'i18n';
import Routes from './routes/index';

const Root = ({ store }) => (
  <I18nextProvider i18n={i18n}>
    <Provider store={store}>
      <Routes />
    </Provider>
  </I18nextProvider>
);

Root.propTypes = {
  store: PropTypes.object.isRequired,
};

export default withNamespaces()(Root);
