import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import { isEmpty, sortBy } from 'lodash';
import { selectDocument } from 'actions/user-companies/select';
import { Button, Dimmer, Header, Loader, Segment, Table } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';
import classnames from 'classnames';
import ReactTooltip from 'react-tooltip';

class ListPurchaseOrder extends Component {
  state = {
    purchaseOrderData: null,
    column: null,
    direction: null,
  };

  componentDidMount() {
    const { selectDocument } = this.props;

    selectDocument(null);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.dataPurchaseOrder) && nextProps.dataPurchaseOrder['hydra:member'] !== prevState.purchaseOrderData) {
      return {
        purchaseOrderData: nextProps.dataPurchaseOrder['hydra:member'],
      };
    }

    return null;
  }

  selectPurchaseOrder = (purchaseOrder) => {
    const { selectDocument, history } = this.props;

    selectDocument(purchaseOrder);

    history.push(`/business/purchase-orders/${purchaseOrder.id}`);
  };

  handleSort = clickedColumn => () => {
    const { column, purchaseOrderData, direction } = this.state;

    if (column !== clickedColumn) {
      this.setState({
        column: clickedColumn,
        purchaseOrderData: sortBy(purchaseOrderData, [clickedColumn]),
        direction: 'ascending',
      });

      return;
    }

    this.setState({
      purchaseOrderData: purchaseOrderData.reverse(),
      direction: direction === 'ascending' ? 'descending' : 'ascending',
    });
  };

  render() {
    const { purchaseOrderData, column, direction } = this.state;

    const {
      loadingPurchaseOrder,
      t,
    } = this.props;

    return (
      <div className="section-container">

        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('purchaseOrderHomeTitle')}</Header>
            <EssorButton as={Link} to="/business/purchase-orders/create" type="plus" size="tiny" floated="right">
              {t('buttonAdd')}
            </EssorButton>
          </div>

          <Segment
            basic
            className={classnames('table-container', {
              'is-loading': loadingPurchaseOrder,
            })}
          >
            <Dimmer active={loadingPurchaseOrder} inverted>
              <Loader>{t('loading')}</Loader>
            </Dimmer>
            <Table celled striped>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell
                    sorted={column === 'uniqueID' ? direction : null}
                    onClick={this.handleSort('uniqueID')}
                  >
                    #
                  </Table.HeaderCell>

                  <Table.HeaderCell
                    sorted={column === 'creationDate' ? direction : null}
                    onClick={this.handleSort('creationDate')}
                  >
                    {t('formCreationDate')}
                  </Table.HeaderCell>

                  <Table.HeaderCell
                    sorted={column === 'customer' ? direction : null}
                    onClick={this.handleSort('customer')}
                  >
                    {t('formCustomer')}
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    sorted={column === 'totalPrice' ? direction : null}
                    onClick={this.handleSort('totalPrice')}
                  >
                    {t('formTotalPrice')}
                  </Table.HeaderCell>

                  <Table.HeaderCell
                    sorted={column === 'responseDate' ? direction : null}
                    onClick={this.handleSort('responseDate')}
                  >
                    {t('formResponseDate')}
                  </Table.HeaderCell>

                  <Table.HeaderCell />
                  <Table.HeaderCell />
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {purchaseOrderData && purchaseOrderData.map((purchaseOrder, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{purchaseOrder.uniqueID}</Table.Cell>
                    <Table.Cell>{moment(purchaseOrder.creationDate).format('DD/MM/YYYY')}</Table.Cell>
                    <Table.Cell>{purchaseOrder.customer.companyName}</Table.Cell>
                    <Table.Cell>{parseFloat(purchaseOrder.totalPrice).toFixed(2)}</Table.Cell>
                    <Table.Cell>{moment(purchaseOrder.responseDate).format('DD/MM/YYYY')}</Table.Cell>
                    <Table.Cell textAlign="center">
                      <Button
                        as={Link}
                        to={`/business/purchase-orders/${purchaseOrder.id}/edit`}
                        onClick={() => this.selectPurchaseOrder(purchaseOrder, 'edit')}
                        className="table-button"
                        data-tip="Edit"
                        icon="edit"
                      />
                      <ReactTooltip className="essor-tooltip" effect="solid" place="bottom" />
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Button onClick={() => this.selectPurchaseOrder(purchaseOrder)} className="table-button" data-tip="Voir la fiche" icon="eye" />
                      <ReactTooltip className="essor-tooltip" effect="solid" place="bottom" />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </Segment>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  selectDocument: purchase => dispatch(selectDocument(purchase)),
});

const mapStateToProps = state => ({
  dataPurchaseOrder: state.purchaseOrder.list.data,
  loadingPurchaseOrder: state.purchaseOrder.list.loading,
  errorPurchaseOrder: state.purchaseOrder.list.error,

  selectedCompany: state.userCompanies.select.selectedCompany,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(ListPurchaseOrder);

export default withNamespaces('translation')(withRouter(Main));
