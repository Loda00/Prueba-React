import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty, sortBy } from 'lodash';
import { selectDocument } from 'actions/user-companies/select';
import { Button, Dimmer, Header, Loader, Segment, Table } from 'semantic-ui-react';
import { withNamespaces } from 'react-i18next';
import classnames from 'classnames';
import ReactTooltip from 'react-tooltip';

class ListModel extends Component {
  state = {
    modelData: null,
    column: null,
    direction: null,
  };

  componentDidMount() {
    const { selectDocument } = this.props;

    selectDocument(null);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.dataModel) && nextProps.dataModel['hydra:member'] !== prevState.modelData) {
      return {
        modelData: nextProps.dataModel['hydra:member'],
      };
    }

    return null;
  }

  handleSort = clickedColumn => () => {
    const { column, modelData, direction } = this.state;

    if (column !== clickedColumn) {
      this.setState({
        column: clickedColumn,
        modelData: sortBy(modelData, [clickedColumn]),
        direction: 'ascending',
      });

      return;
    }

    this.setState({
      modelData: modelData.reverse(),
      direction: direction === 'ascending' ? 'descending' : 'ascending',
    });
  };

  render() {
    const { modelData, column, direction } = this.state;

    const {
      loadingModel,
      t,
    } = this.props;

    return (
      <div className="section-container">

        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('invoiceHomeTitle')}</Header>
          </div>

          <Segment
            basic
            className={classnames('table-container', {
              'is-loading': loadingModel,
            })}
          >
            <Dimmer active={loadingModel} inverted>
              <Loader>{t('loading')}</Loader>
            </Dimmer>
            <Table sortable celled striped>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell
                    sorted={column === 'id' ? direction : null}
                    onClick={this.handleSort('id')}
                  >
                    #
                  </Table.HeaderCell>


                  <Table.HeaderCell
                    sorted={column === 'label' ? direction : null}
                    onClick={this.handleSort('label')}
                  >
                    {t('formLabel')}
                  </Table.HeaderCell>


                  <Table.HeaderCell />
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {modelData && modelData.map((model, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{model.id}</Table.Cell>
                    <Table.Cell>{model.label}</Table.Cell>

                    <Table.Cell textAlign="center">
                      <Button as={Link} to={`/business/models/${model.id}/edit`} className="table-button" data-tip="Voir la fiche" icon="eye" />
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
  dataModel: state.model.list.data,
  loadingModel: state.model.list.loading,
  errorModel: state.model.list.error,

  selectedCompany: state.userCompanies.select.selectedCompany,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(ListModel);

export default withNamespaces('translation')(withRouter(Main));
