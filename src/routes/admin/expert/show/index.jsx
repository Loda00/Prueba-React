import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import moment from 'moment';
import { retrieve, reset } from 'actions/expert/show';
import { Form, Grid, Header } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class ShowExpert extends Component {
  state = {
    firstName: '',
    lastName: '',
    birthday: '',
    jobTitle: '',
    phoneNumber: '',
    username: '',
    office: '',
    isLoaded: false,
  };

  componentDidMount() {
    const { getExpert, match } = this.props;
    getExpert(`/experts/${match.params.id}`);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.retrieved) && !prevState.isLoaded) {
      return {
        firstName: nextProps.retrieved.firstName,
        lastName: nextProps.retrieved.lastName,
        birthday: moment(nextProps.retrieved.birthday).format('DD/MM/YYYY'),
        jobTitle: nextProps.retrieved.jobTitle,
        phoneNumber: nextProps.retrieved.phoneNumber,
        username: nextProps.retrieved.identity.username,
        office: nextProps.retrieved.office.name,
        isLoaded: true,
      };
    }

    return null;
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  render() {
    const {
      firstName,
      lastName,
      birthday,
      jobTitle,
      phoneNumber,
      username,
      office,
    } = this.state;

    const { loading, t, match } = this.props;

    return (
      <div className="section-container no-margin">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('expertsShowTitle')}</Header>
            <EssorButton as={Link} to={`/experts/${match.params.id}/edit`} type="edit" size="tiny" floated="right">
              {t('buttonEdit')}
            </EssorButton>

            <EssorButton as={Link} to="/experts" type="chevron left" size="tiny" floated="right">
              {t('buttonBack')}
            </EssorButton>
          </div>

          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form className="margin-top-bot main-form" loading={loading} size="small">
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formFirstName')}</label>
                      <h5 className="informative-field">{firstName}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formLastName')}</label>
                      <h5 className="informative-field">{lastName}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formJobTitle')}</label>
                      <h5 className="informative-field">{jobTitle}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formPhoneNumber')}</label>
                      <h5 className="informative-field">{phoneNumber}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formBirthday')}</label>
                      <h5 className="informative-field">{birthday}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formEmail')}</label>
                      <h5 className="informative-field">{username}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formOffice')}</label>
                      <h5 className="informative-field">{office}</h5>
                    </Form.Field>
                  </Form.Group>
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
  getExpert: page => dispatch(retrieve(page)),
  reset: () => dispatch(reset()),
});

const mapStateToProps = state => ({
  retrieved: state.expert.show.retrieved,
  loading: state.expert.show.loading,
  error: state.expert.show.error,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(ShowExpert);

export default withNamespaces('translation')(withRouter(Main));
