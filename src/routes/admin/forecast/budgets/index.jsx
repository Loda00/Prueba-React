import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty, find, padEnd, sortBy, findIndex, replace } from 'lodash';
import papa from 'papaparse';
import { list as listBudget, listPrev as listPrevBudget, resetActual as resetActualBudget, resetPrev as resetPreviousBudget } from 'actions/budget/list';
import { create as createBudget, error as errorCreateBudget, loading as loadingCreateBudget, success as successBudget } from 'actions/budget/create';
import { update as updateBudget, reset as resetUpdateBudget } from 'actions/budget/update';
import { list as listSelfFinancing, reset as resetSelfFinancing } from 'actions/self-financing/list';
import { update as updateFiscalYear, reset as resetFiscalYearUpdate } from 'actions/fiscal-year/update';
import { retrieve as retrieveFiscalYear, reset as resetFiscalYear } from 'actions/fiscal-year/show';
import { Button, Dimmer, Dropdown, Form, Grid, Header, Input, Label, Loader, Segment, Table, Modal, Message } from 'semantic-ui-react';
import Cleave from 'cleave.js/react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';
import classnames from 'classnames';
import csvFr from 'assets/csv/fr.csv';

class ShowBudgets extends Component {
  state = {
    showBudgetModalOpen: false,
    createBudgetModalOpen: false,
    results: {},
    selectedAccount: null,
    loadingAccounts: true,
    isActualBudgetLoaded: false,
    actualBudgetData: null,
    previousBudgetData: null,
    budgetToShow: null,
    previousFilteredBudget: null,
    isBudgetEdit: null,
    account: '',
    budgetLabel: '',
    type: null,
    realised: '',
    planned: '',
    percentage: '',
    vat: '',
    vatTemporal: '0',
    realizedResult: '',

    allocated: false,
    accountError: false,
    budgetLabelError: false,
    typeError: false,
    realisedError: false,
    plannedError: false,
    vatError: false,
    realizedResultError: false,

    accountsData: [],
    accountsDataFilter: [],

    enableAutocomplete: false,
    valueInputSelectAccount: '',
    enterSearchAccount: false,
    compareRealizedResult: false,
  };

  componentDidMount() {
    const {
      getBudgets,
      getSelfFinancing,
      getPreviousFiscalYear,
      selectedFiscalYear,
      selectedCompany,
    } = this.props;

    getBudgets(`/budgets?fiscalYear=${selectedFiscalYear.id}`);
    getSelfFinancing(`/self_financings?fiscalYear=${selectedFiscalYear.id}`);
    getPreviousFiscalYear(`/fiscal_years?company=${selectedCompany.id}&dateEnd[before]=${selectedFiscalYear.dateStart}`);

    papa.parse(csvFr, {
      delimiter: ';',
      download: true,
      complete: (results) => {
        this.setState({
          results,
          loadingAccounts: false,
        });
      },
    });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      !isEmpty(nextProps.selectedFiscalYear)
      && prevState.realizedResult !== nextProps.selectedFiscalYear.realizedResult
    ) {
      return {
        realizedResult: nextProps.selectedFiscalYear.realizedResult,
      };
    }

    if (!isEmpty(nextProps.dataSelfFinancing) && prevState.selfFinancingData !== nextProps.dataSelfFinancing['hydra:member']) {
      return {
        selfFinancingData: nextProps.dataSelfFinancing['hydra:member'],
      };
    }

    if (!isEmpty(nextProps.dataPrevBudget) && nextProps.dataPrevBudget['hydra:member'] !== prevState.previousBudgetData) {
      return {
        previousBudgetData: nextProps.dataPrevBudget['hydra:member'],
      };
    }

    if (nextProps.successBudget || nextProps.updatedBudget) {
      const {
        resetCreateBudget,
        resetUpdateBudget,
      } = nextProps;

      const { actualBudgetData, accountsDataFilter } = prevState;

      if (nextProps.successBudget) {
        actualBudgetData.push(nextProps.successBudget);
      } else if (nextProps.updatedBudget) {
        const indexBg = findIndex(actualBudgetData, {
          '@id': nextProps.updatedBudget['@id'],
        });
        const indexFilterData = findIndex(accountsDataFilter, {
          key: nextProps.updatedBudget.account,
        });
        accountsDataFilter[indexFilterData].text = `${nextProps.updatedBudget.account} - ${nextProps.updatedBudget.label}`;
        accountsDataFilter[indexFilterData].value = `{"account": "${nextProps.updatedBudget.account}", "label": "${nextProps.updatedBudget.label}"}`;
        actualBudgetData[indexBg] = nextProps.updatedBudget;
      }
      resetCreateBudget();
      resetUpdateBudget();
      return {
        selectedAccount: null,
        actualFilteredBudget: null,
        previousFilteredBudget: null,
        account: '',
        budgetLabel: '',
        type: null,
        realised: '',
        planned: '',
        vat: '',
        isActualBudgetLoaded: false,
        createBudgetModalOpen: false,
        actualBudgetData,
        accountsDataFilter,
      };
    }

