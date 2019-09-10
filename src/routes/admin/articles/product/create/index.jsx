import React, { Component } from 'react';
import { Link, Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty, find } from 'lodash';
import { create, error, loading, success } from 'actions/product/create';
import { retrieve as retrieveProduct, update as updateProduct, reset as resetUpdateProduct } from 'actions/product/update';
import { create as createMedia, error as errorMedia, loading as loadingMedia, success as successMedia } from 'actions/media/create';
import { list as listSettings, reset as resetListCompanySettings } from 'actions/company-settings/list';
import { list as listSupplier, reset as resetListSupplier } from 'actions/supplier/list';
import { Form, Grid, Message, Header, Dropdown, Input, Image, Label } from 'semantic-ui-react';
import { EssorButton } from 'components';
import uploadDefaultImage from 'assets/images/uploadDefault.png';
import { withNamespaces } from 'react-i18next';
import Cleave from 'cleave.js/react';

class CreateProduct extends Component {
  state = {
    company: null,
    reference: '',
    picture: null,
    label: '',
    unit: null,
    stockManagement: false,
    marginRate: '',
    supplier: null,
    supplyTime: '',
    purchaseUnitCost: '',
    unitPrice: '',
    companyError: false,
    labelError: false,
    unitError: false,
    marginRateError: false,
    purchaseUnitCostError: false,
    unitPriceError: false,
    imagePreview: null,
    companySettingsList: null,
    supplierList: null,
    isPictureCreated: false,
    isLoaded: false,
  };

  componentDidMount() {
    const {
      getSuppliers,
      getCompanySettings,
      retrieveProduct,
      selectedCompany,
      match,
    } = this.props;

    if (match.params.id) {
      retrieveProduct(`/products/${match.params.id}`);
    }

    getSuppliers(`/suppliers?company=${selectedCompany.id}`);
    getCompanySettings(`/company_settings?name=UNITS&company=${selectedCompany.id}`);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.retrieved && !prevState.isLoaded) {
      return {
        reference: nextProps.retrieved.reference,
        picture: nextProps.retrieved.picture,
        label: nextProps.retrieved.label,
        unit: nextProps.retrieved.unit,
        stockManagement: nextProps.retrieved.stockManagement,
        marginRate: nextProps.retrieved.marginRate,
        supplier: nextProps.retrieved.supplier,
        supplyTime: nextProps.retrieved.supplyTime,
        purchaseUnitCost: nextProps.retrieved.purchaseUnitCost,
        isLoaded: true,
      };
    }

    if (nextProps.selectedCompany && prevState.company !== nextProps.selectedCompany['@id']) {
      return {
        company: nextProps.selectedCompany['@id'],
      };
    }

    if (!isEmpty(nextProps.listSuppliers) && nextProps.listSuppliers['hydra:member'] !== prevState.supplierList) {
      return {
        supplierList: nextProps.listSuppliers['hydra:member'],
      };
    }

    if (!isEmpty(nextProps.listCompanySettings) && nextProps.listCompanySettings['hydra:member'][0] !== prevState.companySettingsList) {
      return {
        companySettingsList: nextProps.listCompanySettings['hydra:member'][0],
      };
    }

    if (nextProps.successMedia && !prevState.isPictureCreated) {
      const {
        company,
        reference,
        label,
        unit,
        stockManagement,
        marginRate,
        supplier,
        supplyTime,
        purchaseUnitCost,
        unitPrice,
      } = prevState;

      let data = {
        company,
        reference,
        label,
        unit,
        stockManagement,
        marginRate,
        purchaseUnitCost,
        unitPrice,
        picture: nextProps.successMedia['@id'],
      };

      if (supplier) {
        data = {
          ...data,
          supplier: JSON.parse(supplier)['@id'],
          supplyTime,
        };
      }

      nextProps.postProduct(data);

      return {
        isPictureCreated: true,
      };
    }

    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    const { isLoaded, supplierList } = this.state;

    if (prevState.isLoaded !== isLoaded) {
      this.getUnitPrice();
    }

