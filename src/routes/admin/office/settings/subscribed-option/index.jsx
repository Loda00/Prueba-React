import React, { Component } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { retrieve, update, reset } from 'actions/office-settings/update';
import { Form, Grid, Header } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class SubscribedOption extends Component {
  state = {
    value: {
      sellingSuccess: false,
      managementSecret: false,
      legal: false,
      managementSecret2: false,
      talents: false,
      websitesAndSocial: false,
      remoteProspecting: '',
    },
    remoteProspectingError: false,
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
      && nextProps.retrieved['hydra:member'][4].value !== prevState.value
    ) {
      return {
        value: nextProps.retrieved['hydra:member'][4].value,
        alreadyCharged: true,
      };
    }

    return null;
  }

  handleCheckBoxChange= (e, value) => {
    e.preventDefault();

    const { name } = value;

    this.setState(prevState => (
      {
        value: {
          ...prevState.value,
          [name]: !prevState[name],
        },
      }
    ));
  };

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

    update(retrieved['hydra:member'][4], data);
  };

  render() {
    const {
      remoteProspectingError,
      wasUpdate,
      value: {
        sellingSuccess,
        managementSecret,
        legal,
        managementSecret2,
        talents,
        websitesAndSocial,
        remoteProspecting,
      },
    } = this.state;

    const { retrieveLoading, updated, updateLoading, office, t } = this.props;

    if (updated && office && wasUpdate) {
      return (
        <Redirect
          push
          to={{
            pathname: '/offices',
            message: {
              type: 'positive',
              text: 'Office created success',
            },
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
                  {office && `${t('step')} 6 / 6: `}
                  {t('officesSubscribedOption')}
                </Header>
                <Form className="margin-top-bot main-form" loading={retrieveLoading || updateLoading} size="small">
                  <Form.Group inline>
                    <Form.Checkbox
                      label={t('formSellingSuccess')}
                      name="sellingSuccess"
                      checked={sellingSuccess}
                      onChange={this.handleCheckBoxChange}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Checkbox
                      label={t('formManagementSecret')}
                      name="managementSecret"
                      checked={managementSecret}
                      onChange={this.handleCheckBoxChange}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Checkbox
                      label={t('formLegal')}
                      name="legal"
                      checked={legal}
                      onChange={this.handleCheckBoxChange}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Checkbox
                      label={t('formManagementSecret2')}
                      name="managementSecret2"
                      checked={managementSecret2}
                      onChange={this.handleCheckBoxChange}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Checkbox
                      label={t('formTalents')}
                      name="talents"
                      checked={talents}
                      onChange={this.handleCheckBoxChange}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Checkbox
                      label={t('formWebsitesAndSocial')}
                      name="websitesAndSocial"
                      checked={websitesAndSocial}
                      onChange={this.handleCheckBoxChange}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formRemoteProspecting')}
                      name="remoteProspecting"
                      placeholder={t('formPHRemoteProspecting')}
                      value={remoteProspecting}
                      onChange={this.handleInputChange}
                      error={remoteProspectingError}
                    />
                  </Form.Group>

                  <EssorButton type="check" submit onClick={this.handleOnSubmit} size="small">
                    {t('buttonSubmit')}
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

const Main = connect(mapStateToProps, mapDispatchToProps)(SubscribedOption);

export default withNamespaces('translation')(withRouter(Main));
