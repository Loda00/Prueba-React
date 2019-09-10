/* eslint-disable max-len */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Cleave from 'cleave.js/react';

import { connect } from 'react-redux';
import { find, isEmpty } from 'lodash';
import { list as listCalculation, reset as resetCalculation } from 'actions/calculation-mode/list';
import { update as updateCalculation, reset as resetUpdateCalculation } from 'actions/calculation-mode/update';
import { create as createCalculation, error as errorCreateCalculation, loading as loadingCreateCalculation, success as successCalculation } from 'actions/calculation-mode/create';
import { Form, Header, Select, Input, Modal, Table, TableRow } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class CalculateMode extends Component {
  state = {
    showModalCalc: false,
    typeRate: null,
    typeRateError: false,
    typePlanned: null,
    typePlanedError: false,
    firstCalc: true,
    isCalculationLoaded: false,
    calculationData: null,

    rawMaterialmarginRateRealised: '',
    rawMaterialsaleCoefficientRealised: '',
    rawMaterialmarginRatePlanned: '',
    rawMaterialsaleCoefficientPlanned: '',

    goodsmarginRateRealised: '',
    goodssaleCoefficientRealised: '',
    goodsmarginRatePlanned: '',
    goodssaleCoefficientPlanned: '',

    rawMaterialmarginRatePlannedError: false,
    rawMaterialsaleCoefficientPlannedError: false,
    goodsmarginRatePlannedError: false,
    goodssaleCoefficientPlannedError: false,

    rawMaterialmarginRateRealisedError: false,
    rawMaterialsaleCoefficientRealisedError: false,
    goodsmarginRateRealisedError: false,
    goodssaleCoefficientRealisedError: false,

  }

  componentDidMount() {
    const {
      getCalculation,
      match,
    } = this.props;

    getCalculation(`/calculation_modes/?fiscalYear=${match.params.fiscalYearId}`);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.successCalculation || nextProps.updatedCalculation) {
      const {
        resetCreateCalculation,
        resetUpdateCalculation,
        resetCalculationList,
        getCalculation,
        match,
      } = nextProps;
      resetCreateCalculation();
      resetUpdateCalculation();
      resetCalculationList();
      getCalculation(`/calculation_modes/?fiscalYear=${match.params.fiscalYearId}`);

      return {
        calculationData: nextProps.dataCalculation['hydra:member'],
        isCalculationLoaded: true,
        showModalCalc: false,
      };
    }


    if (!isEmpty(nextProps.dataCalculation) && !prevState.isCalculationLoaded && !isEmpty(nextProps.dataCalculation['hydra:member'])) {
      return {
        calculationData: nextProps.dataCalculation['hydra:member'],
        isCalculationLoaded: true,
        firstCalc: !!isEmpty(nextProps.dataCalculation['hydra:member'][0].pastModeMP),
      };
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    const { firstCalc } = this.state;
    if (prevState.firstCalc !== firstCalc && !firstCalc) {
      this.setValueCalculationData();
    }
  }

  componentWillUnmount() {

  }

  getNewCalculatedSaleCoefficent = r => (1 / (1 - (Number(r) / 100))).toFixed(2).toString();

  getNewMarginRate = c => ((Number(c) - 1) * 100 / Number(c)).toFixed(2).toString()

  setValueCalculationData = () => {
    const { calculationData } = this.state;


    if (calculationData[0].pastModeMP === 'rate') {
      this.setState({
        rawMaterialmarginRateRealised: calculationData[0].pastValueMP,
        rawMaterialsaleCoefficientRealised: this.getNewCalculatedSaleCoefficent(calculationData[0].pastValueMP),
        goodsmarginRateRealised: calculationData[0].pastValueMD,
        goodssaleCoefficientRealised: this.getNewMarginRate(calculationData[0].pastValueMD),
      });
    } else {
      this.setState({
        rawMaterialsaleCoefficientRealised: calculationData[0].pastValueMP,
        rawMaterialmarginRateRealised: this.getNewMarginRate(calculationData[0].pastValueMP),
        goodssaleCoefficientRealised: calculationData[0].pastValueMD,
        goodsmarginRateRealised: this.getNewMarginRate(calculationData[0].pastValueMD),
      });
    }

    if (calculationData[0].currentModeMP === 'rate') {
      this.setState({
        rawMaterialmarginRatePlanned: calculationData[0].currentValueMP,
        rawMaterialsaleCoefficientPlanned: this.getNewCalculatedSaleCoefficent(calculationData[0].currentValueMP),
        goodsmarginRatePlanned: calculationData[0].currentValueMD,
        goodssaleCoefficientPlanned: this.getNewCalculatedSaleCoefficent(calculationData[0].currentValueMD),
        typePlanned: 'saleCoefficientRealised',
      });
    } else {
      this.setState({
        rawMaterialsaleCoefficientPlanned: calculationData[0].currentValueMP,
        rawMaterialmarginRatePlanned: this.getNewMarginRate(calculationData[0].currentValueMP),
        goodssaleCoefficientPlanned: calculationData[0].currentValueMD,
        goodsmarginRatePlanned: this.getNewMarginRate(calculationData[0].currentValueMD),
        typePlanned: 'marginRatePlanned',
      });
    }
  };

  handleInputChange = (e) => {
    e.preventDefault();

    const valueIn = e.target.value;
    const targetName = e.target.name;
    const errorName = `${targetName}Error`;
    this.setState({
      [errorName]: false,
    });

    this.setState({
      [e.target.name]: valueIn,
    });
    let checkRateValue;

    if (Number(valueIn) >= 0) {
      if (targetName.includes('saleCoefficient') && parseFloat(valueIn) <= 99) {
        checkRateValue = true;
      } else if (targetName.includes('marginRate') && parseFloat(valueIn) < 99) {
        checkRateValue = true;
      } else {
        checkRateValue = false;
      }
    }

    if (checkRateValue) {
      this.setState({
        [errorName]: false,
      });

      switch (e.target.name) {
        case 'rawMaterialmarginRateRealised':
          this.setState({
            rawMaterialsaleCoefficientRealised: this.getNewCalculatedSaleCoefficent(e.target.value),
            rawMaterialsaleCoefficientRealisedError: false,
          });
          break;

        case 'rawMaterialsaleCoefficientRealised':
          this.setState({
            rawMaterialmarginRateRealised: this.getNewMarginRate(e.target.value),
            rawMaterialmarginRateRealisedError: false,
          });
          break;

        case 'rawMaterialmarginRatePlanned':
          this.setState({
            rawMaterialsaleCoefficientPlanned: this.getNewCalculatedSaleCoefficent(e.target.value),
            rawMaterialsaleCoefficientPlannedError: false,
          });
          break;

        case 'rawMaterialsaleCoefficientPlanned':
          this.setState({
            rawMaterialmarginRatePlanned: this.getNewMarginRate(e.target.value),
            rawMaterialmarginRatePlannedError: false,
          });
          break;

        case 'goodsmarginRateRealised':
          this.setState({
            goodssaleCoefficientRealised: this.getNewCalculatedSaleCoefficent(e.target.value),
            goodssaleCoefficientRealisedError: false,
          });
          break;

        case 'goodssaleCoefficientRealised':
          this.setState({
            goodsmarginRateRealised: this.getNewMarginRate(e.target.value),
            goodsmarginRateRealisedError: false,
          });
          break;

        case 'goodsmarginRatePlanned':
          this.setState({
            goodssaleCoefficientPlanned: this.getNewCalculatedSaleCoefficent(e.target.value),
            goodssaleCoefficientPlannedError: false,
          });
          break;

        case 'goodssaleCoefficientPlanned':
          this.setState({
            goodsmarginRatePlanned: this.getNewMarginRate(e.target.value),
            goodsmarginRatePlannedError: false,
          });
          break;
        default: break;
      }
    } else {
      this.setState({
        [errorName]: true,
      });
    }
  };

  handleSelectBox = (e, { value }) => {
    e.preventDefault();

    this.setState({
      typePlanned: value,
      typePlanedError: false,
    });
  }

  handleSelectBoxRealized = (e, { value }) => {
    e.preventDefault();

    this.setState({
      typeRate: value,
      typeRateError: false,
    });
  }

  showModalCalc = () => {
    this.setState({
      showModalCalc: true,
    });
  };

  closeModalCalc = () => {
    this.setState({
      showModalCalc: false,
    });
  };

  handleOnSubmit = () => {
    const {
      typeRate,
      calculationData,
      typePlanned,
      firstCalc,

      rawMaterialmarginRateRealised,
      rawMaterialsaleCoefficientRealised,
      rawMaterialmarginRatePlanned,
      rawMaterialsaleCoefficientPlanned,

      goodsmarginRateRealised,
      goodssaleCoefficientRealised,
      goodsmarginRatePlanned,
      goodssaleCoefficientPlanned,
    } = this.state;

    const {
      retrieved,
      postCalculation,
      updateCalculation,
    } = this.props;


    this.setState({
      typeRateError: false,
      typePlanedError: false,
      rawMaterialmarginRatePlannedError: false,
      rawMaterialsaleCoefficientPlannedError: false,
      goodsmarginRatePlannedError: false,
      goodssaleCoefficientPlannedError: false,

      rawMaterialmarginRateRealisedError: false,
      rawMaterialsaleCoefficientRealisedError: false,
      goodsmarginRateRealisedError: false,
      goodssaleCoefficientRealisedError: false,
    });

    const id = retrieved['@id'];
    const item = find(calculationData, {
      fiscalYear: id,
    });
    let isValid = true;
    let rateSelect;
    let rateSelectPlanned;

    if (typeRate) {
      typeRate === 'saleCoefficientRealised' ? rateSelect = 'coef' : rateSelect = 'rate';
    }

    if (typePlanned) {
      typePlanned === 'saleCoefficientPlanned' ? rateSelectPlanned = 'coef' : rateSelectPlanned = 'rate';
    }

    if (firstCalc) {
      if (rawMaterialmarginRateRealised === '') {
        isValid = false;
        this.setState({
          rawMaterialmarginRateRealisedError: true,
        });
      }

      if (rawMaterialsaleCoefficientRealised === '') {
        isValid = false;
        this.setState({
          rawMaterialsaleCoefficientRealisedError: true,
        });
      }

      if (goodsmarginRateRealised === '') {
        isValid = false;
        this.setState({
          goodsmarginRateRealisedError: true,
        });
      }

      if (goodssaleCoefficientRealised === '') {
        isValid = false;
        this.setState({
          goodssaleCoefficientRealisedError: true,
        });
      }
    }

    if (rawMaterialmarginRatePlanned === '') {
      isValid = false;
      this.setState({
        rawMaterialmarginRatePlannedError: true,
      });
    }

    if (rawMaterialsaleCoefficientPlanned === '') {
      isValid = false;
      this.setState({
        rawMaterialsaleCoefficientPlannedError: true,
      });
    }


    if (goodsmarginRatePlanned === '') {
      isValid = false;
      this.setState({
        goodsmarginRatePlannedError: true,
      });
    }

    if (goodssaleCoefficientPlanned === '') {
      isValid = false;
      this.setState({
        goodssaleCoefficientPlannedError: true,
      });
    }

    if (isEmpty(typePlanned)) {
      isValid = false;
      this.setState({
        typePlanedError: true,
      });
    }


    if (isEmpty(typeRate) && firstCalc) {
      isValid = false;
      this.setState({
        typeRateError: true,
      });
    }


    if (!isValid) {
      return;
    }

    const data = {
      fiscalYear: id,
      pastValueMD: rateSelect === 'coef' ? goodsmarginRateRealised : goodssaleCoefficientRealised,
      pastValueMP: rateSelect === 'coef' ? rawMaterialmarginRateRealised : rawMaterialsaleCoefficientRealised,

      // left value rateselect
      pastModeMP: typeRate ? rateSelect : calculationData[0].pastModeMP,
      pastModeMD: typeRate ? rateSelect : calculationData[0].pastModeMD,

      // right value rateselect
      currentModeMD: rateSelectPlanned,
      currentModeMP: rateSelectPlanned,

      currentValueMD: rateSelectPlanned === 'coef' ? goodsmarginRatePlanned : goodssaleCoefficientPlanned,
      currentValueMP: rateSelectPlanned === 'coef' ? rawMaterialmarginRatePlanned : rawMaterialsaleCoefficientPlanned,
    };

    item ? updateCalculation(item, data) : postCalculation(data);
  }


  enabledInput = (keycode) => {
    const {
      firstCalc,
      typeRate,
      typePlanned,
    } = this.state;

    if (isEmpty(typeRate)) {
      if (keycode === 'rawMaterialmarginRateRealised'
        || keycode === 'goodsmarginRateRealised'
        || keycode === 'rawMaterialsaleCoefficientRealised'
        || keycode === 'goodssaleCoefficientRealised') {
        return true;
      }
    }
    if (isEmpty(typePlanned)) {
      if (keycode === 'rawMaterialmarginRatePlanned'
        || keycode === 'goodsmarginRatePlanned'
        || keycode === 'rawMaterialsaleCoefficientPlanned'
        || keycode === 'goodssaleCoefficientPlanned') {
        return true;
      }
    }

    if (!firstCalc && keycode === `rawMaterial${typePlanned}`) {
      return true;
    } if (!firstCalc && keycode === `goods${typePlanned}`) {
      return true;
    } if (firstCalc && keycode === `rawMaterial${typeRate}`) {
      return true;
    } if (firstCalc && keycode === `goods${typeRate}`) {
      return true;
    }

    if (typePlanned && (`rawMaterial${typePlanned}` === keycode || `goods${typePlanned}` === keycode)) {
      return true;
    }
  }

  render() {
    const {
      showModalCalc,
      typeRate,
      typeRateError,
      typePlanned,
      typePlanedError,
      firstCalc,
      calculationData,

      rawMaterialmarginRateRealised,
      rawMaterialsaleCoefficientRealised,
      rawMaterialmarginRatePlanned,
      rawMaterialsaleCoefficientPlanned,

      goodsmarginRateRealised,
      goodssaleCoefficientRealised,
      goodsmarginRatePlanned,
      goodssaleCoefficientPlanned,

      rawMaterialmarginRateRealisedError,
      rawMaterialsaleCoefficientRealisedError,
      rawMaterialmarginRatePlannedError,
      rawMaterialsaleCoefficientPlannedError,

      goodsmarginRateRealisedError,
      goodssaleCoefficientRealisedError,
      goodsmarginRatePlannedError,
      goodssaleCoefficientPlannedError,
    } = this.state;

    const {
      loadingCreateCalculation,
      loadingUpdateCalculation,
      loadingCalculation,
      t,
    } = this.props;

    const typeCalc = [
      {
        key: 'rawMaterial',
        text: t('calculationTauxMarge'),
        value: 'saleCoefficientRealised',
      },
      {
        key: 'goods',
        text: t('calculationCoefficient'),
        value: 'marginRateRealised',
      },
    ];

    const typeCalcPlanned = [
      {
        key: 'rawMaterial',
        text: t('calculationTauxMarge'),
        value: 'saleCoefficientPlanned',
      },
      {
        key: 'goods',
        text: t('calculationCoefficient'),
        value: 'marginRatePlanned',
      },
    ];

    let typeRateInfo;
    let valueSelectPast = null;

    if (!firstCalc && !isEmpty(calculationData)) {
      calculationData[0].pastModeMD === 'coef' ? valueSelectPast = typeCalc[1].text : valueSelectPast = typeCalc[0].text;
    } else {
      valueSelectPast = 'Select your type';
    }
    if (isEmpty(typeRate) || isEmpty(typePlanned)) {
      typeRateInfo = (
        <div>
          <h5>
            {t('calculationTitle')}
            &nbsp;:&nbsp;
            {t('calculationDefined')}
          </h5>
        </div>
      );
    }

    if (typeRate === 'marginRateRealised' || typePlanned === 'marginRatePlanned') {
      typeRateInfo = (
        <ul style={{
          paddingLeft: 20,
        }}
        >
          <li>
            {t('calculationModalRaw')}
            &nbsp;:&nbsp;
            {t('calculationCoefficient')}
            &nbsp;
            {rawMaterialsaleCoefficientPlanned}
          </li>

          <li>
            {t('calculationMessageRaw')}
            &nbsp;:&nbsp;
            {t('calculationCoefficient')}
            &nbsp;
            {goodssaleCoefficientPlanned}
          </li>
        </ul>
      );
    }

    if (typeRate === 'saleCoefficientRealised' || typePlanned === 'saleCoefficientPlanned') {
      typeRateInfo = (
        <ul style={{
          paddingLeft: 20,
        }}
        >
          <li>
            {t('calculationModalRaw')}
            &nbsp;:&nbsp;
            {t('calculationTauxMarge')}
            &nbsp;
            {rawMaterialmarginRatePlanned}
%
          </li>

          <li>
            {t('calculationMessageRaw')}
            &nbsp;:&nbsp;
            {t('calculationTauxMarge')}
            &nbsp;
            {goodsmarginRatePlanned}
%
          </li>
        </ul>
      );
    }

    return (
      <div>
        <div style={{
          display: 'flex', marginBottom: 30, alignItems: 'flex-start',
        }}
        >
          <Header as="h3">
            {t('calculationTitle')}
          </Header>
          <EssorButton
            type="plus"
            size="tiny"
            onClick={this.showModalCalc}
            style={{
              marginLeft: 100,
            }}
            disabled={loadingCalculation}
          >
            {t('buttonEdit')}
          </EssorButton>
        </div>
        {
          typeRateInfo
        }
        <Modal
          open={showModalCalc}
          closeOnEscape
        >
          <Modal.Content
            className="form-calculation-mode"
            style={{
              overflow: 'hidden',
            }}
          >
            <Form loading={loadingUpdateCalculation || loadingCreateCalculation}>
              <div className="container-form-mode">
                <Table celled structured>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell rowSpan="2" />
                      <Table.HeaderCell colSpan="2" textAlign="center">
                        {t('calculationModalRealized')}
                        <div>
                          <Select
                            placeholder={valueSelectPast}
                            fluid
                            search
                            selection
                            options={typeCalc}
                            onChange={this.handleSelectBoxRealized}
                            value={typeRate}
                            error={typeRateError}
                            disabled={!firstCalc}
                            style={{
                              width: 'auto', display: 'inline-block', marginTop: 10,
                            }}
                          />
                        </div>
                      </Table.HeaderCell>
                      <Table.HeaderCell colSpan="2" textAlign="center">
                        {t('calculationModalProjected')}
                        <div className="select-calculation">
                          <Select
                            placeholder="Select your type"
                            fluid
                            search
                            selection
                            options={typeCalcPlanned}
                            onChange={this.handleSelectBox}
                            value={typePlanned}
                            error={typePlanedError}
                            style={{
                              width: 'auto', display: 'inline-block', marginTop: 10,
                            }}
                          />
                        </div>
                      </Table.HeaderCell>
                    </Table.Row>
                    <Table.Row>
                      <Table.HeaderCell>{t('calculationTauxMarge')}</Table.HeaderCell>
                      <Table.HeaderCell>{t('calculationCoefficient')}</Table.HeaderCell>
                      <Table.HeaderCell>{t('calculationTauxMarge')}</Table.HeaderCell>
                      <Table.HeaderCell>{t('calculationCoefficient')}</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    <Table.Row>
                      <Table.Cell>{t('calculationModalRaw')}</Table.Cell>
                      <Table.Cell>
                        <Input
                          labelPosition="left"
                          error={rawMaterialmarginRateRealisedError}
                        >
                          <Cleave
                            name="rawMaterialmarginRateRealised"
                            options={{
                              numeral: true,
                              numeralDecimalScale: 2,
                              numeralThousandsGroupStyle: 'none',
                              delimiter: '.',
                            }}
                            onChange={this.handleInputChange}
                            value={rawMaterialmarginRateRealised}
                            maxLength={7}
                            style={{
                              flex: 1,
                            }}
                            disabled={this.enabledInput('rawMaterialmarginRateRealised')}
                          />
                        </Input>
                      </Table.Cell>
                      <Table.Cell>
                        <Input
                          labelPosition="left"
                          error={rawMaterialsaleCoefficientRealisedError}
                        >

                          <Cleave
                            name="rawMaterialsaleCoefficientRealised"
                            options={{
                              numeral: true,
                              numeralDecimalScale: 2,
                              numeralThousandsGroupStyle: 'none',
                              delimiter: '.',
                            }}
                            onChange={this.handleInputChange}
                            value={rawMaterialsaleCoefficientRealised}
                            maxLength={7}
                            style={{
                              flex: 1,
                            }}
                            disabled={this.enabledInput('rawMaterialsaleCoefficientRealised')}
                          />
                        </Input>
                      </Table.Cell>
                      <Table.Cell>
                        <Input
                          labelPosition="left"
                          error={rawMaterialmarginRatePlannedError}
                        >

                          <Cleave
                            name="rawMaterialmarginRatePlanned"
                            options={{
                              numeral: true,
                              numeralDecimalScale: 2,
                              numeralThousandsGroupStyle: 'none',
                              numeralIntegerScale: 2,
                              delimiter: '.',
                            }}
                            onChange={this.handleInputChange}
                            value={rawMaterialmarginRatePlanned}
                            maxLength={7}
                            style={{
                              flex: 1,
                            }}
                            disabled={this.enabledInput('rawMaterialmarginRatePlanned')}
                          />
                        </Input>
                      </Table.Cell>
                      <Table.Cell>
                        <Input
                          labelPosition="left"
                          error={rawMaterialsaleCoefficientPlannedError}
                        >

                          <Cleave
                            name="rawMaterialsaleCoefficientPlanned"
                            options={{
                              numeral: true,
                              numeralDecimalScale: 2,
                              numeralThousandsGroupStyle: 'none',
                              delimiter: '.',
                            }}
                            onChange={this.handleInputChange}
                            value={rawMaterialsaleCoefficientPlanned}
                            style={{
                              flex: 1,
                            }}
                            disabled={this.enabledInput('rawMaterialsaleCoefficientPlanned')}
                          />
                        </Input>
                      </Table.Cell>
                    </Table.Row>
                    <TableRow>
                      <Table.Cell>{t('calculationModalGoods')}</Table.Cell>
                      <Table.Cell>
                        <Input
                          labelPosition="left"
                          error={goodsmarginRateRealisedError}
                        >

                          <Cleave
                            name="goodsmarginRateRealised"
                            options={{
                              numeral: true,
                              numeralDecimalScale: 2,
                              numeralIntegerScale: 2,
                              numeralThousandsGroupStyle: 'none',
                              delimiter: '.',
                            }}
                            onChange={this.handleInputChange}
                            value={goodsmarginRateRealised}
                            maxLength={7}
                            style={{
                              flex: 1,
                            }}
                            disabled={this.enabledInput('goodsmarginRateRealised')}
                          />
                        </Input>
                      </Table.Cell>
                      <Table.Cell>
                        <Input
                          labelPosition="left"
                          error={goodssaleCoefficientRealisedError}
                        >

                          <Cleave
                            name="goodssaleCoefficientRealised"
                            options={{
                              numeral: true,
                              numeralDecimalScale: 2,
                              numeralThousandsGroupStyle: 'none',
                              delimiter: '.',
                            }}
                            onChange={this.handleInputChange}
                            value={goodssaleCoefficientRealised}
                            maxLength={7}
                            style={{
                              flex: 1,
                            }}
                            disabled={this.enabledInput('goodssaleCoefficientRealised')}
                          />
                        </Input>
                      </Table.Cell>
                      <Table.Cell>
                        <Input
                          labelPosition="left"
                          error={goodsmarginRatePlannedError}
                        >

                          <Cleave
                            name="goodsmarginRatePlanned"
                            options={{
                              numeral: true,
                              numeralDecimalScale: 2,
                              numeralThousandsGroupStyle: 'none',
                              delimiter: '.',
                            }}
                            onChange={this.handleInputChange}
                            value={goodsmarginRatePlanned}
                            maxLength={7}
                            style={{
                              flex: 1,
                            }}
                            disabled={this.enabledInput('goodsmarginRatePlanned')}
                          />
                        </Input>
                      </Table.Cell>
                      <Table.Cell>
                        <Input
                          labelPosition="left"
                          error={goodssaleCoefficientPlannedError}
                        >

                          <Cleave
                            name="goodssaleCoefficientPlanned"
                            options={{
                              numeral: true,
                              numeralDecimalScale: 2,
                              numeralThousandsGroupStyle: 'none',
                              delimiter: '.',
                            }}
                            onChange={this.handleInputChange}
                            value={goodssaleCoefficientPlanned}
                            maxLength={7}
                            style={{
                              flex: 1,
                            }}
                            disabled={this.enabledInput('goodssaleCoefficientPlanned')}
                          />
                        </Input>
                      </Table.Cell>
                    </TableRow>
                  </Table.Body>
                </Table>
              </div>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <div>
              <EssorButton type="check" onClick={this.handleOnSubmit} size="small" disabled={loadingUpdateCalculation || loadingCreateCalculation}>
                {t('buttonSave')}
              </EssorButton>
              <EssorButton secondary type="x" size="small" onClick={this.closeModalCalc} disabled={loadingUpdateCalculation || loadingCreateCalculation}>
                {t('buttonCancel')}
              </EssorButton>
            </div>
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  getCalculation: page => dispatch(listCalculation(page)),

  postCalculation: data => dispatch(createCalculation(data)),
  updateCalculation: (item, data) => dispatch(updateCalculation(item, data)),

  resetCreateCalculation: () => {
    dispatch(successCalculation(null));
    dispatch(loadingCreateCalculation(false));
    dispatch(errorCreateCalculation(null));
  },

  resetUpdateCalculation: () => dispatch(resetUpdateCalculation()),
  resetCalculationList: () => dispatch(resetCalculation()),

  reset: () => {
    dispatch(resetCalculation());
  },

});


const mapStateToProps = state => ({

  retrieved: state.fiscalYear.show.retrieved,
  loading: state.fiscalYear.show.loading,
  error: state.fiscalYear.show.error,

  dataCalculation: state.calculationMode.list.data,
  loadingCalculation: state.calculationMode.list.loading,
  errorCalculation: state.calculationMode.list.error,

  updatedCalculation: state.calculationMode.update.updated,
  loadingUpdateCalculation: state.calculationMode.update.updateLoading,
  errorUpdateCalculation: state.calculationMode.update.updateError,
  successCalculation: state.calculationMode.create.created,
  loadingCreateCalculation: state.calculationMode.create.loading,
  errorCreateCalculation: state.calculationMode.create.error,

});

const Main = connect(mapStateToProps, mapDispatchToProps)(CalculateMode);

export default withNamespaces('translation')(withRouter(Main));
