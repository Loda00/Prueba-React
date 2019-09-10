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

class ListInvoice extends Component {
  state = {
    invoiceData: null,
    column: null,
    direction: null,
  };

  componentDidMount() {
    const { selectDocument } = this.props;

    selectDocument(null);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.dataInvoice) && nextProps.dataInvoice['hydra:member'] !== prevState.invoiceData) {
      return {
        invoiceData: nextProps.dataInvoice['hydra:member'],
      };
    }

    return null;
  }

  selectInvoice = (invoice) => {
    const { selectDocument, history } = this.props;

    selectDocument(invoice);

    history.push(`/business/invoice/${invoice.id}`);
  };

  handleSort = clickedColumn => () => {
    const { column, invoiceData, direction } = this.state;

    if (column !== clickedColumn) {
      this.setState({
        column: clickedColumn,
        invoiceData: sortBy(invoiceData, [clickedColumn]),
        direction: 'ascending',
      });

      return;
    }

    this.setState({
      invoiceData: invoiceData.reverse(),
      direction: direction === 'ascending' ? 'descending' : 'ascending',
    });
  };

  render() {
    const { invoiceData, column, direction } = this.state;

    const {
      loadingInvoice,
      t,
    } = this.props;

    return (
      <div className="section-container">

        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('invoiceHomeTitle')}</Header>
            <EssorButton as={Link} to="/business/invoices/create" type="plus" size="tiny" floated="right">
              {t('buttonAdd')}
            </EssorButton>
          </div>

          <Segment
            basic
            className={classnames('table-container', {
              'is-loading': loadingInvoice,
            })}
          >
            <Dimmer active={loadingInvoice} inverted>
              <Loader>{t('loading')}</Loader>
            </Dimmer>
            <Table sortable celled striped>
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
                    sorted={column === 'FollowUp' ? direction : null}
                    onClick={this.handleSort('FollowUp')}
                  >
                    {t('formFollowUpDate')}
                  </Table.HeaderCell>

                  <Table.HeaderCell
                    sorted={column === 'responseDate' ? direction : null}
                    onClick={this.handleSort('responseDate')}
                  >
                    {t('formResponseDate')}
                  </Table.HeaderCell>

                  <Table.HeaderCell />
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {invoiceData && invoiceData.map((invoice, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{invoice.uniqueID}</Table.Cell>
                    <Table.Cell>{moment(invoice.creationDate).format('DD/MM/YYYY')}</Table.Cell>

                    <Table.Cell>{invoice.customer.companyName}</Table.Cell>
                    <Table.Cell>{parseFloat(invoice.totalPrice).toFixed(2)}</Table.Cell>

                    <Table.Cell textAlign="center">
                      {isEmpty(invoice.followUp)
                        ? '-'
                        : moment(invoice.followUp[0].date).format('DD/MM/YYYY')}
                    </Table.Cell>
                    <Table.Cell textAlign="center">{moment(invoice.responseDate).format('DD/MM/YYYY')}</Table.Cell>

                    <Table.Cell textAlign="center">
                      <Button onClick={() => this.selectInvoice(invoice)} as={Link} to={`/business/invoices/${invoice.id}`} className="table-button" data-tip="Voir la fiche" icon="eye" />
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
  selectDocument: invoice => dispatch(selectDocument(invoice)),
});

const mapStateToProps = state => ({
  dataInvoice: state.invoice.list.data,
  loadingInvoice: state.invoice.list.loading,
  errorInvoice: state.invoice.list.error,

  selectedCompany: state.userCompanies.select.selectedCompany,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(ListInvoice);

export default withNamespaces('translation')(withRouter(Main));
