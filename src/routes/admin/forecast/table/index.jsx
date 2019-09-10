import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { isEmpty } from 'lodash';
import { connect } from 'react-redux';
import Cleave from 'cleave.js/react';
import moment from 'moment';
import { update as updateFiscalYear, reset as resetUpdateFiscalYear } from 'actions/fiscal-year/update';
import { retrieve as retrieveForecast, reset as resetForecast } from 'actions/forecast/show';
import { create as createWorkingCapital, error as errorWorkingCapital, loading as loadingWorkingCapital, success as successWorkingCapital } from 'actions/working-capital/create';
import { update as updateWorkingCapital, reset as resetUpdateWorkingCapital } from 'actions/working-capital/update';
import { Grid, Table, Header, Segment, Dimmer, Loader, Input, Label } from 'semantic-ui-react';
import { create as createSelfFinancing, error as errorSelfFinancing, loading as loadingSelfFinancing, success as successSelfFinancing } from 'actions/self-financing/create';
import { update as updateSelfFinancing, reset as resetUpdateSelfFinancing } from 'actions/self-financing/update';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';
import classnames from 'classnames';

import 'moment/locale/fr';

moment.locale('fr');

class ForecastShow extends Component {
  state = {
    calculationMode: null,
    realised: {
      thM: 0,
      hoursTotal: 0,
      hoursToSell: 0,
      hoursToSellAdapted: 0,
      totalChargesAdapted: 0,
      totalCharges: 0,
      totalFixedCharges: 0,
      totalVariablesCharges: 0,
      acaMP: 0,
      marginRate: 0,
      valueMP: 0,
      CA_MP: 0,
      acaMD: 0,
      valueMD: 0,
      CA_MD: 0,
      valueST: 0,
      acaST: 0,
      newCustomersNumber: 0,
    },
    planned: {
      happyBonus: 0,
      rateMP: 0,
      rateMD: 0,
      thM: 0,
      hoursTotal: 0,
      hoursToSell: 0,
      hoursToSellAdapted: 0,
      totalChargesAdapted: 0,
      totalCharges: 0,
      totalFixedCharges: 0,
      totalVariablesCharges: 1,
      acaMP: 0,
      marginRate: 0,
      valueMP: 0,
      CA_MP: 0,
      acaMD: 0,
      valueMD: 0,
      CA_MD: 0,
      valueST: 0,
      acaST: 0,
      newCustomersNumber: 0,
    },
    percentage: {},

    inventoryValue: 0,
    inventoryVAT: 0,
    customerPayables: 0,
    supplierDebts: 0,
    fiscalDebts: 0,
    otherDebts: 0,
    result: 0,

    operatingProfit: 0,
    provisionAndDepreciation: 0,
    financingResult: 0,

    workingCapitalCleaves: [],
  };

  componentDidMount() {
    const { getForecast, selectedCompany } = this.props;

    getForecast(`/companies/${selectedCompany.id}/forecast_result/`);
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      planned,
      forecastId,
      workingCapitalId,
      workingCapitalCleaves,
    } = this.state;

    if (prevState.forecastId !== forecastId) {
      this.calculateValues('valueMD', planned.valueMD);
      this.calculateValues('valueMP', planned.valueMP);
      this.calculateValues('valueST', planned.valueST);
    }

    if (prevState.workingCapitalId !== workingCapitalId && !workingCapitalId) {
      for (let i = 0; i < workingCapitalCleaves.length; i++) {
        workingCapitalCleaves[i].setRawValue(0);
      }
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      !isEmpty(nextProps.retrievedForecast)
      && prevState.forecastId !== nextProps.retrievedForecast.fiscalYearId
    ) {
      let inventoryValue = '0';
      let inventoryVAT = '0';
      let customerPayables = '0';
      let supplierDebts = '0';
      let fiscalDebts = '0';
      let otherDebts = '0';
      let result = '0';
      let workingCapitalId = null;

      let operatingProfit = '0';
      let provisionAndDepreciation = '0';
      let financingResult = '0';
      let selfFinancingId = null;

      if (nextProps.retrievedForecast.workingCapital) {
        ({
          inventoryValue,
          inventoryVAT,
          customerPayables,
          supplierDebts,
          fiscalDebts,
          otherDebts,
          result,
        } = nextProps.retrievedForecast.workingCapital);

        workingCapitalId = nextProps.retrievedForecast.workingCapital.id;
      }

      if (nextProps.retrievedForecast.selfFinancing) {
        ({
          operatingProfit,
          provisionAndDepreciation,
        } = nextProps.retrievedForecast.selfFinancing);

        financingResult = nextProps.retrievedForecast.selfFinancing.result;
        selfFinancingId = nextProps.retrievedForecast.selfFinancing.id;
      }

      return {
        calculationMode: nextProps.retrievedForecast.calculationMode,
        realised: nextProps.retrievedForecast.realised,
        planned: nextProps.retrievedForecast.planned,
        realisedModeCalcMP: nextProps.retrievedForecast.realised.valueMP,
        realisedModeCalcMD: nextProps.retrievedForecast.realised.valueMD,
        forecastId: nextProps.retrievedForecast.fiscalYearId,

        inventoryValue: parseFloat(inventoryValue).toFixed(2),
        inventoryVAT: parseFloat(inventoryVAT).toFixed(2),
        customerPayables: parseFloat(customerPayables).toFixed(2),
        supplierDebts: parseFloat(supplierDebts).toFixed(2),
        fiscalDebts: parseFloat(fiscalDebts).toFixed(2),
        otherDebts: parseFloat(otherDebts).toFixed(2),
        result: parseFloat(result).toFixed(2),
        workingCapitalId,

        operatingProfit: parseFloat(operatingProfit).toFixed(2),
        provisionAndDepreciation: parseFloat(provisionAndDepreciation).toFixed(2),
        financingResult: parseFloat(financingResult).toFixed(2),
        selfFinancingId,
      };
    }

