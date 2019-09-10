import React from 'react';
import { withRouter } from 'react-router-dom';

import Header from '../header/index';
import Sidebar from '../sidebar/index';

const DashboardAdmin = ({ children }) => (
  <div>
    <Header />
    <Sidebar>{children}</Sidebar>
  </div>
);

export default withRouter(DashboardAdmin);
