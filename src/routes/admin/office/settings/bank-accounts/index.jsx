import React, { Component } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { retrieve, update, reset } from 'actions/office-settings/update';
import { Form, Grid, Header } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class BankAccounts extends Component {
  state = {
    value: {
      bankName: '',
      IBAN: '',
      BIC: '',
    },
    bankNameError: false,
    IBANError: false,
    BICError: false,
    alreadyCharged: false,
    wasUpdate: false,
  };

  componentDidMount() {
    const { retrieve, match } = this.props;

    retrieve(match.params.id);
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      nextProps.retrieved
      && nextProps.retrieved['hydra:member']
      && !prevState.alreadyCharged
      && nextProps.retrieved['hydra:member'][2].value !== prevState.value
    ) {
      return {
        value: nextProps.retrieved['hydra:member'][2].value,
        alreadyCharged: true,
      };
    }

    return null;
  }

  handleInputChange = (e) => {
    e.preventDefault();

    const { name, value } = e.target;

    this.setState(prevState => (
      {
        value: {
          ...prevState.value,
          [name]: value,
        },
      }
    ));
  };

  handleOnSubmit = (e) => {
    e.preventDefault();

    const { value } = this.state;

    const { update, retrieved } = this.props;

    const data = {
      value,
    };

    this.setState({
      wasUpdate: true,
    });

    update(retrieved['hydra:member'][2], data);
  };

  render() {
    const {
      bankNameError,
      IBANError,
      BICError,
      wasUpdate,
      value: {
        bankName,
        IBAN,
        BIC,
      },
    } = this.state;

    const { retrieveLoading, updated, updateLoading, office, match, t } = this.props;

    if (updated && office && wasUpdate) {
      return (
        <Redirect
          push
          to={{
            pathname: `/offices/${match.params.id}/settings/subscription-data`,
            office,
          }}
        />
      );
    }

    return (
      <div className="section-container">
        <div className="section-general">
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Header as="h3">
                  {office && `${t('step')} 4 / 6: `}
                  {t('officesBankAccounts')}
                </Header>
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

                  <EssorButton type="check" submit onClick={this.handleOnSubmit} size="small">
                    {office ? t('buttonNext') : t('buttonSubmit')}
                  </EssorButton>
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
  retrieveError: state.officeSettings.update.retrieveError,
  retrieveLoading: state.officeSettings.update.retrieveLoading,
  updateError: state.officeSettings.update.updateError,
  updateLoading: state.officeSettings.update.updateLoading,
  retrieved: state.officeSettings.update.retrieved,
  updated: state.officeSettings.update.updated,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(BankAccounts);

export default withNamespaces('translation')(withRouter(Main));
