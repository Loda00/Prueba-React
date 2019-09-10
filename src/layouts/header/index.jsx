import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import jwtDecode from 'jwt-decode';
import { logout } from 'actions/auth/auth';
import { selectCompany, selectFiscalYear } from 'actions/user-companies/select';
import { setRole, setID } from 'actions/user-companies/role';
import { list as listFiscalYear } from 'actions/fiscal-year/list';
import { Dropdown, Icon, Image, Form, Input, Select, Button } from 'semantic-ui-react';
import { withNamespaces } from 'react-i18next';

import logo from 'assets/images/logo.png';
import tie from 'assets/images/tie.png';
import help from 'assets/images/help.png';
import phone from 'assets/images/phone.png';
import ChangeLang from './flagButtons';

class Header extends Component {
  state = {
    name: 'Loading ...',
    username: 'Loading ...',
    companiesList: null,
  };

  componentDidMount() {
    const { success, setRole, setID } = this.props;
    if (success) {
      const jwt = jwtDecode(success.token);
      this.setState({
        name: `${jwt.firstName} ${jwt.lastName}`,
        username: `${jwt.username}`,
      });
      setRole(jwt.roles[0]);
      setID(jwt.id);
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { listUserCompanies } = nextProps;

    const { companiesList } = prevState;

    if (!isEmpty(listUserCompanies) && listUserCompanies['hydra:member'] !== companiesList) {
      return {
        companiesList: listUserCompanies['hydra:member'],
      };
    }

    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      selectCompany,
      selectFiscalYear,
      userRole,
      getFiscalYears,
      dataFiscalYear,
      selectedCompany,
    } = this.props;
    const { companiesList } = this.state;

    if (!isEmpty(selectedCompany) && selectedCompany !== prevProps.selectedCompany) {
      getFiscalYears(`/fiscal_years?company=${selectedCompany['@id']}`);
    }

    if (!isEmpty(dataFiscalYear) && prevProps.dataFiscalYear !== dataFiscalYear) {
      if (dataFiscalYear['hydra:member'].length >= 1) {
        let fiscalYear = null;

        for (let i = 0; i < dataFiscalYear['hydra:member'].length; i++) {
          if (dataFiscalYear['hydra:member'][i].defaultYear) {
            fiscalYear = dataFiscalYear['hydra:member'][i];
            break;
          }
        }

        selectFiscalYear(fiscalYear);
      } else {
        selectFiscalYear(null);
      }
    }

    if (userRole === 'ROLE_EMPLOYEE' && companiesList !== prevState.companiesList) {
      selectCompany(companiesList[0]);
    }
  }

  changeCompany = (company) => {
    const { selectCompany, history } = this.props;

    selectCompany(company);
    history.push('/company');
  };

  render() {
    const {
      logout,
      loadingFiscalYear,
      selectedCompany,
      userRole,
      selectedFiscalYear,
      t,
    } = this.props;

    const { name, username, companiesList } = this.state;

    const options = [
      {
        key: 'c', text: 'Contacts', value: 'contact', active: true,
      },
      {
        key: 'o', text: 'A option', value: 'option',
      },
      {
        key: 'a', text: 'An other option', value: 'option2',
      },
    ];

    const trigger = (
      <div className="nav-user">
        <div className="user-data">
          <div>{selectedCompany ? selectedCompany.name : name}</div>
          <div>{username}</div>
          <div>
            {(!isEmpty(selectedFiscalYear) && !loadingFiscalYear)
              ? selectedFiscalYear.label
              : ''
            }
          </div>
        </div>
        <div className="avatar">
          <Image src={tie} alt="tie_icon" />
        </div>
      </div>
    );

    return (
      <div className="header-container">
        <Link to="/" className="logo">
          <Image src={logo} alt="essor_logo" />
        </Link>
        <div className="navbar">
          <div className="nav-toggle" />

          <Form className="search-options">
            <Form.Group inline>
              <Form.Field control={Select} options={options} defaultValue="contact" compact />
              <Form.Field>
                <Input />
              </Form.Field>
              <Form.Field>
                <Button icon>
                  <Icon name="search" />
                </Button>
              </Form.Field>
            </Form.Group>
          </Form>

          <div className="util-options">
            <div>
              <Image src={help} alt="help_icon" />
            </div>
            <div>
              <Image src={phone} alt="phone_icon" />
            </div>
            <ChangeLang />
          </div>

          <Dropdown trigger={trigger} icon={null}>
            <Dropdown.Menu>
              {(userRole && userRole !== 'ROLE_EMPLOYEE')
                && (
                  <React.Fragment>
                    <Dropdown.Item
                      as={Link}
                      to="/experts"
                      text="Users"
                    />
                    <Dropdown.Divider />
                    {companiesList
                      ? (
                        <React.Fragment>
                          {companiesList.map(company => (
                            <Dropdown.Item
                              key={company['@id']}
                              text={company.name}
                              onClick={() => this.changeCompany(company)}
                            />
                          ))}
                        </React.Fragment>
                      ) : (
                        <Dropdown.Item
                          disabled
                        >
                          <Icon loading name="spinner" />
                          {t('loading')}
                        </Dropdown.Item>
                      )
                    }
                  </React.Fragment>
                )
              }
              <Dropdown.Item text="Se déconnecter" onClick={logout} />
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    );
  }
}


const mapDispatchToProps = dispatch => ({
  getFiscalYears: page => dispatch(listFiscalYear(page)),
  selectFiscalYear: fiscalYear => dispatch(selectFiscalYear(fiscalYear)),
  logout: () => dispatch(logout()),
  selectCompany: company => dispatch(selectCompany(company)),
  setRole: role => dispatch(setRole(role)),
  setID: id => dispatch(setID(id)),
});

const mapStateToProps = state => ({
  success: state.auth.created,
  error: state.auth.error,
  loading: state.auth.loading,

  listUserCompanies: state.userCompanies.list.data,
  loadingUserCompanies: state.userCompanies.list.loading,
  errorUserCompanies: state.userCompanies.list.error,

  selectedCompany: state.userCompanies.select.selectedCompany,
  userRole: state.userCompanies.role.userRole,

  userCompanies: state.userCompanies.list.data,
  selectedFiscalYear: state.userCompanies.select.selectedFiscalYear,

  dataFiscalYear: state.fiscalYear.list.data,
  loadingFiscalYear: state.fiscalYear.list.loading,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(Header);

export default withNamespaces('translation')(withRouter(Main));
