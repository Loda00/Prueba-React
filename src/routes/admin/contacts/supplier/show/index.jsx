import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { find } from 'lodash';
import { retrieve, reset } from 'actions/supplier/show';
import { Form, Grid, Header } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';
import NotFound from '../../../404';

class ShowSupplier extends Component {
  state = {
    notFound: false,
  }

  componentDidMount() {
    const { getSupplier, match, data } = this.props;

    const res = find(data['hydra:member'], (item) => {
      if (item.id === Number(match.params.id)) {
        return getSupplier(`/suppliers/${match.params.id}`);
      }
    });

    if (typeof res === 'undefined') {
      this.setState({
        notFound: true,
      });
    }
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  render() {
    const { retrieved, loading, t, match } = this.props;
    const { notFound } = this.state;

    if (notFound) {
      return (
        <NotFound />
      );
    }

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('supplierShow')}</Header>
            <EssorButton as={Link} to={`/contacts/suppliers/${match.params.id}/edit`} type="edit" size="tiny" floated="right">
              {t('buttonEdit')}
            </EssorButton>

            <EssorButton as={Link} to="/contacts/suppliers" type="chevron left" size="tiny" floated="right">
              {t('buttonBack')}
            </EssorButton>
          </div>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form className="margin-top-bot main-form" loading={loading} size="small">
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formCompany')}</label>
                      <h5 className="informative-field">{retrieved ? retrieved.company : ''}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formSupplierName')}</label>
                      <h5 className="informative-field">{retrieved ? retrieved.supplierName : ''}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formContactName')}</label>
                      <h5 className="informative-field">{retrieved ? retrieved.contactName : ''}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formStreetName')}</label>
                      <h5 className="informative-field">{retrieved ? retrieved.streetName : ''}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formZipCode')}</label>
                      <h5 className="informative-field">{retrieved ? retrieved.zipCode : ''}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formCity')}</label>
                      <h5 className="informative-field">{retrieved ? retrieved.city : ''}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formPhoneNumber')}</label>
                      <h5 className="informative-field">{retrieved ? retrieved.phone : ''}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formEmail')}</label>
                      <h5 className="informative-field">{retrieved ? retrieved.email : ''}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formWebsite')}</label>
                      <h5 className="informative-field">{retrieved ? retrieved.website : ''}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formSupplyTime')}</label>
                      <h5 className="informative-field">{retrieved ? retrieved.supplyTime : ''}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formComments')}</label>
                      <h5 className="informative-field">{retrieved ? retrieved.comment : '-'}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formAlert')}</label>
                      <h5 className="informative-field">{retrieved ? retrieved.alert : '-'}</h5>
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
  getSupplier: page => dispatch(retrieve(page)),
  reset: () => dispatch(reset()),
});

const mapStateToProps = state => ({
  retrieved: state.supplier.show.retrieved,
  loading: state.supplier.show.loading,
  error: state.supplier.show.error,
  data: state.supplier.list.data,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(ShowSupplier);

export default withNamespaces('translation')(withRouter(Main));
