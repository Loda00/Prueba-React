import React, { Component } from 'react';
import { Link, Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import { find, isEmpty } from 'lodash';
import { create, error, loading, success } from 'actions/fiscal-year/create';
import { retrieve as retrieveFiscalYear, update as updateFiscalYear, reset as resetFiscalYear } from 'actions/fiscal-year/update';
import { selectFiscalYear } from 'actions/user-companies/select';
import { Form, Grid, Message, Header, Dropdown } from 'semantic-ui-react';
import { EssorButton } from 'components';
import DatePicker from 'react-datepicker';
import { withNamespaces } from 'react-i18next';
import NotFound from '../../../404';

import 'moment/locale/fr';

moment.locale('fr');

class CreateFiscalYear extends Component {
  state = {
    isValid: true,
    fiscalYear: null,
    label: '',
    dateStart: null,
    dateEnd: null,
    company: null,
    newClientsGoal: '',
    lastFiscalYearMonth: '',
    daysOff: '',
    region: null,
    defaultYear: false,
    labelError: false,
    dateStartError: false,
    dateEndError: false,
    newClientsGoalError: false,
    lastFiscalYearMonthError: false,
    daysOffError: false,
    regionError: false,
  };

  componentDidMount() {
    const { getFiscalYear, dataFiscalYear, match } = this.props;

    if (match.params.fiscalYearId) {
      if (find(dataFiscalYear['hydra:member'], {
        id: parseInt(match.params.fiscalYearId, 10),
      })) {
        getFiscalYear(`/fiscal_years/${match.params.fiscalYearId}`);
      } else {
        this.setState({
          isValid: false,
        });
      }
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.selectedCompany !== prevState.company) {
      return {
        company: nextProps.selectedCompany,
      };
    }

    if (!isEmpty(nextProps.retrieved) && nextProps.retrieved !== prevState.fiscalYear) {
      return {
        fiscalYear: nextProps.retrieved,
        label: nextProps.retrieved.label,
        dateStart: moment(nextProps.retrieved.dateStart),
        dateEnd: moment(nextProps.retrieved.dateEnd),
        company: nextProps.retrieved.company,
        newClientsGoal: nextProps.retrieved.newClientsGoal.toString(),
        lastFiscalYearMonth: nextProps.retrieved.lastFiscalYearMonth.toString(),
        daysOff: nextProps.retrieved.daysOff.toString(),
        region: nextProps.retrieved.region,
        defaultYear: nextProps.retrieved.defaultYear,
      };
    }

    return null;
  }

  componentDidUpdate(prevProps) {
    const { updated, success, selectFiscalYear } = this.props;
    if (updated !== prevProps.updated && updated.defaultYear) {
      selectFiscalYear(updated);
    }

    if (success !== prevProps.success && success.defaultYear) {
      selectFiscalYear(success);
    }
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  handleDateStartChange = (date) => {
    this.setState({
      dateStart: date,
    });
  };

  handleDateEndChange = (date) => {
    this.setState({
      dateEnd: date,
    });
  };

  handleCheckBoxChange= (e) => {
    e.preventDefault();

    this.setState(prevState => (
      {
        defaultYear: !prevState.defaultYear,
      }
    ));
  };

  handleInputChange = (e) => {
    e.preventDefault();

    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleRegionChange = (e, { value }) => {
    this.setState({
      region: value,
    });
  };

  handleOnSubmit = () => {
    const {
      fiscalYear,
      label,
      dateStart,
      dateEnd,
      company,
      defaultYear,
      newClientsGoal,
      lastFiscalYearMonth,
      daysOff,
      region,
    } = this.state;

    const { postFiscalYear, updateFiscalYear } = this.props;

    let isValid = true;

    this.setState({
      labelError: false,
      dateStartError: false,
      dateEndError: false,
      newClientsGoalError: false,
      lastFiscalYearMonthError: false,
      daysOffError: false,
      regionError: false,
    });

    if (label.trim() === '') {
      isValid = false;

      this.setState({
        labelError: true,
      });
    }

    if (newClientsGoal.trim() === '' || !Number.isInteger(parseFloat(newClientsGoal))) {
      isValid = false;

      this.setState({
        newClientsGoalError: true,
      });
    }

    if (lastFiscalYearMonth.trim() === '' || !Number.isInteger(parseFloat(lastFiscalYearMonth))) {
      isValid = false;

      this.setState({
        lastFiscalYearMonthError: true,
      });
    }

    if (daysOff.trim() === '' || !Number.isInteger(parseFloat(daysOff))) {
      isValid = false;

      this.setState({
        daysOffError: true,
      });
    }

    if (!region) {
      isValid = false;

      this.setState({
        regionError: true,
      });
    }

    if (!company) {
      isValid = false;
    }

    if (!dateStart) {
      isValid = false;

      this.setState({
        dateStartError: true,
      });
    }

    if (!dateEnd || dateStart >= dateEnd) {
      isValid = false;

      this.setState({
        dateEndError: true,
      });
    }

    if (!isValid) return;

    const data = {
      label,
      dateStart: dateStart.format(),
      dateEnd: dateEnd.format(),
      company: company['@id'],
      defaultYear,
      newClientsGoal: parseInt(newClientsGoal, 10),
      lastFiscalYearMonth: parseInt(lastFiscalYearMonth, 10),
      daysOff: parseInt(daysOff, 10),
      region,
    };

    fiscalYear ? updateFiscalYear(fiscalYear, data) : postFiscalYear(data);
  };

  render() {
    const {
      isValid,
      label,
      dateStart,
      dateEnd,
      newClientsGoal,
      lastFiscalYearMonth,
      daysOff,
      region,
      defaultYear,
      labelError,
      dateStartError,
      dateEndError,
      newClientsGoalError,
      lastFiscalYearMonthError,
      daysOffError,
      regionError,
    } = this.state;

    const {
      loading,
      error,
      success,
      updated,
      updateLoading,
      match,
      t,
    } = this.props;

    const updateID = match.params.fiscalYearId;

    const regions = [
      {
        key: 'region-1',
        text: 'Alsace-Moselle',
        value: 'Alsace-Moselle',
      },
      {
        key: 'region-2',
        text: 'Other',
        value: 'Other',
      },
    ];

    if (success || updated) {
      return (
        <Redirect
          push
          to={updated ? `/company/fiscal_years/${updated.id}` : `/company/fiscal_years/${success.id}`}
        />
      );
    }

    if (!isValid) {
      return (
        <div className="section-container">
          <NotFound />
        </div>
      );
    }

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">
              {updateID ? t('fiscalYearsUpdateTitle') : t('fiscalYearsCreateTitle')}
            </Header>

            <EssorButton
              as={Link}
              to={updateID ? `/company/fiscal_years/${updateID}` : '/company/fiscal_years'}
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
                <Form className="margin-top-bot main-form" loading={loading || updateLoading} size="small">
                  <Form.Group inline>
                    <Form.Input
                      label={t('formLabel')}
                      name="label"
                      placeholder={t('formPHLabel')}
                      value={label}
                      onChange={this.handleInputChange}
                      error={labelError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formDateStart')}
                      name="dateStart"
                      control={DatePicker}
                      selected={dateStart}
                      onChange={this.handleDateStartChange}
                      locale="fr"
                      autoComplete="off"
                      error={dateStartError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formDateEnd')}
                      name="dateEnd"
                      control={DatePicker}
                      selected={dateEnd}
                      onChange={this.handleDateEndChange}
                      locale="fr"
                      autoComplete="off"
                      error={dateEndError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formNewClientsGoal')}
                      name="newClientsGoal"
                      placeholder={t('formPHNewClientsGoal')}
                      value={newClientsGoal}
                      onChange={this.handleInputChange}
                      error={newClientsGoalError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formLastFiscalYearMonth')}
                      name="lastFiscalYearMonth"
                      placeholder={t('formPHLastFiscalYearMonth')}
                      value={lastFiscalYearMonth}
                      onChange={this.handleInputChange}
                      error={lastFiscalYearMonthError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formDaysOff')}
                      name="daysOff"
                      placeholder={t('formPHDaysOff')}
                      value={daysOff}
                      onChange={this.handleInputChange}
                      error={daysOffError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Select
                      label={t('formRegion')}
                      control={Dropdown}
                      placeholder={t('formPHSelect')}
                      fluid
                      search
                      selection
                      noResultsMessage="No results"
                      options={regions}
                      onChange={this.handleRegionChange}
                      error={regionError}
                      value={region}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Checkbox
                      label={t('formDefaultYear')}
                      name="defaultYear"
                      checked={defaultYear}
                      onChange={this.handleCheckBoxChange}
                    />
                  </Form.Group>

                  <EssorButton type="check" submit onClick={this.handleOnSubmit} size="small">
                    {t('buttonSave')}
                  </EssorButton>

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
  postFiscalYear: data => dispatch(create(data)),
  getFiscalYear: page => dispatch(retrieveFiscalYear(page)),
  updateFiscalYear: (item, data) => dispatch(updateFiscalYear(item, data)),
  selectFiscalYear: fiscalYear => dispatch(selectFiscalYear(fiscalYear)),
  reset: () => {
    dispatch(success(null));
    dispatch(loading(false));
    dispatch(error(null));
    dispatch(resetFiscalYear());
  },
});

const mapStateToProps = state => ({
  success: state.fiscalYear.create.created,
  loading: state.fiscalYear.create.loading,
  error: state.fiscalYear.create.error,

  selectedCompany: state.userCompanies.select.selectedCompany,

  retrieved: state.fiscalYear.update.retrieved,
  retrieveError: state.fiscalYear.update.retrieveError,
  retrieveLoading: state.fiscalYear.update.retrieveLoading,

  updated: state.fiscalYear.update.updated,
  updateError: state.fiscalYear.update.updateError,
  updateLoading: state.fiscalYear.update.updateLoading,

  dataFiscalYear: state.fiscalYear.list.data,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(CreateFiscalYear);

export default withNamespaces('translation')(withRouter(Main));