    if ((isLoaded || prevState.isLoaded) && prevState.supplierList !== supplierList) {
      this.setSupplier();
    }
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  getUnitPrice = () => {
    const { marginRate, purchaseUnitCost } = this.state;
    const { selectedCompany } = this.props;
    let unitPrice = 0;

    if (selectedCompany.calculationMode === 'rate') {
      unitPrice = parseFloat(marginRate) !== 100
        ? purchaseUnitCost / (1 - (marginRate / 100))
        : purchaseUnitCost;
    } else if (selectedCompany.calculationMode === 'coef') {
      unitPrice = purchaseUnitCost * marginRate;
    }

    this.setState({
      unitPrice,
    });
  };

  setSupplier = () => {
    const { supplier, supplierList } = this.state;
    const supply = find(supplierList, {
      '@id': supplier,
    });

    this.setState({
      supplier: JSON.stringify(supply),
    });
  };

  handleInputChange = (e) => {
    e.preventDefault();
    const { marginRate, purchaseUnitCost } = this.state;
    const { selectedCompany } = this.props;
    const { name, value } = e.target;

    this.setState({
      [name]: value,
    });

    switch (name) {
      case 'marginRate': {
        if (purchaseUnitCost !== '' && value !== '') {
          let unitPrice = 0;

          if (selectedCompany.calculationMode === 'coef') {
            unitPrice = value * purchaseUnitCost;
          } else if (parseFloat(marginRate) === 100) {
            unitPrice = purchaseUnitCost;
          } else {
            unitPrice = purchaseUnitCost / (1 - (value / 100));
          }

          this.setState({
            unitPrice,
          });
        }
        break;
      }
      case 'purchaseUnitCost':
        if (marginRate !== '' && value !== '') {
          let unitPrice = 0;

          if (selectedCompany.calculationMode === 'coef') {
            unitPrice = value * marginRate;
          } else if (parseFloat(marginRate) === 100) {
            unitPrice = value;
          } else {
            unitPrice = value / (1 - (marginRate / 100));
          }

          this.setState({
            unitPrice,
          });
        }
        break;
      case 'unitPrice': {
        if (purchaseUnitCost !== '' && value !== '') {
          let marginRate = 0;

          if (selectedCompany.calculationMode === 'coef') {
            marginRate = value / purchaseUnitCost;
          } else {
            marginRate = 100 + (purchaseUnitCost / value) * 100;
          }

          this.setState({
            marginRate,
          });
        }
        break;
      }
      default: break;
    }
  };

  handleCheckBoxChange= (e, value) => {
    e.preventDefault();

    const { name } = value;

    this.setState(prevState => (
      {
        [name]: !prevState[name],
        supplier: null,
        supplyTime: '',
        purchaseUnitCost: '',
        unitPrice: '',
      }
    ));
  };

  handleSelectChange = (e, { value, name }) => {
    const prevValue = this.state[name]; // eslint-disable-line

    if (prevValue !== value) {
      this.setState({
        [name]: value,
      });

      if (name === 'supplier') {
        this.setState({
          supplyTime: JSON.parse(value).supplyTime,
        });
      }
    }
  };

  handlePictureChange = (e) => {
    e.preventDefault();

    const reader = new FileReader();
    const file = e.target.files[0];

    if (file) {
      reader.onloadend = () => {
        this.setState({
          picture: file,
          imagePreview: reader.result,
        });
      };

      reader.readAsDataURL(file);
    } else {
      this.setState({
        picture: null,
        imagePreview: null,
      });
    }
  };


  handleOnSubmit = () => {
    const {
      company,
      reference,
      label,
      unit,
      picture,
      stockManagement,
      marginRate,
      supplier,
      supplyTime,
      purchaseUnitCost,
      unitPrice,
    } = this.state;

    const {
      postProduct,
      postImage,
      updateProduct,
      retrieved,
      selectedCompany,
    } = this.props;
    let isValid = true;

    this.setState({
      companyError: false,
      labelError: false,
      unitError: false,
      marginRateError: false,
      purchaseUnitCostError: false,
      unitPriceError: false,
    });

    if (label === '') {
      isValid = false;

      this.setState({
        labelError: true,
      });
    }

    if (!unit) {
      isValid = false;

      this.setState({
        unitError: true,
      });
    }

    if (marginRate === '' || Number.isNaN(parseFloat(marginRate)) || (parseFloat(marginRate) < 0) || (parseFloat(marginRate) >= 1000)) {
      isValid = false;

      this.setState({
        marginRateError: true,
      });
    }

    if (!stockManagement) {
      if (purchaseUnitCost === '' || Number.isNaN(parseFloat(purchaseUnitCost))) {
        isValid = false;

        this.setState({
          purchaseUnitCostError: true,
        });
      }
    }

    if (!isValid) return;

    if (picture && !retrieved) { // Change this when retrieve update
      const data = new FormData();

      data.append('file', picture);
      data.append('company', selectedCompany['@id']);
      postImage(data);

      return;
    }

    let data = {
      company,
      reference,
      label,
      unit,
      stockManagement,
      marginRate,
      purchaseUnitCost: purchaseUnitCost === '' ? '0' : purchaseUnitCost,
      unitPrice,
    };

    if (supplier) {
      data = {
        ...data,
        supplier: JSON.parse(supplier)['@id'],
        supplyTime,
      };
    }

    retrieved ? updateProduct(retrieved, data) : postProduct(data);
  };

