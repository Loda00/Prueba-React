import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { retrieve, reset } from 'actions/company-settings/show';
import { Header, Grid, Form } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';
import { isEmpty } from 'lodash';

class CompanyDetails extends Component {
  state = {
    value: null,
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
    if (
      !isEmpty(nextProps.retrieved)
      && nextProps.retrieved['hydra:member'][0].value !== prevState.value
      && nextProps.retrieved['hydra:member'][0].name === 'COMPANY_DETAILS'
    ) {
      return {
        value: nextProps.retrieved['hydra:member'][0].value,
      };
    }

    return null;
  }

  render() {
    const { value } = this.state;

    const { loading, t } = this.props;

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('companiesCompanyDetails')}</Header>
            <EssorButton as={Link} to="/company/settings/company-details/edit" type="edit" size="tiny" floated="right">
              {t('buttonEdit')}
            </EssorButton>
          </div>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form className="margin-top-bot main-form" loading={loading} size="small">
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formLegalName')}</label>
                      <h5 className="informative-field">
                        {value && (value.legalName === '' ? '-' : value.legalName)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formCommercialName')}</label>
                      <h5 className="informative-field">
                        {value && (value.commercialName === '' ? '-' : value.commercialName)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formSlogan')}</label>
                      <h5 className="informative-field">
                        {value && (value.slogan === '' ? '-' : value.slogan)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formActivity')}</label>
                      <h5 className="informative-field">
                        {value && (value.activity === '' ? '-' : value.activity)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formShareCapital')}</label>
                      <h5 className="informative-field">
                        {value && (value.shareCapital === '' ? '-' : value.shareCapital)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formNaf')}</label>
                      <h5 className="informative-field">
                        {value && (value.naf === '' ? '-' : value.naf)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formSiret')}</label>
                      <h5 className="informative-field">
                        {value && (value.siret === '' ? '-' : value.siret)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formVat')}</label>
                      <h5 className="informative-field">
                        {value && (value.vat === '' ? '-' : value.vat)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formRcs')}</label>
                      <h5 className="informative-field">
                        {value && (value.rcs === '' ? '-' : value.rcs)}
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
  retrieve: id => dispatch(retrieve(id)),
  reset: () => {
    dispatch(reset());
  },
});

const mapStateToProps = state => ({
  error: state.companySettings.show.error,
  loading: state.companySettings.show.loading,
  retrieved: state.companySettings.show.retrieved,
  selectedCompany: state.userCompanies.select.selectedCompany,
});


const Main = connect(mapStateToProps, mapDispatchToProps)(CompanyDetails);

export default withNamespaces('translation')(withRouter(Main));
