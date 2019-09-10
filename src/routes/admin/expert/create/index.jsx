import React, { Component } from 'react';
import { Link, Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import { create as createExpert, error as errorExpert, loading as loadingExpert, success } from 'actions/expert/create';
import { retrieve as retrieveExpert, update as updateExpert, reset as resetUpdateExpert } from 'actions/expert/update';
import { list as listOffice, reset as resetOffice } from 'actions/office/list';
import { Form, Dropdown, Grid, Message, Header } from 'semantic-ui-react';
import { EssorButton } from 'components';
import DatePicker from 'react-datepicker';
import { withNamespaces } from 'react-i18next';

import 'moment/locale/fr';

moment.locale('fr');

class CreateExpert extends Component {
  state = {
    firstName: '',
    lastName: '',
    birthday: null,
    jobTitle: '',
    phoneNumber: '',
    username: '',
    password: '',
    office: null,
    officesList: null,
    firstNameError: false,
    lastNameError: false,
    jobTitleError: false,
    phoneNumberError: false,
    usernameError: false,
    passwordError: false,
    officeError: false,
    isLoaded: false,
  };

  componentDidMount() {
    const { getOffices, retrieveExpert, match } = this.props;

    if (match.params.id) {
      retrieveExpert(`/experts/${match.params.id}`);
    }
    getOffices();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.retrieved && !prevState.isLoaded) {
      return {
        firstName: nextProps.retrieved.firstName,
        lastName: nextProps.retrieved.lastName,
        birthday: moment(nextProps.retrieved.birthday),
        jobTitle: nextProps.retrieved.jobTitle,
        phoneNumber: nextProps.retrieved.phoneNumber,
        isLoaded: true,
      };
    }

    if (nextProps.listOffice && nextProps.listOffice['hydra:member'] !== prevState.officesList) {
      return {
        officesList: nextProps.listOffice['hydra:member'],
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

  handleBirthdayChange = (date) => {
    this.setState({
      birthday: date,
    });
  };

  handleOfficeChange = (e, { value }) => {
    this.setState({
      office: value,
    });
  };

  handleOnSubmit = () => {
    const {
      firstName,
      lastName,
      birthday,
      jobTitle,
      phoneNumber,
      username,
      password,
      office,
    } = this.state;
    const { postExpert, updateExpert, retrieved } = this.props;
    // eslint-disable-next-line
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let isValid = true;

    this.setState({
      firstNameError: false,
      lastNameError: false,
      jobTitleError: false,
      phoneNumberError: false,
      usernameError: false,
      passwordError: false,
      officeError: false,
    });

    if (firstName === '') {
      isValid = false;

      this.setState({
        firstNameError: true,
      });
    }

    if (lastName === '') {
      isValid = false;

      this.setState({
        lastNameError: true,
      });
    }

    if (jobTitle === '') {
      isValid = false;

      this.setState({
        jobTitleError: true,
      });
    }

    if (phoneNumber === '') {
      isValid = false;

      this.setState({
        phoneNumberError: true,
      });
    }

    if (!retrieved) {
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

      if (office === null) {
        isValid = false;

        this.setState({
          officeError: true,
        });
      }
    }

    if (!isValid) return;

    const data = {
      firstName,
      lastName,
      jobTitle,
      phoneNumber,
    };

    if (!retrieved) {
      data.identity = {
        username,
        password,
      };
      data.office = office;
    }

    if (birthday) data.birthday = birthday.format();

    retrieved ? updateExpert(retrieved, data) : postExpert(data);
  };

  render() {
    const {
      officesList,
      firstName,
      lastName,
      birthday,
      jobTitle,
      phoneNumber,
      username,
      password,
      office,
      firstNameError,
      lastNameError,
      jobTitleError,
      phoneNumberError,
      usernameError,
      passwordError,
      officeError,
    } = this.state;

    const {
      loadingExpert,
      errorExpert,
      successExpert,
      loadingOffice,
      retrieveLoading,
      updateLoading,
      updateError,
      updated,
      match,
      t,
    } = this.props;

    const updateID = match.params.id;
    let offices = [];

    if (officesList && officesList.length > 0) {
      offices = officesList.map((office, index) => ({
        key: index,
        text: office.name,
        value: office['@id'],
      }));
    }

    if (successExpert || updated) {
      return (
        <Redirect
          push
          to={updated ? `/experts/${updateID}` : `/experts/${successExpert.id}`}
        />
      );
    }

    return (
      <div className="section-container no-margin">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">
              {updateID ? t('expertsUpdateTitle') : t('expertsCreateTitle')}
            </Header>
            <EssorButton
              as={Link}
              to={updateID ? `/experts/${updateID}` : '/experts/'}
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
                <Form className="margin-top-bot main-form" loading={loadingExpert || retrieveLoading || updateLoading} size="small">
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
                      label={t('formBirthday')}
                      name="birthday"
                      control={DatePicker}
                      selected={birthday}
                      onChange={this.handleBirthdayChange}
                      locale="fr"
                      autoComplete="off"
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
                    <Form.Input
                      label={t('formPhoneNumber')}
                      name="phoneNumber"
                      placeholder={t('formPHPhoneNumber')}
                      value={phoneNumber}
                      onChange={this.handleInputChange}
                      error={phoneNumberError}
                    />
                  </Form.Group>

                  {!updateID
                    && (
                      <React.Fragment>
                        <Form.Group inline>
                          <Form.Input
                            label={t('formEmail')}
                            name="username"
                            placeholder="example@email.com"
                            value={username}
                            onChange={this.handleInputChange}
                            error={usernameError}
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
                          />
                        </Form.Group>

                        <Form.Group inline>
                          <Form.Select
                            label={t('formOffice')}
                            control={Dropdown}
                            placeholder={t('formPHOffice')}
                            fluid
                            search
                            selection
                            loading={loadingOffice}
                            noResultsMessage="No results"
                            options={offices}
                            onChange={this.handleOfficeChange}
                            error={officeError}
                            value={office}
                          />
                        </Form.Group>
                      </React.Fragment>
                    )
                  }

                  <EssorButton submit type="check" onClick={this.handleOnSubmit} size="small">
                    {t('buttonSave')}
                  </EssorButton>

                  {updateError
                    && (
                      <Message negative>
                        <p>{updateError}</p>
                      </Message>
                    )
                  }

                  {errorExpert
                    && (
                    <Message negative>
                      <p>{errorExpert}</p>
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
  postExpert: data => dispatch(createExpert(data)),
  retrieveExpert: page => dispatch(retrieveExpert(page)),
  updateExpert: (item, values) => dispatch(updateExpert(item, values)),
  getOffices: () => dispatch(listOffice()),
  reset: () => {
    dispatch(success(null));
    dispatch(loadingExpert(false));
    dispatch(errorExpert(null));
    dispatch(resetUpdateExpert());
    dispatch(resetOffice());
  },
});

const mapStateToProps = state => ({
  successExpert: state.expert.create.created,
  loadingExpert: state.expert.create.loading,
  errorExpert: state.expert.create.error,

  retrieveError: state.expert.update.retrieveError,
  retrieveLoading: state.expert.update.retrieveLoading,
  updateError: state.expert.update.updateError,
  updateLoading: state.expert.update.updateLoading,
  retrieved: state.expert.update.retrieved,
  updated: state.expert.update.updated,

  listOffice: state.office.list.data,
  loadingOffice: state.office.list.loading,
  errorOffice: state.office.list.error,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(CreateExpert);

export default withNamespaces('translation')(withRouter(Main));
