import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { create as createSupplier, error as errorCreateSupplier, loading as loadingCreateSupplier, success as successSupplier } from 'actions/supplier/create';
import { retrieve, reset } from 'actions/product/show';
import { list, reset as resetStock } from 'actions/stock/list';
import { create as createStock, error as errorStock, loading as loadingStock, success as successStock } from 'actions/stock/create';
import { list as listSupplier, error as errorSupplier, loading as loadingSupplier } from 'actions/supplier/list';
import { Form, Grid, Header, Dropdown, Segment, Dimmer, Loader, Button, Table, Modal, Input } from 'semantic-ui-react';
import { EssorButton } from 'components';
import classnames from 'classnames';
import ReactTooltip from 'react-tooltip';
import Cleave from 'cleave.js/react';
import { withNamespaces } from 'react-i18next';

class ShowProduct extends Component {
  state = {
    company: null,
    label: '',
    marginRate: '',
    purchaseUnitCost: '',
    reference: '',
    stockManagement: false,
    supplier: null,
    supplyTime: '',
    unit: '',
    unitPrice: '-',
    price: '',
    supplierPrice: '',
    quantity: '',
    stockSupplier: null,
    supplierName: '',
    contactName: '',
    streetName: '',
    zipCode: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    newSupplyTime: '',
    comment: '',
    alert: '',
    supplierNameError: false,
    contactNameError: false,
    streetNameError: false,
    zipCodeError: false,
    cityError: false,
    phoneError: false,
    emailError: false,
    stockData: null,
    modalOpen: false,
    supplierList: null,
    newSupplier: false,
    isProductLoaded: false,
    isStockLoaded: false,
    isSupplierCreated: false,
  };

