import React, { Component } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { retrieve, update, reset } from 'actions/office-settings/update';
import { Form, Grid, Header } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class CompanyDetails extends Component {
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
      fiscalYearStart: '',
      fiscalYearEnd: '',
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
    fiscalYearStartError: false,
    fiscalYearEndError: false,
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
      && nextProps.retrieved['hydra:member'][1].value !== prevState.value
    ) {
      return {
        value: nextProps.retrieved['hydra:member'][1].value,
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

    update(retrieved['hydra:member'][1], data);
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
      fiscalYearStartError,
      fiscalYearEndError,
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
        fiscalYearStart,
        fiscalYearEnd,
      },
    } = this.state;

    const { retrieveLoading, updated, updateLoading, office, match, t } = this.props;

    if (updated && office && wasUpdate) {
      return (
        <Redirect
          push
          to={{
            pathname: `/offices/${match.params.id}/settings/bank-accounts`,
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
                  {office && `${t('step')} 3 / 6: `}
                  {t('officesCompanyDetails')}
                </Header>
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
                  <Form.Group inline>
                    <Form.Input
                      label={t('formFiscalYearStart')}
                      name="fiscalYearStart"
                      placeholder={t('formPHFiscalYearStart')}
                      value={fiscalYearStart}
                      onChange={this.handleInputChange}
                      error={fiscalYearStartError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formFiscalYearEnd')}
                      name="fiscalYearEnd"
                      placeholder={t('formPHFiscalYearEnd')}
                      value={fiscalYearEnd}
                      onChange={this.handleInputChange}
                      error={fiscalYearEndError}
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

const Main = connect(mapStateToProps, mapDispatchToProps)(CompanyDetails);

export default withNamespaces('translation')(withRouter(Main));
