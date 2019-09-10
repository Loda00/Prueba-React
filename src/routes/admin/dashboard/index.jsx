import React from 'react';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { withRouter } from 'react-router-dom';

const Dashboard = ({ t, selectedCompany }) => (
  <div className="section-container no-margin page-dashboard">
    <div className="section-general">
      <h1>{t('dashboardWelcome')}</h1>

      {!selectedCompany
      && <p className="text">{t('dashboardSelectCompanyFirst')}</p>}
    </div>
  </div>
);

const mapStateToProps = state => ({
  selectedCompany: state.userCompanies.select.selectedCompany,
});

const DashboardConnect = connect(mapStateToProps)(Dashboard);

export default withNamespaces('translation')(withRouter(DashboardConnect));
