import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { retrieve as retrieveStock, reset as resetStock } from 'actions/stock/show';
import { Form, Grid, Header } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class ShowStock extends Component {
  componentDidMount() {
    const { getStock, match } = this.props;

    getStock(`/stocks/${match.params.stockId}`);
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  render() {
    const {
      retrieved,
      loading,
      match,
      t,
    } = this.props;

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('stockHomeTitle')}</Header>
            <EssorButton
              as={Link}
              to={`/articles/products/${match.params.productId}/stock/${match.params.stockId}/edit`}
              type="edit"
              size="tiny"
              floated="right"
            >
              {t('buttonEdit')}
            </EssorButton>

            <EssorButton
              as={Link}
              to={`/articles/products/${match.params.productId}`}
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
                <Form className="margin-top-bot main-form" loading={loading} size="small">

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formQuantity')}</label>
                      <h5 className="informative-field">
                        {retrieved && retrieved.quantity}
                      </h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formSupplierPrice')}</label>
                      <h5 className="informative-field">
                        {retrieved && retrieved.supplierPrice}
                      </h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formPrice')}</label>
                      <h5 className="informative-field">{retrieved && retrieved.price}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formSupplier')}</label>
                      <h5 className="informative-field">
                        {retrieved
                        && (
                          <Link
                            to={`${retrieved.supplier}`}
                            target="_blank"
                          >
                            {retrieved.supplier}
                          </Link>
                        )}
                      </h5>
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
  getStock: page => dispatch(retrieveStock(page)),
  reset: () => dispatch(resetStock()),
});

const mapStateToProps = state => ({
  error: state.stock.show.error,
  loading: state.stock.show.loading,
  retrieved: state.stock.show.retrieved,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(ShowStock);

export default withNamespaces('translation')(withRouter(Main));
