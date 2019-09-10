import React, { Component } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { create, error, loading, success } from 'actions/customer/create';
import { retrieve as retrieveCustomer, update as updateCustomer, reset as resetUpdatecustomer } from 'actions/customer/update';
import { list as listCompany, reset as resetCompany } from 'actions/company/list';
import { Form, Grid, Message, Header } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class CreateRecipients extends Component {
  state = {
    companyName: '',
    contactName: '',
    streetName: '',
    zipCode: '',
    additional: '',
    city: '',
    country: '',
    company: null,
    customerNameError: false,
    contactNameError: false,
    streetNameError: false,
    zipCodeError: false,
    cityError: false,
    companyList: null,
    id: null,
  };

  componentDidMount() {
    const { retrieveCustomer, match, selectedCompany } = this.props;

    if (match.params.id) {
      retrieveCustomer(`/customers/${match.params.id}`);
    } else {
      this.setState({
        companyName: '',
        contactName: '',
        streetName: '',
        additional: '',
        zipCode: '',
        city: '',
        country: '',
      });
    }

    this.setState({
      company: selectedCompany['@id'],
    });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.retrieved && prevState.id !== nextProps.retrieved.id) {
      // eslint-disable-next-line no-console
      console.log('getDerived', prevState, nextProps);
      return {
        companyName: nextProps.retrieved.companyName,
        contactName: nextProps.retrieved.contactName,
        streetName: nextProps.retrieved.details.streetName,
        additional: nextProps.retrieved.details.additional,
        zipCode: nextProps.retrieved.details.zipCode,
        city: nextProps.retrieved.details.city,
        country: nextProps.retrieved.details.country,
        id: nextProps.retrieved.id,
      };
    }

    if (nextProps.listCompany && nextProps.listCompany['hydra:member'] !== prevState.companyList) {
      return {
        companyList: nextProps.listCompany['hydra:member'],
      };
    }
    return null;
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  handleInputChange = (e) => {
    const { name, value } = e.target;
    e.preventDefault();
    this.setState({
      [name]: value,
    });
  };

  handleOnSubmit = () => {
    const {
      companyName,
      contactName,
      streetName,
      additional,
      country,
      zipCode,
      city,
      company,
    } = this.state;
    const { postCustomer, updateCustomer, retrieved } = this.props;

    let isValid = true;
    let creationDate = null;

    this.setState({
      customerNameError: false,
      contactNameError: false,
      streetNameError: false,
      zipCodeError: false,
      cityError: false,
    });

    if (company === '') {
      isValid = false;

      this.setState({
        customerNameError: true,
      });
    }

    if (additional === '') {
      isValid = false;

      this.setState({
        customerNameError: true,
      });
    }

    if (country === '') {
      isValid = false;

      this.setState({
        customerNameError: true,
      });
    }

    if (companyName === '') {
      isValid = false;

      this.setState({
        customerNameError: true,
      });
    }

    if (contactName === '') {
      isValid = false;

      this.setState({
        contactNameError: true,
      });
    }

    if (streetName === '') {
      isValid = false;

      this.setState({
        streetNameError: true,
      });
    }

    if (zipCode === '' || !Number.isInteger(parseFloat(zipCode))) {
      isValid = false;

      this.setState({
        zipCodeError: true,
      });
    }

    if (city === '') {
      isValid = false;

      this.setState({
        cityError: true,
      });
    }

    if (!isValid) return;

    const data = {
      company,
      companyName,
      contactName,
      details: {
        streetName,
        additional,
        country,
        zipCode: parseInt(zipCode, 10),
        city,
      },
    };

    if (retrieved) {
      updateCustomer(retrieved, data);
    } else {
      // eslint-disable-next-line prefer-destructuring
      creationDate = new Date().toISOString().split('T')[0];
      data.creationDate = creationDate;
      postCustomer(data);
    }
  };

  render() {
    const {
      companyName,
      contactName,
      streetName,
      additional,
      country,
      zipCode,
      city,
      customerNameError,
      contactNameError,
      streetNameError,
      zipCodeError,
      cityError,
    } = this.state;

    const {
      loading,
      error,
      success,
      retrieveLoading,
      updateLoading,
      updateError,
      updated,
      match,
      t,
    } = this.props;

    const updateID = match.params.id;

    if (success || updated) {
      return (
        <Redirect
          push
          to={updated ? `/contacts/recipients/${updateID}` : `/contacts/recipients/${success.id}`}
        />
      );
    }

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">
              {updateID ? t('customerUpdateTitle') : t('customerCreateTitle')}
            </Header>
          </div>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form className="margin-top-bot main-form" loading={loading || retrieveLoading || updateLoading} size="small">

                  <Form.Group inline>
                    <Form.Input
                      label={t('formCompanyName')}
                      name="companyName"
                      placeholder={t('formCompanyName')}
                      value={companyName}
                      onChange={this.handleInputChange}
                      error={customerNameError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formContactName')}
                      name="contactName"
                      placeholder={t('formPHContactName')}
                      value={contactName}
                      onChange={this.handleInputChange}
                      error={contactNameError}
                    />
                  </Form.Group>

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
                      label={t('formNewSupplierAdditional')}
                      name="additional"
                      placeholder={t('formPHStreetName')}
                      value={additional}
                      onChange={this.handleInputChange}
                      error={streetNameError}
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
                      label={t('formNewSUpplierCountry')}
                      name="country"
                      placeholder={t('formPHZipCode')}
                      value={country}
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

                  {error
                    && (
                      <Message negative>
                        <p>{error}</p>
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
  postCustomer: data => dispatch(create(data)),
  retrieveCustomer: page => dispatch(retrieveCustomer(page)),
  updateCustomer: (item, values) => dispatch(updateCustomer(item, values)),
  getCompanies: () => dispatch(listCompany()),
  reset: () => {
    dispatch(success(null));
    dispatch(loading(false));
    dispatch(error(null));
    dispatch(resetCompany());
    dispatch(resetUpdatecustomer());
  },
});

const mapStateToProps = state => ({
  success: state.customer.create.created,
  loading: state.customer.create.loading,
  error: state.customer.create.error,
  listCompany: state.company.list.data,
  loadingCompany: state.company.list.loading,
  errorCompany: state.company.list.error,

  retrieveError: state.customer.update.retrieveError,
  retrieveLoading: state.customer.update.retrieveLoading,
  updateError: state.customer.update.updateError,
  updateLoading: state.customer.update.updateLoading,
  retrieved: state.customer.update.retrieved,
  updated: state.customer.update.updated,
  selectedCompany: state.userCompanies.select.selectedCompany,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(CreateRecipients);

export default withNamespaces('translation')(withRouter(Main));
