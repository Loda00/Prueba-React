import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import classnames from 'classnames';
import { Icon } from 'semantic-ui-react';
import { toggleMobileNavVisibilityRight } from 'actions/layout/layout';

import { withNamespaces } from 'react-i18next';

const SidebarInfo = ({ mobileNavVisibilityRight, toggleMobileNavVisibilityRight }) => (
  <div className="main-container">
    <div
      className={classnames('info-sidebar', {
        active: mobileNavVisibilityRight,
      })}
    >
      <ul>
        <li className="menu-item menu-title">
          <h3>1. Planned turnover</h3>
          <span className="menu-item-info">15 000.00</span>
        </li>
      </ul>
      <ul>
        <li className="menu-item menu-title">
          <h3>2. Planned turnover</h3>
          <span className="menu-item-info">15 000.00</span>
        </li>
      </ul>
      <ul>
        <li className="menu-item menu-title">
          <h3>3. Planned turnover</h3>
          <span className="menu-item-info">15 000.00</span>
        </li>
      </ul>
    </div>
    <div
      className={classnames('info-toggle-bar', {
        rotate: mobileNavVisibilityRight,
      })}
      onClick={toggleMobileNavVisibilityRight}
    >
      <Icon name={mobileNavVisibilityRight ? 'angle left' : 'angle right'} />
    </div>
  </div>
);

const mapDispatchToProps = dispatch => ({
  toggleMobileNavVisibilityRight: () => dispatch(toggleMobileNavVisibilityRight()),
});

const mapStateToProps = state => ({
  mobileNavVisibilityRight: state.layoutRight.mobileNavVisibilityRight,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(SidebarInfo);

export default withNamespaces('translation')(withRouter(Main));