    if (!isEmpty(nextProps.dataBudget)
      && !prevState.isActualBudgetLoaded
      && !(nextProps.loadingCreateBudget
        || nextProps.loadingUpdateBudget)) {
      return {
        actualBudgetData: nextProps.dataBudget['hydra:member'],
        isActualBudgetLoaded: true,
      };
    }

    if (!isEmpty(prevState.actualBudgetData)) {
      const { actualBudgetData, accountsDataFilter } = prevState;
      prevState.actualBudgetData.map((e) => {
        if (isEmpty(find(prevState.accountsDataFilter, {
          key: e.account,
        }))) {
          const setAccountZero = e.account;
          if (isEmpty(find(prevState.accountsDataFilter, {
            key: setAccountZero,
          }))) {
            prevState.accountsDataFilter.push({
              key: setAccountZero,
              text: `${setAccountZero} - ${e.label}`,
              value: `{"account": "${setAccountZero}","label": "${e.label}"}`,
            });
          }
        }

        return {
          actualBudgetData,
          accountsDataFilter,
        };
      });
    }

    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    const { createBudgetModalOpen } = this.state;

    const {
      retrievedFiscalYear,
      getPrevBudgets,
    } = this.props;

    if (!isEmpty(retrievedFiscalYear) && retrievedFiscalYear !== prevProps.retrievedFiscalYear) {
      if (retrievedFiscalYear['hydra:member'].length > 0) {
        const data = retrievedFiscalYear['hydra:member'];
        const previousFiscalYear = data[data.length - 1];

        getPrevBudgets(`/budgets?fiscalYear=${previousFiscalYear.id}`);
      }
    }

    if ((prevState.createBudgetModalOpen !== createBudgetModalOpen)) {
      this.updateSelectedFilter();
    }

    this.filterAccountData();
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  updateSelectedFilter = () => {
    const { selectedAccount, accountsDataFilter, valueInputSelectAccount } = this.state;
    const select = JSON.parse(selectedAccount);
    if (selectedAccount
      && select.account
      && isEmpty(accountsDataFilter.filter(item => item.text.includes(valueInputSelectAccount)))) {
      accountsDataFilter.push({
        key: valueInputSelectAccount,
        text: `${valueInputSelectAccount}`,
        value: `{"account": "${valueInputSelectAccount}","label": ""}`,
      });
      this.setState({
        accountsDataFilter,
      });
    }
  };

  filterAccountData = () => {
    const { accountsData, accountsDataFilter, results } = this.state;

    if (isEmpty(accountsData) && results.data) {
      this.setState({
        accountsData: results.data.map(item => ({
          key: item[0],
          text: `${item[0]} - ${item[1]}`,
          value: JSON.stringify({
            account: item[0],
            label: item[1],
          }),
        })),
      });
    }

    if (!isEmpty(accountsData) && isEmpty(accountsDataFilter)) {
      this.setState({
        accountsDataFilter: accountsData.filter(f => f.key.startsWith('6') || f.key.startsWith('7')),
      });
    }
  };

  submitModal = (e) => {
    if (e.ctrlKey && e.keyCode === 13) {
      this.handleBudgetSubmit();
    }
  };

  openCreateBudgetModal = (budget, isBudgetEdit) => {
    const { vatTemporal, valueInputSelectAccount, type } = this.state;

    const regex = /^[A-Za-z].*$/;

    const objectFromLabel = regex.test(budget);

    if (!objectFromLabel && typeof budget === 'string') {
      budget = JSON.parse(budget);
    }
    window.addEventListener('keydown', this.submitModal);
    this.setState({
      isBudgetEdit: isBudgetEdit ? budget : null,
      account: objectFromLabel
        ? ''
        : budget.account ? padEnd(budget.account, 9, '0') : padEnd(valueInputSelectAccount, 9, '0'),
      budgetLabel: objectFromLabel
        ? budget
        : budget.label,
      type: isBudgetEdit ? budget.type : type,
      realised: isBudgetEdit ? budget.realised : '0.00',
      planned: budget.planned ? budget.planned : '0.00',
      percentage: isBudgetEdit ? this.getPercentage(budget.realised, budget.planned) : '0.00',
      vat: budget.vat ? budget.vat : vatTemporal,
      allocated: budget.allocated === 'Yes',
      createBudgetModalOpen: true,
      createFromLabel: objectFromLabel,
      fromLabelDisableFields: objectFromLabel,
      accountFormatError: false,
      accountError: false,
    });
  };

  closeCreateBudgetModal = () => {
    this.setState({
      createBudgetModalOpen: false,
      account: '',
      budgetLabel: '',
      type: null,
      realised: '',
      planned: '',
      vat: '',
      allocated: false,
    });
  };

