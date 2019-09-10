import React, { Component } from 'react';
import { withRouter, Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { list as listSettings, reset as resetListCompanySettings } from 'actions/company-settings/list';
import { create, error, loading, success } from 'actions/service/create';
import { retrieve as retrieveService, update as updateService, reset as resetUpdateService } from 'actions/service/update';
import { Dropdown, Form, Grid, Message, Header, Input } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';
import Cleave from 'cleave.js/react';

class CreateService extends Component {
  state = {
    company: null,
    companyList: null,
    reference: '',
    label: '',
    unit: null,
    unitPrice: '',
    companySettingsList: null,
    companyError: false,
    labelError: false,
    unitPriceError: false,
    isLoaded: false,
  };

  componentDidMount() {
    const { getCompanySettings, retrieveService, selectedCompany, match } = this.props;

    if (match.params.id) retrieveService(`/services/${match.params.id}`);

    getCompanySettings(`/company_settings?name=UNITS&company=${selectedCompany.id}`);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.retrieved && !prevState.isLoaded) {
      return {
        reference: nextProps.retrieved.reference,
        label: nextProps.retrieved.label,
        unit: nextProps.retrieved.unit,
        unitPrice: nextProps.retrieved.unitPrice,
        isLoaded: true,
      };
    }

    if (!isEmpty(nextProps.listCompany) && nextProps.listCompany['hydra:member'] !== prevState.companyList) {
      return {
        companyList: nextProps.listCompany['hydra:member'],
      };
    }

    if (nextProps.selectedCompany && prevState.company !== nextProps.selectedCompany['@id']) {
      return {
        company: nextProps.selectedCompany['@id'],
      };
    }

    if (!isEmpty(nextProps.listCompanySettings) && nextProps.listCompanySettings['hydra:member'][0] !== prevState.companySettingsList) {
      return {
        companySettingsList: nextProps.listCompanySettings['hydra:member'][0],
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

    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleSelectChange = (e, { value, name }) => {
    const prevValue = this.state[name]; // eslint-disable-line

    if (prevValue !== value) {
      this.setState({
        [name]: value,
      });

      if (name === 'supplier') {
        this.setState({
          supplyTime: JSON.parse(value).supplyTime,
        });
      }
    }
  };

  handleOnSubmit = () => {
    const {
      company,
      reference,
      label,
      unit,
      unitPrice,
    } = this.state;
    const { postService, updateService, retrieved } = this.props;
    let isValid = true;

    this.setState({
      companyError: false,
      labelError: false,
      unitError: false,
      unitPriceError: false,

    });

    if (label === '') {
      isValid = false;

      this.setState({
        labelError: true,
      });
    }

    if (!unit) {
      isValid = false;

      this.setState({
        unitError: true,
      });
    }

    if (unitPrice.trim() === '') {
      isValid = false;

      this.setState({
        unitPriceError: true,
      });
    }

    if (!isValid) return;

    const data = {
      company,
      reference,
      label,
      unit,
      unitPrice,
    };

    retrieved ? updateService(retrieved, data) : postService(data);
  };

  render() {
    const {
      companySettingsList,
      label,
      reference,
      unit,
      unitPrice,
      unitError,
      labelError,
      unitPriceError,
    } = this.state;

    const {
      success,
      updated,
      error,
      loading,
      retrieveLoading,
      updateLoading,
      updateError,
      loadingCompanySettings,
      match,
      t,
    } = this.props;

    const updateID = match.params.id;
    let companySettings = [];

    if (companySettingsList && companySettingsList.value.length > 0) {
      companySettings = companySettingsList.value.map((setting, index) => ({
        key: index,
        text: setting.label,
        value: setting.unit,
      }));
    }


    if (success || updated) {
      return (
        <Redirect
          push
          to={updated ? `/articles/services/${updateID}` : `/articles/services/${success.id}`}
        />
      );
    }

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">
              {updateID ? t('servicesUpdateTitle') : t('servicesCreateTitle')}
            </Header>
            <EssorButton
              as={Link}
              to={updateID ? `/articles/services/${updateID}` : '/articles/services/'}
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
                      label={t('formReference')}
                      name="reference"
                      placeholder={t('formPHReference')}
                      value={reference}
                      onChange={this.handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Select
                      label={t('formUnit')}
                      control={Dropdown}
                      placeholder={t('formPHSelect')}
                      disabled={loadingCompanySettings}
                      fluid
                      search
                      selection
                      loading={loadingCompanySettings}
                      noResultsMessage="No results"
                      options={companySettings}
                      name="unit"
                      onChange={this.handleSelectChange}
                      value={unit}
                      error={unitError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field error={unitPriceError}>
                      <label>{t('formUnitPrice')}</label>
                      <Input>
                        <Cleave
                          options={{
                            numeral: true,
                            numeralThousandsGroupStyle: 'none',
                            numeralDecimalScale: 2,
                          }}
                          onChange={this.handleInputChange}
                          name="unitPrice"
                          placeholder={t('formPHUnitPrice')}
                          value={unitPrice}
                        />
                      </Input>
                    </Form.Field>
                  </Form.Group>

                  <EssorButton type="check" submit onClick={this.handleOnSubmit} size="small">
                    {t('buttonSave')}
                  </EssorButton>

                  {updateError
                    && (
                      <Message negative>
                        <p>{updateError}</p>
                      </Message>
                    )
                  }

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
  getCompanySettings: page => dispatch(listSettings(page)),
  postService: data => dispatch(create(data)),
  retrieveService: page => dispatch(retrieveService(page)),
  updateService: (item, data) => dispatch(updateService(item, data)),
  reset: () => {
    dispatch(resetUpdateService());
    dispatch(success(null));
    dispatch(loading(false));
    dispatch(error(null));
    dispatch(resetListCompanySettings());
  },
});

const mapStateToProps = state => ({
  success: state.service.create.created,
  error: state.service.create.error,
  loading: state.service.create.loading,

  listCompanySettings: state.companySettings.list.data,
  loadingCompanySettings: state.companySettings.list.loading,
  errorCompanySettings: state.companySettings.list.error,

  retrieveError: state.service.update.retrieveError,
  retrieveLoading: state.service.update.retrieveLoading,
  updateError: state.service.update.updateError,
  updateLoading: state.service.update.updateLoading,
  retrieved: state.service.update.retrieved,
  updated: state.service.update.updated,

  selectedCompany: state.userCompanies.select.selectedCompany,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(CreateService);

export default withNamespaces('translation')(withRouter(Main));
