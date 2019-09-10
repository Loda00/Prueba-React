import React, { Component } from 'react';
import { Link, Redirect, withRouter } from 'react-router-dom';
import { isEmpty } from 'lodash';
import { connect } from 'react-redux';
import Cleave from 'cleave.js/react';
import { update as updateEmployeeData, reset as resetUpdateEmployeeData } from 'actions/employee-data/update';
import { retrieved } from 'actions/employee-data/show';
import { Form, Grid, Input, Message, Header, Label } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class UpdateEmployeeData extends Component {
  state = {
    employeeData: null,
    exploitationRate: '',
    efficiencyRate: '',
    daysOff: '',
    employerTaxRate: '',
    grossMonthlyPay: '',
    grossAnnualBonus: '',
    hoursToSell: false,

    exploitationRateError: false,
    efficiencyRateError: false,
    daysOffError: false,
    employerTaxRateError: false,
    grossMonthlyPayError: false,
    grossAnnualBonusError: false,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      !isEmpty(nextProps.retrievedEmployeeData)
      && !isEmpty(nextProps.retrievedEmployeeData['hydra:member'])
      && nextProps.retrievedEmployeeData['hydra:member'][0] !== prevState.employeeData
    ) {
      const {
        exploitationRate,
        efficiencyRate,
        daysOff,
        employerTaxRate,
        grossMonthlyPay,
        grossAnnualBonus,
        hoursToSell,
      } = nextProps.retrievedEmployeeData['hydra:member'][0];

      return {
        employeeData: nextProps.retrievedEmployeeData['hydra:member'][0],
        exploitationRate,
        efficiencyRate,
        daysOff,
        employerTaxRate,
        grossMonthlyPay,
        grossAnnualBonus,
        hoursToSell,
      };
    }

    return null;
  }

  componentDidUpdate() {
    const { updated, setEmployeeData } = this.props;

    if (!isEmpty(updated)) {
      const employeeData = {};
      employeeData['hydra:member'] = [];
      employeeData['hydra:member'].push(updated);
      setEmployeeData(employeeData);
    }
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  handleInputChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;

    this.setState({
      [name]: value,
    });
  };

  handleCheckBoxChange = (e, { name }) => {
    e.preventDefault();

    this.setState(prevState => (
      {
        [name]: !prevState[name],
      }
    ));
  };

  handleOnSubmit = () => {
    const {
      employeeData,
      exploitationRate,
      efficiencyRate,
      daysOff,
      employerTaxRate,
      grossMonthlyPay,
      grossAnnualBonus,
      hoursToSell,
    } = this.state;

    const { updateEmployeeData } = this.props;

    let isValid = true;

    this.setState({
      exploitationRateError: false,
      efficiencyRateError: false,
      daysOffError: false,
      employerTaxRateError: false,
      grossMonthlyPayError: false,
      grossAnnualBonusError: false,
    });

    if (exploitationRate === '' || (parseFloat(exploitationRate) > 100)) {
      isValid = false;

      this.setState({
        exploitationRateError: true,
      });
    }

    if (efficiencyRate === '' || (parseFloat(efficiencyRate) > 100)) {
      isValid = false;

      this.setState({
        efficiencyRateError: true,
      });
    }

    if (grossMonthlyPay === '') {
      isValid = false;

      this.setState({
        grossMonthlyPayError: true,
      });
    }

    if (grossAnnualBonus === '') {
      isValid = false;

      this.setState({
        grossAnnualBonusError: true,
      });
    }

    if (employerTaxRate === '' || (parseFloat(employerTaxRate) > 100)) {
      isValid = false;

      this.setState({
        employerTaxRateError: true,
      });
    }

    if (daysOff === '') {
      isValid = false;

      this.setState({
        daysOffError: true,
      });
    }

    if (!isValid) return;

    const data = {
      hoursToSell,
      exploitationRate,
      efficiencyRate,
      grossMonthlyPay: parseFloat(grossMonthlyPay),
      grossAnnualBonus: parseFloat(grossAnnualBonus),
      employerTaxRate,
      daysOff,
    };

    updateEmployeeData(employeeData, data);
  };

  render() {
    const {
      hoursToSell,
      exploitationRate,
      efficiencyRate,
      grossMonthlyPay,
      grossAnnualBonus,
      employerTaxRate,
      daysOff,

      exploitationRateError,
      efficiencyRateError,
      grossMonthlyPayError,
      grossAnnualBonusError,
      employerTaxRateError,
      daysOffError,
    } = this.state;

    const {
      updated,
      loadingEmployeeData,
      updateLoading,
      updateError,
      match,
      t,
    } = this.props;

    if (updated) {
      return (
        <Redirect
          push
          to={{
            pathname: `/employees/${match.params.id}/data-synthesis`,
          }}
        />
      );
    }

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('employeeDataAndSynthesisUpdate')}</Header>
            <EssorButton
              as={Link}
              to={`/employees/${match.params.id}/data-synthesis`}
              type="chevron left"
              size="tiny"
              floated="right"
            >
              {t('buttonBack')}
            </EssorButton>
          </div>

          <Form className="margin-top-bot main-form" loading={loadingEmployeeData || updateLoading} size="small">
            <Grid>
              <Grid.Row>
                <Grid.Column width={12}>
                  <Form.Group inline>
                    <Form.Field error={exploitationRateError}>
                      <label>{t('formExploitationRate')}</label>
                      <Input labelPosition="left">
                        <Label>%</Label>
                        <Cleave
                          options={{
                            numeral: true,
                            numeralThousandsGroupStyle: 'none',
                            numeralDecimalScale: 2,
                            numeralPositiveOnly: true,
                          }}
                          onChange={this.handleInputChange}
                          name="exploitationRate"
                          placeholder={t('formPHExploitationRate')}
                          value={exploitationRate}
                        />
                      </Input>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field error={efficiencyRateError}>
                      <label>{t('formEfficiencyRate')}</label>
                      <Input labelPosition="left">
                        <Label>%</Label>
                        <Cleave
                          options={{
                            numeral: true,
                            numeralThousandsGroupStyle: 'none',
                            numeralDecimalScale: 2,
                            numeralPositiveOnly: true,
                          }}
                          onChange={this.handleInputChange}
                          name="efficiencyRate"
                          placeholder={t('formPHEfficiencyRate')}
                          value={efficiencyRate}
                        />
                      </Input>
                    </Form.Field>
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
                    <Form.Field error={employerTaxRateError}>
                      <label>{t('formEmployerTaxRate')}</label>
                      <Input labelPosition="left">
                        <Label>%</Label>
                        <Cleave
                          options={{
                            numeral: true,
                            numeralThousandsGroupStyle: 'none',
                            numeralDecimalScale: 2,
                            numeralPositiveOnly: true,
                          }}
                          onChange={this.handleInputChange}
                          name="employerTaxRate"
                          placeholder={t('formPHEmployerTaxRate')}
                          value={employerTaxRate}
                        />
                      </Input>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formGrossMonthlyPay')}
                      name="grossMonthlyPay"
                      placeholder={t('formPHGrossMonthlyPay')}
                      value={grossMonthlyPay}
                      onChange={this.handleInputChange}
                      error={grossMonthlyPayError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formGrossAnnualBonus')}
                      name="grossAnnualBonus"
                      placeholder={t('formPHGrossAnnualBonus')}
                      value={grossAnnualBonus}
                      onChange={this.handleInputChange}
                      error={grossAnnualBonusError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Checkbox
                      label={t('formHoursToSell')}
                      name="hoursToSell"
                      checked={hoursToSell}
                      onChange={this.handleCheckBoxChange}
                    />
                  </Form.Group>

                  <EssorButton type="check" submit onClick={this.handleOnSubmit} size="small">
                    {t('buttonSave')}
                  </EssorButton>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Form>

          {updateError
          && (
            <Message negative>
              <p>{updateError}</p>
            </Message>
          )}
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  updateEmployeeData: (item, data) => dispatch(updateEmployeeData(item, data)),
  setEmployeeData: employeeData => dispatch(retrieved(employeeData)),
  reset: () => {
    dispatch(resetUpdateEmployeeData());
  },
});

const mapStateToProps = state => ({
  retrievedEmployeeData: state.employeeData.show.retrieved,
  loadingEmployeeData: state.employeeData.show.loading,
  errorEmployeeData: state.employeeData.show.error,

  updateError: state.employeeData.update.updateError,
  updateLoading: state.employeeData.update.updateLoading,
  updated: state.employeeData.update.updated,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(UpdateEmployeeData);

export default withNamespaces('translation')(withRouter(Main));
