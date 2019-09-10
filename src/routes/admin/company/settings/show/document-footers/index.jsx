import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { retrieve, reset } from 'actions/company-settings/show';
import { Header, Grid, Form } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';
import { isEmpty } from 'lodash';

class DocumentFooters extends Component {
  state = {
    value: null,
  };

  componentDidMount() {
    const { retrieve, selectedCompany } = this.props;

    retrieve(`/company_settings?company=${selectedCompany.id}&name=DOCUMENT_FOOTERS`);
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      !isEmpty(nextProps.retrieved)
      && nextProps.retrieved['hydra:member'][0].value !== prevState.value
      && nextProps.retrieved['hydra:member'][0].name === 'DOCUMENT_FOOTERS'
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
            <Header as="h3">{t('companiesDocumentFooters')}</Header>
            <EssorButton as={Link} to="/company/settings/document-footers/edit" type="edit" size="tiny" floated="right">
              {t('buttonEdit')}
            </EssorButton>
          </div>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form className="margin-top-bot main-form" loading={loading} size="small">
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formQuote')}</label>
                      <h5 className="informative-field">
                        {value && (value.quote === '' ? '-' : value.quote)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formInvoice')}</label>
                      <h5 className="informative-field">
                        {value && (value.invoice === '' ? '-' : value.invoice)}
                      </h5>
                    </Form.Field>
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formDelivery')}</label>
                      <h5 className="informative-field">
                        {value && (value.delivery === '' ? '-' : value.delivery)}
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


const Main = connect(mapStateToProps, mapDispatchToProps)(DocumentFooters);

export default withNamespaces('translation')(withRouter(Main));
