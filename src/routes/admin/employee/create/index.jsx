import React, { Component } from 'react';
import { Link, Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import moment from 'moment';
import { create as createEmployee, success as successEmployee, error as errorEmployee, loading as loadingEmployee } from 'actions/employee/create';
import { retrieve as retrieveEmployee, update as updateEmployee, reset as resetUpdateEmployee } from 'actions/employee/update';
import { Form, Grid, Message, Header } from 'semantic-ui-react';
import { EssorButton } from 'components';
import DatePicker from 'react-datepicker';
import { withNamespaces } from 'react-i18next';

import 'moment/locale/fr';

moment.locale('fr');

class CreateEmployee extends Component {
  state = {
    id: '',
    company: null,
    lastName: '',
    firstName: '',
    inDate: null,
    outDate: null,
    username: '',
    password: '',
    address: '',
    zipCode: '',
    city: '',
    region: '',
    country: '',
    contractType: '',
    jobTitle: '',
    gender: '',
    birthday: null,
    companyError: false,
    lastNameError: false,
    firstNameError: false,
    inDateError: false,
    outDateError: false,
    usernameError: false,
    passwordError: false,
    addressError: false,
    zipCodeError: false,
    cityError: false,
    regionError: false,
    countryError: false,
    contractTypeError: false,
    jobTitleError: false,
    genderError: false,
    birthdayError: false,
    companyList: null,
    createIdentity: false,
  };

  componentDidMount() {
    const { retrieveEmployee, match } = this.props;

    if (match.params.id) {
      retrieveEmployee(`/employees/${match.params.id}`);
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.retrieved) && nextProps.retrieved.id !== prevState.id) {
      const {
        id,
        company,
        lastName,
        firstName,
        inDate,
        outDate,
        username,
        password,
        details,
      } = nextProps.retrieved;

      return {
        id,
        company,
        lastName,
        firstName,
        inDate: moment(inDate),
        outDate: outDate ? moment(outDate) : null,
        username,
        password,
        address: details.address,
        zipCode: details.zipCode,
        city: details.city,
        region: details.region,
        country: details.country,
        contractType: details.contractType,
        jobTitle: details.jobTitle,
        gender: details.gender,
        birthday: moment(details.birthday),
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

    if (e.target.name === 'lastName') {
      this.setState({
        [e.target.name]: (e.target.value).toUpperCase(),
      });
    } else {
      this.setState({
        [e.target.name]: e.target.value,
      });
    }
  };

  handleCheckBoxChange= (e, value) => {
    e.preventDefault();

    const { name } = value;

    this.setState(prevState => (
      {
        [name]: !prevState[name],
      }
    ));
  };

  handleOnSubmit = () => {
    const {
      company,
      lastName,
      firstName,
      inDate,
      outDate,
      createIdentity,
      username,
      password,
      address,
      zipCode,
      city,
      region,
      country,
      contractType,
      jobTitle,
      gender,
      birthday,
    } = this.state;
    const { postEmployee, updateEmployee, selectedCompany, retrieved } = this.props;
    // eslint-disable-next-line
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let isValid = true;

    this.setState({
      lastNameError: false,
      firstNameError: false,
      inDateError: false,
      outDateError: false,
      usernameError: false,
      passwordError: false,
      addressError: false,
      zipCodeError: false,
      cityError: false,
      regionError: false,
      countryError: false,
      contractTypeError: false,
      jobTitleError: false,
      genderError: false,
      birthdayError: false,
    });

    if (lastName === '') {
      isValid = false;

      this.setState({
        lastNameError: true,
      });
    }

    if (firstName === '') {
      isValid = false;

      this.setState({
        firstNameError: true,
      });
    }

    if (!inDate) {
      isValid = false;

      this.setState({
        inDateError: true,
      });
    }

    if (createIdentity) {
      if (username === '' || !regex.test(username)) {
        isValid = false;

        this.setState({
          usernameError: true,
        });
      }

      if (password === '') {
        isValid = false;

        this.setState({
          passwordError: true,
        });
      }
    }

    if (address === '') {
      isValid = false;

      this.setState({
        addressError: true,
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

    if (region === '') {
      isValid = false;

      this.setState({
        regionError: true,
      });
    }

    if (country === '') {
      isValid = false;

      this.setState({
        countryError: true,
      });
    }

    if (contractType === '') {
      isValid = false;

      this.setState({
        contractTypeError: true,
      });
    }

    if (jobTitle === '') {
      isValid = false;

      this.setState({
        jobTitleError: true,
      });
    }

    if (gender === '') {
      isValid = false;

      this.setState({
        genderError: true,
      });
    }

    if (!birthday) {
      isValid = false;

      this.setState({
        birthdayError: true,
      });
    }

    if (!isValid) return;

    const data = {
      company: company || selectedCompany['@id'],
      lastName,
      firstName,
      inDate: inDate.format(),
      details: {
        address,
        zipCode,
        city,
        region,
        country,
        contractType,
        jobTitle,
        gender,
        birthday,
      },
    };

    data.outDate = outDate ? outDate.format() : null;

    if (createIdentity) {
      data.identity = {
        username, password,
      };
    }

    retrieved ? updateEmployee(retrieved, data) : postEmployee(data);
  };

  handleSelectChange = (e, obj) => {
    e.preventDefault();

    this.setState({
      [obj.name]: obj.value,
    });
  };

  handleInDateChange = (date) => {
    this.setState({
      inDate: date,
    });
  };

  handleOutDateChange = (date) => {
    this.setState({
      outDate: date,
    });
  };

  handleBirthdayChange = (date) => {
    this.setState({
      birthday: date,
    });
  };

  render() {
    const {
      lastName,
      firstName,
      inDate,
      outDate,
      username,
      password,
      address,
      zipCode,
      city,
      region,
      country,
      contractType,
      jobTitle,
      gender,
      birthday,
      lastNameError,
      firstNameError,
      inDateError,
      outDateError,
      usernameError,
      passwordError,
      addressError,
      zipCodeError,
      cityError,
      regionError,
      countryError,
      contractTypeError,
      jobTitleError,
      genderError,
      birthdayError,
      createIdentity,
    } = this.state;

    const {
      loadingEmployee,
      errorEmployee,
      successEmployee,
      t,
      updated,
      retrieveLoading,
      updateLoading,
      match,
    } = this.props;

    const updateID = match.params.id;

    const genderOptions = [
      {
        key: 'm', text: t('employeesFormMale'), value: 'male',
      },
      {
        key: 'f', text: t('employeesFormFemale'), value: 'female',
      },
    ];

    const contractTypeOptions = [
      {
        key: 'c', text: 'CDI', value: 'cdi',
      },
      {
        key: 'd', text: 'CDD', value: 'cdd',
      },
      {
        key: 'i', text: 'Internship', value: 'internship',
      },
    ];

    if (updated || successEmployee) {
      return (
        <Redirect
          push
          to={{
            pathname: updated ? `/employees/${updateID}` : `/employees/${successEmployee.id}`,
          }}
        />
      );
    }

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">
              {updateID ? t('employeesUpdate') : t('employeeCreate')}
            </Header>
            <EssorButton
              as={Link}
              to={updateID ? `/employees/${updateID}` : '/employees/'}
              type="chevron left"
              size="tiny"
              floated="right"
            >
              {t('buttonBack')}
            </EssorButton>
          </div>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form className="margin-top-bot main-form" loading={loadingEmployee || retrieveLoading || updateLoading} size="small">
                  <Form.Group inline>
                    <Form.Input
                      label={t('formLastName')}
                      name="lastName"
                      placeholder={t('formPHLastName')}
                      value={lastName}
                      onChange={this.handleInputChange}
                      error={lastNameError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formFirstName')}
                      name="firstName"
                      placeholder={t('formPHFirstName')}
                      value={firstName}
                      onChange={this.handleInputChange}
                      error={firstNameError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formInDate')}
                      name="inDate"
                      control={DatePicker}
                      selected={inDate}
                      onChange={this.handleInDateChange}
                      locale="fr"
                      error={inDateError}
                      autoComplete="off"
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formOutDate')}
                      name="outDate"
                      control={DatePicker}
                      isClearable
                      selected={outDate}
                      onChange={this.handleOutDateChange}
                      locale="fr"
                      error={outDateError}
                      autoComplete="off"
                    />
                  </Form.Group>

                  {!updateID
                    && (
                    <div>
                      <Form.Group inline>
                        <Form.Checkbox
                          label={t('formCreateIdentity')}
                          name="createIdentity"
                          checked={createIdentity}
                          onChange={this.handleCheckBoxChange}
                        />
                      </Form.Group>
                      <div className="well">
                        <Form.Group inline>
                          <Form.Input
                            label={t('formEmail')}
                            name="username"
                            placeholder="example@email.com"
                            value={username}
                            onChange={this.handleInputChange}
                            error={usernameError}
                            disabled={!createIdentity}
                            autoComplete="off"
                          />
                        </Form.Group>

                        <Form.Group inline>
                          <Form.Input
                            label={t('formPassword')}
                            name="password"
                            type="password"
                            value={password}
                            onChange={this.handleInputChange}
                            error={passwordError}
                            disabled={!createIdentity}
                            autoComplete="off"
                          />
                        </Form.Group>
                      </div>
                    </div>
                    )
                  }

                  <Form.Group inline>
                    <Form.Input
                      label={t('formAddress')}
                      name="address"
                      placeholder={t('formPHAddress')}
                      value={address}
                      onChange={this.handleInputChange}
                      error={addressError}
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
                      label={t('formRegion')}
                      name="region"
                      placeholder={t('formPHRegion')}
                      value={region}
                      onChange={this.handleInputChange}
                      error={regionError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formCountry')}
                      name="country"
                      placeholder={t('formPHCountry')}
                      value={country}
                      onChange={this.handleInputChange}
                      error={countryError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Select
                      label={t('formContractType')}
                      name="contractType"
                      placeholder={t('formPHSelect')}
                      value={contractType}
                      options={contractTypeOptions}
                      onChange={this.handleSelectChange}
                      error={contractTypeError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formJobTitle')}
                      name="jobTitle"
                      placeholder={t('formPHJobTitle')}
                      value={jobTitle}
                      onChange={this.handleInputChange}
                      error={jobTitleError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Select
                      label={t('formGender')}
                      name="gender"
                      placeholder={t('formPHSelect')}
                      value={gender}
                      options={genderOptions}
                      onChange={this.handleSelectChange}
                      error={genderError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formBirthday')}
                      name="birthday"
                      control={DatePicker}
                      selected={birthday}
                      onChange={this.handleBirthdayChange}
                      locale="fr"
                      error={birthdayError}
                      autoComplete="off"
                    />
                  </Form.Group>

                  <EssorButton type="check" submit onClick={this.handleOnSubmit} size="small">
                    {t('buttonSave')}
                  </EssorButton>

                </Form>

                {errorEmployee
                && (
                  <Message negative>
                    <p>{errorEmployee}</p>
                  </Message>
                )}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  postEmployee: data => dispatch(createEmployee(data)),
  retrieveEmployee: data => dispatch(retrieveEmployee(data)),
  updateEmployee: (item, data) => dispatch(updateEmployee(item, data)),
  reset: () => {
    dispatch(resetUpdateEmployee());
    dispatch(loadingEmployee(false));
    dispatch(errorEmployee(null));
    dispatch(successEmployee(null));
  },
});

const mapStateToProps = state => ({
  successEmployee: state.employee.create.created,
  loadingEmployee: state.employee.create.loading,
  errorEmployee: state.employee.create.error,
  retrieveError: state.employee.update.retrieveError,
  retrieveLoading: state.employee.update.retrieveLoading,
  updateError: state.employee.update.updateError,
  updateLoading: state.employee.update.updateLoading,
  retrieved: state.employee.update.retrieved,
  updated: state.employee.update.updated,

  selectedCompany: state.userCompanies.select.selectedCompany,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(CreateEmployee);

export default withNamespaces('translation')(withRouter(Main));
