import React, { Component } from 'react';
import { withRouter, Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { create, success, error, loading } from 'actions/office/create';
import { retrieve as retrieveOffice, update as updateOffice, reset as resetUpdateOffice } from 'actions/office/update';
import { Form, Grid, Message, Header } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class CreateOffice extends Component {
  state = {
    name: '',
    nameError: false,
    isLoaded: false,
  };

  componentDidMount() {
    const { retrieveOffice, match } = this.props;

    if (match.params.id) {
      retrieveOffice(`/offices/${match.params.id}`);
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.retrieved && !prevState.isLoaded) {
      return {
        name: nextProps.retrieved.name,
        isLoaded: true,
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

  handleOnSubmit = () => {
    const { name } = this.state;
    const { postOffice, updateOffice, retrieved } = this.props;
    let isValid = true;

    this.setState({
      nameError: false,
    });

    if (name === '') {
      isValid = false;

      this.setState({
        nameError: true,
      });
    }

    if (!isValid) return;

    const data = {
      name,
    };

    retrieved ? updateOffice(retrieved, data) : postOffice(data);
  };

  render() {
    const { name, nameError } = this.state;
    const {
      success,
      updated,
      error,
      loading,
      retrieveLoading,
      updateLoading,
      match,
      t,
    } = this.props;
    const updateID = match.params.id;

    if (success) {
      return (
        <Redirect
          push
          to={{
            pathname: `/offices/${success.id}/settings`,
            office: success,
          }}
        />
      );
    }

    if (updated) {
      return (
        <Redirect
          push
          to={`/offices/${updateID}`}
        />
      );
    }

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">
              {updateID ? t('officesUpdateTitle') : `${t('step')} 1 / 6: ${t('officesCreateTitle')}`}
            </Header>
            <EssorButton
              as={Link}
              to={updateID ? `/offices/${updateID}` : '/offices/'}
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
                      label={t('formName')}
                      name="name"
                      placeholder={t('formPHName')}
                      value={name}
                      onChange={this.handleInputChange}
                      error={nameError}
                    />
                  </Form.Group>

                  <EssorButton type="check" submit onClick={this.handleOnSubmit} size="small">
                    {t('buttonSave')}
                  </EssorButton>
                </Form>

                {error
                  && (
                  <Message negative>
                    <p>{error}</p>
                  </Message>
                  )
                }
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  postOffice: data => dispatch(create(data)),
  retrieveOffice: page => dispatch(retrieveOffice(page)),
  updateOffice: (item, data) => dispatch(updateOffice(item, data)),
  reset: () => {
    dispatch(resetUpdateOffice());
    dispatch(success(null));
    dispatch(loading(false));
    dispatch(error(null));
  },
});

const mapStateToProps = state => ({
  success: state.office.create.created,
  loading: state.office.create.loading,
  error: state.office.create.error,
  retrieveError: state.office.update.retrieveError,
  retrieveLoading: state.office.update.retrieveLoading,
  updateError: state.office.update.updateError,
  updateLoading: state.office.update.updateLoading,
  retrieved: state.office.update.retrieved,
  updated: state.office.update.updated,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(CreateOffice);

export default withNamespaces('translation')(withRouter(Main));