    if (!isEmpty(nextProps.successWorkingCapital) && !prevState.workingCapitalId) {
      return {
        workingCapitalId: nextProps.successWorkingCapital.id,
      };
    }

    return null;
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  getPercentage = (planned, realised) => {
    const parsedPlanned = parseFloat(planned);
    const parsedRealised = parseFloat(realised);

    if (parsedRealised === 0 || Number.isNaN(parsedRealised) || Number.isNaN(parsedPlanned)) {
      return 0;
    }

    return 100 * (parsedPlanned - parsedRealised) / parsedRealised;
  };

  calculateTurnover = (aca, mode) => {
    const { calculationMode } = this.state;
    const parsedAca = parseFloat(aca);
    const parsedMode = parseFloat(mode);

    if (Number.isNaN(parsedAca) || Number.isNaN(parsedMode)) return 0;

    if (calculationMode === 'rate' && parsedMode !== 100) {
      return parsedAca / (1 - (parsedMode / 100));
    } if (calculationMode === 'coef') {
      return parsedAca * parsedMode;
    }
    return 0;
  };

  calculateValues = (mode, value) => {
    const { calculationMode } = this.state;
    let result = 0;

    switch (calculationMode) {
      case 'coef':
        result = (value !== '' && value !== 0 && value !== null)
          ? (((parseFloat(value) - 1) / parseFloat(value)) * 100).toFixed(2)
          : 0.00;
        break;
      case 'rate':
        result = (value !== '' && value !== 0 && value !== null)
          ? ((1) / (1 - (parseFloat(value) / 100))).toFixed(2)
          : 0.00;
        break;
      default: break;
    }

    this.setState(prevState => (
      {
        percentage: {
          ...prevState.percentage,
          [mode]: result,
        },
      }
    ));
  };

  handleInputChange = (e) => {
    e.preventDefault();

    const { planned, realised } = this.state;
    const { name, value } = e.target;

    if (!name) return;

    let {
      inventoryValue,
      inventoryVAT,
      customerPayables,
      supplierDebts,
      fiscalDebts,
      otherDebts,
    } = this.state;

    const keys = name.split('.');

    if (keys.length > 1) {
      this.setState(prevState => (
        {
          [keys[0]]: {
            ...prevState[keys[0]],
            [keys[1]]: value,
          },
        }
      ));

      switch (keys[0]) {
        case 'realised':
          realised[keys[1]] = value;
          break;
        case 'planned':
          planned[keys[1]] = value;
          break;
        default: break;
      }

      if (keys[1] === 'valueMD' || keys[1] === 'valueMP' || keys[1] === 'valueST') {
        if (keys[0] === 'planned') {
          this.calculateValues(keys[1], value);
        }
      } else if (!isEmpty(realised[keys[1]]) && !isEmpty(planned[keys[1]])) {
        this.setState(prevState => (
          {
            percentage: {
              ...prevState.percentage,
              [keys[1]]: (parseFloat(realised[keys[1]]) !== 0)
                ? (((parseFloat(planned[keys[1]]) - parseFloat(realised[keys[1]])) * 100)
                  / parseFloat(realised[keys[1]])).toFixed(2)
                : 0.00,
            },
          }
        ));
      } else if (isEmpty(realised[keys[1]]) || isEmpty(planned[keys[1]])) {
        this.setState(prevState => (
          {
            percentage: {
              ...prevState.percentage,
              [keys[1]]: 0.00,
            },
          }
        ));
      }
    } else {
      this.setState({
        [name]: value,
      });

      switch (name) {
        case 'inventoryValue':
          inventoryValue = value;
          break;
        case 'inventoryVAT':
          inventoryVAT = value;
          break;
        case 'customerPayables':
          customerPayables = value;
          break;
        case 'supplierDebts':
          supplierDebts = value;
          break;
        case 'fiscalDebts':
          fiscalDebts = value;
          break;
        case 'otherDebts':
          otherDebts = value;
          break;
        default:
          break;
      }

      if (
        (!isEmpty(inventoryVAT) && Number(inventoryVAT) < 100)
        && !isEmpty(customerPayables)
        && !isEmpty(supplierDebts)
        && !isEmpty(fiscalDebts)
        && !isEmpty(otherDebts)
        && !isEmpty(inventoryValue)
      ) {
        const result = ((parseFloat(inventoryValue) * (1 + (parseFloat(inventoryVAT) / 100)))
          + (parseFloat(customerPayables) - (parseFloat(supplierDebts) + parseFloat(fiscalDebts)
          + parseFloat(otherDebts)))).toFixed(2);
        this.setState({
          result,
          advise: result > 0,
        });
      } else {
        this.setState({
          result: '-',
          advise: false,
        });
      }
    }
  };

  submit = () => {
    const { planned, realised, forecastId } = this.state;
    const { updateFiscalYear } = this.props;

    const data = {
      forecast: {
        planned,
        realised,
      },
    };

    const fiscalYear = {
      '@id': `/fiscal_years/${forecastId}`,
    };

    this.handleSFSubmit();
    updateFiscalYear(fiscalYear, data);
  };

  handleWCSubmit = () => {
    const {
      workingCapitalId,
      forecastId,

      inventoryValue,
      inventoryVAT,
      customerPayables,
      supplierDebts,
      fiscalDebts,
      otherDebts,
      result,
    } = this.state;
    const {
      successWorkingCapital,
      retrievedForecast,
      postWorkingCapital,
      updateWorkingCapital,
    } = this.props;

    const data = {
      inventoryValue,
      inventoryVAT,
      customerPayables,
      supplierDebts,
      fiscalDebts,
      otherDebts,
      result: result.toString(),
    };

    if (workingCapitalId) {
      const item = retrievedForecast.workingCapital
        ? {
          '@id': `/working_capitals/${workingCapitalId}`,
        }
        : successWorkingCapital;

      updateWorkingCapital(item, data);
    } else {
      data.fiscalYear = `/fiscal_years/${forecastId}`;

      postWorkingCapital(data);
    }
  };

