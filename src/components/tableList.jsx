import React, { Component } from 'react';
import classnames from 'classnames';
import { map, isEmpty, sortBy, findIndex, find } from 'lodash';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Link, withRouter } from 'react-router-dom';
import { Table, Dimmer, Loader, Segment, Dropdown, Button, Checkbox, Icon } from 'semantic-ui-react';
import ReactTooltip from 'react-tooltip';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class TableList extends Component {
  state = {
    data: [],
    headers: [],
    activeHeaders: [],
    activeAttributes: [],
    filters: [],
    columnActive: null,
    direction: null,
    isLoaded: false,
    isFilterer: false,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.columns && !prevState.isLoaded) {
      const names = [];
      const activeNames = [];
      const activeAttributes = [];
      const filter = [];

      map(nextProps.columns, ({ name, attribute, filterable, sortable }) => {
        names.push({
          name,
          attribute,
          sortable,
        });

        activeNames.push({
          name,
          attribute,
          sortable,
        });

        activeAttributes.push(attribute);

        if (filterable) {
          filter.push({
            text: name,
            value: attribute,
          });
        }
      });

      return {
        isLoaded: true,
        activeHeaders: activeNames,
        headers: names,
        activeAttributes,
        filters: filter,
      };
    }
    if (!isEmpty(nextProps.data) && prevState.data.length === 0) {
      return {
        data: nextProps.data,
      };
    }

    return null;
  }

  handleSort = clickedColumn => () => {
    if (!clickedColumn.sortable) return;

    const { columnActive, data, direction } = this.state;

    if (columnActive !== clickedColumn.attribute) {
      this.setState({
        columnActive: clickedColumn.attribute,
        data: sortBy(data, [clickedColumn.attribute]),
        direction: 'ascending',
      });

      return;
    }

    this.setState({
      data: data.reverse(),
      direction: direction === 'ascending' ? 'descending' : 'ascending',
    });
  };

  handleCheckboxChange = (e, field) => {
    const { value, checked } = field;
    const { activeHeaders, activeAttributes, headers, filters } = this.state;
    let { isFilterer } = this.state;

    if (!checked && isFilterer) {
      const generalIndex = findIndex(activeHeaders, ['attribute', value]);

      activeHeaders.splice(generalIndex, 1);
      activeAttributes.splice(generalIndex, 1);
    } else if (checked && isFilterer) {
      const item = find(headers, ['attribute', value]);

      activeAttributes.push(value);
      activeHeaders.push(item);
    } else if (checked && !isFilterer) {
      for (let i = 0; i < filters.length; i += 1) {
        const index = findIndex(activeHeaders, ['attribute', filters[i].value]);
        activeHeaders.splice(index, 1);
        activeAttributes.splice(index, 1);
      }

      const item = find(headers, ['attribute', value]);

      activeHeaders.push(item);
      activeAttributes.push(value);
      isFilterer = true;
    }

    this.setState({
      activeHeaders,
      activeAttributes,
      isFilterer,
    });
  };

  resetFilters = (e) => {
    e.preventDefault();
    const { filters } = this.state;
    const { columns } = this.props;

    const activeNames = [];
    const activeAttributes = [];

    for (let i = 0; i < filters.length; i += 1) {
      this[`ref${i}`].state.checked = false;
    }

    map(columns, ({ name, attribute, sortable }) => {
      activeNames.push({
        name,
        attribute,
        sortable,
      });

      activeAttributes.push(attribute);
    });

    this.setState({
      activeHeaders: activeNames,
      activeAttributes,
      isFilterer: false,
    });
  };

  handleCheckboxClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  format = (data) => {
    if (typeof data === 'boolean') {
      if (data) {
        return (
          <Table.Cell textAlign="center">
            <Icon color="green" name="checkmark" size="large" />
          </Table.Cell>
        );
      }
      return (
        <Table.Cell textAlign="center">
          <Icon color="red" name="close" size="large" />
        </Table.Cell>
      );
    }

    if (moment(data, 'YYYY-MM-DD', true).isValid()) {
      return (
        <Table.Cell>
          {moment(data).format('DD/MM/YYYY')}
        </Table.Cell>
      );
    }

    return (
      <Table.Cell>
        {data}
      </Table.Cell>
    );
  };

  render() {
    const { filterBtn, exportBtn, addLink, loading, onView, t, history } = this.props;
    const { activeHeaders, activeAttributes, filters, columnActive, direction, data } = this.state;

    return (
      <React.Fragment>
        <div className="option-buttons-container clearfix">
          { filterBtn
            && (
              <EssorButton type="filter" size="tiny" floated="left">
                {t('buttonFilter')}
              </EssorButton>
            )
          }
          <Dropdown
            multiple
            className="tiny-select selection"
            placeholder={t('buttonOptionSelect')}
            value={[]}
          >
            <Dropdown.Menu>
              {filters.map((filter, index) => (
                <Dropdown.Item key={index}>
                  <Checkbox
                    label={filter.text}
                    value={filter.value}
                    onClick={this.handleCheckboxClick}
                    onChange={this.handleCheckboxChange}
                    ref={(input) => {
                      this[`ref${index}`] = input;
                    }}
                  />
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          { exportBtn
            && (
              <EssorButton type="file pdf" size="tiny" floated="left" secondary>
                {`${t('buttonExport')} PDF`}
              </EssorButton>
            )
          }

          <EssorButton type="x" size="tiny" floated="left" secondary onClick={this.resetFilters}>
            {t('buttonReset')}
          </EssorButton>

          { addLink
            && (
              <EssorButton as={Link} to={addLink} type="plus" size="tiny" floated="right">
                {t('buttonAdd')}
              </EssorButton>
            )
          }
        </div>

        <Segment
          basic
          className={classnames('table-container', {
            'is-loading': loading,
          })}
        >
          <Dimmer active={loading} inverted>
            <Loader>Loading</Loader>
          </Dimmer>
          <Table sortable celled striped>
            <Table.Header>
              <Table.Row>
                {activeHeaders.map((header, index) => (
                  <Table.HeaderCell
                    key={index}

                    sorted={columnActive === header.attribute ? direction : null}

                    onClick={this.handleSort(header)}
                  >
                    {header.name}
                  </Table.HeaderCell>
                ))}
                <Table.HeaderCell colSpan="2" />
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {Object.keys(data).map(item => (
                <Table.Row key={data[item].id}>
                  {activeAttributes.map((key, index) => (
                    <React.Fragment key={index}>
                      {this.format(data[item][key])}
                    </React.Fragment>
                  ))}
                  <Table.Cell textAlign="center">
                    {onView
                      ? <Button onClick={() => onView(data[item])} className="table-button" data-tip="Voir la fiche" icon="eye" />
                      : <Button onClick={() => history.push(data[item]['@id'])} className="table-button" data-tip="Voir la fiche" icon="eye" />
                    }
                    <ReactTooltip className="essor-tooltip" effect="solid" place="bottom" />
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    <Button className="table-button" data-tip="Supprimer" icon="trash alternate" />
                    <ReactTooltip className="essor-tooltip" effect="solid" place="bottom" />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Segment>
      </React.Fragment>
    );
  }
}

TableList.propTypes = {
  filterBtn: PropTypes.bool, // filter button
  exportBtn: PropTypes.bool, // export button
  addLink: PropTypes.string, // Link for create respective object
  loading: PropTypes.bool.isRequired, // Boolean for loading data
  columns: PropTypes.array.isRequired, // Object for table format and data showed
  data: PropTypes.PropTypes.oneOfType([ // Data for table
    PropTypes.array,
    PropTypes.object,
  ]).isRequired,
};

TableList.defaultProps = {
  filterBtn: false,
  exportBtn: false,
  addLink: false,
};

/* columns object example:

const columns = [
  {
    name: 'First name',
    attribute: 'firstName',
    filterable: true,
    sortable: false,
  },
  {
    name: 'Last name',
    attribute: 'lastName',
    filterable: true,
    sortable: true,
  },
  {
    name: 'Job title',
    attribute: 'jobTitle',
    filterable: false,
    sortable: true,
  },
];
 */

export default withNamespaces('translation')(withRouter(TableList));