  componentDidMount() {
    const { getProduct, getStocks, match } = this.props;
    getProduct(`/products/${match.params.id}`);
    getStocks(`/stocks?product=/products/${match.params.id}`);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.retrieved) && !prevState.isProductLoaded) {
      return {
        company: nextProps.retrieved.company,
        id: nextProps.retrieved['@id'],
        label: nextProps.retrieved.label,
        marginRate: nextProps.retrieved.marginRate,
        purchaseUnitCost: nextProps.retrieved.purchaseUnitCost,
        reference: nextProps.retrieved.reference,
        stockManagement: nextProps.retrieved.stockManagement,
        supplier: nextProps.retrieved.supplier,
        supplyTime: nextProps.retrieved.supplyTime,
        unit: nextProps.retrieved.unit,
        isProductLoaded: true,
      };
    }

    if (!isEmpty(nextProps.dataStock) && !prevState.isStockLoaded) {
      return {
        stockData: nextProps.dataStock['hydra:member'],
        isStockLoaded: true,
      };
    }

    if (!isEmpty(nextProps.listSuppliers) && nextProps.listSuppliers['hydra:member'] !== prevState.supplierList) {
      return {
        supplierList: nextProps.listSuppliers['hydra:member'],
      };
    }

    if (nextProps.successSupplier && !prevState.isSupplierCreated) {
      const { id, price, quantity, supplierPrice } = prevState;
      const data = {
        product: id,
        price,
        supplierPrice,
        quantity: parseInt(quantity, 10),
        supplier: nextProps.successSupplier['@id'],
      };

      nextProps.postStock(data);

      return {
        isSupplierCreated: true,
      };
    }

    if (prevState.isSupplierCreated && nextProps.successStock) {
      const { resetCreateStock, resetSupplierList, getStocks, match } = nextProps;
      resetCreateStock();
      resetSupplierList();
      getStocks(`/stocks?product=/products/${match.params.id}`);

      return {
        price: '',
        quantity: '',
        stockSupplier: null,
        supplierName: '',
        contactName: '',
        streetName: '',
        zipCode: '',
        city: '',
        phone: '',
        email: '',
        website: '',
        newSupplyTime: '',
        comment: '',
        alert: '',
        stockData: null,
        supplierList: null,
        newSupplier: false,
        isStockLoaded: false,
        isSupplierCreated: false,
        modalOpen: false,
      };
    }

    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    const { company, isProductLoaded } = this.state;
    const { location } = this.props;

    if (prevState.company !== company && location.createStock) this.openModal();

    if (prevState.isProductLoaded !== isProductLoaded) {
      this.getUnitPrice();
    }
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  getUnitPrice = () => {
    const { marginRate, purchaseUnitCost } = this.state;

    if (!Number.isNaN(parseFloat(marginRate)) && !Number.isNaN(parseFloat(purchaseUnitCost))) {
      this.setState({
        unitPrice: (parseFloat(marginRate) * parseFloat(purchaseUnitCost)) / 100,
      });
    }
  };

  openModal = () => {
    const { company } = this.state;
    const { getSuppliers } = this.props;

    this.setState({
      modalOpen: true,
    });

    getSuppliers(`/suppliers?company=${company}`);
  };

  closeModal = () => {
    this.setState({
      modalOpen: false,
      price: '',
      quantity: '',
      stockSupplier: null,
      supplierName: '',
      contactName: '',
      streetName: '',
      zipCode: '',
      city: '',
      phone: '',
      email: '',
      website: '',
      newSupplyTime: '',
      comment: '',
      alert: '',
      supplierList: null,
      newSupplier: false,
    });
  };

  handleInputChange = (e) => {
    e.preventDefault();

    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleSelectChange = (e, { value, name }) => {
    this.setState({
      [name]: value,
    });
  };

  handleCheckBoxChange= (e, value) => {
    e.preventDefault();

    const { name } = value;

    this.setState(prevState => (
      {
        [name]: !prevState[name],
        stockSupplier: null,
      }
    ));
  };

  handleOnSubmit = () => {
    const {
      id,
      company,
      newSupplier,
      supplierName,
      contactName,
      streetName,
      zipCode,
      city,
      phone,
      email,
      website,
      newSupplyTime,
      comment,
      alert,
      quantity,
      price,
      supplierPrice,
      stockSupplier,
    } = this.state;
    const { postSupplier, postStock } = this.props;
    // eslint-disable-next-line
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let isValid = true;

    this.setState({
      supplierNameError: false,
      contactNameError: false,
      streetNameError: false,
      zipCodeError: false,
      cityError: false,
      phoneError: false,
      emailError: false,
      quantityError: false,
      priceError: false,
      supplierPriceError: false,
      stockSupplierError: false,
    });

    if (quantity.trim() === '') {
      isValid = false;

      this.setState({
        quantityError: true,
      });
    }

    if (price.trim() === '') {
      isValid = false;

      this.setState({
        priceError: true,
      });
    }

    if (supplierPrice.trim() === '') {
      isValid = false;

      this.setState({
        supplierPriceError: true,
      });
    }

    if (newSupplier) {
      if (supplierName.trim() === '') {
        isValid = false;

        this.setState({
          supplierNameError: true,
        });
      }

      if (contactName.trim() === '') {
        isValid = false;

        this.setState({
          contactNameError: true,
        });
      }

      if (streetName.trim() === '') {
        isValid = false;

        this.setState({
          streetNameError: true,
        });
      }

      if (zipCode.trim() === '' || !Number.isInteger(parseFloat(zipCode))) {
        isValid = false;

        this.setState({
          zipCodeError: true,
        });
      }

      if (city.trim() === '') {
        isValid = false;

        this.setState({
          cityError: true,
        });
      }

      if (phone.trim() === '') {
        isValid = false;

        this.setState({
          phoneError: true,
        });
      }

      if (email.trim() === '' || !regex.test(email)) {
        isValid = false;

        this.setState({
          emailError: true,
        });
      }

      if (!isValid) return;

      const data = {
        company,
        supplierName,
        contactName,
        streetName,
        zipCode: parseInt(zipCode, 10),
        city,
        phone,
        email,
        website,
        supplyTime: newSupplyTime,
        comment,
        alert,
      };

      postSupplier(data);
      return;
    }

    if (stockSupplier === null) {
      isValid = false;

      this.setState({
        stockSupplierError: true,
      });
    }

    if (!isValid) return;

    this.setState({
      isSupplierCreated: true,
    });

    const data = {
      product: id,
      price,
      supplierPrice,
      quantity: parseInt(quantity, 10),
      supplier: stockSupplier,
    };

    postStock(data);
  };

  render() {
    const {
      label,
      marginRate,
      purchaseUnitCost,
      reference,
      stockManagement,
      supplier,
      supplyTime,
      unit,
      unitPrice,
      price,
      supplierPrice,
      quantity,
      stockSupplier,
      priceError,
      supplierPriceError,
      quantityError,
      stockSupplierError,
      supplierName,
      contactName,
      streetName,
      zipCode,
      city,
      phone,
      email,
      website,
      newSupplyTime,
      comment,
      alert,
      supplierNameError,
      contactNameError,
      streetNameError,
      zipCodeError,
      cityError,
      phoneError,
      emailError,
      stockData,
      modalOpen,
      supplierList,
      newSupplier,
    } = this.state;

    const {
      loading,
      loadingStock,
      loadingSuppliers,
      loadingCreateSupplier,
      loadingCreateStock,
      selectedCompany,
      match,
      t,
    } = this.props;

    const loadingForm = loadingCreateStock || loadingCreateSupplier;

    let supplies = [];

    if (supplierList && supplierList.length > 0) {
      supplies = supplierList.map((supply, index) => ({
        key: index,
        text: supply.supplierName,
        value: supply['@id'],
      }));
    }

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('productsShowTitle')}</Header>
            <EssorButton as={Link} to={`/articles/products/${match.params.id}/edit`} type="edit" size="tiny" floated="right">
              {t('buttonEdit')}
            </EssorButton>

            <EssorButton as={Link} to="/articles/products" type="chevron left" size="tiny" floated="right">
              {t('buttonBack')}
            </EssorButton>
          </div>

          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form className="margin-top-bot main-form" loading={loading} size="small">
                  <Form.Group inline>
                    <Form.Field>
                      <label htmlFor="Label">{t('formLabel')}</label>
                      <h5 className="informative-field" id="Label">{label}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label htmlFor="reference">{t('formReference')}</label>
                      <h5 className="informative-field" id="reference">{reference || '-'}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label htmlFor="marginRate">
                        {selectedCompany.calculationMode === 'rate'
                          ? t('formMarginRate')
                          : t('formSellingCoefficient')
                        }
                      </label>
                      <h5 className="informative-field" id="marginRate">
                        {marginRate || '-'}
                        {(marginRate && selectedCompany.calculationMode === 'rate') && ' %'}
                      </h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label htmlFor="unit">{t('formUnit')}</label>
                      <h5 className="informative-field" id="unit">{unit || '-'}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label htmlFor="marginRate">{t('formUnitPrice')}</label>
                      <h5 className="informative-field" id="marginRate">{unitPrice}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Checkbox
                      label={t('formStockManagement')}
                      name="stockManagement"
                      checked={stockManagement}
                      readOnly
                    />
                  </Form.Group>

                  {!stockManagement
                    && (
                    <React.Fragment>
                      <Form.Group inline>
                        <Form.Field>
                          <label htmlFor="marginRate">{t('formSupplier')}</label>
                          <h5 className="informative-field" id="marginRate">{supplier}</h5>
                        </Form.Field>
                      </Form.Group>

                      <Form.Group inline>
                        <Form.Field>
                          <label htmlFor="marginRate">{t('formSupplyTime')}</label>
                          <h5 className="informative-field" id="marginRate">{supplyTime}</h5>
                        </Form.Field>
                      </Form.Group>

                      <Form.Group inline>
                        <Form.Field>
                          <label htmlFor="marginRate">{t('formPurchaseUnitCost')}</label>
                          <h5 className="informative-field" id="marginRate">{purchaseUnitCost}</h5>
                        </Form.Field>
                      </Form.Group>
                    </React.Fragment>
                    )
                  }
                </Form>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>

        {stockManagement
          && (
            <div className="section-general">
              <div className="option-buttons-container clearfix">
                <Header as="h3">{t('stockHomeTitle')}</Header>
                <EssorButton type="plus" size="tiny" floated="right" onClick={this.openModal}>
                  {t('buttonAdd')}
                </EssorButton>
              </div>

              <Modal
                open={modalOpen}
                closeOnEscape={false}
                closeOnDimmerClick={false}
                className="full-content"
              >
                <Modal.Header>{t('stockCreateTitle')}</Modal.Header>
                <Modal.Content scrolling>
                  <Modal.Description>
                    <Form className="margin-top-bot main-form" loading={loadingForm} size="small">
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
                        <Form.Select
                          label={t('formSupplier')}
                          control={Dropdown}
                          placeholder={t('formPHSelect')}
                          fluid
                          search
                          selection
                          loading={loadingSuppliers}
                          noResultsMessage="No results"
                          options={supplies}
                          disabled={newSupplier}
                          name="stockSupplier"
                          onChange={this.handleSelectChange}
                          value={stockSupplier}
                          error={stockSupplierError}
                        />
                      </Form.Group>

                      <Form.Group inline>
                        <Form.Checkbox
                          label={t('formNewSupplier')}
                          name="newSupplier"
                          checked={newSupplier}
                          onChange={this.handleCheckBoxChange}
                        />
                      </Form.Group>

                      {newSupplier
                      && (
                        <React.Fragment>
                          <Form.Group inline>
                            <Form.Input
                              label={t('formSupplierName')}
                              name="supplierName"
                              placeholder={t('formPHSupplierName')}
                              value={supplierName}
                              onChange={this.handleInputChange}
                              error={supplierNameError}
                            />
                          </Form.Group>

                          <Form.Group inline>
                            <Form.Input
                              label={t('formContactName')}
                              name="contactName"
                              placeholder={t('formPHContactName')}
                              value={contactName}
                              onChange={this.handleInputChange}
                              error={contactNameError}
                            />
                          </Form.Group>

                          <Form.Group inline>
                            <Form.Input
                              label={t('formStreetName')}
                              name="streetName"
                              placeholder={t('formPHStreetName')}
                              value={streetName}
                              onChange={this.handleInputChange}
                              error={streetNameError}
                            />
                          </Form.Group>

                          <Form.Group inline>
                            <Form.Input
                              label={t('formZipCode')}
                              name="zipCode"
                              placeholder={t('formPHZipCode')}
                              value={zipCode}
                              onChange={this.handleInputChange}
                              error={zipCodeError}
                            />
                          </Form.Group>

                          <Form.Group inline>
                            <Form.Input
                              label={t('formCity')}
                              name="city"
                              placeholder={t('formPHCity')}
                              value={city}
                              onChange={this.handleInputChange}
                              error={cityError}
                            />
                          </Form.Group>

                          <Form.Group inline>
                            <Form.Input
                              label={t('formPhoneNumber')}
                              name="phone"
                              placeholder={t('formPHPhoneNumber')}
                              value={phone}
                              onChange={this.handleInputChange}
                              error={phoneError}
                            />
                          </Form.Group>

                          <Form.Group inline>
                            <Form.Input
                              label={t('formEmail')}
                              name="email"
                              placeholder="example@email.com"
                              value={email}
                              onChange={this.handleInputChange}
                              error={emailError}
                            />
                          </Form.Group>

                          <Form.Group inline>
                            <Form.Input
                              label={t('formWebsite')}
                              name="website"
                              placeholder="www.example.com"
                              value={website}
                              onChange={this.handleInputChange}
                            />
                          </Form.Group>

                          <Form.Group inline>
                            <Form.Input
                              label={t('formSupplyTime')}
                              name="newSupplyTime"
                              placeholder={t('formPHSupplyTime')}
                              value={newSupplyTime}
                              onChange={this.handleInputChange}
                            />
                          </Form.Group>

                          <Form.Group inline>
                            <Form.TextArea
                              label={t('formComments')}
                              name="comment"
                              placeholder={t('formPHComments')}
                              value={comment}
                              onChange={this.handleInputChange}
                            />
                          </Form.Group>

                          <Form.Group inline>
                            <Form.TextArea
                              label={t('formAlert')}
                              name="alert"
                              placeholder={t('formPHAlert')}
                              value={alert}
                              onChange={this.handleInputChange}
                            />
                          </Form.Group>
                        </React.Fragment>
                      )}
                    </Form>
                  </Modal.Description>
                </Modal.Content>
                <Modal.Actions>
                  <EssorButton disabled={loadingForm} secondary type="x" size="small" onClick={this.closeModal}>
                    {t('buttonCancel')}
                  </EssorButton>

                  <EssorButton disabled={loadingForm} type="plus" size="small" onClick={this.handleOnSubmit}>
                    {t('buttonAdd')}
                  </EssorButton>
                </Modal.Actions>
              </Modal>

              <Segment
                basic
                className={classnames('table-container', {
                  'is-loading': loadingStock,
                })}
              >
                <Dimmer active={loadingStock} inverted>
                  <Loader>{t('loading')}</Loader>
                </Dimmer>
                <Table celled striped>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell />
                      <Table.HeaderCell>{t('formQuantity')}</Table.HeaderCell>
                      <Table.HeaderCell>{t('formPrice')}</Table.HeaderCell>
                      <Table.HeaderCell />
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {stockData && stockData.map((stock, index) => (
                      <Table.Row key={index}>
                        <Table.Cell>{index + 1}</Table.Cell>
                        <Table.Cell>{stock.quantity}</Table.Cell>
                        <Table.Cell>{stock.price}</Table.Cell>
                        <Table.Cell textAlign="center">
                          <Button
                            as={Link}
                            to={`/articles/products/${match.params.id}/stock/${stock.id}`}
                            className="table-button"
                            data-tip="Voir la fiche"
                            icon="eye"
                          />
                          <ReactTooltip className="essor-tooltip" effect="solid" place="bottom" />
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </Segment>
            </div>
          )
        }
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  postSupplier: data => dispatch(createSupplier(data)),
  postStock: data => dispatch(createStock(data)),
  getProduct: id => dispatch(retrieve(id)),
  getStocks: page => dispatch(list(page)),
  getSuppliers: page => dispatch(listSupplier(page)),
  resetCreateStock: () => {
    dispatch(successStock(null));
    dispatch(loadingStock(false));
    dispatch(errorStock(null));
    dispatch(successSupplier(null));
    dispatch(loadingCreateSupplier(false));
    dispatch(errorCreateSupplier(null));
    dispatch(resetStock());
  },
  resetSupplierList: () => {
    dispatch(loadingSupplier(false));
    dispatch(errorSupplier(null));
  },
  reset: () => {
    dispatch(reset());
    dispatch(resetStock());
  },
});

const mapStateToProps = state => ({
  retrieved: state.product.show.retrieved,
  loading: state.product.show.loading,
  error: state.product.show.error,
  dataStock: state.stock.list.data,
  loadingStock: state.stock.list.loading,
  errorStock: state.stock.list.error,
  successStock: state.stock.create.created,
  loadingCreateStock: state.stock.create.loading,
  errorCreateStock: state.stock.create.error,
  listSuppliers: state.supplier.list.data,
  loadingSuppliers: state.supplier.list.loading,
  errorSuppliers: state.supplier.list.error,
  successSupplier: state.supplier.create.created,
  loadingCreateSupplier: state.supplier.create.loading,
  errorCreateSupplier: state.supplier.create.error,

  selectedCompany: state.userCompanies.select.selectedCompany,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(ShowProduct);

export default withNamespaces('translation')(withRouter(Main));
