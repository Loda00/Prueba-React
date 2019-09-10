import React, { Component } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { create, error, loading, success } from 'actions/supplier/create';
import { retrieve as retrieveSupplier, update as updateSupplier, reset as resetUpdateSupplier } from 'actions/supplier/update';
import { list as listCompany, reset as resetCompany } from 'actions/company/list';
import { Form, Grid, Message, Header } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class CreateSupplier extends Component {
  state = {
    supplierName: '',
    contactName: '',
    streetName: '',
    zipCode: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    supplyTime: '',
    comment: '',
    alert: '',
    company: null,
    supplierNameError: false,
    contactNameError: false,
    streetNameError: false,
    zipCodeError: false,
    cityError: false,
    phoneError: false,
    emailError: false,
    companyList: null,
    isLoaded: false,
  };

  componentDidMount() {
    const { getCompanies, retrieveSupplier, match, selectedCompany } = this.props;

    if (match.params.id) {
      retrieveSupplier(`/suppliers/${match.params.id}`);
    } else {
      this.setState({
        supplierName: '',
        contactName: '',
        streetName: '',
        zipCode: '',
        city: '',
        phone: '',
        email: '',
        website: '',
        supplyTime: '',
        comment: '',
        alert: '',
      });
    }

    this.setState({
      company: selectedCompany['@id'],
    });

    getCompanies();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.retrieved && !prevState.isLoaded) {
      return {
        supplierName: nextProps.retrieved.supplierName,
        contactName: nextProps.retrieved.contactName,
        streetName: nextProps.retrieved.streetName,
        zipCode: nextProps.retrieved.zipCode,
        city: nextProps.retrieved.city,
        phone: nextProps.retrieved.phone,
        email: nextProps.retrieved.email,
        website: nextProps.retrieved.website,
        supplyTime: nextProps.retrieved.supplyTime,
        comment: nextProps.retrieved.comment,
        alert: nextProps.retrieved.alert,
        isLoaded: true,
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
    e.preventDefault();

    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleOnSubmit = () => {
    const {
      supplierName,
      contactName,
      streetName,
      zipCode,
      city,
      phone,
      email,
      website,
      supplyTime,
      comment,
      alert,
      company,
    } = this.state;
    const { postSupplier, updateSupplier, retrieved } = this.props;
    // eslint-disable-next-line
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let isValid = true;

    this.setState({
      supplierNameError: false,
      contactNameError: false,
      streetNameError: false,
      zipCodeError: false,
      cityError: false,
      phoneError: false,
      emailError: false,
    });

    if (supplierName === '') {
      isValid = false;

      this.setState({
        supplierNameError: true,
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

    if (phone === '') {
      isValid = false;

      this.setState({
        phoneError: true,
      });
    }

    if (email === '' || !regex.test(email)) {
      isValid = false;

      this.setState({
        emailError: true,
      });
    }

    if (!isValid) return;

    const data = {
      supplierName,
      contactName,
      streetName,
      zipCode: parseInt(zipCode, 10),
      city,
      phone,
      email,
      website,
      supplyTime,
      comment,
      alert,
      company,
    };

    retrieved ? updateSupplier(retrieved, data) : postSupplier(data);
  };

  render() {
    const {
      supplierName,
      contactName,
      streetName,
      zipCode,
      city,
      phone,
      email,
      website,
      supplyTime,
      comment,
      alert,
      supplierNameError,
      contactNameError,
      streetNameError,
      zipCodeError,
      cityError,
      phoneError,
      emailError,
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
          to={updated ? `/contacts/suppliers/${updateID}` : `/contacts/suppliers/${success.id}`}
        />
      );
    }

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">
              {updateID ? t('suppliersUpdateTitle') : t('suppliersCreateTitle')}
            </Header>
          </div>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form className="margin-top-bot main-form" loading={loading || retrieveLoading || updateLoading} size="small">
                  <Form.Group inline>
                    <Form.Input
                      label={t('formSupplierName')}
                      name="supplierName"
                      placeholder={t('formPHSupplierName')}
                      value={supplierName}
                      onChange={this.handleInputChange}
                      error={supplierNameError}
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
                      label={t('formEmail')}
                      name="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={this.handleInputChange}
                      error={emailError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formWebsite')}
                      name="website"
                      placeholder="www.example.com"
                      value={website}
                      onChange={this.handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formSupplyTime')}
                      name="supplyTime"
                      placeholder={t('formPHSupplyTime')}
                      value={supplyTime}
                      onChange={this.handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.TextArea
                      label={t('formComments')}
                      name="comment"
                      placeholder={t('formPHComments')}
                      value={comment}
                      onChange={this.handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.TextArea
                      label={t('formAlert')}
                      name="alert"
                      placeholder={t('formPHAlert')}
                      value={alert}
                      onChange={this.handleInputChange}
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
  postSupplier: data => dispatch(create(data)),
  retrieveSupplier: page => dispatch(retrieveSupplier(page)),
  updateSupplier: (item, values) => dispatch(updateSupplier(item, values)),
  getCompanies: () => dispatch(listCompany()),
  reset: () => {
    dispatch(success(null));
    dispatch(loading(false));
    dispatch(error(null));
    dispatch(resetCompany());
    dispatch(resetUpdateSupplier());
  },
});

const mapStateToProps = state => ({
  success: state.supplier.create.created,
  loading: state.supplier.create.loading,
  error: state.supplier.create.error,
  listCompany: state.company.list.data,
  loadingCompany: state.company.list.loading,
  errorCompany: state.company.list.error,

  retrieveError: state.supplier.update.retrieveError,
  retrieveLoading: state.supplier.update.retrieveLoading,
  updateError: state.supplier.update.updateError,
  updateLoading: state.supplier.update.updateLoading,
  retrieved: state.supplier.update.retrieved,
  updated: state.supplier.update.updated,
  selectedCompany: state.userCompanies.select.selectedCompany,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(CreateSupplier);

export default withNamespaces('translation')(withRouter(Main));
