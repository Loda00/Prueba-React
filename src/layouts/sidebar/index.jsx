/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable no-trailing-spaces */
import React from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { Image, Icon } from 'semantic-ui-react';
import ReactTooltip from 'react-tooltip';
import { toggleMobileNavVisibility } from 'actions/layout/layout';

import enterprise from 'assets/images/sidebar-icons/8-layers.png';
import kog from 'assets/images/sidebar-icons/9-layers.png';
import rocket from 'assets/images/sidebar-icons/12-layers.png';
// import rocket from 'assets/images/sidebar-icons/12-layers.png';
import file from 'assets/images/sidebar-icons/17-layers.png';
import globe from 'assets/images/sidebar-icons/36-layers.png';
import users from 'assets/images/sidebar-icons/23-layers.png';
import gestion from 'assets/images/sidebar-icons/15-layers.png';
import { withNamespaces } from 'react-i18next';
import jwtDecode from 'jwt-decode';

/* eslint-disable-next-line max-len */
const Sidebar = ({ mobileNavVisibility, toggleMobileNavVisibility, selectedCompany, userRole, children, t, success, selectedBusiness }) => {
  /* eslint-disable-next-line */
  let role = '';
  if (success) {
    const jwt = jwtDecode(success.token);
    /* eslint-disable-next-line */
    role = jwt.roles[0];
  }

  return (
    <div className="main-container">
      <div
        className={classnames('sidebar', {
          active: mobileNavVisibility,
        })}
      >
        <ul>
          {/* DASHBOARD */}
          <li>
            <NavLink
              to="/dashboard"
              activeClassName="active"
              className="menu-item"
            >
              <div className="icon-container">
                <Image src={kog} alt="Dashboard" data-tip={t('dashboard')} data-for="dashboard" />
              </div>
              {t('dashboard')}

              {!mobileNavVisibility
              && <ReactTooltip className="essor-tooltip" place="right" effect="solid" id="dashboard" />
              }
            </NavLink>
          </li>

          {/* COMPANY */}
          <li className={classnames({
            disable: !selectedCompany && role === 'ROLE_EMPLOYEE',
          })}
          >
            <NavLink
              to={userRole !== 'ROLE_EMPLOYEE' && selectedCompany === null ? '/companies' : '/company'}
              activeClassName="active"
              className="menu-item"
            >
              <div className="icon-container">
                <Image src={enterprise} alt="enterprise_image" data-tip={t('companies')} data-for="companies" />
              </div>
              {t('companies')}

              {!mobileNavVisibility
              && <ReactTooltip className="essor-tooltip" place="right" effect="solid" id="companies" />
              }
            </NavLink>
          </li>

          {/* ARTICLES */}
          <li className={classnames({
            disable: !selectedCompany,
          })}
          >
            <NavLink
              to="/articles/"
              activeClassName="active"
              className="menu-item"
            >
              <div className="icon-container">
                <Image src={file} alt="file_image" data-tip={t('articlesShowTitle')} data-for="articles" />
              </div>
              {t('articlesShowTitle')}
              {!mobileNavVisibility
              && <ReactTooltip className="essor-tooltip" place="right" effect="solid" id="articles" />
              }
            </NavLink>
          </li>

          {/* EMPLOYEES */}
          <li className={classnames({
            disable: !selectedCompany,
          })}
          >
            <NavLink
              to="/employees"
              activeClassName="active"
              className="menu-item"
            >
              <div className="icon-container">
                <Image src={users} alt="users_image" data-tip={t('staff')} data-for="staff" />
              </div>
              {t('staff')}

              {!mobileNavVisibility
              && <ReactTooltip className="essor-tooltip" place="right" effect="solid" id="staff" />
              }
            </NavLink>
          </li>

          {/* EXPERTS
          {userRole !== 'ROLE_EMPLOYEE'
            && (
            <li className={classnames({
              disable: !selectedCompany,
            })}
            >
              <NavLink
                to="/experts"
                activeClassName="active"
                className="menu-item"
              >
                <div className="icon-container">
                  <Image src={users} alt="users_image" data-tip={t('experts')} data-for="experts" />
                </div>
                {t('experts')}

                {!mobileNavVisibility
                && <ReactTooltip className="essor-tooltip" place="right" effect="solid" id="experts" />
                }
              </NavLink>
            </li>
            )
          } */}

          {/* CONTACTS */}
          <li className={classnames({
            disable: !selectedCompany,
          })}
          >
            <NavLink
              to="/contacts"
              activeClassName="active"
              className="menu-item"
            >
              <div className="icon-container">
                <Image src={globe} alt="contacts_image" data-tip={t('contacts')} data-for="suppliers" />
              </div>
              {t('suppliers')}

              {!mobileNavVisibility
              && <ReactTooltip className="essor-tooltip" place="right" effect="solid" id="suppliers" />
              }
            </NavLink>
          </li>

          {/* INVOICES / REGLEMENTS */}
          {/* <li className={classnames({
            disable: !selectedCompany,
          })}
          >
            <NavLink
              to="/invoices"
              activeClassName="active"
              className="menu-item"
            >
              <div className="icon-container">
                <Image src={piggy} alt="regulations_image" data-tip={t('regulations')} data-for="regulations" />
              </div>
              {t('regulations')}

              {!mobileNavVisibility
              && <ReactTooltip className="essor-tooltip" place="right" effect="solid" id="regulations" />
              }
            </NavLink>
          </li> */}

          {/* FORECAST */}
          <li className={classnames({
            disable: !selectedCompany,
          })}
          >
            <NavLink
              to="/forecast"
              activeClassName="active"
              className="menu-item"
            >
              <div className="icon-container">
                <Image src={rocket} alt="projected_image" data-tip={t('forecast')} data-for="forecast" />
              </div>
              {t('forecast')}

              {!mobileNavVisibility
              && <ReactTooltip className="essor-tooltip" place="right" effect="solid" id="forecast" />
              }
            </NavLink>
          </li>

          {/* Business Management */}
          <li
            className={classnames({
              disable: !selectedCompany,
            })}
          >
            <NavLink
              to="/business"
              activeClassName={selectedBusiness ? 'active' : ''}
              className="menu-item"
            >
              <div className="icon-container">
                <Image src={gestion} alt="projected_image" data-tip={t('business')} data-for="business" />
              </div>
              {t('forecast')}

              {!mobileNavVisibility
              && <ReactTooltip className="essor-tooltip" place="right" effect="solid" id="business" />
              }
            </NavLink>
          </li>
          {/* ANALYSIS */}
          {/* <li className={classnames({
            disable: !selectedCompany,
          })}
          >
            <NavLink
              to="/analysis"
              activeClassName="active"
              className="menu-item"
            >
              <div className="icon-container">
                <Image src={dashboard} alt="analyzes_image" data-tip={t('analyzes')} data-for="analyzes" />
              </div>
              {t('analyzes')}

              {!mobileNavVisibility
              && <ReactTooltip className="essor-tooltip" place="right" effect="solid" id="analyzes" />
              }
            </NavLink>
          </li> */}

          {/* STATISTICS */}
          {/* <li className={classnames({
            disable: !selectedCompany,
          })}
          >
            <NavLink
              to="/statistics"
              activeClassName="active"
              className="menu-item"
            >
              <div className="icon-container">
                <Image src={chartPie} alt="statistics_image" data-tip={t('statistics')} data-for="statistics" />
              </div>
              {t('statistics')}

              {!mobileNavVisibility
              && <ReactTooltip className="essor-tooltip" place="right" effect="solid" id="statistics" />
              }
            </NavLink>
          </li> */}

          {/*
          <hr />

          <li className="menu-item text-primary">
            {mobileNavVisibility && 'Administration'}
          </li>

          <li>
            <NavLink
              to="/experts"
              activeClassName="active"
              className="menu-item text-primary"
            >
              <div className="icon-container">
                <Icon name="buromobelexperte" data-tip={t('experts')} data-for="experts" />
              </div>
              {t('experts')}

              {!mobileNavVisibility
              && <ReactTooltip className="essor-tooltip" place="right" effect="solid" id="experts" />
              }
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/offices"
              activeClassName="active"
              className="menu-item text-primary"
            >
              <div className="icon-container">
                <Icon name="folder open" data-tip={t('offices')} data-for="offices" />
              </div>
              {t('offices')}

              {!mobileNavVisibility
              && <ReactTooltip className="essor-tooltip" place="right" effect="solid" id="offices" />
              }
            </NavLink>
          </li>
          */}
        </ul>
      </div>
      <div
        className={classnames('toggle-bar', {
          active: mobileNavVisibility,
        })}
        onClick={toggleMobileNavVisibility}
      >
        <Icon name={mobileNavVisibility ? 'angle left' : 'angle right'} />
      </div>
      <div
        className={classnames('main-view', {
          active: mobileNavVisibility,
        })}
      >
        {children}
      </div>
    </div>
  );
};

const mapDispatchToProps = dispatch => ({
  toggleMobileNavVisibility: () => dispatch(toggleMobileNavVisibility()),
});

const mapStateToProps = state => ({
  success: state.auth.created,
  error: state.auth.error,
  loading: state.auth.loading,

  mobileNavVisibility: state.layout.mobileNavVisibility,
  selectedCompany: state.userCompanies.select.selectedCompany,
  userRole: state.userCompanies.role.userRole,

});

const Main = connect(mapStateToProps, mapDispatchToProps)(Sidebar);

export default withNamespaces('translation')(withRouter(Main));
