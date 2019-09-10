import React from 'react';
import { withRouter } from 'react-router-dom';

import Header from '../header-web/index';
import Footer from '../footer/index';

const DashboardWeb = ({ children }) => (
  <div className="login-container">
    <Header />
    {children}
    <Footer />
  </div>
);

export default withRouter(DashboardWeb);
