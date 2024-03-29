import React from 'react';
import ReactDOM from 'react-dom';

import configureStore from './store/configureStore';
import App from './App';

import * as serviceWorker from './serviceWorker';

const store = configureStore();

ReactDOM.render(
  React.createElement(App, {
    store,
  }),
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
