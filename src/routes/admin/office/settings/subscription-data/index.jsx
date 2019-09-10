import React, { Component } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import { retrieve, update, reset } from 'actions/office-settings/update';
import { Form, Grid, Header } from 'semantic-ui-react';
import { EssorButton } from 'components';
import DatePicker from 'react-datepicker';
import { withNamespaces } from 'react-i18next';

import 'moment/locale/fr';

moment.locale('fr');

class SubscriptionData extends Component {
  state = {
    value: {
      subscriptionAmount: '',
      accreditationAmount: '',
      renewDate: null,
      startDate: null,
      membershipLevy: '',
      timeCreditBase: '',
      timeCreditUsed: '',
    },
    subscriptionAmountError: false,
    accreditationAmountError: false,
    renewDateError: false,
    startDateError: false,
    membershipLevyError: false,
    timeCreditBaseError: false,
    timeCreditUsedError: false,
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
      && nextProps.retrieved['hydra:member'][3].value !== prevState.value
    ) {
      const data = nextProps.retrieved['hydra:member'][3].value;

      data.renewDate = moment(data.renewDate);
      data.startDate = moment(data.startDate);

      return {
        value: data,
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

  handleRenewDateChange = (date) => {
    this.setState(prevState => (
      {
        value: {
          ...prevState.value,
          renewDate: date,
        },
      }
    ));
  };

  handleStartDateChange = (date) => {
    this.setState(prevState => (
      {
        value: {
          ...prevState.value,
          startDate: date,
        },
      }
    ));
  };

  handleOnSubmit = (e) => {
    e.preventDefault();

    const { value } = this.state;

    const { update, retrieved } = this.props;

    const data = {
      value: {
        ...value,
        renewDate: value.renewDate.format(),
        startDate: value.startDate.format(),
      },
    };

    this.setState({
      wasUpdate: true,
    });

    update(retrieved['hydra:member'][3], data);
  };

  render() {
    const {
      subscriptionAmountError,
      accreditationAmountError,
      renewDateError,
      startDateError,
      membershipLevyError,
      timeCreditBaseError,
      timeCreditUsedError,
      wasUpdate,
      value: {
        subscriptionAmount,
        accreditationAmount,
        renewDate,
        startDate,
        membershipLevy,
        timeCreditBase,
        timeCreditUsed,
      },
    } = this.state;

    const { retrieveLoading, updated, updateLoading, office, match, t } = this.props;

    if (updated && office && wasUpdate) {
      return (
        <Redirect
          push
          to={{
            pathname: `/offices/${match.params.id}/settings/subscribed-option`,
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
                  {office && `${t('step')} 5 / 6: `}
                  {t('officesSubscriptionData')}
                </Header>
                <Form className="margin-top-bot main-form" loading={retrieveLoading || updateLoading} size="small">
                  <Form.Group inline>
                    <Form.Input
                      label={t('formSubscriptionAmount')}
                      name="subscriptionAmount"
                      placeholder={t('formPHSubscriptionAmount')}
                      value={subscriptionAmount}
                      onChange={this.handleInputChange}
                      error={subscriptionAmountError}
                    />
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Input
                      label={t('formAccreditationAmount')}
                      name="accreditationAmount"
                      placeholder={t('formPHAccreditationAmount')}
                      value={accreditationAmount}
                      onChange={this.handleInputChange}
                      error={accreditationAmountError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formRenewDate')}
                      name="renewDate"
                      control={DatePicker}
                      selected={renewDate}
                      onChange={this.handleRenewDateChange}
                      locale="fr"
                      error={renewDateError}
                      autoComplete="off"
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formStartDate')}
                      name="startDate"
                      control={DatePicker}
                      selected={startDate}
                      onChange={this.handleStartDateChange}
                      locale="fr"
                      error={startDateError}
                      autoComplete="off"
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formMembershipLevy')}
                      name="membershipLevy"
                      placeholder={t('formPHMembershipLevy')}
                      value={membershipLevy}
                      onChange={this.handleInputChange}
                      error={membershipLevyError}
                    />
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Input
                      label={t('formTimeCreditBase')}
                      name="timeCreditBase"
                      placeholder={t('formPHTimeCreditBase')}
                      value={timeCreditBase}
                      onChange={this.handleInputChange}
                      error={timeCreditBaseError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formTimeCreditUsed')}
                      name="timeCreditUsed"
                      placeholder={t('formPHTimeCreditUsed')}
                      value={timeCreditUsed}
                      onChange={this.handleInputChange}
                      error={timeCreditUsedError}
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

const Main = connect(mapStateToProps, mapDispatchToProps)(SubscriptionData);

export default withNamespaces('translation')(withRouter(Main));
