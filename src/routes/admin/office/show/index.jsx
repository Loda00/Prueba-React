import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { find } from 'lodash';
import moment from 'moment';
import { connect } from 'react-redux';
import { retrieve as retrieveOffice, reset as resetOffice } from 'actions/office/show';
import { retrieve as retrieveOfficeSettings, reset as resetOfficeSettings } from 'actions/office-settings/show';
import { Form, Grid, Header } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class ShowOffice extends Component {
  componentDidMount() {
    const { getOffice, getOfficeSettings, match } = this.props;
    getOffice(`/offices/${match.params.id}`);
    getOfficeSettings(`/office_settings?office=${match.params.id}`);
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  render() {
    const {
      retrievedOffice,
      retrievedOfficeSettings,
      loadingOffice,
      loadingOfficeSettings,
      t,
      match,
    } = this.props;

    let companyDetails;
    let contactInformation;
    let bankAccounts;
    let subscriptionData;
    let subscribedOption;

    if (retrievedOfficeSettings) {
      companyDetails = find(retrievedOfficeSettings['hydra:member'], {
        name: 'COMPANY_DETAILS',
      });
      companyDetails = companyDetails.value;

      contactInformation = find(retrievedOfficeSettings['hydra:member'], {
        name: 'CONTACT_INFORMATION',
      });
      contactInformation = contactInformation.value;

      bankAccounts = find(retrievedOfficeSettings['hydra:member'], {
        name: 'BANK_ACCOUNTS',
      });
      bankAccounts = bankAccounts.value;

      subscriptionData = find(retrievedOfficeSettings['hydra:member'], {
        name: 'SUBSCRIPTION_DATA',
      });
      subscriptionData = subscriptionData.value;

      subscribedOption = find(retrievedOfficeSettings['hydra:member'], {
        name: 'SUBSCRIBED_OPTION',
      });
      subscribedOption = subscribedOption.value;
    }

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('officesShowTitle')}</Header>
            <EssorButton as={Link} to={`/offices/${match.params.id}/edit`} type="edit" size="tiny" floated="right">
              {t('buttonEdit')}
            </EssorButton>

            <EssorButton as={Link} to="/offices" type="chevron left" size="tiny" floated="right">
              {t('buttonBack')}
            </EssorButton>
          </div>

          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form className="margin-top-bot main-form" loading={loadingOffice} size="small">
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formName')}</label>
                      <h5 className="informative-field">{retrievedOffice && retrievedOffice.name}</h5>
                    </Form.Field>
                  </Form.Group>
                </Form>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('officesContactInformation')}</Header>
            <EssorButton as={Link} to={`/offices/${match.params.id}/settings/contact-information`} type="edit" size="tiny" floated="right">
              {t('buttonEdit')}
            </EssorButton>
          </div>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form className="margin-top-bot main-form" loading={loadingOfficeSettings} size="small">
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formStreetName')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (contactInformation.streetName === '' ? '-' : contactInformation.streetName)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formAdditional')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (contactInformation.additional === '' ? '-' : contactInformation.additional)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formZipCode')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (contactInformation.zipCode === '' ? '-' : contactInformation.zipCode)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formCity')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (contactInformation.city === '' ? '-' : contactInformation.city)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formRegion')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (contactInformation.region === '' ? '-' : contactInformation.region)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formCountry')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (contactInformation.country === '' ? '-' : contactInformation.country)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formPhoneNumber')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (contactInformation.phone === '' ? '-' : contactInformation.phone)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formFax')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (contactInformation.fax === '' ? '-' : contactInformation.fax)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formWebsite')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (contactInformation.website === '' ? '-' : contactInformation.website)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                </Form>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('officesCompanyDetails')}</Header>
            <EssorButton as={Link} to={`/offices/${match.params.id}/settings/company-details`} type="edit" size="tiny" floated="right">
              {t('buttonEdit')}
            </EssorButton>
          </div>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form className="margin-top-bot main-form" loading={loadingOfficeSettings} size="small">
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formLegalName')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (companyDetails.legalName === '' ? '-' : companyDetails.legalName)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formCommercialName')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (companyDetails.commercialName === '' ? '-' : companyDetails.commercialName)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formSlogan')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (companyDetails.slogan === '' ? '-' : companyDetails.slogan)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formActivity')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (companyDetails.activity === '' ? '-' : companyDetails.activity)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formShareCapital')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (companyDetails.shareCapital === '' ? '-' : companyDetails.shareCapital)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formNaf')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (companyDetails.naf === '' ? '-' : companyDetails.naf)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formSiret')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (companyDetails.siret === '' ? '-' : companyDetails.siret)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formVat')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (companyDetails.vat === '' ? '-' : companyDetails.vat)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formRcs')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (companyDetails.rcs === '' ? '-' : companyDetails.rcs)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formFiscalYearStart')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (companyDetails.fiscalYearStart === '' ? '-' : companyDetails.fiscalYearStart)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formFiscalYearEnd')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (companyDetails.fiscalYearEnd === '' ? '-' : companyDetails.fiscalYearEnd)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                </Form>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('officesBankAccounts')}</Header>
            <EssorButton as={Link} to={`/offices/${match.params.id}/settings/bank-accounts`} type="edit" size="tiny" floated="right">
              {t('buttonEdit')}
            </EssorButton>
          </div>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form className="margin-top-bot main-form" loading={loadingOfficeSettings} size="small">
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formBankName')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (bankAccounts.bankName === '' ? '-' : bankAccounts.bankName)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formIBAN')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (bankAccounts.IBAN === '' ? '-' : bankAccounts.IBAN)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formBIC')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (bankAccounts.BIC === '' ? '-' : bankAccounts.BIC)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                </Form>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('officesSubscriptionData')}</Header>
            <EssorButton as={Link} to={`/offices/${match.params.id}/settings/subscription-data`} type="edit" size="tiny" floated="right">
              {t('buttonEdit')}
            </EssorButton>
          </div>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form className="margin-top-bot main-form" loading={loadingOfficeSettings} size="small">
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formSubscriptionAmount')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (subscriptionData.subscriptionAmount === '' ? '-' : subscriptionData.subscriptionAmount)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formAccreditationAmount')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (subscriptionData.accreditationAmount === '' ? '-' : subscriptionData.accreditationAmount)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formRenewDate')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (subscriptionData.renewDate === '' ? '-' : moment(subscriptionData.renewDate).format('DD/MM/YYYY'))}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formStartDate')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (subscriptionData.startDate === '' ? '-' : moment(subscriptionData.startDate).format('DD/MM/YYYY'))}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formMembershipLevy')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (subscriptionData.membershipLevy === '' ? '-' : subscriptionData.membershipLevy)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formTimeCreditBase')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (subscriptionData.timeCreditBase === '' ? '-' : subscriptionData.timeCreditBase)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formTimeCreditUsed')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (subscriptionData.timeCreditUsed === '' ? '-' : subscriptionData.timeCreditUsed)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                </Form>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('officesSubscribedOption')}</Header>
            <EssorButton as={Link} to={`/offices/${match.params.id}/settings/subscribed-option`} type="edit" size="tiny" floated="right">
              {t('buttonEdit')}
            </EssorButton>
          </div>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form className="margin-top-bot main-form" loading={loadingOfficeSettings} size="small">
                  <Form.Group inline>
                    <Form.Field>
                      <Form.Checkbox
                        label={t('formSellingSuccess')}
                        checked={retrievedOfficeSettings ? subscribedOption.sellingSuccess : false}
                        readOnly
                      />
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <Form.Checkbox
                        label={t('formManagementSecret')}
                        checked={
                          retrievedOfficeSettings ? subscribedOption.managementSecret : false
                        }
                        readOnly
                      />
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <Form.Checkbox
                        label={t('formLegal')}
                        checked={retrievedOfficeSettings ? subscribedOption.legal : false}
                        readOnly
                      />
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <Form.Checkbox
                        label={t('formManagementSecret2')}
                        checked={
                          retrievedOfficeSettings ? subscribedOption.managementSecret2 : false
                        }
                        readOnly
                      />
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <Form.Checkbox
                        label={t('formTalents')}
                        checked={retrievedOfficeSettings ? subscribedOption.talents : false}
                        readOnly
                      />
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <Form.Checkbox
                        label={t('formWebsitesAndSocial')}
                        checked={
                          retrievedOfficeSettings ? subscribedOption.websitesAndSocial : false
                        }
                        readOnly
                      />
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formRemoteProspecting')}</label>
                      <h5 className="informative-field">
                        {retrievedOfficeSettings && (subscribedOption.remoteProspecting === '' ? '-' : subscribedOption.remoteProspecting)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
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
  getOffice: page => dispatch(retrieveOffice(page)),
  getOfficeSettings: page => dispatch(retrieveOfficeSettings(page)),
  reset: () => {
    dispatch(resetOffice());
    dispatch(resetOfficeSettings());
  },
});

const mapStateToProps = state => ({
  retrievedOffice: state.office.show.retrieved,
  loadingOffice: state.office.show.loading,
  errorOffice: state.office.show.error,

  retrievedOfficeSettings: state.officeSettings.show.retrieved,
  loadingOfficeSettings: state.officeSettings.show.loading,
  errorOfficeSettings: state.officeSettings.show.error,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(ShowOffice);

export default withNamespaces('translation')(withRouter(Main));