  handleSFSubmit = () => {
    const {
      selfFinancingId,
      forecastId,

      realised,
    } = this.state;
    const {
      successSelfFinancing,
      retrievedForecast,
      postSelfFinancing,
      updateSelfFinancing,
    } = this.props;

    const operatingProfit = realised.thM * realised.hoursToSellAdapted
      + this.calculateTurnover(realised.acaST, realised.valueST)
      + this.calculateTurnover(realised.acaMD, realised.valueMD)
      + this.calculateTurnover(realised.acaMP, realised.valueMP);

    const result = (operatingProfit + parseFloat(realised.deprecationsAndProvisions))
      / realised.monthsInTheFiscalYear;

    const data = {
      operatingProfit: operatingProfit.toString(),
      provisionAndDepreciation: realised.deprecationsAndProvisions.toString(),
      result: result.toString(),
    };

    if (selfFinancingId) {
      const item = retrievedForecast.selfFinancing
        ? {
          '@id': `/self_financings/${selfFinancingId}`,
        }
        : successSelfFinancing;

      updateSelfFinancing(item, data);
    } else {
      data.fiscalYear = `/fiscal_years/${forecastId}`;

      postSelfFinancing(data);
    }
  };

  onWorkingCapitalsCleaveInit = (cleave) => {
    const { workingCapitalCleaves } = this.state;

    workingCapitalCleaves.push(cleave);

    this.setState({
      workingCapitalCleaves,
    });
  };

  render() {
    const {
      calculationMode,
      realised,
      planned,
      percentage,

      inventoryValue,
      inventoryVAT,
      customerPayables,
      supplierDebts,
      fiscalDebts,
      otherDebts,
      result,

      advise,

      realisedModeCalcMP,
      realisedModeCalcMD,
    } = this.state;

    const {
      loadingForecast,
      t,
    } = this.props;

    const forecast = {};
    forecast.hoursTotal = this.getPercentage(planned.hoursTotal, realised.hoursTotal);

    forecast.hoursToSell = this.getPercentage(planned.hoursToSell, realised.hoursToSell);

    forecast.hoursToSellAdapted = this.getPercentage(planned.hoursToSellAdapted,
      realised.hoursToSellAdapted);

    forecast.realisedDiff = realised.hoursToSellAdapted - realised.hoursToSell;
    forecast.plannedDiff = planned.hoursToSellAdapted - planned.hoursToSell;
    forecast.diff = this.getPercentage(forecast.plannedDiff,
      forecast.realisedDiff);

    forecast.totalChargesAdapted = this.getPercentage(planned.totalChargesAdapted,
      realised.totalChargesAdapted);

    forecast.realisedChargesHours = realised.hoursToSellAdapted !== 0
      ? (realised.totalCharges / realised.hoursToSellAdapted)
      : 0;
    forecast.plannedChargesHours = planned.hoursToSellAdapted !== 0
      ? ((parseFloat(planned.totalCharges) + parseFloat(planned.happyBonus))
        / planned.hoursToSellAdapted)
      : 0;
    forecast.chargesHours = this.getPercentage(forecast.plannedChargesHours,
      forecast.realisedChargesHours);

    forecast.realisedHoursProduction = realised.thM * realised.hoursTotal;
    forecast.plannedHoursProduction = planned.thM * planned.hoursTotal;
    forecast.HoursProduction = this.getPercentage(forecast.plannedHoursProduction,
      forecast.realisedHoursProduction);

    forecast.realisedHourlySale = realised.thM * realised.hoursToSellAdapted;
    forecast.plannedHourlySale = planned.thM * planned.hoursToSellAdapted;
    forecast.hourlySale = this.getPercentage(forecast.plannedHourlySale,
      forecast.realisedHourlySale);

    forecast.realisedSaleProduction = forecast.realisedHoursProduction !== 0
      ? ((forecast.realisedHourlySale / forecast.realisedHoursProduction) * 100)
      : 0;
    forecast.plannedSaleProduction = forecast.plannedHoursProduction !== 0
      ? ((forecast.plannedHourlySale / forecast.plannedHoursProduction) * 100)
      : 0;
    forecast.saleProduction = this.getPercentage(forecast.plannedSaleProduction,
      forecast.realisedSaleProduction);

    forecast.totalFixedCharges = this.getPercentage(planned.totalFixedCharges,
      realised.totalFixedCharges);

    forecast.totalVariablesCharges = this.getPercentage(planned.totalVariablesCharges,
      realised.totalVariablesCharges);

    forecast.realisedTotalCharges = parseFloat(realised.totalVariablesCharges)
      + parseFloat(realised.totalFixedCharges);
    forecast.plannedTotalCharges = parseFloat(planned.totalVariablesCharges)
      + parseFloat(planned.totalFixedCharges);
    forecast.totalCharges = this.getPercentage(forecast.plannedTotalCharges,
      forecast.realisedTotalCharges);

    forecast.acaMP = this.getPercentage(planned.acaMP, realised.acaMP);

    forecast.realisedRawMaterials = this.calculateTurnover(realised.acaMP, realised.valueMP);
    forecast.plannedRawMaterials = this.calculateTurnover(planned.acaMP, planned.valueMP);
    forecast.rawMaterials = this.getPercentage(forecast.plannedRawMaterials,
      forecast.realisedRawMaterials);

    forecast.realisedMarginPurchase = forecast.realisedRawMaterials - realised.acaMP;
    forecast.plannedMarginPurchase = forecast.plannedRawMaterials - planned.acaMP;
    forecast.marginPurchase = this.getPercentage(forecast.plannedMarginPurchase,
      forecast.realisedMarginPurchase);

    forecast.acaMD = this.getPercentage(planned.acaMD, realised.acaMD);

    forecast.realisedMerchandiseTurnover = this.calculateTurnover(realised.acaMD, realised.valueMD);
    forecast.plannedMerchandiseTurnover = this.calculateTurnover(planned.acaMD, planned.valueMD);
    forecast.merchandiseTurnover = this.getPercentage(forecast.plannedMerchandiseTurnover,
      forecast.realisedMerchandiseTurnover);

    forecast.realisedGoodsPurchase = forecast.realisedMerchandiseTurnover - realised.acaMD;
    forecast.plannedGoodsPurchase = forecast.plannedMerchandiseTurnover - planned.acaMD;
    forecast.goodsPurchase = this.getPercentage(forecast.plannedGoodsPurchase,
      forecast.realisedGoodsPurchase);

    forecast.acaST = this.getPercentage(planned.acaST, realised.acaST);

    forecast.realisedSaleOutsourcing = this.calculateTurnover(realised.acaST,
      realised.valueST);
    forecast.plannedSaleOutsourcing = this.calculateTurnover(planned.acaST,
      planned.valueST);
    forecast.saleOutsourcing = this.getPercentage(forecast.plannedSaleOutsourcing,
      forecast.realisedSaleOutsourcing);

    forecast.realisedSubcontracting = forecast.realisedSaleOutsourcing - realised.acaST;
    forecast.plannedSubcontracting = forecast.plannedSaleOutsourcing - planned.acaST;
    forecast.subcontracting = this.getPercentage(forecast.plannedSubcontracting,
      forecast.realisedSubcontracting);

    forecast.realisedTurnover = forecast.realisedHourlySale + forecast.realisedSaleOutsourcing
      + forecast.realisedMerchandiseTurnover + forecast.realisedRawMaterials;
    forecast.plannedTurnover = forecast.plannedHourlySale + forecast.plannedSaleOutsourcing
      + forecast.plannedMerchandiseTurnover + forecast.plannedRawMaterials;
    forecast.turnover = this.getPercentage(forecast.plannedTurnover, forecast.realisedTurnover);

    forecast.realisedOperatingProfit = forecast.realisedTurnover - forecast.realisedTotalCharges;
    forecast.plannedOperatingProfit = forecast.plannedTurnover - forecast.plannedTotalCharges;
    forecast.operatingProfit = this.getPercentage(forecast.plannedOperatingProfit,
      forecast.realisedOperatingProfit);

    forecast.newCustomersNumber = this.getPercentage(planned.newCustomersNumber,
      realised.newCustomersNumber);

    /* Seuil de rentabilité / Breakeven */
    const breakEven = {};
    breakEven.turnover = realised.acaMP * realised.valueMP
      + realised.acaMD * realised.valueMD
      + realised.acaST * realised.valueST
      + forecast.realisedHourlySale;
    breakEven.totalFixedCharges = parseFloat(realised.totalFixedCharges) !== null
      ? parseFloat(realised.totalFixedCharges)
      : 0;
    breakEven.totalVariablesCharges = parseFloat(realised.totalVariablesCharges) !== null
      ? parseFloat(realised.totalVariablesCharges)
      : 0;
    breakEven.variableCostsMargin = breakEven.turnover - breakEven.totalVariablesCharges;
    breakEven.variableCostsMarginPercentage = breakEven.turnover === 0
      ? 0
      : breakEven.variableCostsMargin / breakEven.turnover * 100;
    breakEven.result = breakEven.variableCostsMarginPercentage === 0
      ? 0
      : breakEven.totalFixedCharges / breakEven.variableCostsMarginPercentage;
    breakEven.neutralPointDate = breakEven.turnover === 0
      ? 0
      : breakEven.result * realised.daysInTheFiscalYear / breakEven.turnover;

    const autoFinancing = (parseFloat(realised.deprecationsAndProvisions)
      + forecast.realisedOperatingProfit) / realised.monthsInTheFiscalYear;

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('forecastHomeTitle')}</Header>
          </div>

