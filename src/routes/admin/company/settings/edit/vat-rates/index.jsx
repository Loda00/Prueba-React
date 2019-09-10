import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { retrieve, update, reset } from 'actions/company-settings/update';
import { Form, Header, Grid, Message } from 'semantic-ui-react';
import { EssorButton, CompanyListEdit } from 'components';
import { withNamespaces } from 'react-i18next';
import { isEmpty } from 'lodash';

class VatRates extends Component {
  state = {
    value: {},
    label: '',
    rate: '',
    defaultBool: false,
    labelError: false,
    rateError: false,
    isSettingsLoaded: false,

    btnSave: false,
  };

  componentDidMount() {
    const { retrieve, selectedCompany } = this.props;

    retrieve(`/company_settings?company=${selectedCompany.id}&name=VAT_RATES`);
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.retrieved && nextProps.retrieved['hydra:member'][0].name === 'VAT_RATES' && !prevState.isSettingsLoaded) {
      return {
        isSettingsLoaded: true,
        value: nextProps.retrieved['hydra:member'][0].value,
      };
    }

    return null;
  }

  handleInputChange = (e) => {
    e.preventDefault();

    const { name, value } = e.target;

    this.setState({
      [name]: value,
    });
  };

  handleCheckBoxChange = (e) => {
    e.preventDefault();

    this.setState(prevState => (
      {
        defaultBool: !prevState.defaultBool,
      }
    ));
  };

  handleAddItem = () => {
    const {
      label,
      rate,
      defaultBool,
      value,
    } = this.state;

    this.setState({
      labelError: false,
      rateError: false,
    });

    let isValid = true;

    if (label.trim() === '') {
      isValid = false;

      this.setState({
        labelError: true,
      });
    }

    if (rate.trim() === '') {
      isValid = false;

      this.setState({
        rateError: true,
      });
    }

    if (!isValid) return;

    const data = {
      label,
      rate,
      default: defaultBool,
    };

    value.push(data);

    this.setState({
      value,
      label: '',
      rate: '',
      defaultBool: false,
    });
  };

  handleDelete = (e) => {
    const { value } = this.state;
    const index = e.target.getAttribute('data-id');

    value.splice(index, 1);

    this.setState({
      value,
    });
  };

  handleOnSubmit = () => {
    const { value } = this.state;

    const { update, retrieved } = this.props;

    const data = {
      value,
    };

    update(retrieved['hydra:member'][0], data);
  };

  onSubmitList = (item) => {
    this.setState({
      value: item,
    });
  };

  render() {
    const {
      label,
      rate,
      defaultBool,
      labelError,
      rateError,
      value,

      btnSave,
    } = this.state;

    const { retrieveLoading, updateLoading, updateError, t } = this.props;

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('companiesVatRates')}</Header>
            <EssorButton as={Link} to="/company/settings/vat-rates" type="chevron left" size="tiny" floated="right">
              {t('buttonBack')}
            </EssorButton>
          </div>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form className="margin-top-bot main-form" loading={retrieveLoading || updateLoading} size="small">
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
                      label={t('formRate')}
                      name="rate"
                      placeholder={t('formPHRate')}
                      value={rate}
                      onChange={this.handleInputChange}
                      error={rateError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Checkbox
                      label={t('formDefault')}
                      name="defaultBool"
                      checked={defaultBool}
                      onChange={this.handleCheckBoxChange}
                    />
                  </Form.Group>

                  <EssorButton type="plus" submit onClick={this.handleAddItem} size="tiny">
                    {t('buttonSubmit')}
                  </EssorButton>

                  {
                    !isEmpty(value)
                    && (
                      <React.Fragment>
                        <CompanyListEdit
                          dataValue={value}
                          onEditList={valueEdit => this.onSubmitList(valueEdit)}
                          btnSave={btnSave}
                          loading={updateLoading}
                        />

                        <EssorButton type="check" onClick={this.handleOnSubmit} size="small">
                          {t('buttonSave')}
                        </EssorButton>
                      </React.Fragment>
                    )
                  }

                  {updateError
                    && (
                      <Message negative>
                        <p>{updateError}</p>
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
  retrieve: id => dispatch(retrieve(id)),
  update: (item, values) => dispatch(update(item, values)),
  reset: () => {
    dispatch(reset());
  },
});

const mapStateToProps = state => ({
  retrieveError: state.companySettings.update.retrieveError,
  retrieveLoading: state.companySettings.update.retrieveLoading,
  updateError: state.companySettings.update.updateError,
  updateLoading: state.companySettings.update.updateLoading,
  retrieved: state.companySettings.update.retrieved,
  updated: state.companySettings.update.updated,
  selectedCompany: state.userCompanies.select.selectedCompany,
});


const Main = connect(mapStateToProps, mapDispatchToProps)(VatRates);

export default withNamespaces('translation')(withRouter(Main));
