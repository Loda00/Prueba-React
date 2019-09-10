import React, { Component } from 'react';
import { Link, Redirect, withRouter } from 'react-router-dom';
import { isEmpty } from 'lodash';
import { connect } from 'react-redux';
import Cleave from 'cleave.js/react';
import { update as updateEmployeeData, reset as resetUpdateEmployeeData } from 'actions/employee-data/update';
import { retrieved } from 'actions/employee-data/show';
import { Form, Dropdown, Grid, Message, Table, Icon, Header } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class UpdateEmployeeData extends Component {
  state = {
    employeeData: null,
    hours: {},
    selectDay: null,
    from: '',
    to: '',
    selectedDayError: false,
    fromError: false,
    toError: false,
  };

  from = React.createRef();

  to = React.createRef();

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      !isEmpty(nextProps.retrievedEmployeeData)
      && !isEmpty(nextProps.retrievedEmployeeData['hydra:member'])
      && nextProps.retrievedEmployeeData['hydra:member'][0] !== prevState.employeeData
    ) {
      const { hours } = nextProps.retrievedEmployeeData['hydra:member'][0];

      return {
        employeeData: nextProps.retrievedEmployeeData['hydra:member'][0],
        hours: isEmpty(hours) ? {} : hours,
      };
    }

    return null;
  }

  componentDidUpdate() {
    const { updated, setEmployeeData } = this.props;

    if (!isEmpty(updated)) {
      const employeeData = {};
      employeeData['hydra:member'] = [];
      employeeData['hydra:member'].push(updated);
      setEmployeeData(employeeData);
    }
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  handleInputChange = (e) => {
    e.preventDefault();

    const { name, value } = e.target;
    const { [`${name}IsEmpty`]: wasEmpty, [`${name}Cleave`]: cleave } = this.state;

    if (!name) return;

    this.setState({
      [name]: value,
    });

    if (name === 'from' || name === 'to') {
      if (value.includes(':') && value.length === 3 && wasEmpty) {
        cleave.setRawValue(`${value}00`);

        this.setState({
          [`${name}IsEmpty`]: false,
          [e.target.name]: `${value}00`,
        }, () => {
          if (name === 'from') {
            this.from.current.element.focus();
            this.from.current.element.setSelectionRange(3, 3);
          } else {
            this.to.current.element.focus();
            this.to.current.element.setSelectionRange(3, 3);
          }
        });
      } else if (value.includes(':') && value.length === 5 && wasEmpty) {
        this.setState({
          [`${name}IsEmpty`]: false,
        });

        e.target.focus();
        e.target.setSelectionRange(3, 3);
      } else if (value.trim() === '') {
        this.setState({
          [`${name}IsEmpty`]: true,
        });
      }
    }
  };

  handleOnBlur = (e) => {
    const { name, value } = e.target;
    const { [`${name}Cleave`]: cleave } = this.state;

    if (value === '0' || value === '1' || value === '2') {
      cleave.setRawValue(`0${value}:00`);
      this.setState({
        [`${name}IsEmpty`]: false,
        [name]: `0${value}:00`,
      });
    }
  };

  handleItemSelect = (e, obj) => {
    e.preventDefault();

    this.setState({
      selectDay: obj.value,
    });
  };

  onFromCleaveInit = (cleave) => {
    this.setState({
      fromCleave: cleave,
    });
  };

  onToCleaveInit = (cleave) => {
    this.setState({
      toCleave: cleave,
    });
  };

  handleOnSubmit = () => {
    const {
      employeeData,
      hours,
    } = this.state;

    const { updateEmployeeData } = this.props;

    this.setState({
      fromError: false,
      toError: false,
      selectedDayError: false,
    });

    const data = {
      hours,
    };

    updateEmployeeData(employeeData, data);
  };

  handleDelete = (e) => {
    const { hours } = this.state;
    const index = e.target.getAttribute('data-id');
    const valueDay = e.target.getAttribute('data-label');

    if (hours[valueDay].length === 1) {
      delete hours[valueDay];
    } else {
      hours[valueDay].splice(index, 1);
    }

    this.setState({
      hours,
    });
  };

  handleAddItem = () => {
    const { selectDay, from, to, hours, fromCleave, toCleave } = this.state;
    let isValid = true;

    this.setState({
      toError: false,
      fromError: false,
      selectedDayError: false,
    });

    const formatTime = t => Number(t.replace(':', ''));

    const formatFrom = formatTime(from);
    const formatTo = formatTime(to);

    if (from.trim() === '' || from.length !== 5) {
      isValid = false;

      this.setState({
        fromError: true,
      });
    }

    if (to.trim() === '' || to.length !== 5) {
      isValid = false;

      this.setState({
        toError: true,
      });
    }

    if (selectDay === null) {
      isValid = false;

      this.setState({
        selectedDayError: true,
      });
    }

    if (formatFrom >= formatTo) {
      isValid = false;

      this.setState({
        toError: true,
        fromError: true,
      });
    }

    if (!isValid) return;

    const itemHour = {
      from,
      to,
    };

    let showListDay;

    if (selectDay in hours) {
      showListDay = hours[selectDay];
      showListDay.push(itemHour);
      this.setState({
        hours: {
          ...hours,
          [selectDay]: showListDay,
        },
      });
    } else {
      const obj = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      };

      for (const i in hours) {
        if (i === 'monday') {
          obj.monday = hours[i];
        } else if (i === 'tuesday') {
          obj.tuesday = hours[i];
        } else if (i === 'wednesday') {
          obj.wednesday = hours[i];
        } else if (i === 'thursday') {
          obj.thursday = hours[i];
        } else if (i === 'friday') {
          obj.friday = hours[i];
        } else if (i === 'saturday') {
          obj.saturday = hours[i];
        } else if (i === 'sunday') {
          obj.sunday = hours[i];
        }
      }

      this.setState({
        hours: {
          ...obj,
          [selectDay]: [
            itemHour,
          ],
        },
      });
    }

    this.setState({
      selectDay: null,
      from: '',
      to: '',
    });

    fromCleave.setRawValue('');
    toCleave.setRawValue('');
  };

  render() {
    const {
      hours,
      from,
      to,
      selectDay,
      selectedDayError,
      fromError,
      toError,
    } = this.state;

    const {
      updated,
      loadingEmployeeData,
      updateLoading,
      updateError,
      match,
      t,
    } = this.props;

    const daysList = [
      {
        text: t('monday'),
        value: 'monday',
      },
      {
        text: t('tuesday'),
        value: 'tuesday',
      },
      {
        text: t('wednesday'),
        value: 'wednesday',
      },
      {
        text: t('thursday'),
        value: 'thursday',
      },
      {
        text: t('friday'),
        value: 'friday',
      },
      {
        text: t('saturday'),
        value: 'saturday',
      }, {
        text: t('sunday'),
        value: 'sunday',
      },
    ];

    if (updated) {
      return (
        <Redirect
          push
          to={{
            pathname: `/employees/${match.params.id}/work-schedule`,
          }}
        />
      );
    }

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('employeeWorkScheduleUpdate')}</Header>
            <EssorButton
              as={Link}
              to={`/employees/${match.params.id}/work-schedule`}
              type="chevron left"
              size="tiny"
              floated="right"
            >
              {t('buttonBack')}
            </EssorButton>
          </div>

          <Form className="margin-top-bot main-form" loading={loadingEmployeeData || updateLoading} size="small">
            <Grid>
              <Grid.Row>
                <Grid.Column width={4}>
                  <Form.Group className="select-list">
                    <Form.Select
                      label={t('formDays')}
                      onChange={this.handleItemSelect}
                      control={Dropdown}
                      placeholder={t('formPHSelect')}
                      fluid
                      search
                      selection
                      noResultsMessage="No results"
                      options={daysList}
                      value={selectDay}
                      error={selectedDayError}
                    />
                  </Form.Group>
                </Grid.Column>
                <Grid.Column width={3}>
                  <h5>{t('formFrom')}</h5>
                  <Form.Input error={fromError}>
                    <Cleave
                      label={t('formFrom')}
                      name="from"
                      placeholder={t('formHour')}
                      value={from}
                      onBlur={this.handleOnBlur}
                      onInit={this.onFromCleaveInit}
                      onChange={this.handleInputChange}
                      options={{
                        time: true, timePattern: ['h', 'm'],
                      }}
                      ref={this.from}
                    />
                  </Form.Input>
                </Grid.Column>

                <Grid.Column width={3}>
                  <h5>{t('formTo')}</h5>
                  <Form.Input error={toError}>
                    <Cleave
                      label={t('formTo')}
                      name="to"
                      placeholder={t('formHour')}
                      value={to}
                      onBlur={this.handleOnBlur}
                      onInit={this.onToCleaveInit}
                      onChange={this.handleInputChange}
                      options={{
                        time: true, timePattern: ['h', 'm'],
                      }}
                      ref={this.to}
                    />
                  </Form.Input>
                </Grid.Column>

                <Grid.Column width={2}>
                  <Form.Group className="select-list">
                    <Form.Field>
                      <label>{' '}</label>
                      <EssorButton
                        fluid
                        icon
                        type="plus"
                        onClick={this.handleAddItem}
                      />
                    </Form.Field>
                  </Form.Group>
                </Grid.Column>
              </Grid.Row>

              <Grid.Row>
                <Grid.Column width={12}>
                  {!isEmpty(hours)
                  && (
                    <div className="select-list">
                      <label>{t('ensemblesSelectedItems')}</label>

                      <Table celled structured className="margin-bot">
                        <Table.Header>
                          <Table.Row>
                            <Table.HeaderCell>{t('formDays')}</Table.HeaderCell>
                            <Table.HeaderCell>{t('formFrom')}</Table.HeaderCell>
                            <Table.HeaderCell>{t('formTo')}</Table.HeaderCell>
                            <Table.HeaderCell />
                          </Table.Row>
                        </Table.Header>

                        <Table.Body>
                          {Object.keys(hours).map((item, index) => (
                            <React.Fragment key={index}>
                              {hours[item].map((hour, index2) => (
                                <Table.Row key={`t${index2}`}>
                                  {index2 === 0
                                  && (
                                    <Table.Cell
                                      rowSpan={hours[item].length}
                                    >
                                      {t(item)}
                                    </Table.Cell>
                                  )}
                                  <Table.Cell collapsing textAlign="center">
                                    {hour.from}
                                  </Table.Cell>
                                  <Table.Cell collapsing textAlign="center">
                                    {hour.to}
                                  </Table.Cell>
                                  <Table.Cell collapsing textAlign="center">
                                    <Icon name="x" data-id={index2} data-label={item} onClick={e => this.handleDelete(e)} />
                                  </Table.Cell>
                                </Table.Row>
                              ))}
                            </React.Fragment>
                          ))}
                        </Table.Body>
                      </Table>
                    </div>
                  )}
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column>
                  <EssorButton type="check" onClick={this.handleOnSubmit} size="small">
                    {t('buttonSave')}
                  </EssorButton>
                </Grid.Column>
              </Grid.Row>
            </Grid>

          </Form>

          {updateError
          && (
            <Message negative>
              <p>{updateError}</p>
            </Message>
          )}
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  updateEmployeeData: (item, data) => dispatch(updateEmployeeData(item, data)),
  setEmployeeData: employeeData => dispatch(retrieved(employeeData)),
  reset: () => {
    dispatch(resetUpdateEmployeeData());
  },
});

const mapStateToProps = state => ({
  retrievedEmployeeData: state.employeeData.show.retrieved,
  loadingEmployeeData: state.employeeData.show.loading,
  errorEmployeeData: state.employeeData.show.error,

  updateError: state.employeeData.update.updateError,
  updateLoading: state.employeeData.update.updateLoading,
  updated: state.employeeData.update.updated,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(UpdateEmployeeData);

export default withNamespaces('translation')(withRouter(Main));