          <Segment
            basic
            className={classnames('table-container', 'forecast-table', {
              'is-loading': loadingForecast,
            })}
          >
            <Dimmer active={loadingForecast} inverted>
              <Loader>{t('loading')}</Loader>
            </Dimmer>
            <Table celled className="definition-table">
              <Table.Header>
                <Table.Row textAlign="center">
                  <Table.HeaderCell />
                  <Table.HeaderCell>{t('formRealised')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('formPlanned')}</Table.HeaderCell>
                  <Table.HeaderCell>%</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                <Table.Row>
                  <Table.Cell className="table-title">{t('forecastLaborSale')}</Table.Cell>
                  <Table.Cell />
                  <Table.Cell />
                  <Table.Cell />
                </Table.Row>
                <Table.Row>
                  <Table.Cell>{t('forecastAverageHourRate')}</Table.Cell>
                  <Table.Cell>
                    <Input fluid>
                      <Cleave
                        options={{
                          numeral: true,
                          numeralThousandsGroupStyle: 'none',
                          numeralDecimalScale: 2,
                        }}
                        name="realised.thM"
                        value={realised.thM || 0}
                        onChange={this.handleInputChange}
                      />
                    </Input>
                  </Table.Cell>
                  <Table.Cell>
                    <Input fluid>
                      <Cleave
                        options={{
                          numeral: true,
                          numeralThousandsGroupStyle: 'none',
                          numeralDecimalScale: 2,
                        }}
                        name="planned.thM"
                        value={planned.thM || 0}
                        onChange={this.handleInputChange}
                      />
                    </Input>
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {percentage.thM}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>{t('forecastNumberHoursProduction')}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {parseFloat(realised.hoursTotal).toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {parseFloat(planned.hoursTotal).toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.hoursTotal.toFixed(2)}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>{t('forecastNumberHoursSale')}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {parseFloat(realised.hoursToSell).toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {parseFloat(planned.hoursToSell).toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.hoursToSell.toFixed(2)}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>{t('forecastNumberHoursvalidated')}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {parseFloat(realised.hoursToSellAdapted).toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {parseFloat(planned.hoursToSellAdapted).toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.hoursToSellAdapted.toFixed(2)}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>{t('forecastLossGainHours')}</Table.Cell>
                  <Table.Cell textAlign="center">{forecast.realisedDiff.toFixed(2)}</Table.Cell>
                  <Table.Cell textAlign="center">{forecast.plannedDiff.toFixed(2)}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.diff.toFixed(2)}
                  </Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.Cell colSpan="4" />
                </Table.Row>

                <Table.Row>
                  <Table.Cell>{t('forecastHourCostLabor')}</Table.Cell>
                  <Table.Cell textAlign="center">{realised.totalChargesAdapted || '0.00'}</Table.Cell>
                  <Table.Cell textAlign="center">{planned.totalChargesAdapted || '0.00'}</Table.Cell>
                  <Table.Cell textAlign="center">
                    -
                    {/* forecast.totalChargesAdapted */}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    {t('forecastHourCostLaborProduction')}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.realisedChargesHours.toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.plannedChargesHours.toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.chargesHours.toFixed(2)}
                  </Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.Cell colSpan="4" />
                </Table.Row>

                <Table.Row>
                  <Table.Cell>{t('forecastTurnoverProduction')}</Table.Cell>
                  <Table.Cell textAlign="center">{forecast.realisedHoursProduction.toFixed(2)}</Table.Cell>
                  <Table.Cell textAlign="center">{forecast.plannedHoursProduction.toFixed(2)}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.HoursProduction.toFixed(2)}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    {t('forecastLaborValidated')}
                  </Table.Cell>
                  <Table.Cell textAlign="center">{forecast.realisedHourlySale.toFixed(2)}</Table.Cell>
                  <Table.Cell textAlign="center">{forecast.plannedHourlySale.toFixed(2)}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.hourlySale.toFixed(2)}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    {t('forecastPercentageBetweenSales')}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.realisedSaleProduction.toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.plannedSaleProduction.toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.saleProduction.toFixed(2)}
                  </Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.Cell colSpan="4" />
                </Table.Row>
                <Table.Row>
                  <Table.Cell colSpan="4" />
                </Table.Row>

                <Table.Row>
                  <Table.Cell className="table-title">{t('forecastGlobalChargesCompany')}</Table.Cell>
                  <Table.Cell />
                  <Table.Cell />
                  <Table.Cell />
                </Table.Row>
                <Table.Row>
                  <Table.Cell>{t('forecastFixedCharges')}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {parseFloat(realised.totalFixedCharges).toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {parseFloat(planned.totalFixedCharges).toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.totalFixedCharges.toFixed(2)}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>{t('forecastVariableExpenses')}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {parseFloat(realised.totalVariablesCharges).toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {parseFloat(planned.totalVariablesCharges).toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.totalVariablesCharges.toFixed(2)}
                  </Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.Cell colSpan="4" />
                </Table.Row>

                <Table.Row>
                  <Table.Cell>{t('forecastTotalCharges')}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.realisedTotalCharges.toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.plannedTotalCharges.toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.totalCharges.toFixed(2)}
                  </Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.Cell colSpan="4" />
                </Table.Row>
                <Table.Row>
                  <Table.Cell colSpan="4" />
                </Table.Row>

                <Table.Row>
                  <Table.Cell className="table-title">{t('forecastProductsSaleCompanies')}</Table.Cell>
                  <Table.Cell />
                  <Table.Cell />
                  <Table.Cell />
                </Table.Row>

                <Table.Row>
                  <Table.Cell>{t('forecastPurchaseRawMaterials')}</Table.Cell>
                  <Table.Cell textAlign="center">{parseFloat(realised.acaMP).toFixed(2)}</Table.Cell>
                  <Table.Cell textAlign="center">{parseFloat(planned.acaMP).toFixed(2)}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.acaMP.toFixed(2)}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>{t('forecastModeCalc')}</Table.Cell>
                  <Table.Cell textAlign="center" colSpan="2">
                    {calculationMode === 'coef'
                      ? t('forecastCoef') : t('forecastMarginRate')
                    }
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {calculationMode === 'rate'
                      ? 'Coef de vente'
                      : calculationMode === 'coef'
                        ? 'Taux de marge'
                        : ''
                    }
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell />
                  <Table.Cell textAlign="center">
                    {realisedModeCalcMP
                      ? (
                        <React.Fragment>
                          {calculationMode === 'rate'
                            ? `${parseFloat(realised.valueMP).toFixed(2)} %`
                            : parseFloat(realised.valueMP).toFixed(2)
                          }
                        </React.Fragment>
                      ) : (
                        <Input fluid labelPosition="left">
                          {calculationMode === 'rate'
                            && <Label>%</Label>
                          }
                          <Cleave
                            options={{
                              numeral: true,
                              numeralThousandsGroupStyle: 'none',
                              numeralDecimalScale: 2,
                            }}
                            name="realised.valueMP"
                            value={realised.valueMP || 0}
                            onChange={this.handleInputChange}
                          />
                        </Input>
                      )}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    <Input fluid labelPosition="left">
                      {calculationMode === 'rate'
                        && <Label>%</Label>
                      }
                      <Cleave
                        options={{
                          numeral: true,
                          numeralThousandsGroupStyle: 'none',
                          numeralDecimalScale: 2,
                        }}
                        name="planned.valueMP"
                        value={planned.valueMP || 0}
                        onChange={this.handleInputChange}
                      />
                    </Input>
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {percentage.valueMP}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>{t('forecastRawTurnover')}</Table.Cell>
                  <Table.Cell textAlign="center">{forecast.realisedRawMaterials.toFixed(2)}</Table.Cell>
                  <Table.Cell textAlign="center">{forecast.plannedRawMaterials.toFixed(2)}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.rawMaterials.toFixed(2)}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>{t('forecastMarginGoodsPurchase')}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.realisedMarginPurchase.toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.plannedMarginPurchase.toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.marginPurchase.toFixed(2)}
                  </Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.Cell colSpan="4" />
                </Table.Row>

                <Table.Row>
                  <Table.Cell>{t('forecastPurchaseOutsourcing')}</Table.Cell>
                  <Table.Cell textAlign="center">{parseFloat(realised.acaMD).toFixed(2)}</Table.Cell>
                  <Table.Cell textAlign="center">{parseFloat(planned.acaMD).toFixed(2)}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.acaMD.toFixed(2)}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>{t('forecastModeCalc')}</Table.Cell>
                  <Table.Cell textAlign="center" colSpan="2">
                    {calculationMode === 'coef'
                      ? t('forecastCoef') : t('forecastMarginRate')
                    }
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {calculationMode === 'rate'
                      ? 'Coef de vente'
                      : calculationMode === 'coef'
                        ? 'Taux de marge'
                        : ''
                    }
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell />
                  <Table.Cell textAlign="center">
                    {realisedModeCalcMD
                      ? (
                        <React.Fragment>
                          {calculationMode === 'rate'
                            ? `${parseFloat(realised.valueMD).toFixed(2)} %`
                            : parseFloat(realised.valueMD).toFixed(2)
                          }
                        </React.Fragment>
                      ) : (
                        <Input fluid labelPosition="left">
                          {calculationMode === 'rate'
                            && <Label>%</Label>
                          }
                          <Cleave
                            options={{
                              numeral: true,
                              numeralThousandsGroupStyle: 'none',
                              numeralDecimalScale: 2,
                            }}
                            name="realised.valueMD"
                            value={realised.valueMD || 0}
                            onChange={this.handleInputChange}
                          />
                        </Input>
                      )}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    <Input fluid labelPosition="left">
                      {calculationMode === 'rate'
                        && <Label>%</Label>
                      }
                      <Cleave
                        options={{
                          numeral: true,
                          numeralThousandsGroupStyle: 'none',
                          numeralDecimalScale: 2,
                        }}
                        name="planned.valueMD"
                        value={planned.valueMD || 0}
                        onChange={this.handleInputChange}
                      />
                    </Input>
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {percentage.valueMD}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>{t('forecastRawTurnover')}</Table.Cell>
                  <Table.Cell textAlign="center">{forecast.realisedMerchandiseTurnover.toFixed(2)}</Table.Cell>
                  <Table.Cell textAlign="center">{forecast.plannedMerchandiseTurnover.toFixed(2)}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.merchandiseTurnover.toFixed(2)}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>{t('forecastMarginGoodsPurchase')}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.realisedGoodsPurchase.toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.plannedGoodsPurchase.toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.goodsPurchase.toFixed(2)}
                  </Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.Cell colSpan="4" />
                </Table.Row>


                <Table.Row>
                  <Table.Cell>{t('forecastPurchaseGoods')}</Table.Cell>
                  <Table.Cell textAlign="center">{parseFloat(realised.acaST).toFixed(2)}</Table.Cell>
                  <Table.Cell textAlign="center">{parseFloat(planned.acaST).toFixed(2)}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.acaST.toFixed(2)}
                  </Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.Cell>{t('forecastModeCalc')}</Table.Cell>
                  <Table.Cell textAlign="center" colSpan="2">
                    {calculationMode === 'coef'
                      ? t('forecastCoef') : t('forecastMarginRate')
                    }
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {calculationMode === 'rate'
                      ? 'Coef de vente'
                      : calculationMode === 'coef'
                        ? 'Taux de marge'
                        : ''
                    }
                  </Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.Cell />
                  <Table.Cell textAlign="center">
                    <Input fluid labelPosition="left">
                      {calculationMode === 'rate'
                        && <Label>%</Label>
                      }
                      <Cleave
                        options={{
                          numeral: true,
                          numeralThousandsGroupStyle: 'none',
                          numeralDecimalScale: 2,
                        }}
                        name="realised.valueST"
                        value={realised.valueST || 0}
                        onChange={this.handleInputChange}
                      />
                    </Input>
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    <Input fluid labelPosition="left">
                      {calculationMode === 'rate'
                        && <Label>%</Label>
                      }
                      <Cleave
                        options={{
                          numeral: true,
                          numeralThousandsGroupStyle: 'none',
                          numeralDecimalScale: 2,
                        }}
                        name="planned.valueST"
                        value={planned.valueST || 0}
                        onChange={this.handleInputChange}
                      />
                    </Input>
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {percentage.valueST}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>{t('forecastSalesOutsourcing')}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.realisedSaleOutsourcing.toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.plannedSaleOutsourcing.toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.saleOutsourcing.toFixed(2)}
                  </Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.Cell>{t('forecastContractingPurchase')}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.realisedSubcontracting.toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.plannedSubcontracting.toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.subcontracting.toFixed(2)}
                  </Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.Cell colSpan="4" />
                </Table.Row>
                <Table.Row>
                  <Table.Cell colSpan="4" />
                </Table.Row>

                <Table.Row>
                  <Table.Cell className="table-title">{t('forecastSummaryCompanies')}</Table.Cell>
                  <Table.Cell />
                  <Table.Cell />
                  <Table.Cell />
                </Table.Row>
                <Table.Row>
                  <Table.Cell>{t('forecastTotalExpenses')}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.realisedTotalCharges.toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.plannedTotalCharges.toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.totalCharges.toFixed(2)}
                  </Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.Cell colSpan="4" />
                </Table.Row>

                <Table.Row>
                  <Table.Cell>{t('forecastRawTurnover')}</Table.Cell>
                  <Table.Cell textAlign="center">{forecast.realisedRawMaterials.toFixed(2)}</Table.Cell>
                  <Table.Cell textAlign="center">{forecast.plannedRawMaterials.toFixed(2)}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.rawMaterials.toFixed(2)}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>{t('forecastMerchandiseTurnover')}</Table.Cell>
                  <Table.Cell textAlign="center">{forecast.realisedMerchandiseTurnover.toFixed(2)}</Table.Cell>
                  <Table.Cell textAlign="center">{forecast.plannedMerchandiseTurnover.toFixed(2)}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.merchandiseTurnover.toFixed(2)}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>{t('forecastSalesOutsourcing')}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.realisedSaleOutsourcing.toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.plannedSaleOutsourcing.toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.saleOutsourcing.toFixed(2)}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    {t('forecastLaborValidated')}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.realisedHourlySale.toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.plannedHourlySale.toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.hourlySale.toFixed(2)}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>{t('forecastTurnover')}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.realisedTurnover.toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.plannedTurnover.toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.turnover.toFixed(2)}
                  </Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.Cell colSpan="4" />
                </Table.Row>

                <Table.Row>
                  <Table.Cell>{t('forecastOperating')}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.realisedOperatingProfit.toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.plannedOperatingProfit.toFixed(2)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.operatingProfit.toFixed(2)}
                  </Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.Cell colSpan="4" />
                </Table.Row>
                <Table.Row>
                  <Table.Cell colSpan="4" />
                </Table.Row>

                <Table.Row>
                  <Table.Cell className="table-title">{t('forecastIndicatorsCompany')}</Table.Cell>
                  <Table.Cell />
                  <Table.Cell />
                  <Table.Cell />
                </Table.Row>
                <Table.Row>
                  <Table.Cell>{t('forecastNumberCustomers')}</Table.Cell>
                  <Table.Cell textAlign="center">{realised.newCustomersNumber.toFixed(2)}</Table.Cell>
                  <Table.Cell textAlign="center">{planned.newCustomersNumber.toFixed(2)}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {forecast.newCustomersNumber.toFixed(2)}
                  </Table.Cell>
                </Table.Row>

              </Table.Body>
            </Table>

            <EssorButton type="check" primary onClick={this.submit}>
              {t('buttonSave')}
            </EssorButton>

          </Segment>
        </div>


        <div className="section-general">
          <Grid>
            <Grid.Row>
              <Grid.Column width={10}>
                <Segment
                  basic
                  className={classnames('table-container', 'forecast-table', {
                    'is-loading': loadingForecast,
                  })}
                >
                  <Dimmer active={loadingForecast} inverted>
                    <Loader>{t('loading')}</Loader>
                  </Dimmer>
                  <Table celled className="values-table">
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>
                          {t('forecastCalculatingWCR')}
                        </Table.HeaderCell>
                        <Table.HeaderCell />
                      </Table.Row>
                    </Table.Header>

                    <Table.Body>
                      <Table.Row>
                        <Table.Cell>{t('forecastStockValue')}</Table.Cell>
                        <Table.Cell>
                          <Input fluid>
                            <Cleave
                              options={{
                                numeral: true,
                                numeralThousandsGroupStyle: 'none',
                                numeralDecimalScale: 2,
                                numeralIntegerScale: 6,
                              }}
                              onInit={this.onWorkingCapitalsCleaveInit}
                              name="inventoryValue"
                              value={inventoryValue}
                              onChange={this.handleInputChange}
                            />
                          </Input>
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>{t('forecastVAT')}</Table.Cell>
                        <Table.Cell>
                          <Input fluid labelPosition="left">
                            <Label>%</Label>
                            <Cleave
                              options={{
                                numeral: true,
                                numeralThousandsGroupStyle: 'none',
                                numeralDecimalScale: 2,
                                numeralIntegerScale: 2,
                              }}
                              onInit={this.onWorkingCapitalsCleaveInit}
                              name="inventoryVAT"
                              value={inventoryVAT}
                              onChange={this.handleInputChange}
                            />
                          </Input>
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>{t('forecastAmount')}</Table.Cell>
                        <Table.Cell>
                          <Input fluid>
                            <Cleave
                              options={{
                                numeral: true,
                                numeralThousandsGroupStyle: 'none',
                                numeralDecimalScale: 2,
                                numeralIntegerScale: 6,
                              }}
                              onInit={this.onWorkingCapitalsCleaveInit}
                              name="customerPayables"
                              value={customerPayables}
                              onChange={this.handleInputChange}
                            />
                          </Input>
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>{t('forecastDebts')}</Table.Cell>
                        <Table.Cell>
                          <Input fluid>
                            <Cleave
                              options={{
                                numeral: true,
                                numeralThousandsGroupStyle: 'none',
                                numeralDecimalScale: 2,
                                numeralIntegerScale: 6,
                              }}
                              onInit={this.onWorkingCapitalsCleaveInit}
                              name="supplierDebts"
                              value={supplierDebts}
                              onChange={this.handleInputChange}
                            />
                          </Input>
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>{t('forecastTaxDebts')}</Table.Cell>
                        <Table.Cell>
                          <Input fluid>
                            <Cleave
                              options={{
                                numeral: true,
                                numeralThousandsGroupStyle: 'none',
                                numeralDecimalScale: 2,
                                numeralIntegerScale: 6,
                              }}
                              onInit={this.onWorkingCapitalsCleaveInit}
                              name="fiscalDebts"
                              value={fiscalDebts}
                              onChange={this.handleInputChange}
                            />
                          </Input>
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>{t('forecastOtherDebts')}</Table.Cell>
                        <Table.Cell>
                          <Input fluid>
                            <Cleave
                              options={{
                                numeral: true,
                                numeralThousandsGroupStyle: 'none',
                                numeralDecimalScale: 2,
                                numeralIntegerScale: 6,
                              }}
                              onInit={this.onWorkingCapitalsCleaveInit}
                              name="otherDebts"
                              value={otherDebts}
                              onChange={this.handleInputChange}
                            />
                          </Input>
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell><strong>{t('forecastBFR')}</strong></Table.Cell>
                        <Table.Cell textAlign="center">{result}</Table.Cell>
                      </Table.Row>
                      {advise
                      && (
                      <Table.Row>
                        <Table.Cell colSpan="2">
                          {t('forecastMessageFinancing')}
                        </Table.Cell>
                      </Table.Row>
                      )
                      }
                    </Table.Body>
                  </Table>
                  <EssorButton type="check" primary onClick={this.handleWCSubmit}>
                    {t('buttonSave')}
                  </EssorButton>
                </Segment>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>

        {/* START SEUIL DE RENTABILITE */}
        <div className="section-general">
          <Grid>
            <Grid.Row>
              <Grid.Column width={10}>
                <Segment
                  basic
                  className={classnames('table-container', 'forecast-table', {
                    'is-loading': loadingForecast,
                  })}
                >
                  <Dimmer active={loadingForecast} inverted>
                    <Loader>{t('loading')}</Loader>
                  </Dimmer>
                  <Table celled className="values-table">
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>
                          {t('forecastCalculatingBreak')}
                        </Table.HeaderCell>
                        <Table.HeaderCell />
                      </Table.Row>
                    </Table.Header>

                    <Table.Body>
                      <Table.Row>
                        <Table.Cell>{t('forecastTurnover')}</Table.Cell>
                        <Table.Cell>
                          {breakEven.turnover.toFixed(2)}
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>{t('forecastFixedCharges')}</Table.Cell>
                        <Table.Cell>
                          {breakEven.totalFixedCharges.toFixed(2)}
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>{t('forecastVariableExpenses')}</Table.Cell>
                        <Table.Cell>
                          {breakEven.totalVariablesCharges.toFixed(2)}
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>{t('forecastMarginVariable')}</Table.Cell>
                        <Table.Cell>
                          {breakEven.variableCostsMargin.toFixed(2)}
                          {' '}
