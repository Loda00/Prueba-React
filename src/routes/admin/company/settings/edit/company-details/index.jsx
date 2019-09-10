import React, { Component } from 'react';
import { Link, Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { retrieve, update, reset } from 'actions/company-settings/update';
import { Form, Header, Grid } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class CompanyInformation extends Component {
  state = {
    value: {
      legalName: '',
      commercialName: '',
      slogan: '',
      activity: '',
      shareCapital: '',
      naf: '',
      siret: '',
      vat: '',
      rcs: '',
    },

    legalNameError: false,
    commercialNameError: false,
    sloganError: false,
    activityError: false,
    shareCapitalError: false,
    nafError: false,
    siretError: false,
    vatError: false,
    rcsError: false,
    isSettingsLoaded: false,
    wasUpdate: false,
  };

  componentDidMount() {
    const { retrieve, selectedCompany } = this.props;

    retrieve(`/company_settings?company=${selectedCompany.id}&name=COMPANY_DETAILS`);
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.retrieved && nextProps.retrieved['hydra:member'][0].name === 'COMPANY_DETAILS' && !prevState.isSettingsLoaded) {
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
      legalNameError,
      commercialNameError,
      sloganError,
      activityError,
      shareCapitalError,
      nafError,
      siretError,
      vatError,
      rcsError,
      wasUpdate,
      value: {
        legalName,
        commercialName,
        slogan,
        activity,
        shareCapital,
        naf,
        siret,
        vat,
        rcs,
      },
    } = this.state;

    const { retrieveLoading, updated, updateLoading, company, t } = this.props;

    if (company && updated && wasUpdate) {
      return (
        <Redirect
          push
          to={{
            pathname: '/company/settings/contact-information/edit',
            company,
          }}
        />
      );
    }

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">
              {company ? `${t('step')} 2 / 3: ${t('companiesCompanyDetails')}` : t('companiesCompanyDetails')}
            </Header>
            <EssorButton as={Link} to="/company/settings/company-details" type="chevron left" size="tiny" floated="right">
              {t('buttonBack')}
            </EssorButton>
          </div>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form className="margin-top-bot main-form" loading={retrieveLoading || updateLoading} size="small">
                  <Form.Group inline>
                    <Form.Input
                      label={t('formLegalName')}
                      name="legalName"
                      placeholder={t('formPHLegalName')}
                      value={legalName}
                      onChange={this.handleInputChange}
                      error={legalNameError}
                    />
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Input
                      label={t('formCommercialName')}
                      name="commercialName"
                      placeholder={t('formPHCommercialName')}
                      value={commercialName}
                      onChange={this.handleInputChange}
                      error={commercialNameError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formSlogan')}
                      name="slogan"
                      placeholder={t('formPHSlogan')}
                      value={slogan}
                      onChange={this.handleInputChange}
                      error={sloganError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formActivity')}
                      name="activity"
                      placeholder={t('formPHActivity')}
                      value={activity}
                      onChange={this.handleInputChange}
                      error={activityError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formShareCapital')}
                      name="shareCapital"
                      placeholder={t('formPHShareCapital')}
                      value={shareCapital}
                      onChange={this.handleInputChange}
                      error={shareCapitalError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      maxLength="5"
                      label={t('formNaf')}
                      name="naf"
                      placeholder={t('formPHNaf')}
                      value={naf}
                      onChange={this.handleInputChange}
                      error={nafError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      maxLength="14"
                      type="number"
                      label={t('formSiret')}
                      name="siret"
                      placeholder={t('formPHSiret')}
                      value={siret}
                      onChange={this.handleInputChange}
                      error={siretError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formVat')}
                      name="vat"
                      placeholder={t('formPHVat')}
                      value={vat}
                      onChange={this.handleInputChange}
                      error={vatError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formRcs')}
                      name="rcs"
                      placeholder={t('formPHRcs')}
                      value={rcs}
                      onChange={this.handleInputChange}
                      error={rcsError}
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


const Main = connect(mapStateToProps, mapDispatchToProps)(CompanyInformation);

export default withNamespaces('translation')(withRouter(Main));
