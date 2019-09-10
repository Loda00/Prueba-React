import React, { Component } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { retrieve, update, reset } from 'actions/office-settings/update';
import { Form, Grid, Header } from 'semantic-ui-react';
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
    alreadyCharged: false,
    wasUpdate: false,
  };

  componentDidMount() {
    const { retrieve, match } = this.props;

    retrieve(match.params.id);
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      nextProps.retrieved
      && nextProps.retrieved['hydra:member']
      && !prevState.alreadyCharged
      && nextProps.retrieved['hydra:member'][0].value !== prevState.value
    ) {
      return {
        value: nextProps.retrieved['hydra:member'][0].value,
        alreadyCharged: true,
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
    /*
    this.setState({
      value: {
        ...this.state.value,
        [e.target.name]: e.target.value,
      },
    }); */
  };

  handleOnSubmit = (e) => {
    e.preventDefault();

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
    } = this.state;

    const { retrieveLoading, updated, updateLoading, office, match, t } = this.props;

    if (updated && office && wasUpdate) {
      return (
        <Redirect
          push
          to={{
            pathname: `/offices/${match.params.id}/settings/company-details`,
            office,
          }}
        />
      );
    }

    return (
      <div className="section-container">
        <div className="section-general">
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Header as="h3">
                  {office && `${t('step')} 2 / 6: `}
                  {t('officesContactInformation')}
                </Header>
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
                      placeholder="www.example.com"
                      value={website}
                      onChange={this.handleInputChange}
                      error={websiteError}
                    />
                  </Form.Group>

                  <EssorButton type="check" submit onClick={this.handleOnSubmit} size="small">
                    {office ? t('buttonNext') : t('buttonSubmit')}
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
  retrieveError: state.officeSettings.update.retrieveError,
  retrieveLoading: state.officeSettings.update.retrieveLoading,
  updateError: state.officeSettings.update.updateError,
  updateLoading: state.officeSettings.update.updateLoading,
  retrieved: state.officeSettings.update.retrieved,
  updated: state.officeSettings.update.updated,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(ContactInformation);

export default withNamespaces('translation')(withRouter(Main));