  render() {
    const {
      companySettingsList,
      supplierList,
      reference,
      label,
      unit,
      stockManagement,
      marginRate,
      supplier,
      supplyTime,
      purchaseUnitCost,
      unitPrice,
      labelError,
      unitError,
      marginRateError,
      purchaseUnitCostError,
      unitPriceError,
      imagePreview,
    } = this.state;

    const {
      selectedCompany,
      loadingProduct,
      loadingMedia,
      errorProduct,
      successProduct,
      updated,
      retrieveLoading,
      updateLoading,
      loadingCompanySettings,
      loadingSuppliers,
      match,
      t,
    } = this.props;

    const updateID = match.params.id;
    const formLoading = loadingProduct || loadingMedia;

    let companySettings = [];
    let supplies = [];

    if (companySettingsList && companySettingsList.value.length > 0) {
      companySettings = companySettingsList.value.map((setting, index) => ({
        key: index,
        text: setting.label,
        value: setting.unit,
      }));
    }

    if (supplierList && supplierList.length > 0) {
      supplies = supplierList.map((supply, index) => ({
        key: index,
        text: supply.supplierName,
        value: JSON.stringify(supply),
      }));
    }

    if (updated) {
      return (
        <Redirect
          push
          to={`/articles/products/${updateID}`}
        />
      );
    }

    if (successProduct) {
      return (
        <Redirect
          push
          to={{
            pathname: `/articles${successProduct['@id']}`,
            createStock: stockManagement,
          }}
        />
      );
    }

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{updateID ? t('productsUpdateTitle') : t('productsCreateTitle')}</Header>
            <EssorButton
              as={Link}
              to={updateID ? `/articles/products/${updateID}` : '/articles/products'}
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
                <Form className="margin-top-bot main-form" loading={formLoading || retrieveLoading || updateLoading} size="small">

                  <Form.Group inline>
                    <Form.Input
                      label={t('formReference')}
                      name="reference"
                      placeholder={t('formPHReference')}
                      value={reference}
                      onChange={this.handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label htmlFor="picture">{t('formPicture')}</label>
                      <Input
                        type="file"
                        id="picture"
                        name="picture"
                        accept="image/*"
                        onChange={this.handlePictureChange}
                      />
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label />
                      <div style={{
                        width: '182px',
                      }}
                      >
                        {imagePreview
                          ? <Image src={imagePreview} />
                          : <Image src={uploadDefaultImage} />
                        }
                      </div>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formLabel')}
                      name="label"
                      placeholder={t('formPHLabel')}
                      value={label}
                      onChange={this.handleInputChange}
                      error={labelError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Select
                      label={t('formUnit')}
                      control={Dropdown}
                      placeholder={t('formPHSelect')}
                      disabled={loadingCompanySettings}
                      fluid
                      search
                      selection
                      loading={loadingCompanySettings}
                      noResultsMessage="No results"
                      options={companySettings}
                      name="unit"
                      onChange={this.handleSelectChange}
                      value={unit}
                      error={unitError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field error={marginRateError}>
                      <label>
                        {selectedCompany.calculationMode === 'rate'
                          ? t('formMarginRate')
                          : t('formSellingCoefficient')
                        }
                      </label>
                      <Input labelPosition="left">
                        {selectedCompany.calculationMode === 'rate'
                          && <Label>%</Label>
                        }
                        <Cleave
                          options={{
                            numeral: true,
                            numeralThousandsGroupStyle: 'none',
                            numeralDecimalScale: 2,
                          }}
                          onChange={this.handleInputChange}
                          name="marginRate"
                          placeholder={t('formPHMarginRate')}
                          value={marginRate}
                        />
                      </Input>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Checkbox
                      label={t('formStockManagement')}
                      name="stockManagement"
                      checked={stockManagement}
                      onChange={this.handleCheckBoxChange}
                      readOnly={!!updateID}
                    />
                  </Form.Group>

                  {!stockManagement
                    && (
                      <React.Fragment>
                        <Form.Group inline>
                          <Form.Select
                            label={t('formSupplier')}
                            control={Dropdown}
                            placeholder={t('formPHSelect')}
                            fluid
                            search
                            selection
                            loading={loadingSuppliers}
                            disabled={loadingSuppliers}
                            noResultsMessage="No results"
                            options={supplies}
                            name="supplier"
                            onChange={this.handleSelectChange}
                            value={supplier}
                          />
                        </Form.Group>

                        <Form.Group inline>
                          <Form.Field>
                            <label>{t('formSupplyTime')}</label>
                            <h5 className="informative-field">{supplyTime}</h5>
                          </Form.Field>
                        </Form.Group>

                        <Form.Group inline>
                          <Form.Field error={purchaseUnitCostError}>
                            <label>{t('formPurchaseUnitCost')}</label>
                            <Input>
                              <Cleave
                                options={{
                                  numeral: true,
                                  numeralThousandsGroupStyle: 'none',
                                  numeralDecimalScale: 2,
                                }}
                                onChange={this.handleInputChange}
                                name="purchaseUnitCost"
                                placeholder={t('formPHPurchaseUnitCost')}
                                value={purchaseUnitCost}
                              />
                            </Input>
                          </Form.Field>
                        </Form.Group>

                        <Form.Group inline>
                          <Form.Field error={unitPriceError}>
                            <label>{t('formUnitPrice')}</label>
                            <Input>
                              <Cleave
                                options={{
                                  numeral: true,
                                  numeralThousandsGroupStyle: 'none',
                                  numeralDecimalScale: 2,
                                }}
                                onChange={this.handleInputChange}
                                name="unitPrice"
                                placeholder={t('formPHUnitPrice')}
                                value={unitPrice}
                              />
                            </Input>
                          </Form.Field>
                        </Form.Group>
                      </React.Fragment>
                    )
                  }

                  <EssorButton type="check" submit onClick={this.handleOnSubmit} size="small">
                    {t('buttonSave')}
                  </EssorButton>

                  {errorProduct
                    && (
                      <Message negative>
                        <p>{errorProduct}</p>
                      </Message>
                    )
                  }
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
  postProduct: data => dispatch(create(data)),
  retrieveProduct: page => dispatch(retrieveProduct(page)),
  updateProduct: (item, data) => dispatch(updateProduct(item, data)),
  postImage: file => dispatch(createMedia(file)),
  getCompanySettings: page => dispatch(listSettings(page)),
  getSuppliers: page => dispatch(listSupplier(page)),
  reset: () => {
    dispatch(success(null));
    dispatch(loading(false));
    dispatch(error(null));
    dispatch(successMedia(null));
    dispatch(loadingMedia(false));
    dispatch(errorMedia(null));
    dispatch(resetUpdateProduct());
    dispatch(resetListCompanySettings());
    dispatch(resetListSupplier());
  },
});

const mapStateToProps = state => ({
  successProduct: state.product.create.created,
  loadingProduct: state.product.create.loading,
  errorProduct: state.product.create.error,

  retrieveError: state.product.update.retrieveError,
  retrieveLoading: state.product.update.retrieveLoading,
  updateError: state.product.update.updateError,
  updateLoading: state.product.update.updateLoading,
  retrieved: state.product.update.retrieved,
  updated: state.product.update.updated,

  successMedia: state.media.create.created,
  loadingMedia: state.media.create.loading,
  errorMedia: state.media.create.error,

  listCompanySettings: state.companySettings.list.data,
  loadingCompanySettings: state.companySettings.list.loading,
  errorCompanySettings: state.companySettings.list.error,
  listSuppliers: state.supplier.list.data,
  loadingSuppliers: state.supplier.list.loading,
  errorSuppliers: state.supplier.list.error,

  selectedCompany: state.userCompanies.select.selectedCompany,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(CreateProduct);

export default withNamespaces('translation')(withRouter(Main));
