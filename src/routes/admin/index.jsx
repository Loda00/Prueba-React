import React, { Component } from 'react';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';
import { DashboardAdmin } from 'layouts';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { ToastContainer } from 'react-toastify';
import { refresh, error, loading } from 'actions/auth/auth';
import { list as listUserCompanies } from 'actions/user-companies/list';
import { Segment, Dimmer, Loader } from 'semantic-ui-react';

import Dashboard from './dashboard';
import Offices from './office';
import Experts from './expert';
import Employees from './employee';
import Companies from './company';
import Forecast from './forecast';
import Articles from './articles';
import Business from './business';
import NotFound from './404';
import Contacts from './contacts/index';

const EXPIRE_TIME = 86400;

class Admin extends Component {
  state = {
    isAuth: null,
    isExpired: false,
    isAuthenticating: false,
  };

  componentDidMount() {
    const { refreshToken, success, listUserCompanies, getUserCompanies } = this.props;

    if (success) {
      const initialDate = new Date(success.date);
      const diff = Math.abs(new Date() - initialDate) / 1000;

      if (diff > EXPIRE_TIME) {
        refreshToken({
          refresh_token: success.refresh_token,
        });
      } else if (isEmpty(listUserCompanies)) {
        getUserCompanies();
      }
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.success && (nextProps.success !== prevState.isAuth)) {
      const initialDate = new Date(nextProps.success.date);
      const diff = Math.abs(new Date() - initialDate) / 1000;

      return {
        isAuth: nextProps.success,
        isExpired: diff > EXPIRE_TIME,
        isAuthenticating: diff > EXPIRE_TIME,
      };
    }

    if (prevState.isExpired === false && prevState.isAuth && prevState.isAuthenticating === false) {
      const initialDate = new Date(prevState.isAuth.date);
      const diff = Math.abs(new Date() - initialDate) / 1000;

      if (diff > EXPIRE_TIME && !nextProps.error) {
        nextProps.refreshToken({
          refresh_token: prevState.isAuth.refresh_token,
        });

        return {
          isAuthenticating: true,
          isExpired: true,
        };
      }
    }

    if (!nextProps.success && (nextProps.success !== prevState.isAuth)) {
      return {
        isAuth: nextProps.success,
        isAuthenticating: false,
      };
    }

    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    const { isAuth } = this.state;
    const { refreshToken, listUserCompanies, getUserCompanies, error } = this.props;

    if (prevState.isExpired === false) {
      const initialDate = new Date(prevState.isAuth.date);
      const diff = Math.abs(new Date() - initialDate) / 1000;

      if (diff > EXPIRE_TIME && !error) {
        this.setState({ isExpired: true }); // eslint-disable-line
        refreshToken({
          refresh_token: prevState.isAuth.refresh_token,
        });
      }
    }

    if (isAuth && prevState.isAuth !== isAuth && isEmpty(listUserCompanies)) {
      getUserCompanies();
    }
  }

  render() {
    const { error, loading, userRole, selectedCompany, selectedFiscalYear } = this.props;
    const { isAuth, isExpired } = this.state;

    return (
      <DashboardAdmin>
        <React.Fragment>
          <Switch>
            <PrivateRoute
              path="/"
              auth={isAuth}
              isExpired={isExpired}
              loading={loading}
              error={error}
              role={userRole}
              company={selectedCompany}
              fiscalYear={selectedFiscalYear}
            />
          </Switch>
        </React.Fragment>
      </DashboardAdmin>
    );
  }
}

const PrivateRoute = (
  {
    auth: isAuth,
    isExpired,
    loading,
    error,
    role,
    company,
    fiscalYear,
    ...rest
  },
) => {
  if (isAuth && !isExpired && !error && !loading) {
    if (role && role !== 'ROLE_EMPLOYEE') {
      return (
        <React.Fragment>
          <Switch>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/offices" component={Offices} />
            <Route path="/companies" component={Companies} />
            <Route path="/experts" component={Experts} />
            <Route path="/contacts" component={Contacts} />
            <Route
              path="/employees"
              render={(props) => {
                if (!company) {
                  return (
                    <Redirect to="/dashboard" />
                  );
                }

                return (
                  <Employees {...props} />
                );
              }}
            />
            <Route
              path="/company"
              render={(props) => {
                if (!company) {
                  return (
                    <Redirect to="/dashboard" />
                  );
                }

                return (
                  <Companies {...props} />
                );
              }}
            />
            <Route
              path="/forecast"
              render={(props) => {
                if (!company || !fiscalYear) {
                  return (
                    <Redirect to="/dashboard" />
                  );
                }

                return (
                  <Forecast {...props} />
                );
              }}
            />
            <Route
              path="/articles"
              render={(props) => {
                if (!company) {
                  return (
                    <Redirect to="/dashboard" />
                  );
                }

                return (
                  <Articles {...props} />
                );
              }}
            />
            <Route
              path="/business"
              render={(props) => {
                if (!company) {
                  return (
                    <Redirect to="/dashboard" />
                  );
                }
                return (
                  <Business {...props} />
                );
              }}
            />
            <Route exact path="/" component={Dashboard} />
            <Route component={NotFound} />
          </Switch>
          <ToastContainer
            position="bottom-right"
            hideProgressBar
            draggable={false}
            toastClassName="custom-toast-container"
            bodyClassName="custom-toast-body"
          />
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <Switch>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/company" component={Companies} />
          <Route
            path="/contacts"
            render={(props) => {
              if (!company) {
                return (
                  <Redirect to="/dashboard" />
                );
              }
              return (
                <Contacts {...props} />
              );
            }}
          />
          <Route
            path="/forecast"
            render={(props) => {
              if (!company) {
                return (
                  <Redirect to="/dashboard" />
                );
              }

              return (
                <Forecast {...props} />
              );
            }}
          />
          <Route
            path="/employees"
            render={(props) => {
              if (!company) {
                return (
                  <Redirect to="/dashboard" />
                );
              }

              return (
                <Employees {...props} />
              );
            }}
          />
          <Route exact path="/" component={Dashboard} />
          <Route component={NotFound} />
        </Switch>
        <ToastContainer
          position="bottom-right"
          hideProgressBar
          draggable={false}
          toastClassName="custom-toast-container"
          bodyClassName="custom-toast-body"
        />
      </React.Fragment>
    );
  }

  if (!isAuth && !error && !loading) {
    return (
      <Route
        {...rest}
        render={props => (
          <Redirect
            to={{
              pathname: '/login',
              state: {
                from: props.location,
              },
            }}
          />
        )}
      />
    );
  }

  return (
    <React.Fragment>
      <Segment className="full-page-loader">
        <Dimmer active>
          <Loader size="massive">Vérification login en cours</Loader>
        </Dimmer>
      </Segment>
    </React.Fragment>
  );
};

const mapDispatchToProps = dispatch => ({
  refreshToken: data => dispatch(refresh(data)),
  getUserCompanies: page => dispatch(listUserCompanies(page)),
  reset: () => {
    dispatch(loading(false));
    dispatch(error(null));
  },
});

const mapStateToProps = state => ({
  success: state.auth.created,
  error: state.auth.error,
  loading: state.auth.loading,
  userRole: state.userCompanies.role.userRole,
  listUserCompanies: state.userCompanies.list.data,
  selectedCompany: state.userCompanies.select.selectedCompany,
  selectedFiscalYear: state.userCompanies.select.selectedFiscalYear,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(Admin);

export default withRouter(Main);