(
                          {breakEven.variableCostsMarginPercentage.toFixed(2)}
%)
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell><strong>{t('forecastResultBreak')}</strong></Table.Cell>
                        <Table.Cell>
                          {breakEven.result.toFixed(2)}
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell><strong>{t('forecastDeadLine')}</strong></Table.Cell>
                        <Table.Cell>
                          {breakEven.neutralPointDate.toFixed(2)}
                        </Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table>
                </Segment>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
        {/* END SEUIL DE RENTABILITE */}

        <div className="section-general">
          <Grid>
            <Grid.Row>
              <Grid.Column width={10}>
                <Segment
                  basic
                  className={classnames('table-container', 'forecast-table', {
                    'is-loading': loadingForecast,
                  })}
                >
                  <Dimmer active={loadingForecast} inverted>
                    <Loader>{t('loading')}</Loader>
                  </Dimmer>
                  <Table celled className="values-table">
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>
                          {t('forecastCalculatingCash')}
                        </Table.HeaderCell>
                        <Table.HeaderCell />
                      </Table.Row>
                    </Table.Header>

                    <Table.Body>
                      <Table.Row>
                        <Table.Cell>{t('forecastOperating')}</Table.Cell>
                        <Table.Cell>
                          {forecast.realisedOperatingProfit.toFixed(2)}
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>{t('forecastAmortization')}</Table.Cell>
                        <Table.Cell>
                          {parseFloat(realised.deprecationsAndProvisions).toFixed(2)}
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell><strong>{t('forecastCash')}</strong></Table.Cell>
                        <Table.Cell textAlign="center">{autoFinancing.toFixed(2)}</Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table>
                </Segment>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  getForecast: page => dispatch(retrieveForecast(page)),

  updateFiscalYear: (item, data) => dispatch(updateFiscalYear(item, data)),

  postWorkingCapital: data => dispatch(createWorkingCapital(data)),
  updateWorkingCapital: (item, data) => dispatch(updateWorkingCapital(item, data)),

  postSelfFinancing: data => dispatch(createSelfFinancing(data, false)),
  updateSelfFinancing: (item, data) => dispatch(updateSelfFinancing(item, data, false)),

  reset: () => {
    dispatch(resetForecast());
    dispatch(resetUpdateWorkingCapital());
    dispatch(resetUpdateSelfFinancing());
    dispatch(resetUpdateFiscalYear());

    dispatch(errorWorkingCapital(null));
    dispatch(loadingWorkingCapital(false));
    dispatch(successWorkingCapital(null));

    dispatch(errorSelfFinancing(null));
    dispatch(loadingSelfFinancing(false));
    dispatch(successSelfFinancing(null));
  },
});

const mapStateToProps = state => ({
  retrievedForecast: state.forecast.show.retrieved,
  loadingForecast: state.forecast.show.loading,
  errorForecast: state.forecast.show.error,

  updatedWorkingCapital: state.workingCapital.update.updated,
  loadingUpdateWorkingCapital: state.workingCapital.update.updateLoading,
  errorUpdateWorkingCapital: state.workingCapital.update.updateError,

  successWorkingCapital: state.workingCapital.create.created,
  loadingCreateWorkingCapital: state.workingCapital.create.loading,
  errorCreateWorkingCapital: state.workingCapital.create.error,

  updatedSelfFinancing: state.selfFinancing.update.updated,
  loadingUpdateSelfFinancing: state.selfFinancing.update.updateLoading,
  errorUpdateSelfFinancing: state.selfFinancing.update.updateError,

  successSelfFinancing: state.selfFinancing.create.created,
  loadingCreateSelfFinancing: state.selfFinancing.create.loading,
  errorCreateSelfFinancing: state.selfFinancing.create.error,

  selectedCompany: state.userCompanies.select.selectedCompany,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(ForecastShow);

export default withNamespaces('translation')(withRouter(Main));
