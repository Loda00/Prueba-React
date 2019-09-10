import React, { Component } from 'react';
import { Link, withRouter, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import Cleave from 'cleave.js/react';
import { create, error, loading, success } from 'actions/working-capital/create';
import { update as updateWorkingCapital, reset as resetUpdateWorkingCapital } from 'actions/working-capital/update';
import { Form, Grid, Header, Input, Label, Message } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class WorkingCapitalForm extends Component {
  state = {
    workingCapital: null,
    inventoryValue: '',
    inventoryVAT: '',
    customerPayables: '',
    supplierDebts: '',
    fiscalDebts: '',
    otherDebts: '',
    result: '',

    inventoryValueError: false,
    inventoryVATError: false,
    customerPayablesError: false,
    supplierDebtsError: false,
    fiscalDebtsError: false,
    otherDebtsError: false,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      !isEmpty(nextProps.retrievedWorkingCapital['hydra:member'])
      && prevState.workingCapital !== nextProps.retrievedWorkingCapital['hydra:member'][0]
    ) {
      return {
        workingCapital: nextProps.retrievedWorkingCapital['hydra:member'][0],
        inventoryValue: nextProps.retrievedWorkingCapital['hydra:member'][0].inventoryValue,
        inventoryVAT: nextProps.retrievedWorkingCapital['hydra:member'][0].inventoryVAT,
        customerPayables: nextProps.retrievedWorkingCapital['hydra:member'][0].customerPayables,
        supplierDebts: nextProps.retrievedWorkingCapital['hydra:member'][0].supplierDebts,
        fiscalDebts: nextProps.retrievedWorkingCapital['hydra:member'][0].fiscalDebts,
        otherDebts: nextProps.retrievedWorkingCapital['hydra:member'][0].otherDebts,
        result: nextProps.retrievedWorkingCapital['hydra:member'][0].result,
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

    const { name, value } = e.target;

    let {
      inventoryValue,
      inventoryVAT,
      customerPayables,
      supplierDebts,
      fiscalDebts,
      otherDebts,
    } = this.state;

    const errorFormat = `${name}Error`;

    this.setState({
      [name]: value,
    });

    if (!isEmpty(value)) {
      this.setState({
        [errorFormat]: false,
      });
    }

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

    if (Number(inventoryVAT) < 100) {
      this.setState({
        inventoryVATError: false,
      });
    } else {
      this.setState({
        inventoryVATError: true,
      });
    }
    if (
      (!isEmpty(inventoryVAT) && Number(inventoryVAT) < 100)
      && !isEmpty(customerPayables)
      && !isEmpty(supplierDebts)
      && !isEmpty(fiscalDebts)
      && !isEmpty(otherDebts)
      && !isEmpty(inventoryValue)
    ) {
      this.setState({
        result:
          parseFloat(
            (parseFloat(inventoryValue) * (1 + parseFloat(inventoryVAT) / 100))
            + (parseFloat(customerPayables)
            - (parseFloat(supplierDebts) + parseFloat(fiscalDebts) + parseFloat(otherDebts))),
          ).toFixed(2),
      });
    }
  };

  handleOnSubmit = () => {
    const {
      workingCapital,
      inventoryValue,
      inventoryVAT,
      customerPayables,
      supplierDebts,
      fiscalDebts,
      otherDebts,
      result,
    } = this.state;

    const { postWorkingCapital, updateWorkingCapital, selectedFiscalYear } = this.props;

    let isValid = true;

    this.setState({
      inventoryValueError: false,
      inventoryVATError: false,
      customerPayablesError: false,
      supplierDebtsError: false,
      fiscalDebtsError: false,
      otherDebtsError: false,
    });

    if (inventoryValue === '' || Number.isNaN(parseFloat(inventoryValue)) || (parseFloat(inventoryValue) < 0)) {
      isValid = false;

      this.setState({
        inventoryValueError: true,
      });
    }

    if (inventoryVAT === '' || Number.isNaN(parseFloat(inventoryVAT)) || (parseFloat(inventoryVAT) < 0)) {
      isValid = false;

      this.setState({
        inventoryVATError: true,
      });
    }

    if (customerPayables === '' || Number.isNaN(parseFloat(customerPayables)) || (parseFloat(customerPayables) < 0)) {
      isValid = false;

      this.setState({
        customerPayablesError: true,
      });
    }

    if (supplierDebts === '' || Number.isNaN(parseFloat(supplierDebts)) || (parseFloat(supplierDebts) < 0)) {
      isValid = false;

      this.setState({
        supplierDebtsError: true,
      });
    }

    if (fiscalDebts === '' || Number.isNaN(parseFloat(fiscalDebts)) || (parseFloat(fiscalDebts) < 0)) {
      isValid = false;

      this.setState({
        fiscalDebtsError: true,
      });
    }

    if (otherDebts === '' || Number.isNaN(parseFloat(otherDebts)) || (parseFloat(otherDebts) < 0)) {
      isValid = false;

      this.setState({
        otherDebtsError: true,
      });
    }

    if (!isValid) return;

    const data = {
      fiscalYear: selectedFiscalYear['@id'],
      inventoryValue,
      inventoryVAT,
      customerPayables,
      supplierDebts,
      fiscalDebts,
      otherDebts,
      result: result.toString(),
    };

    workingCapital ? updateWorkingCapital(workingCapital, data) : postWorkingCapital(data);
  };

  render() {
    const {
      workingCapital,
      inventoryValue,
      inventoryVAT,
      customerPayables,
      supplierDebts,
      fiscalDebts,
      otherDebts,
      result,

      inventoryValueError,
      inventoryVATError,
      customerPayablesError,
      supplierDebtsError,
      fiscalDebtsError,
      otherDebtsError,
    } = this.state;

    const {
      loading,
      error,
      success,
      retrieveLoading,
      updateLoading,
      updated,
      t,
    } = this.props;

    if (success || updated) {
      return (
        <Redirect
          push
          to="/forecast/working-capital"
        />
      );
    }

    const cleaveOptions = {
      numeral: true,
      numeralIntegerScale: 6,
      numeralDecimalScale: 3,
      numeralThousandsGroupStyle: 'none',
      delimiter: '.',
    };

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">
              {workingCapital ? t('workingCapitalUpdateTitle') : t('workingCapitalCreateTitle')}
            </Header>

            <EssorButton
              as={Link}
              to="/forecast/working-capital"
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
                <Form className="margin-top-bot main-form" loading={loading || retrieveLoading || updateLoading} size="small">

                  <Form.Group inline>
                    <Form.Field error={inventoryValueError}>
                      <label>{t('formInventoryValue')}</label>
                      <Input labelPosition="left">
                        <Cleave
                          options={cleaveOptions}
                          onChange={this.handleInputChange}
                          name="inventoryValue"
                          placeholder="inventoryValue"
                          value={inventoryValue}
                        />
                      </Input>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field error={inventoryVATError}>
                      <label>{t('formInventoryVAT')}</label>
                      <Input labelPosition="left">
                        <Label>%</Label>
                        <Cleave
                          label="%"
                          options={{
                            numeral: true,
                            numeralIntegerScale: 3,
                            numeralDecimalScale: 2,
                            numeralThousandsGroupStyle: 'none',
                            delimiter: '.',
                          }}
                          onChange={this.handleInputChange}
                          name="inventoryVAT"
                          placeholder="inventoryVAT"
                          value={inventoryVAT}
                        />
                      </Input>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field error={customerPayablesError}>
                      <label>{t('formCustomerPayables')}</label>
                      <Input labelPosition="left">
                        <Cleave
                          options={cleaveOptions}
                          onChange={this.handleInputChange}
                          name="customerPayables"
                          placeholder="customerPayables"
                          value={customerPayables}
                        />
                      </Input>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field error={supplierDebtsError}>
                      <label>{t('formSupplierDebts')}</label>
                      <Input labelPosition="left">
                        <Cleave
                          options={cleaveOptions}
                          onChange={this.handleInputChange}
                          name="supplierDebts"
                          placeholder="supplierDebts"
                          value={supplierDebts}
                        />
                      </Input>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field error={fiscalDebtsError}>
                      <label>{t('formFiscalDebts')}</label>
                      <Input labelPosition="left">
                        <Cleave
                          options={cleaveOptions}
                          onChange={this.handleInputChange}
                          name="fiscalDebts"
                          placeholder="fiscalDebts"
                          value={fiscalDebts}
                        />
                      </Input>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field error={otherDebtsError}>
                      <label>{t('formOtherDebts')}</label>
                      <Input labelPosition="left">
                        <Cleave
                          options={cleaveOptions}
                          onChange={this.handleInputChange}
                          name="otherDebts"
                          placeholder="otherDebts"
                          value={otherDebts}
                        />
                      </Input>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formWCResult')}</label>
                      <h5 className="informative-field">{result}</h5>
                    </Form.Field>
                  </Form.Group>

                  {result > 0 && (
                    <Message>
                      <p>{t('formResultPositive')}</p>
                    </Message>
                  )}

                  <EssorButton type="check" submit onClick={this.handleOnSubmit} size="small">
                    {t('buttonSave')}
                  </EssorButton>

                  {error
                  && (
                    <Message negative>
                      <p>{error}</p>
                    </Message>
                  )}
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
  postWorkingCapital: data => dispatch(create(data)),
  updateWorkingCapital: (item, values) => dispatch(updateWorkingCapital(item, values)),
  reset: () => {
    dispatch(success(null));
    dispatch(loading(false));
    dispatch(error(null));
    dispatch(resetUpdateWorkingCapital());
  },
});

const mapStateToProps = state => ({
  selectedFiscalYear: state.userCompanies.select.selectedFiscalYear,

  success: state.workingCapital.create.created,
  loading: state.workingCapital.create.loading,
  error: state.workingCapital.create.error,

  retrievedWorkingCapital: state.workingCapital.show.retrieved,
  retrieveError: state.workingCapital.show.error,
  retrieveLoading: state.workingCapital.show.loading,

  updateError: state.workingCapital.update.updateError,
  updateLoading: state.workingCapital.update.updateLoading,
  updated: state.workingCapital.update.updated,

});

const Main = connect(mapStateToProps, mapDispatchToProps)(WorkingCapitalForm);

export default withNamespaces('translation')(withRouter(Main));
