import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import { create, error, loading, success } from 'actions/customer/create';
import { Form, Modal } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class CalculateMode extends Component {
  state = {
    companyName: '',
    contactName: '',
    streetName: '',
    additional: '',
    zipCode: '',
    city: '',
    country: '',

    streetNameError: false,
    zipCodeError: false,
    cityError: false,
    countryError: false,
    companyNameError: false,
    contactNameError: false,
  };

  componentDidUpdate(prevProps) {
    const { successCustomer, onSuccess } = this.props;

    if (prevProps.successCustomer !== successCustomer) {
      onSuccess(successCustomer);
      this.closeModal();
    }
  }

  componentWillUnmount() {
    const { reset } = this.props;

    reset();
  }

  closeModal = () => {
    const { onClose } = this.props;

    this.setState({
      companyName: '',
      contactName: '',
      companyNameError: false,
      contactNameError: false,
    });

    onClose();
  };

  handleInputChange = (e) => {
    e.preventDefault();

    const { name, value } = e.target;

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
      zipCode,
      city,
      country,
    } = this.state;

    const {
      postCustomer,
      selectedCompany,
    } = this.props;

    let isValid = true;

    this.setState({
      companyNameError: false,
      contactNameError: false,
      streetNameError: false,
      zipCodeError: false,
      cityError: false,
      countryError: false,
    });

    if (companyName === '') {
      isValid = false;

      this.setState({
        companyNameError: true,
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

    if (zipCode === '') {
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

    if (country === '') {
      isValid = false;

      this.setState({
        countryError: true,
      });
    }

    if (!isValid) return;

    const data = {
      company: selectedCompany['@id'],
      companyName,
      contactName,
      creationDate: moment().format(),
      details: {
        streetName,
        additional,
        zipCode,
        city,
        country,
      },
    };

    postCustomer(data);
  };


  render() {
    const {
      companyName,
      contactName,
      streetName,
      additional,
      zipCode,
      city,
      country,
      companyNameError,
      contactNameError,
      streetNameError,
      zipCodeError,
      cityError,
      countryError,
    } = this.state;

    const {
      modalOpen,
      loadingCreateCustomer,
      t,
    } = this.props;

    return (
      <Modal
        open={modalOpen}
        closeOnEscape={false}
        closeOnDimmerClick={false}
      >
        <Modal.Header>{t('recipientCreateTitle')}</Modal.Header>
        <Modal.Content scrolling>
          <Modal.Description>
            <Form className="margin-top-bot main-form" loading={loadingCreateCustomer} size="small">
              <Form.Group inline>
                <Form.Input
                  label={t('formCompanyName')}
                  name="companyName"
                  placeholder={t('formPHCompanyName')}
                  onChange={this.handleInputChange}
                  value={companyName}
                  error={companyNameError}
                />
              </Form.Group>

              <Form.Group inline>
                <Form.Input
                  label={t('formContactName')}
                  name="contactName"
                  placeholder={t('formPHContactName')}
                  onChange={this.handleInputChange}
                  value={contactName}
                  error={contactNameError}
                />
              </Form.Group>

              <Form.Group inline>
                <Form.Input
                  label={t('formStreetName')}
                  name="streetName"
                  placeholder={t('formPHStreetName')}
                  onChange={this.handleInputChange}
                  value={streetName}
                  error={streetNameError}
                />
              </Form.Group>

              <Form.Group inline>
                <Form.Input
                  label={t('formAdditional')}
                  name="additional"
                  placeholder={t('formPHAdditional')}
                  onChange={this.handleInputChange}
                  value={additional}
                />
              </Form.Group>

              <Form.Group inline>
                <Form.Input
                  label={t('formZipCode')}
                  name="zipCode"
                  placeholder={t('formPHZipCode')}
                  onChange={this.handleInputChange}
                  value={zipCode}
                  error={zipCodeError}
                />
              </Form.Group>

              <Form.Group inline>
                <Form.Input
                  label={t('formCity')}
                  name="city"
                  placeholder={t('formPHCity')}
                  onChange={this.handleInputChange}
                  value={city}
                  error={cityError}
                />
              </Form.Group>

              <Form.Group inline>
                <Form.Input
                  label={t('formCountry')}
                  name="country"
                  placeholder={t('formPHCountry')}
                  onChange={this.handleInputChange}
                  value={country}
                  error={countryError}
                />
              </Form.Group>
            </Form>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <div>
            <EssorButton type="check" onClick={this.handleOnSubmit} size="small" disabled={loadingCreateCustomer}>
              {t('buttonSave')}
            </EssorButton>
            <EssorButton secondary type="x" size="small" onClick={this.closeModal} disabled={loadingCreateCustomer}>
              {t('buttonCancel')}
            </EssorButton>
          </div>
        </Modal.Actions>
      </Modal>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  postCustomer: data => dispatch(create(data)),
  reset: () => {
    dispatch(error(null));
    dispatch(loading(false));
    dispatch(success(null));
  },

});


const mapStateToProps = state => ({
  successCustomer: state.customer.create.created,
  loadingCreateCustomer: state.customer.create.loading,
  errorCreateCustomer: state.customer.create.error,

  selectedCompany: state.userCompanies.select.selectedCompany,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(CalculateMode);

export default withNamespaces('translation')(withRouter(Main));
