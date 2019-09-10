import React, { Component } from 'react';
import { withRouter, Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { create as createCompany, success as successCompany, error as errorCompany, loading as loadingCompany } from 'actions/company/create';
import { list as listOffice, reset as resetOffice } from 'actions/office/list';
import { update as updateCompany, reset as resetUpdateCompany } from 'actions/company/update';
import { retrieve as retrieveExpert } from 'actions/expert/show';
import { selectCompany } from 'actions/user-companies/select';
import { list as listUserCompanies } from 'actions/user-companies/list';
import { Form, Message, Dropdown, Header, Grid } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class CreateCompany extends Component {
  state = {
    office: '',
    name: '',
    calculationMode: null,
    officesList: null,
    officeNameError: false,
    calculationModeError: false,
    companyNameError: false,
    isEditing: false,
  };

  componentDidMount() {
    const {
      getOffices,
      getExpert,
      selectedCompany,
      match,
      userID,
    } = this.props;

    /* if (userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPER_ADMIN') {
       getOffices();
     } else {
       this.setState({
         office: selectedCompany.office,
       });
     } */

    getOffices();
    getExpert(`/experts/${userID}`);

    if (match.path === '/company/edit' && selectedCompany) {
      this.setState({
        office: selectedCompany.office,
        name: selectedCompany.name,
        calculationMode: selectedCompany.calculationMode,
        isEditing: true,
      });
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.retrievedExpert) && prevState.office !== nextProps.retrievedExpert.office['@id']) {
      return {
        office: nextProps.retrievedExpert.office['@id'],
      };
    }
    if (!isEmpty(nextProps.listOffice) && nextProps.listOffice['hydra:member'] !== prevState.officesList) {
      return {
        officesList: nextProps.listOffice['hydra:member'],
      };
    }

    return null;
  }

  componentDidUpdate(prevProps) {
    const { updated, success } = this.props;

    if (updated !== prevProps.updated) {
      this.updateSelectedCompany(updated);
    }

    if (success !== prevProps.success) {
      this.updateSelectedCompany(success);
    }
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  updateSelectedCompany = (company) => {
    const { selectCompany, getUserCompanies } = this.props;

    selectCompany(company);
    getUserCompanies();
  };

  handleInputChange = (e) => {
    e.preventDefault();

    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleSelectChange = (e, { value, name }) => {
    this.setState({
      [name]: value,
    });
  };

  handleOnSubmit = () => {
    const { office, name, calculationMode, isEditing } = this.state;
    const { postCompany, updateCompany, selectedCompany } = this.props;
    let isValid = true;

    this.setState({
      officeNameError: false,
      companyNameError: false,
      calculationModeError: false,
    });

    if (office === '') {
      isValid = false;
      this.setState({
        officeNameError: true,
      });
    }

    if (name === '') {
      isValid = false;

      this.setState({
        companyNameError: true,
      });
    }

    if (!calculationMode) {
      isValid = false;

      this.setState({
        calculationModeError: true,
      });
    }

    if (!isValid) {
      return;
    }
    const data = {
      office,
      name,
      calculationMode,
    };

    isEditing ? updateCompany(selectedCompany, data) : postCompany(data);
  };

  render() {
    const {
      office,
      name,
      calculationMode,
      officeNameError,
      companyNameError,
      calculationModeError,
      officesList,
    } = this.state;

    const {
      userRole,
      loadingCompany,
      loadingOffice,
      loadingExpert,
      updateLoading,
      errorCompany,
      success,
      updated,
      t,
      match,
    } = this.props;

    const updateID = match.path === '/company/edit';

    let offices = [];

    if (officesList && officesList.length > 0) {
      offices = officesList.map(office => ({
        key: office.id,
        text: office.name,
        value: office['@id'],
      }));
    }

    const calculationOptions = [
      {
        key: '1', text: t('formSellingCoefficient'), value: 'coef',
      },
      {
        key: '2', text: t('formMarginRate'), value: 'rate',
      },
    ];

    if (success) {
      return (
        <Redirect
          push
          to={{
            pathname: '/company/settings/company-details/edit',
            company: true,
          }}
        />
      );
    }

    if (updated) {
      return (
        <Redirect
          push
          to="/company"
        />
      );
    }

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">
              {updateID ? t('companiesUpdateTitle') : `${t('step')} 1 / 3: ${t('companiesCreateTitle')}`}
            </Header>
            <EssorButton
              as={Link}
              to={updateID ? '/company' : '/companies/'}
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
                <Form className="margin-top-bot main-form" loading={loadingCompany || updateLoading || loadingExpert} size="small">
                  {!updateID && (userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPER_ADMIN')
                   && (
                     <Form.Group inline>
                       <Form.Select
                         label={t('formOffice')}
                         control={Dropdown}
                         placeholder={t('formPHSelect')}
                         name="office"
                         fluid
                         search
                         selection
                         loading={loadingOffice}
                         disabled={loadingOffice}
                         noResultsMessage="No results"
                         options={offices}
                         onChange={this.handleSelectChange}
                         error={officeNameError}
                         value={office}
                       />
                     </Form.Group>
                   )
                  }
                  <Form.Group inline>
                    <Form.Input
                      label={t('formName')}
                      name="name"
                      placeholder={t('formPHName')}
                      value={name}
                      onChange={this.handleInputChange}
                      error={companyNameError}
                    />
                  </Form.Group>

                  {!updateID
                  && (
                    <Form.Group inline>
                      <Form.Select
                        label={t('formCalculationMode')}
                        control={Dropdown}
                        placeholder={t('formPHSelect')}
                        name="calculationMode"
                        fluid
                        selection
                        options={calculationOptions}
                        onChange={this.handleSelectChange}
                        error={calculationModeError}
                        value={calculationMode}
                      />
                    </Form.Group>
                  )}

                  <EssorButton submit type="check" onClick={this.handleOnSubmit} size="small">
                    {t('buttonSave')}
                  </EssorButton>
                </Form>

                {errorCompany
                  && (
                  <Message negative>
                    <p>{errorCompany}</p>
                  </Message>
                  )
                }
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  postCompany: data => dispatch(createCompany(data)),
  getOffices: () => dispatch(listOffice()),
  updateCompany: (item, data) => dispatch(updateCompany(item, data)),
  selectCompany: company => dispatch(selectCompany(company)),
  getUserCompanies: page => dispatch(listUserCompanies(page)),
  getExpert: page => dispatch(retrieveExpert(page)),
  reset: () => {
    dispatch(loadingCompany(false));
    dispatch(errorCompany(null));
    dispatch(successCompany(null));
    dispatch(resetOffice());
    dispatch(resetUpdateCompany());
  },
});

const mapStateToProps = state => ({
  successAuth: state.auth.created,

  success: state.company.create.created,
  loadingCompany: state.company.create.loading,
  errorCompany: state.company.create.error,
  loadingOffice: state.office.list.loading,
  listOffice: state.office.list.data,

  selectedCompany: state.userCompanies.select.selectedCompany,
  userRole: state.userCompanies.role.userRole,

  updated: state.company.update.updated,
  updateError: state.company.update.updateError,
  updateLoading: state.company.update.updateLoading,

  retrieved: state.expert.update.retrieved,
  userID: state.userCompanies.role.userID,

  loadingExpert: state.expert.show.loading,
  errorExpert: state.expert.show.loading,
  retrievedExpert: state.expert.show.retrieved,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(CreateCompany);

export default withNamespaces('translation')(withRouter(Main));
