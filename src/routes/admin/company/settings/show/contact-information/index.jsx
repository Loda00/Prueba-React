import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { retrieve, reset } from 'actions/company-settings/show';
import { Header, Grid, Form } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';
import { isEmpty } from 'lodash';

class ContactInformation extends Component {
  state = {
    value: null,
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
    if (
      !isEmpty(nextProps.retrieved)
      && nextProps.retrieved['hydra:member'][0].value !== prevState.value
      && nextProps.retrieved['hydra:member'][0].name === 'CONTACT_INFORMATION'
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
            <Header as="h3">{t('companiesContactInformation')}</Header>
            <EssorButton as={Link} to="/company/settings/contact-information/edit" type="edit" size="tiny" floated="right">
              {t('buttonEdit')}
            </EssorButton>
          </div>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form className="margin-top-bot main-form" loading={loading} size="small">
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formStreetName')}</label>
                      <h5 className="informative-field">
                        {value && (value.streetName === '' ? '-' : value.streetName)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formAdditional')}</label>
                      <h5 className="informative-field">
                        {value && (value.additional === '' ? '-' : value.additional)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formZipCode')}</label>
                      <h5 className="informative-field">
                        {value && (value.zipCode === '' ? '-' : value.zipCode)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formCity')}</label>
                      <h5 className="informative-field">
                        {value && (value.city === '' ? '-' : value.city)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formRegion')}</label>
                      <h5 className="informative-field">
                        {value && (value.region === '' ? '-' : value.region)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formCountry')}</label>
                      <h5 className="informative-field">
                        {value && (value.country === '' ? '-' : value.country)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formPhoneNumber')}</label>
                      <h5 className="informative-field">
                        {value && (value.phone === '' ? '-' : value.phone)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formFax')}</label>
                      <h5 className="informative-field">
                        {value && (value.fax === '' ? '-' : value.fax)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formWebsite')}</label>
                      <h5 className="informative-field">
                        {value && (value.website === '' ? '-' : value.website)}
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


const Main = connect(mapStateToProps, mapDispatchToProps)(ContactInformation);

export default withNamespaces('translation')(withRouter(Main));