  closeShowBudget = () => {
    this.setState({
      budgetToShow: null,
      showBudgetModalOpen: false,
    });
  };

  getPercentage = (realised, planned) => {
    const p = parseFloat(planned);
    const r = parseFloat(realised);
    return (
      r !== 0 ? (100 * (p - r) / r).toFixed(2) : 0
    );
  };

  handleSelectChange = (e, obj) => {
    e.preventDefault();

    this.setState({
      [obj.name]: obj.value,
    });
  };

  completeAccountFormat = (e) => {
    const { rawValue } = e.target;

    if (rawValue !== '') {
      this.setState({
        account: padEnd(rawValue, 9, '0'),
      });
    }
  };

  handleInputChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    const {
      realizedResult,
      compareRealizedResult,
      planned,
      realised,
    } = this.state;

    this.setState({
      [name]: value,
    }, () => {
      const { createFromLabel, account, budgetLabel } = this.state;

      if (createFromLabel) {
        this.setState({
          fromLabelDisableFields: account.trim() === '' || budgetLabel.trim() === '',
        });
      }

      this.setState({
        accountFormatError: account.trim() !== '' && !account.startsWith('6') && !account.startsWith('7'),
        accountError: account.trim() !== '' && !account.startsWith('6') && !account.startsWith('7'),
      });
    });

    if (name === 'vat') {
      this.setState({
        vatTemporal: value,
      });
    }

    if (name === 'realizedResult') {
      this.setState({
        compareRealizedResult: true,
      });

      if (realizedResult.length === 6 && !(realizedResult.includes('.'))) {
        this.setState({
          realizedResult: `${realizedResult}.`,
        });
      }
      if (compareRealizedResult) {
        window.addEventListener('keydown', this.submitRealizedResult);
      }
    }

