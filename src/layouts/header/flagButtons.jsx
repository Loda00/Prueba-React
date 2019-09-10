import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';

import { filter } from 'lodash';
import { Dropdown, Image } from 'semantic-ui-react';
import frFlag from 'assets/images/flag.png';
import enFlag from 'assets/images/flag-us.png';

import i18n from 'i18n';

class ChangeLang extends Component {
  state = {
    countryFlags: [
      {
        country: frFlag,
        flag: 'fr',
      },
      {
        country: enFlag,
        flag: 'en',
      },
    ],
    selectCountry: '',
    getCountry: '',
  };

  componentDidMount() {
    const { countryFlags } = this.state;
    const filterFlag = filter(countryFlags, {
      flag: i18n.language,
    });

    this.setState({
      getCountry: filterFlag[0].country,
      selectCountry: filterFlag[0].flag,
    });
  }

  changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    const { countryFlags } = this.state;
    const changeFlag = filter(countryFlags, {
      flag: lng,
    });

    this.setState({
      selectCountry: lng,
      getCountry: changeFlag[0].country,
    });
  };

  render() {
    const { countryFlags, selectCountry, getCountry } = this.state;

    const trigger = (
      <div>
        <div>
          <Image src={getCountry} alt="flag_icon" />
        </div>
      </div>
    );

    return (
      <Dropdown trigger={trigger} icon={null} fluid>
        <Dropdown.Menu className="language-dropdown">
          {countryFlags.map((flagItem, i) => {
            if (flagItem.flag === selectCountry) {
              return null;
            }
            return (
              <Dropdown.Item key={i} onClick={() => this.changeLanguage(flagItem.flag)}>
                <Image src={flagItem.country} alt="flag_icon" />
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

export default withNamespaces('translation')(ChangeLang);
