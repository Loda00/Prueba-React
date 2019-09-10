import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { retrieve, update, reset } from 'actions/company-settings/update';
import { Form, Header, Grid, Message } from 'semantic-ui-react';
import { EssorButton, CompanyListEdit } from 'components';
import { withNamespaces } from 'react-i18next';
import { isEmpty, last } from 'lodash';

class BankAccounts extends Component {
  state = {
    value: {},
    bankName: '',
    IBAN: '',
    BIC: '',
    bankNameError: false,
    IBANError: false,
    BICError: false,
    isSettingsLoaded: false,
    defaultBool: false,

    id: null,
    btnSave: false,
  };

  componentDidMount() {
    const { retrieve, selectedCompany } = this.props;

    retrieve(`/company_settings?company=${selectedCompany.id}&name=BANK_ACCOUNTS`);
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.retrieved && nextProps.retrieved['hydra:member'][0].name === 'BANK_ACCOUNTS' && !prevState.isSettingsLoaded) {
      return {
        isSettingsLoaded: true,
        value: nextProps.retrieved['hydra:member'][0].value,

        id: isEmpty(nextProps.retrieved['hydra:member'][0]) ? 0 : last(nextProps.retrieved['hydra:member'][0].value).id,
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
      value,
      bankName,
      IBAN,
      BIC,
      id,
      defaultBool,
    } = this.state;

    this.setState({
      bankNameError: false,
      IBANError: false,
      BICError: false,
    });

    let isValid = true;

    if (bankName.trim() === '') {
      isValid = false;

      this.setState({
        bankNameError: true,
      });
    }

    if (IBAN.trim() === '') {
      isValid = false;

      this.setState({
        IBANError: true,
      });
    }

    if (BIC.trim() === '') {
      isValid = false;

      this.setState({
        BICError: true,
      });
    }

    if (!isValid) return;

    const data = {
      id: id + 1,
      bankName,
      IBAN,
      BIC,
      default: defaultBool,
    };

    value.push(data);

    this.setState({
      value,
      bankName: '',
      IBAN: '',
      BIC: '',
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
      bankName,
      IBAN,
      BIC,
      bankNameError,
      IBANError,
      BICError,
      value,
      defaultBool,

      btnSave,
    } = this.state;

    const { retrieveLoading, updateLoading, updateError, match, t } = this.props;

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('companiesBankAccounts')}</Header>
            <EssorButton
              as={Link}
              to={`/companies/${match.params.id}`}
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
                <Form className="margin-top-bot main-form" loading={retrieveLoading || updateLoading} size="small">
                  <Form.Group inline>
                    <Form.Input
                      label={t('formBankName')}
                      name="bankName"
                      placeholder={t('formPHBankName')}
                      value={bankName}
                      onChange={this.handleInputChange}
                      error={bankNameError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formIBAN')}
                      name="IBAN"
                      placeholder={t('formPHIBAN')}
                      value={IBAN}
                      onChange={this.handleInputChange}
                      error={IBANError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formBIC')}
                      name="BIC"
                      placeholder={t('formPHBIC')}
                      value={BIC}
                      onChange={this.handleInputChange}
                      error={BICError}
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


const Main = connect(mapStateToProps, mapDispatchToProps)(BankAccounts);

export default withNamespaces('translation')(withRouter(Main));
