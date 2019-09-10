import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { find } from 'lodash';
import { retrieve, reset } from 'actions/customer/show';
import { Form, Grid, Header } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class ShowCustomer extends Component {
  state = {
    // eslint-disable-next-line react/no-unused-state
    notFound: false,
  };

  componentDidMount() {
    const { getCustomer, match, data } = this.props;

    if (match.params.id) {
      if (find(data, {
        id: parseInt(match.params.id, 10),
      })) {
        getCustomer(`/customers/${match.params.id}`);
      } else {
        this.setState({
          // eslint-disable-next-line react/no-unused-state
          notFound: true,
        });
        return;
      }
    }

    getCustomer(`/customers/${match.params.id}`);
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  render() {
    const { retrieved, loading, t, match } = this.props;

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('formRecipient')}</Header>
            <EssorButton as={Link} to={`/contacts/recipients/${match.params.id}/edit`} type="edit" size="tiny" floated="right">
              {t('buttonEdit')}
            </EssorButton>

            <EssorButton as={Link} to="/contacts/recipients" type="chevron left" size="tiny" floated="right">
              {t('buttonBack')}
            </EssorButton>
          </div>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form className="margin-top-bot main-form" loading={loading} size="small">
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('customerCompany')}</label>
                      <h5 className="informative-field">{retrieved ? retrieved.company : ''}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('customerCompanyName')}</label>
                      <h5 className="informative-field">{retrieved ? retrieved.companyName : ''}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('customerContactName')}</label>
                      <h5 className="informative-field">{retrieved ? retrieved.contactName : ''}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('customerAdditional')}</label>
                      <h5 className="informative-field">{retrieved && retrieved.details ? retrieved.details.additional : ''}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('customerCity')}</label>
                      <h5 className="informative-field">{retrieved && retrieved.details ? retrieved.details.city : ''}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('customerCountry')}</label>
                      <h5 className="informative-field">{retrieved && retrieved.details ? retrieved.details.country : ''}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('customerStreetName')}</label>
                      <h5 className="informative-field">{retrieved && retrieved.details ? retrieved.details.streetName : ''}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('customerZipCode')}</label>
                      <h5 className="informative-field">{retrieved && retrieved.details ? retrieved.details.zipCode : ''}</h5>
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
  getCustomer: page => dispatch(retrieve(page)),
  reset: () => dispatch(reset()),
});

const mapStateToProps = state => ({
  retrieved: state.customer.show.retrieved,
  loading: state.customer.show.loading,
  error: state.customer.show.error,
  data: state.customer.list.data,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(ShowCustomer);

export default withNamespaces('translation')(withRouter(Main));
