import React, { Component } from 'react';
import { Link, Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { retrieve as retrieveStock, update as updateStock, reset as resetUpdateStock } from 'actions/stock/update';
import { Form, Grid, Header, Input } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';
import Cleave from 'cleave.js/react';

class UpdateStock extends Component {
  state = {
    id: '',
    quantity: '',
    supplierPrice: '',
    price: '',
    supplier: '',

    quantityError: false,
    supplierPriceError: false,
    priceError: false,
  };

  componentDidMount() {
    const { retrieveStock, match } = this.props;

    retrieveStock(`/stocks/${match.params.stockId}`);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.retrieved) && prevState.id !== nextProps.retrieved['@id']) {
      return {
        id: nextProps.retrieved['@id'],
        quantity: nextProps.retrieved.quantity,
        supplierPrice: nextProps.retrieved.supplierPrice,
        price: nextProps.retrieved.price,
        supplier: nextProps.retrieved.supplier,
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
    const {
      quantity,
      price,
      supplierPrice,
    } = this.state;
    const { updateStock, retrieved } = this.props;

    let isValid = true;

    this.setState({
      quantityError: false,
      priceError: false,
      supplierPriceError: false,
    });

    if (quantity === '') {
      isValid = false;

      this.setState({
        quantityError: true,
      });
    }

    if (price === '') {
      isValid = false;

      this.setState({
        priceError: true,
      });
    }

    if (supplierPrice === '') {
      isValid = false;

      this.setState({
        supplierPriceError: true,
      });
    }

    if (!isValid) return;

    const data = {
      quantity: parseInt(quantity, 10),
      price,
      supplierPrice,
    };

    updateStock(retrieved, data);
  };

  render() {
    const {
      quantity,
      price,
      supplierPrice,
      supplier,
      quantityError,
      priceError,
      supplierPriceError,
    } = this.state;

    const {
      t,
      updated,
      retrieveLoading,
      updateLoading,
      match,
    } = this.props;

    const updateID = match.params.stockId;

    if (updated) {
      return (
        <Redirect
          push
          to={`/articles/products/${match.params.productId}/stock/${updateID}`}
        />
      );
    }

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">
              {t('stockUpdateTitle')}
            </Header>
            <EssorButton
              as={Link}
              to={`/articles/products/${match.params.productId}/stock/${updateID}`}
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
                    <Form.Field error={priceError}>
                      <label>{t('formPrice')}</label>
                      <Input>
                        <Cleave
                          options={{
                            numeral: true,
                            numeralThousandsGroupStyle: 'none',
                            numeralDecimalScale: 2,
                          }}
                          onChange={this.handleInputChange}
                          name="price"
                          placeholder={t('formPHPrice')}
                          value={price}
                        />
                      </Input>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field error={supplierPriceError}>
                      <label>{t('formSupplierPrice')}</label>
                      <Input>
                        <Cleave
                          options={{
                            numeral: true,
                            numeralThousandsGroupStyle: 'none',
                            numeralDecimalScale: 2,
                          }}
                          onChange={this.handleInputChange}
                          name="supplierPrice"
                          placeholder={t('formPHPrice')}
                          value={supplierPrice}
                        />
                      </Input>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field error={quantityError}>
                      <label>{t('formQuantity')}</label>
                      <Input>
                        <Cleave
                          options={{
                            numeral: true,
                            numeralThousandsGroupStyle: 'none',
                            numeralDecimalScale: 2,
                          }}
                          onChange={this.handleInputChange}
                          name="quantity"
                          placeholder={t('formPHQuantity')}
                          value={quantity}
                        />
                      </Input>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formSupplier')}</label>
                      <h5 className="informative-field">
                        {supplier}
                      </h5>
                    </Form.Field>
                  </Form.Group>

                  <EssorButton type="check" submit onClick={this.handleOnSubmit} size="small">
                    {t('buttonSave')}
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
  retrieveStock: data => dispatch(retrieveStock(data)),
  updateStock: (item, data) => dispatch(updateStock(item, data)),
  reset: () => dispatch(resetUpdateStock()),
});

const mapStateToProps = state => ({
  retrieveError: state.stock.update.retrieveError,
  retrieveLoading: state.stock.update.retrieveLoading,
  updateError: state.stock.update.updateError,
  updateLoading: state.stock.update.updateLoading,
  retrieved: state.stock.update.retrieved,
  updated: state.stock.update.updated,

  selectedCompany: state.userCompanies.select.selectedCompany,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(UpdateStock);

export default withNamespaces('translation')(withRouter(Main));
