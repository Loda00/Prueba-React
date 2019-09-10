import React, { Component } from 'react';
import { Link, Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { retrieve, update, reset } from 'actions/company-settings/update';
import { Form, Header, Grid } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class ContactInformation extends Component {
  state = {
    value: {
      streetName: '',
      additional: '',
      zipCode: '',
      city: '',
      region: '',
      country: '',
      phone: '',
      fax: '',
      website: '',
    },

    streetNameError: false,
    additionalError: false,
    zipCodeError: false,
    cityError: false,
    regionError: false,
    countryError: false,
    phoneError: false,
    faxError: false,
    websiteError: false,
    isSettingsLoaded: false,
    wasUpdate: false,
  };

  componentDidMount() {
    const { retrieve, selectedCompany } = this.props;

    retrieve(`/company_settings?company=${selectedCompany.id}&name=CONTACT_INFORMATION`);
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.retrieved && nextProps.retrieved['hydra:member'][0].name === 'CONTACT_INFORMATION' && !prevState.isSettingsLoaded) {
      return {
        isSettingsLoaded: true,
        value: nextProps.retrieved['hydra:member'][0].value,
      };
    }

    return null;
  }

  handleInputChange = (e) => {
    e.preventDefault();

    const { name, value } = e.target;

    this.setState(prevState => (
      {
        value: {
          ...prevState.value,
          [name]: value,
        },
      }
    ));
  };

  handleOnSubmit = () => {
    const { value } = this.state;

    const { update, retrieved } = this.props;

    const data = {
      value,
    };

    this.setState({
      wasUpdate: true,
    });

    update(retrieved['hydra:member'][0], data);
  };


  render() {
    const {
      value: {
        streetName,
        additional,
        zipCode,
        city,
        region,
        country,
        phone,
        fax,
        website,
      },
      streetNameError,
      additionalError,
      zipCodeError,
      cityError,
      regionError,
      countryError,
      phoneError,
      faxError,
      websiteError,
      wasUpdate,
    } = this.state;

    const {
      retrieveLoading,
      updated,
      updateLoading,
      company,
      t,
    } = this.props;

    if (updated && company && wasUpdate) {
      return (
        <Redirect
          push
          to="/company/"
        />
      );
    }
    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">
              {company ? `${t('step')} 3 / 3: ${t('companiesContactInformation')}` : t('companiesContactInformation')}
            </Header>
            <EssorButton as={Link} to="/company/settings/contact-information" type="chevron left" size="tiny" floated="right">
              {t('buttonBack')}
            </EssorButton>
          </div>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form className="margin-top-bot main-form" loading={retrieveLoading || updateLoading} size="small">
                  <Form.Group inline>
                    <Form.Input
                      label={t('formStreetName')}
                      name="streetName"
                      placeholder={t('formPHStreetName')}
                      value={streetName}
                      onChange={this.handleInputChange}
                      error={streetNameError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formAdditional')}
                      name="additional"
                      placeholder={t('formPHAdditional')}
                      value={additional}
                      onChange={this.handleInputChange}
                      error={additionalError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formZipCode')}
                      name="zipCode"
                      placeholder={t('formPHZipCode')}
                      value={zipCode}
                      onChange={this.handleInputChange}
                      error={zipCodeError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formCity')}
                      name="city"
                      placeholder={t('formPHCity')}
                      value={city}
                      onChange={this.handleInputChange}
                      error={cityError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formRegion')}
                      name="region"
                      placeholder={t('formPHRegion')}
                      value={region}
                      onChange={this.handleInputChange}
                      error={regionError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formCountry')}
                      name="country"
                      placeholder={t('formPHCountry')}
                      value={country}
                      onChange={this.handleInputChange}
                      error={countryError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formPhoneNumber')}
                      name="phone"
                      placeholder={t('formPHPhoneNumber')}
                      value={phone}
                      onChange={this.handleInputChange}
                      error={phoneError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formFax')}
                      name="fax"
                      placeholder={t('formPHFax')}
                      value={fax}
                      onChange={this.handleInputChange}
                      error={faxError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formWebsite')}
                      name="website"
                      placeholder="wwww.example.com"
                      value={website}
                      onChange={this.handleInputChange}
                      error={websiteError}
                    />
                  </Form.Group>
                  <EssorButton type="check" submit onClick={this.handleOnSubmit} size="small">
                    {company ? t('buttonNext') : t('buttonSave')}
                  </EssorButton>
                </Form>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  retrieve: id => dispatch(retrieve(id)),
  update: (item, values) => dispatch(update(item, values)),
  reset: () => {
    dispatch(reset());
  },
});

const mapStateToProps = state => ({
  retrieveError: state.companySettings.update.retrieveError,
  retrieveLoading: state.companySettings.update.retrieveLoading,
  updateError: state.companySettings.update.updateError,
  updateLoading: state.companySettings.update.updateLoading,
  retrieved: state.companySettings.update.retrieved,
  updated: state.companySettings.update.updated,
  selectedCompany: state.userCompanies.select.selectedCompany,
});


const Main = connect(mapStateToProps, mapDispatchToProps)(ContactInformation);

export default withNamespaces('translation')(withRouter(Main));
