import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { retrieve, update, reset } from 'actions/company-settings/update';
import { Form, Header, Grid, Message } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class DocumentFooters extends Component {
  state = {
    value: {
      quote: '',
      invoice: '',
      delivery: '',
    },

    quoteError: false,
    invoiceError: false,
    deliveryError: false,
    isSettingsLoaded: false,
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
    if (nextProps.retrieved && nextProps.retrieved['hydra:member'][0].name === 'DOCUMENT_FOOTERS' && !prevState.isSettingsLoaded) {
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

    update(retrieved['hydra:member'][0], data);
  };

  render() {
    const {
      quoteError,
      invoiceError,
      deliveryError,
      value: {
        quote,
        invoice,
        delivery,
      },
    } = this.state;

    const { retrieveLoading, updateLoading, updateError, t } = this.props;

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('companiesDocumentFooters')}</Header>
            <EssorButton as={Link} to="/company/settings/document-footers" type="chevron left" size="tiny" floated="right">
              {t('buttonBack')}
            </EssorButton>
          </div>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form className="margin-top-bot main-form" loading={retrieveLoading || updateLoading} size="small">
                  <Form.Group inline>
                    <Form.Input
                      label={t('formQuote')}
                      name="quote"
                      placeholder={t('formPHQuote')}
                      value={quote}
                      onChange={this.handleInputChange}
                      error={quoteError}
                    />
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Input
                      label={t('formInvoice')}
                      name="invoice"
                      placeholder={t('formPHInvoice')}
                      value={invoice}
                      onChange={this.handleInputChange}
                      error={invoiceError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formDelivery')}
                      name="delivery"
                      placeholder={t('formPHDelivery')}
                      value={delivery}
                      onChange={this.handleInputChange}
                      error={deliveryError}
                    />
                  </Form.Group>

                  <EssorButton type="check" submit onClick={this.handleOnSubmit} size="small">
                    {t('buttonSave')}
                  </EssorButton>

                  {updateError
                    && (
                      <Message negative>
                        <p>{updateError}</p>
                      </Message>
                    )
                  }
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


const Main = connect(mapStateToProps, mapDispatchToProps)(DocumentFooters);

export default withNamespaces('translation')(withRouter(Main));
