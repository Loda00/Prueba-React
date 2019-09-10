import React, { Component } from 'react';
import { Link, Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { create, error, loading, success } from 'actions/self-financing/create';
import { update as updateSelfFinancing, reset as resetUpdateSelfFinancing } from 'actions/self-financing/update';
import { Form, Grid, Message, Header } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class CreateSelfFinancing extends Component {
  state = {
    selfFinancing: null,
    operatingProfit: '',
    provisionAndDepreciation: '',
    result: '',
    operatingProfitError: false,
    provisionAndDepreciationError: false,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      !isEmpty(nextProps.retrievedSelfFinancing['hydra:member'])
      && prevState.selfFinancing !== nextProps.retrievedSelfFinancing['hydra:member'][0]
    ) {
      return {
        selfFinancing: nextProps.retrievedSelfFinancing['hydra:member'][0],
        operatingProfit: nextProps.retrievedSelfFinancing['hydra:member'][0].operatingProfit,
        provisionAndDepreciation: nextProps.retrievedSelfFinancing['hydra:member'][0].provisionAndDepreciation,
        result: nextProps.retrievedSelfFinancing['hydra:member'][0].result,
      };
    }

    return null;
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  handleInputBlur = (e) => {
    if (!Number.isNaN(parseFloat(e.target.value))) {
      this.setState({
        [e.target.name]: parseFloat(e.target.value).toFixed(2),
      });
    } else {
      this.setState({
        [e.target.name]: e.target.value,
      });
    }
  };

  handleInputChange = (e) => {
    e.preventDefault();
    const {
      operatingProfit,
      provisionAndDepreciation,
    } = this.state;

    const { selectedFiscalYear } = this.props;

    let { dateStart, dateEnd } = selectedFiscalYear;

    dateStart = moment(dateStart);
    dateEnd = moment(dateEnd);

    const totalMonths = (moment(dateEnd).year() - moment(dateStart).year()) * 12 - dateStart.month() + dateEnd.month() + 1; // eslint-disable-line

    this.setState({
      [e.target.name]: e.target.value,
    });

    switch (e.target.name) {
      case 'operatingProfit':
        if (!Number.isNaN(parseFloat(provisionAndDepreciation))
          && !Number.isNaN(parseFloat(e.target.value))) {
          this.setState({
            result:
              (parseFloat(provisionAndDepreciation) + parseFloat(e.target.value)) / totalMonths,
          });
        }
        break;
      case 'provisionAndDepreciation':
        if (!Number.isNaN(parseFloat(operatingProfit))
          && !Number.isNaN(parseFloat(e.target.value))) {
          this.setState({
            result: (parseFloat(operatingProfit) + parseFloat(e.target.value)) / totalMonths,
          });
        }
        break;
      default:
        break;
    }
  };

  handleOnSubmit = () => {
    const {
      selfFinancing,
      operatingProfit,
      provisionAndDepreciation,
      result,
    } = this.state;

    const { postSelfFinancing, updateSelfFinancing, selectedFiscalYear } = this.props;

    let isValid = true;

    this.setState({
      operatingProfitError: false,
      provisionAndDepreciationError: false,
    });

    if (operatingProfit.trim() === '' || Number.isNaN(parseFloat(operatingProfit))) {
      isValid = false;

      this.setState({
        operatingProfitError: true,
      });
    }

    if (provisionAndDepreciation.trim() === '' || Number.isNaN(parseFloat(provisionAndDepreciation))) {
      isValid = false;

      this.setState({
        provisionAndDepreciationError: true,
      });
    }

    if (!isValid) return;

    const data = {
      operatingProfit,
      provisionAndDepreciation,
      result: result.toString(),
      fiscalYear: selectedFiscalYear['@id'],
    };

    selfFinancing ? updateSelfFinancing(selfFinancing, data) : postSelfFinancing(data);
  };

  render() {
    const {
      selfFinancing,
      operatingProfit,
      provisionAndDepreciation,
      result,
      operatingProfitError,
      provisionAndDepreciationError,
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
          to="/forecast/self-financing"
        />
      );
    }

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">
              {selfFinancing ? t('selfFinancingsUpdateTitle') : t('selfFinancingsCreateTitle')}
            </Header>

            <EssorButton
              as={Link}
              to="/forecast/self-financing"
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
                    <Form.Input
                      label={t('formOperatingProfit')}
                      name="operatingProfit"
                      placeholder={t('formPHOperatingProfit')}
                      value={operatingProfit}
                      onChange={this.handleInputChange}
                      onBlur={this.handleInputBlur}
                      error={operatingProfitError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formProvisionAndDepreciation')}
                      name="provisionAndDepreciation"
                      placeholder={t('formPHProvisionAndDepreciation')}
                      value={provisionAndDepreciation}
                      onChange={this.handleInputChange}
                      onBlur={this.handleInputBlur}
                      error={provisionAndDepreciationError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formResult')}
                      readOnly
                      name="result"
                      placeholder={t('formPHResult')}
                      value={result ? parseFloat(result).toFixed(2) : ''}
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
  postSelfFinancing: data => dispatch(create(data)),
  updateSelfFinancing: (item, values) => dispatch(updateSelfFinancing(item, values)),
  reset: () => {
    dispatch(success(null));
    dispatch(loading(false));
    dispatch(error(null));
    dispatch(resetUpdateSelfFinancing());
  },
});

const mapStateToProps = state => ({
  selectedFiscalYear: state.userCompanies.select.selectedFiscalYear,

  success: state.selfFinancing.create.created,
  loading: state.selfFinancing.create.loading,
  error: state.selfFinancing.create.error,

  retrievedSelfFinancing: state.selfFinancing.show.retrieved,
  retrieveError: state.selfFinancing.show.error,
  retrieveLoading: state.selfFinancing.show.loading,

  updateError: state.selfFinancing.update.updateError,
  updateLoading: state.selfFinancing.update.updateLoading,
  updated: state.selfFinancing.update.updated,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(CreateSelfFinancing);

export default withNamespaces('translation')(withRouter(Main));