    switch (name) {
      case 'planned':
        if (realised.trim() !== '') {
          this.setState({
            percentage: this.getPercentage(realised, value),
          });
        }
        break;
      case 'realised':
        if (planned.trim() !== '' && (value).trim() !== '') {
          this.setState({
            percentage: this.getPercentage(value, planned),
          });
        }
        break;
      default: break;
    }
  };

  handleCheckBoxChange = (e) => {
    e.preventDefault();

    this.setState(prevState => (
      {
        allocated: !prevState.allocated,
      }
    ));
  };

  handleOnBlurSelect = () => {
    const { selectedAccount } = this.state;
    if (isEmpty(selectedAccount)) {
      this.resetBudgetList();
    }
  };

  handleBlurResult = () => {
    const { compareRealizedResult } = this.state;
    if (compareRealizedResult) {
      this.handleResultFiscalYearSubmit();
    }
  };

  inputValueAccount = (e) => {
    const { accountsDataFilter, createAccountObject, selectedAccount } = this.state;

    this.setState({
      enterSearchAccount: false,
      enableAutocomplete: false,
    });

    if (isEmpty(e.target.value)) {
      this.setState({
        valueInputSelectAccount: '',
      });
      this.resetBudgetList();
    } else {
      this.setState({
        valueInputSelectAccount: padEnd(e.target.value, '9', 0),
      });
    }
    if ((createAccountObject && ((e.target.value).length === 1)) || selectedAccount) {
      // when typing an account that does not exist, a placeholder is added
      // in the dropdown list (Add XXXX) and is added to accountDataFilter in last
      // position. After object creation we need to remove it using pop so that
      // the placeholder does not appear again
      accountsDataFilter.pop();
      this.setState({
        createAccountObject: false,
      });
    }

    const regex = /^[A-Za-z].*$/;

    if (e.target.value.startsWith('6') || e.target.value.startsWith('7') || regex.test(e.target.value)) {
      if (isEmpty(accountsDataFilter.filter(item => item.text.includes(e.target.value)))) {
        this.setState({
          enableAutocomplete: true,
        });
      } else {
        this.setState({
          enableAutocomplete: false,
        });
      }
    }
  };

  handleAccountChange = (e, { value }) => {
    const {
      actualBudgetData,
      previousBudgetData,
      valueInputSelectAccount,
      accountsDataFilter,
    } = this.state;

    const regex = /^[A-Za-z].*$/;

    const selectedAccount = !regex.test(value)
      ? JSON.parse(value)
      : value;

    const newAccTarget = padEnd(selectedAccount.account, 9, '0');

    const onActual = find(actualBudgetData, {
      account: newAccTarget,
    });

    if (isEmpty(selectedAccount.account)) {
      this.setState({
        accountsDataFilter,
        createAccountObject: true,
        selectedAccount: !regex.test(e.target.value)
          ? `{"account": "${valueInputSelectAccount}","label": ""}`
          : `{"account": "","label": "${valueInputSelectAccount}"}`,
      });
    } else {
      this.setState({
        selectedAccount: value,
        enterSearchAccount: true,
        createAccountObject: false,
      });
    }

    const actualAccount = valueInputSelectAccount;
    if (actualAccount.startsWith('60')
      || actualAccount.startsWith('611')
      || actualAccount.startsWith('615')
      || actualAccount.startsWith('617')
      || actualAccount.startsWith('618')
      || actualAccount.startsWith('619')
      || actualAccount.startsWith('621')
      || actualAccount.startsWith('622')
      || actualAccount.startsWith('623')
      || actualAccount.startsWith('624')
      || actualAccount.startsWith('625')
      || actualAccount.startsWith('626')
      || actualAccount.startsWith('628')
      || actualAccount.startsWith('629')
      || actualAccount.startsWith('66')
      || actualAccount.startsWith('67')
      || actualAccount.startsWith('69')
    ) {
      this.setState({
        type: 'CV',
      });
    }

    if (actualAccount.startsWith('612')
      || actualAccount.startsWith('613')
      || actualAccount.startsWith('614')
      || actualAccount.startsWith('616')
      || actualAccount.startsWith('627')
      || actualAccount.startsWith('63')
      || actualAccount.startsWith('64')
      || actualAccount.startsWith('65')
      || actualAccount.startsWith('68')
    ) {
      this.setState({
        type: 'CF',
      });
    }
    const onPrev = find(previousBudgetData, {
      account: padEnd(selectedAccount.account, 9, '0'),
    });

    this.setState({
      previousFilteredBudget: onPrev || {},
    });
    if (!isEmpty(onActual) && e.keyCode === 13) {
      this.openCreateBudgetModal(onActual, true);
    } else if (isEmpty(onActual) && e.keyCode === 13) {
      this.openCreateBudgetModal(
        selectedAccount,
        false,
      );
    }
  };

  resetBudgetList = () => {
    this.setState({
      selectedAccount: null,
      previousFilteredBudget: null,
      valueInputSelectAccount: '',
    });
  };

  submitRealizedResult = (e) => {
    const { compareRealizedResult } = this.state;
    if (e.key === 'Enter' && compareRealizedResult) {
      this.handleResultFiscalYearSubmit();
    }
  };

  handleResultFiscalYearSubmit = () => {
    const { realizedResult } = this.state;
    const { updateFiscalYear, selectedFiscalYear } = this.props;
    let isValidResult = true;
    this.setState({
      realizedResultError: false,
    });

    if (realizedResult === '') {
      isValidResult = false;
      this.setState({
        realizedResultError: true,
      });
    }

    if (!isValidResult) return;

    const data = {
      realizedResult,
    };
    updateFiscalYear(selectedFiscalYear, data).then(
      this.setState({
        compareRealizedResult: false,
      }),
    );
  };

  handleBudgetSubmit = () => {
    const {
      createFromLabel,
      account,
      budgetLabel,
      type,
      realised,
      planned,
      vat,
      allocated,
      isBudgetEdit,
    } = this.state;

    const {
      selectedFiscalYear,
      postBudget,
      updateBudget,
    } = this.props;

    const id = selectedFiscalYear['@id'];

    let isValid = true;

    this.setState({
      accountError: false,
      budgetLabelError: false,
      typeError: false,
      realisedError: false,
      plannedError: false,
      vatError: false,
    });

    if (createFromLabel && (account.trim() === '' || (!account.startsWith('6') && !account.startsWith('7')))) {
      isValid = false;

      this.setState({
        accountError: true,
      });
    }

    if (isEmpty(budgetLabel) || budgetLabel.trim() === '') {
      isValid = false;

      this.setState({
        budgetLabelError: true,
      });
    }

    if (account.startsWith('6') && !type) {
      isValid = false;

      this.setState({
        typeError: true,
      });
    }

    if (Number.isNaN(parseFloat(realised)) || realised.trim() === '') {
      isValid = false;

      this.setState({
        realisedError: true,
      });
    }

    if (Number.isNaN(parseFloat(planned)) || planned.trim() === '') {
      isValid = false;

      this.setState({
        plannedError: true,
      });
    }

    if (vat.trim() === '' || Number.isNaN(parseFloat(vat)) || (parseFloat(vat) < 0) || (parseFloat(vat) >= 100)) {
      isValid = false;

      this.setState({
        vatError: true,
      });
    }
    if (!isValid) return;

    const data = {
      account: padEnd(replace(account, '.', ''), 9, '0'),
      label: budgetLabel,
      type,
      realised,
      planned,
      vat,
      allocated: allocated ? 'Yes' : 'No',
      fiscalYear: id,
    };

    const resetBudget = () => this.resetBudgetList();
    isBudgetEdit
      ? updateBudget(isBudgetEdit, data).then(resetBudget)
      : postBudget(data).then(resetBudget);
  };

  accountFormat = (account) => {
    if (account.length !== 9) account = padEnd(account, 9, '0');

    const one = account.slice(0, 3);
    const two = account.slice(3, 6);
    const three = account.slice(6, 9);

    return `${one}.${two}.${three}`;
  };

  render() {
    const {
      createBudgetModalOpen,
      showBudgetModalOpen,
      account,
      budgetLabel,
      type,
      realised,
      planned,
      percentage,
      vat,
      allocated,
      realizedResult,
      accountError,
      budgetLabelError,
      typeError,
      realisedError,
      plannedError,
      vatError,
      realizedResultError,

      selectedAccount,
      loadingAccounts,
      actualBudgetData,
      budgetToShow,
      previousFilteredBudget,
      isBudgetEdit,

      accountsDataFilter,
      enableAutocomplete,
      createFromLabel,
      fromLabelDisableFields,
      accountFormatError,

      valueInputSelectAccount,
      enterSearchAccount,
    } = this.state;

    const {
      loadingFiscalYear,
      loadingSelfFinancing,
      loadingBudget,
      loadingPrevBudget,
      loadingCreateBudget,
      loadingUpdateBudget,
      t,
      updateLoading,
    } = this.props;

    const prevLoading = loadingFiscalYear || loadingPrevBudget;
    const typeOptions = [
      {
        key: '1', text: 'CV', value: 'CV',
      },
      {
        key: '2', text: 'CF', value: 'CF',
      },
    ];

    let chargesFixesRealised = 0;
    let chargesVariablesRealised = 0;
    let chargesFixesPlanned = 0;
    let chargesVariablesPlanned = 0;
    let totalProducts = 0;

    if (!(loadingCreateBudget || loadingUpdateBudget)) {
      if (actualBudgetData) {
        actualBudgetData.map((budget) => {
          if (budget.account.startsWith('6') && budget.type === 'CF') {
            chargesFixesRealised += parseFloat(budget.realised);
            chargesFixesPlanned += parseFloat(budget.planned);
          }

          if (budget.account.startsWith('6') && budget.type === 'CV') {
            chargesVariablesRealised += parseFloat(budget.realised);
            chargesVariablesPlanned += parseFloat(budget.planned);
          }

          if (budget.account.startsWith('7')) {
            totalProducts += parseFloat(budget.realised);
          }

          return null;
        });
      }
    }
    let filterSearchBudget = '';
    const selectedAccountFormat = JSON.parse(selectedAccount);
    let selectedAccountPad = '';
    if (selectedAccountFormat) {
      selectedAccountPad = padEnd(selectedAccountFormat.account, 9, '0');
    }

    if (!isEmpty(actualBudgetData)) {
      if ((!isEmpty(valueInputSelectAccount) && !enterSearchAccount) || selectedAccountFormat) {
        filterSearchBudget = actualBudgetData.filter(
          e => e.account.includes(
            !isEmpty(selectedAccountFormat)
              ? selectedAccountPad
              : valueInputSelectAccount,
          ),
        );
      } else if (
        (!isEmpty(valueInputSelectAccount)
          && enterSearchAccount)
        || selectedAccountFormat) {
        filterSearchBudget = actualBudgetData.filter(
          e => (e.account === selectedAccountFormat ? selectedAccountPad : padEnd(valueInputSelectAccount, 9, '0')),
        );
      } else {
        filterSearchBudget = '';
      }
    }

    const actualBudgetDataSort = sortBy(actualBudgetData, ['account']);
    let plannedEditDisabled = '';
    if (account) {
      plannedEditDisabled = account.startsWith('7')
        || account.startsWith('641')
        || account.startsWith('642')
        || account.startsWith('643')
        || account.startsWith('644')
        || account.startsWith('645')
        || account.startsWith('646')
        || account.startsWith('69');
    }

    return (
      <div className="section-container">

        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('budgetsHomeTitle')}</Header>
          </div>

          <Segment
            basic
            className={classnames('table-container', {
              'is-loading': loadingBudget || loadingSelfFinancing,
            })}
          >
            <Dimmer active={loadingBudget || loadingSelfFinancing} inverted>
              <Loader>{t('loading')}</Loader>
            </Dimmer>
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell />
                  <Table.HeaderCell>{t('budgetsTableCF')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('budgetsTableCV')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('budgetsTableTotalCharges')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('budgetsTableTotalProducts')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('budgetsTableResult')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('budgetsTableResultTotal')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('budgetsTableDifference')}</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                <Table.Row>
                  <Table.Cell>{t('budgetTableRealized')}</Table.Cell>
                  <Table.Cell>{chargesFixesRealised.toFixed(2)}</Table.Cell>
                  <Table.Cell>{chargesVariablesRealised.toFixed(2)}</Table.Cell>
                  <Table.Cell>
                    {(chargesFixesRealised + chargesVariablesRealised).toFixed(2)}
                  </Table.Cell>
                  <Table.Cell>{totalProducts.toFixed(2)}</Table.Cell>
                  <Table.Cell>
                    {(totalProducts - chargesFixesRealised - chargesVariablesRealised).toFixed(2)}
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Input
                      error={realizedResultError}
                    >
                      <Cleave
                        name="realizedResult"
                        onChange={this.handleInputChange}
                        value={realizedResult}
                        disabled={updateLoading}
                        maxLength={9}
                        onBlur={this.handleBlurResult}
                        options={{
                          numeral: true,
                          numeralThousandsGroupStyle: 'none',
                          numeralIntegerScale: 6,
                          numeralDecimalScale: 2,
                        }}
                      />
                    </Form.Input>
                  </Table.Cell>
                  <Table.Cell>
                    {(totalProducts - chargesFixesRealised - chargesVariablesRealised
                      - realizedResult).toFixed(2)}
                  </Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.Cell>{t('budgetTablePredictable')}</Table.Cell>
                  <Table.Cell>{chargesFixesPlanned.toFixed(2)}</Table.Cell>
                  <Table.Cell>{chargesVariablesPlanned.toFixed(2)}</Table.Cell>
                  <Table.Cell>
                    {(chargesFixesPlanned + chargesVariablesPlanned).toFixed(2)}
                  </Table.Cell>
                  <Table.Cell>-</Table.Cell>
                  <Table.Cell>-</Table.Cell>
                  <Table.Cell>-</Table.Cell>
                  <Table.Cell>-</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </Segment>


        </div>

        <div className="section-general">

          <Form className="margin-top-bot main-form" size="small">
            <Grid>
              <Grid.Row>
                <Grid.Column width={12}>
                  <Form.Group inline>
                    <Form.Select
                      id="select-account"
                      onBlur={this.handleOnBlurSelect}
                      label={t('formAccount')}
                      selectOnBlur={false}
                      control={Dropdown}
                      placeholder={t('formPHSelect')}
                      maxLength={9}
                      fluid
                      onSearchChange={this.inputValueAccount}
                      search
                      selection
                      allowAdditions={enableAutocomplete}
                      loading={loadingAccounts || loadingBudget || prevLoading}
                      disabled={loadingAccounts || loadingBudget || prevLoading}
                      noResultsMessage="No results"
                      options={accountsDataFilter}
                      onChange={this.handleAccountChange}
                      value={selectedAccount}
                    />
                  </Form.Group>
                </Grid.Column>

                <Grid.Column width={4}>
                  <Form.Group>
                    <Form.Field>
                      <EssorButton
                        size="small"
                        type="close"
                        onClick={this.resetBudgetList}
                      >
                        {t('buttonReset')}
                      </EssorButton>
                    </Form.Field>
                  </Form.Group>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Form>

          <Segment
            basic
            className={classnames('table-container', {
              'is-loading': loadingBudget,
            })}
          >
            <Dimmer active={loadingBudget} inverted>
              <Loader>{t('loading')}</Loader>
            </Dimmer>
            <Table celled striped>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>{t('formAccount')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('formLabel')}</Table.HeaderCell>
                  <Table.HeaderCell textAlign="center">{t('formRealised')}</Table.HeaderCell>
                  <Table.HeaderCell textAlign="center">{t('formPlanned')}</Table.HeaderCell>
                  <Table.HeaderCell textAlign="center">{t('formType')}</Table.HeaderCell>
                  <Table.HeaderCell />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {(actualBudgetData && !filterSearchBudget)
                && actualBudgetDataSort.map(budget => (
                  <Table.Row key={budget.account}>
                    <Table.Cell>{this.accountFormat(budget.account)}</Table.Cell>
                    <Table.Cell>{budget.label}</Table.Cell>
                    <Table.Cell textAlign="center">
                      {budget.realised}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      {budget.planned}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      {budget.type}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Button
                        className="table-button"
                        icon="edit"
                        onClick={() => this.openCreateBudgetModal(budget, true)}
                      />
                    </Table.Cell>
                  </Table.Row>
                ))}

                {(selectedAccount || valueInputSelectAccount.length > 0)
                && (
                  isEmpty(filterSearchBudget)
                    ? (
                      <Table.Row key="noFound">
                        <Table.Cell colSpan="5">No results</Table.Cell>
                        <Table.Cell textAlign="center">
                          <EssorButton
                            primary
                            size="tiny"
                            type="plus"
                            onClick={() => this.openCreateBudgetModal(
                              isEmpty(previousFilteredBudget)
                                ? selectedAccount : previousFilteredBudget,
                              false,
                            )}
                          >
                            {t('buttonCreate')}
                          </EssorButton>
                        </Table.Cell>
                      </Table.Row>
                    )
                    : (
                      filterSearchBudget.map((budget, index) => (
                        <Table.Row key={index}>
                          <Table.Cell>{this.accountFormat(budget.account)}</Table.Cell>
                          <Table.Cell>{budget.label}</Table.Cell>
                          <Table.Cell textAlign="center">
                            {budget.realised}
                          </Table.Cell>
                          <Table.Cell textAlign="center">
                            {budget.planned}
                          </Table.Cell>
                          <Table.Cell textAlign="center">
                            {budget.vat}
                          </Table.Cell>
                          <Table.Cell textAlign="center">
                            <Button
                              className="table-button"
                              icon="edit"
                              onClick={() => this.openCreateBudgetModal(budget, true)}
                            />
                          </Table.Cell>
                        </Table.Row>
                      ))
                    )
                )}
              </Table.Body>
            </Table>
          </Segment>

          <Modal
            open={showBudgetModalOpen}
            closeOnEscape
            closeOnDimmerClick
            onClose={this.closeShowBudget}
          >
            <Modal.Header>{t('budgetsShowTitle')}</Modal.Header>
            <Modal.Content scrolling>
              <Modal.Description>
                <Form className="margin-top-bot main-form" size="small">
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formAccount')}</label>
                      <h5 className="informative-field">{budgetToShow && this.accountFormat(budgetToShow.account)}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formLabel')}</label>
                      <h5 className="informative-field">{budgetToShow && budgetToShow.label}</h5>
                    </Form.Field>
                  </Form.Group>

                  {(budgetToShow && budgetToShow.type)
                  && (
                    <Form.Group inline>
                      <Form.Field>
                        <label>{t('formType')}</label>
                        <h5 className="informative-field">{budgetToShow.type}</h5>
                      </Form.Field>
                    </Form.Group>
                  )}

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formRealised')}</label>
                      <h5 className="informative-field">{budgetToShow && parseFloat(budgetToShow.realised).toFixed(2)}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formPlanned')}</label>
                      <h5 className="informative-field">{budgetToShow && parseFloat(budgetToShow.planned).toFixed(2)}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formPercentage')}</label>
                      <h5 className="informative-field">{budgetToShow && `${this.getPercentage(budgetToShow.realised, budgetToShow.planned)} %`}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formVat')}</label>
                      <h5 className="informative-field">{budgetToShow && parseFloat(budgetToShow.vat).toFixed(2)}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formAllocated')}</label>
                      <h5 className="informative-field">{budgetToShow && budgetToShow.allocated}</h5>
                    </Form.Field>
                  </Form.Group>

                </Form>
              </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
              <EssorButton secondary type="x" size="small" onClick={this.closeShowBudget}>
                {t('buttonCancel')}
              </EssorButton>
            </Modal.Actions>
          </Modal>

          <Modal
            open={createBudgetModalOpen}
            closeOnEscape={false}
            closeOnDimmerClick={false}
          >
            <Modal.Header>{isBudgetEdit ? t('budgetsUpdateTitle') : t('budgetsCreateTitle')}</Modal.Header>
            <Modal.Content scrolling>
              <Modal.Description>
                <Form className="margin-top-bot main-form" loading={loadingCreateBudget || loadingUpdateBudget} size="small">
                  <Form.Group inline>
                    <Form.Field error={accountError}>
                      <label>{t('formAccount')}</label>
                      <Input>
                        <Cleave
                          options={{
                            blocks: [3, 3, 3],
                            delimiter: '.',
                          }}
                          name="account"
                          placeholder={t('formAccount')}
                          value={account}
                          onChange={this.handleInputChange}
                          onBlur={this.completeAccountFormat}
                          readOnly={!createFromLabel}
                        />
                      </Input>
                    </Form.Field>
                  </Form.Group>

                  {accountFormatError
                  && (
                    <Form.Group inline>
                      <Form.Field error={accountError}>
                        <label />
                        <Message
                          negative
                          size="small"
                          style={{
                            margin: 0,
                          }}
                        >
                          <p>Only strings started by 6 and 7 </p>
                        </Message>
                      </Form.Field>
                    </Form.Group>
                  )}

                  <Form.Group inline>
                    <Form.Input
                      label={t('formLabel')}
                      name="budgetLabel"
                      placeholder={t('formPHLabel')}
                      value={budgetLabel}
                      onChange={this.handleInputChange}
                      error={budgetLabelError}
                    />

                  </Form.Group>

                  {account.startsWith('6')
                  && (
                    <Form.Group inline>
                      <Form.Select
                        label={t('formType')}
                        name="type"
                        placeholder={t('formPHSelect')}
                        disabled={fromLabelDisableFields}
                        value={type}
                        options={typeOptions}
                        onChange={this.handleSelectChange}
                        error={typeError}
                      />
                    </Form.Group>
                  )}

                  <Form.Group inline>
                    <Form.Field error={realisedError}>
                      <label>{t('formRealised')}</label>
                      <Input>
                        <Cleave
                          options={{
                            numeral: true,
                            numeralThousandsGroupStyle: 'none',
                            numeralDecimalScale: 2,
                          }}
                          onChange={this.handleInputChange}
                          disabled={fromLabelDisableFields}
                          name="realised"
                          placeholder={t('formPHRealised')}
                          value={realised}
                        />
                      </Input>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field error={plannedError}>
                      <label>{t('formPlanned')}</label>
                      <Input>
                        <Cleave
                          options={{
                            numeral: true,
                            numeralThousandsGroupStyle: 'none',
                            numeralDecimalScale: 2,
                          }}
                          onChange={this.handleInputChange}
                          name="planned"
                          placeholder={t('formPHPlanned')}
                          disabled={plannedEditDisabled || fromLabelDisableFields}
                          value={(plannedEditDisabled && !isBudgetEdit) ? '0.00' : planned}
                        />
                      </Input>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formPercentage')}</label>
                      <Input
                        label="%"
                        name="percentage"
                        placeholder={t('formPHPercentage')}
                        disabled={fromLabelDisableFields}
                        value={percentage}
                        readOnly
                      />
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field error={vatError}>
                      <label>{t('formVat')}</label>
                      <Input labelPosition="left">
                        <Label>%</Label>
                        <Cleave
                          options={{
                            numeral: true,
                            numeralThousandsGroupStyle: 'none',
                            numeralDecimalScale: 2,
                          }}
                          onChange={this.handleInputChange}
                          disabled={fromLabelDisableFields}
                          name="vat"
                          placeholder={t('formPHVat')}
                          value={vat}
                        />
                      </Input>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Checkbox
                      label={t('formAllocated')}
                      disabled={fromLabelDisableFields}
                      name="allocated"
                      checked={allocated}
                      onChange={this.handleCheckBoxChange}
                    />
                  </Form.Group>

                </Form>
              </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
              <EssorButton disabled={loadingCreateBudget || loadingUpdateBudget} secondary type="x" size="small" onClick={this.closeCreateBudgetModal}>
                {t('buttonCancel')}
              </EssorButton>

              <EssorButton disabled={loadingCreateBudget || loadingUpdateBudget} type="check" size="small" onClick={this.handleBudgetSubmit}>
                {t('buttonSave')}
              </EssorButton>
            </Modal.Actions>
          </Modal>
        </div>

      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  getSelfFinancing: page => dispatch(listSelfFinancing(page)),

  getBudgets: page => dispatch(listBudget(page)),
  getPrevBudgets: page => dispatch(listPrevBudget(page)),

  updateFiscalYear: (item, data) => dispatch(updateFiscalYear(item, data)),

  postBudget: data => dispatch(createBudget(data)),

  updateBudget: (item, data) => dispatch(updateBudget(item, data)),

  getPreviousFiscalYear: page => dispatch(retrieveFiscalYear(page)),
  resetCreateBudget: () => {
    dispatch(successBudget(null));
    dispatch(loadingCreateBudget(false));
    dispatch(errorCreateBudget(null));
  },
  resetUpdateBudget: () => {
    dispatch(resetUpdateBudget());
  },
  resetActualBudgetList: () => dispatch(resetActualBudget()),
  reset: () => {
    dispatch(resetFiscalYear());
    dispatch(resetActualBudget());
    dispatch(resetPreviousBudget());
    dispatch(resetSelfFinancing());
    dispatch(resetFiscalYearUpdate());
  },
});

