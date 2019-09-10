import React from 'react';
import { Link } from 'react-router-dom';

import { Container, Image } from 'semantic-ui-react';

import logo from 'assets/images/logo.png';
import checkVine from 'assets/images/checkvine.png';
import icon from 'assets/images/simbol.png';

const Header = () => (
  <div className="header-web-container">
    <Container
      className="clearfix"
      style={{
        position: 'relative',
      }}
    >
      <Link to="/login" className="logo">
        <Image src={logo} alt="enterprise_logo" />
      </Link>

      <div className="web-contact">
        <Image src={icon} alt="homeIcon" className="icon-head" />
        <div>RETOUR SITE</div>

        <div className="contact-number">
          <div style={{
            marginRight: '-10px',
          }}
          >
CONTACT
          </div>
          <div style={{
            position: 'relative', width: '70px',
          }}
          >
            <Image src={checkVine} alt="checkVine" className="checkVine" />
          </div>
          <div style={{
            fontWeight: '900', fontSize: '18px',
          }}
          >
03 88 08 54 35
          </div>
        </div>
      </div>
    </Container>
  </div>
);

export default Header;
