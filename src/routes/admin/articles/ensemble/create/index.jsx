import React, { Component } from 'react';
import { Link, Redirect, withRouter } from 'react-router-dom';
import { map, isEmpty, find, findIndex } from 'lodash';
import { connect } from 'react-redux';

import { create, error, loading, success } from 'actions/ensemble/create';
import { retrieve as retrieveEnsemble, update as updateEnsemble, reset as resetUpdateEnsemble } from 'actions/ensemble/update';
import { list as listArticle, reset as resetArticle } from 'actions/article/list';
import { Form, Dropdown, Grid, Message, Header, Table, Icon, Button } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class CreateEnsemble extends Component {
  state = {
    company: null,
    reference: '',
    label: '',
    sellingPrice: '',
    quantity: '',
    selectedItem: null,
    labelError: false,
    sellingPriceError: false,
    quantityError: false,
    selectedItemError: false,
    articlesList: null,
    warningMessage: false,
    noItems: false,
    selectedItems: [],
    isLoaded: false,
  };

  componentDidMount() {
    const {
      retrieveEnsemble,
      getArticles,
      selectedCompany,
      match,
    } = this.props;

    if (match.params.id) {
      retrieveEnsemble(`/ensembles/${match.params.id}`);
    }

    getArticles(`/articles/${selectedCompany.id}`);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.retrieved && !prevState.isLoaded) {
      return {
        reference: nextProps.retrieved.reference,
        label: nextProps.retrieved.label,
        sellingPrice: nextProps.retrieved.sellingPrice,
        selectedItems: nextProps.retrieved.items,
        isLoaded: true,
      };
    }

    if (!isEmpty(nextProps.listArticle) && nextProps.listArticle !== prevState.articlesList) {
      return {
        articlesList: nextProps.listArticle,
      };
    }

    if (nextProps.selectedCompany) {
      return {
        company: nextProps.selectedCompany['@id'],
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

    if (e.target.name === 'quantity') {
      this.setState({
        warningMessage: false,
      });
    }
  };

  handleDelete = (e, itemId) => {
    const { selectedItems } = this.state;
    const index = findIndex(selectedItems, {
      id: itemId,
    });

    selectedItems.splice(index, 1);

    this.setState({
      selectedItems,
    });
  };

  handleAddItem = () => {
    const { selectedItem, quantity, selectedItems } = this.state;
    const { selectedCompany } = this.props;
    let isValid = true;

    this.setState({
      quantityError: false,
      selectedItemError: false,
    });

    if (quantity.trim() === '' || !Number.isInteger(parseFloat(quantity)) || (parseFloat(quantity) < 0)) {
      isValid = false;

      this.setState({
        quantityError: true,
      });
    }

    if (selectedItem === null) {
      isValid = false;

      this.setState({
        selectedItemError: true,
      });
    }

    if (!isValid) return;

    const item = JSON.parse(selectedItem);

    item.quantity = quantity;

    if (item.type === 'Product') {
      if (selectedCompany.calculationMode === 'coef') {
        item.price *= item.margin;
      } else if (parseFloat(item.margin) !== 100) {
        item.price /= (1 - (item.margin / 100));
      }
    }

    item.totalPrice = item.price * item.quantity;

    if (!find(selectedItems, {
      id: item.id,
    })) {
      selectedItems.push(item);

      this.setState({
        selectedItems,
        warningMessage: false,
        selectedItem: null,
        quantity: '',
      });
    } else {
      this.setState({
        warningMessage: true,
      });
    }
  };

  addQuantity = () => {
    const { selectedItem, selectedItems, quantity } = this.state;
    const item = JSON.parse(selectedItem);
    const index = findIndex(selectedItems, {
      id: item.id,
    });
    let object = selectedItems[index];

    object = {
      ...object,
      quantity: parseInt(object.quantity, 10) + parseInt(quantity, 10),
    };

    selectedItems[index] = object;

    this.setState({
      selectedItems,
      warningMessage: false,
      selectedItem: null,
      quantity: '',
    });
  };

  dismissWarning = () => {
    this.setState({
      selectedItem: null,
      quantity: '',
      warningMessage: false,
    });
  };

  handleOnSubmit = () => {
    const {
      company,
      reference,
      label,
      sellingPrice,
      selectedItems,
    } = this.state;

    const { postEnsemble, updateEnsemble, retrieved } = this.props;
    let isValid = true;

    this.setState({
      labelError: false,
      sellingPriceError: false,
      noItems: false,
    });

    if (company === null) {
      isValid = false;
    }

    if (label.trim() === '') {
      isValid = false;

      this.setState({
        labelError: true,
      });
    }

    if (sellingPrice === '' || Number.isNaN(parseFloat(sellingPrice)) || (parseFloat(sellingPrice) < 0)) {
      isValid = false;

      this.setState({
        sellingPriceError: true,
      });
    }

    if (selectedItems.length === 0) {
      isValid = false;

      this.setState({
        noItems: true,
      });
    }

    if (!isValid) return;

    const items = [];

    for (let i = 0; i < selectedItems.length; i++) {
      items.push({
        item: selectedItems[i].id,
        quantity: selectedItems[i].quantity,
      });
    }

    const data = {
      company,
      reference,
      label,
      sellingPrice,
      items,
    };

    retrieved ? updateEnsemble(retrieved, data) : postEnsemble(data);
  };

  handleItemSelect = (e, obj) => {
    e.preventDefault();

    this.setState({
      selectedItem: obj.value,
      warningMessage: false,
    });
  };

  render() {
    const {
      reference,
      label,
      sellingPrice,
      selectedItem,
      quantity,
      articlesList,
      selectedItems,
      labelError,
      sellingPriceError,
      quantityError,
      selectedItemError,
      warningMessage,
      noItems,
    } = this.state;

    const {
      loading,
      error,
      success,
      updated,
      updateError,
      retrieveLoading,
      updateLoading,
      loadingListArticle,
      match,
      t,
    } = this.props;

    const updateID = match.params.id;
    const items = [];
    let subtotal = 0;

    if (!isEmpty(articlesList)) {
      articlesList.forEach((item) => {
        if (item.type !== 'Ensemble') {
          items.push({
            key: item.id,
            text: item.label,
            value: JSON.stringify(item),
          });
        }
      });
    }

    if (!isEmpty(selectedItems)) {
      for (let i = 0; i < selectedItems.length; i++) {
        subtotal += selectedItems[i].totalPrice;
      }
    }

    if (success || updated) {
      return (
        <Redirect
          push
          to={updated ? `/articles/ensembles/${updateID}` : `/articles/ensembles/${success.id}`}
        />
      );
    }

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">
              {updateID ? t('ensemblesUpdateTitle') : t('ensemblesCreateTitle')}
            </Header>
            <EssorButton
              as={Link}
              to={updateID ? `/articles/ensembles/${updateID}` : '/articles/ensembles/'}
              type="chevron left"
              size="tiny"
              floated="right"
            >
              {t('buttonBack')}
            </EssorButton>
          </div>

          <Form className="margin-top-bot main-form" loading={loading || retrieveLoading || updateLoading} size="small">
            <Grid>
              <Grid.Row>
                <Grid.Column width={12}>

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
                    <Form.Input
                      label={t('formSellingPrice')}
                      name="sellingPrice"
                      placeholder={t('formPHSellingPrice')}
                      value={sellingPrice}
                      onChange={this.handleInputChange}
                      error={sellingPriceError}
                    />
                  </Form.Group>
                </Grid.Column>
              </Grid.Row>

              <Grid.Row>
                <Grid.Column width={6}>
                  <Form.Group className="select-list">
                    <Form.Select
                      label={t('formItems')}
                      control={Dropdown}
                      placeholder={t('formPHSelect')}
                      fluid
                      search
                      selection
                      loading={loadingListArticle}
                      noResultsMessage="No results"
                      options={items}
                      disabled={loadingListArticle}
                      onChange={this.handleItemSelect}
                      value={selectedItem}
                      error={selectedItemError}
                    />
                  </Form.Group>
                </Grid.Column>
                <Grid.Column width={4}>
                  <Form.Group className="select-list">
                    <Form.Input
                      label={t('formQuantity')}
                      name="quantity"
                      placeholder={t('formPHQuantity')}
                      value={quantity}
                      onChange={this.handleInputChange}
                      error={quantityError}
                    />
                  </Form.Group>
                </Grid.Column>

                <Grid.Column width={2}>
                  <Form.Group className="select-list">
                    <Form.Field>
                      <label>{' '}</label>
                      <EssorButton
                        fluid
                        icon
                        type="plus"
                        size="small"
                        onClick={this.handleAddItem}
                      />
                    </Form.Field>
                  </Form.Group>
                </Grid.Column>
              </Grid.Row>

              <Grid.Row>
                <Grid.Column width={12}>
                  {warningMessage
                    && (
                      <Message visible={warningMessage} warning icon>
                        <Icon name="warning sign" />
                        <Message.Content>
                          <Message.Header>Item already added</Message.Header>
                          <p>Add quantity to the previous ?</p>
                          <Button positive compact onClick={this.addQuantity}>Yes! please!</Button>
                          <Button negative compact onClick={this.dismissWarning}>No way!</Button>
                        </Message.Content>
                      </Message>
                    )
                  }

                  <div className="select-list">
                    <label>{t('ensemblesSelectedItems')}</label>

                    <Table celled selectable className="margin-bot">
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>{t('ensemblesTableName')}</Table.HeaderCell>
                          <Table.HeaderCell>{t('ensemblesTableType')}</Table.HeaderCell>
                          <Table.HeaderCell textAlign="center">{t('formUnitPrice')}</Table.HeaderCell>
                          <Table.HeaderCell>{t('ensemblesTableQuantity')}</Table.HeaderCell>
                          <Table.HeaderCell textAlign="center">{t('formTotalPrice')}</Table.HeaderCell>
                          <Table.HeaderCell />
                        </Table.Row>
                      </Table.Header>

                      <Table.Body>
                        {!isEmpty(selectedItems) && map(selectedItems, item => (
                          <Table.Row key={item.id}>
                            <Table.Cell>
                              {item.label}
                            </Table.Cell>
                            <Table.Cell>
                              {item.type}
                            </Table.Cell>

                            <Table.Cell textAlign="center">
                              {parseFloat(item.price).toFixed(2)}
                            </Table.Cell>

                            <Table.Cell collapsing textAlign="center">
                              {item.quantity}
                            </Table.Cell>

                            <Table.Cell textAlign="center">
                              {parseFloat(item.totalPrice).toFixed(2)}
                            </Table.Cell>

                            <Table.Cell collapsing textAlign="center">
                              <Icon name="x" onClick={e => this.handleDelete(e, item.id)} />
                            </Table.Cell>
                          </Table.Row>
                        ))}
                        <Table.Row>
                          <Table.Cell colSpan={4}>
                            Subtotal
                          </Table.Cell>
                          <Table.Cell textAlign="center">
                            {subtotal.toFixed(2)}
                          </Table.Cell>
                          <Table.Cell />
                        </Table.Row>
                      </Table.Body>
                    </Table>
                  </div>

                  {noItems
                    && (
                      <Message negative>
                        <p>No items selected</p>
                      </Message>
                    )
                  }

                  <EssorButton type="check" onClick={this.handleOnSubmit} size="small">
                    {t('buttonSave')}
                  </EssorButton>

                  {updateError
                    && (
                      <Message negative>
                        <p>{updateError}</p>
                      </Message>
                    )
                  }

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
          </Form>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  postEnsemble: data => dispatch(create(data)),
  retrieveEnsemble: page => dispatch(retrieveEnsemble(page)),
  updateEnsemble: (item, values) => dispatch(updateEnsemble(item, values)),
  getArticles: page => dispatch(listArticle(page)),
  reset: () => {
    dispatch(resetArticle());
    dispatch(resetUpdateEnsemble());
    dispatch(success(null));
    dispatch(error(null));
    dispatch(loading(false));
  },
});

const mapStateToProps = state => ({
  success: state.ensemble.create.created,
  loading: state.ensemble.create.loading,
  error: state.ensemble.create.error,

  retrieveError: state.ensemble.update.retrieveError,
  retrieveLoading: state.ensemble.update.retrieveLoading,
  updateError: state.ensemble.update.updateError,
  updateLoading: state.ensemble.update.updateLoading,
  retrieved: state.ensemble.update.retrieved,
  updated: state.ensemble.update.updated,

  listArticle: state.article.list.data,
  loadingListArticle: state.article.list.loading,
  errorListArticle: state.article.list.error,

  selectedCompany: state.userCompanies.select.selectedCompany,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(CreateEnsemble);

export default withNamespaces('translation')(withRouter(Main));