const mapStateToProps = state => ({
  retrievedFiscalYear: state.fiscalYear.show.retrieved,
  loadingFiscalYear: state.fiscalYear.show.loading,
  errorFiscalYear: state.fiscalYear.show.error,

  dataBudget: state.budget.list.data,
  loadingBudget: state.budget.list.loading,
  errorBudget: state.budget.list.error,

  dataPrevBudget: state.budget.list.dataPrev,
  loadingPrevBudget: state.budget.list.loadingPrev,
  errorPrevBudget: state.budget.list.errorPrev,

  successBudget: state.budget.create.created,
  loadingCreateBudget: state.budget.create.loading,
  errorCreateBudget: state.budget.create.error,

  errorUpdateBudget: state.budget.update.updateError,
  loadingUpdateBudget: state.budget.update.updateLoading,
  updatedBudget: state.budget.update.updated,

  dataSelfFinancing: state.selfFinancing.list.data,
  loadingSelfFinancing: state.selfFinancing.list.loading,
  errorSelfFinancing: state.selfFinancing.list.error,

  selectedCompany: state.userCompanies.select.selectedCompany,
  selectedFiscalYear: state.userCompanies.select.selectedFiscalYear,

  updated: state.fiscalYear.update.updated,
  updateError: state.fiscalYear.update.updateError,
  updateLoading: state.fiscalYear.update.updateLoading,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(ShowBudgets);

export default withNamespaces('translation')(withRouter(Main));
