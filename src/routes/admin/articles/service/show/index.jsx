import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { retrieve, reset } from 'actions/service/show';
import { Form, Grid, Header } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class ShowService extends Component {
  componentDidMount() {
    const { getService, match } = this.props;
    getService(`/services/${match.params.id}`);
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  render() {
    const {
      retrieved,
      loading,
      t,
      match,
    } = this.props;

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('servicesShowTitle')}</Header>
            <EssorButton as={Link} to={`/articles/services/${match.params.id}/edit`} type="edit" size="tiny" floated="right">
              {t('buttonEdit')}
            </EssorButton>

            <EssorButton as={Link} to="/articles/services" type="chevron left" size="tiny" floated="right">
              {t('buttonBack')}
            </EssorButton>
          </div>

          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form className="margin-top-bot main-form" loading={loading} size="small">
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formLabel')}</label>
                      <h5 className="informative-field">{retrieved && retrieved.label}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formReference')}</label>
                      <h5 className="informative-field">
                        {retrieved && (
                          retrieved.reference === '' ? '-' : retrieved.reference
                        )}
                      </h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formUnit')}</label>
                      <h5 className="informative-field">{retrieved && retrieved.unit}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formUnitPrice')}</label>
                      <h5 className="informative-field">{retrieved && retrieved.unitPrice}</h5>
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
  getService: page => dispatch(retrieve(page)),
  reset: () => dispatch(reset()),
});

const mapStateToProps = state => ({
  retrieved: state.service.show.retrieved,
  loading: state.service.show.loading,
  error: state.service.show.error,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(ShowService);

export default withNamespaces('translation')(withRouter(Main));
