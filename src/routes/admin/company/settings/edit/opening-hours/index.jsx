import React, { Component } from 'react';
import { isEmpty } from 'lodash';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { retrieve, update, reset } from 'actions/company-settings/update';
import { Form, Header, Grid, Dropdown, Message, Icon, Table } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';
import Cleave from 'cleave.js/react';

class OpeningHours extends Component {
  state = {
    value: {},
    from: '',
    to: '',
    selectDay: null,
    isCompanyLoaded: false,
    selectedDayError: false,
    fromIsEmpty: true, // eslint-disable-line
    toIsEmpty: true, // eslint-disable-line
  };

  from = React.createRef();

  to = React.createRef();

  componentDidMount() {
    const { retrieve, selectedCompany } = this.props;

    retrieve(`/company_settings?company=${selectedCompany.id}&name=OPENING_HOURS`);
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.retrieved && nextProps.retrieved['hydra:member'][0].name === 'OPENING_HOURS' && !prevState.isCompanyLoaded) {
      return {
        isCompanyLoaded: true,
        value: nextProps.retrieved['hydra:member'][0].value,
      };
    }

    return null;
  }

  handleItemSelect = (e, obj) => {
    e.preventDefault();

    this.setState({
      selectDay: obj.value,
    });
  };

  handleInputChange = (e) => {
    e.preventDefault();

    const { name, value } = e.target;
    const { [`${name}IsEmpty`]: wasEmpty } = this.state;

    if (!name) return;

    this.setState({
      [name]: value,
    });

    if (value.includes(':') && value.length === 3 && wasEmpty) {
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
  };

  handleAddItem = () => {
    const { selectDay, from, to, value, fromCleave, toCleave } = this.state;
    let isValid = true;

    this.setState({
      toError: false,
      fromError: false,
      selectedDayError: false,
    });

    const formatTime = t => Number(t.replace(':', ''));

    const formatFrom = formatTime(from);
    const formatTo = formatTime(to);

    if (isEmpty(from) || from.length !== 5) {
      isValid = false;

      this.setState({
        fromError: true,
      });
    }

    if (isEmpty(to) || to.length !== 5) {
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

    if (formatFrom > formatTo) {
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

    if (selectDay in value) {
      showListDay = value[selectDay];
      showListDay.push(itemHour);

      this.setState({
        value: {
          ...value,
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

      for (const i in value) {
        if (i === 'monday') {
          obj.monday = value[i];
        } else if (i === 'tuesday') {
          obj.tuesday = value[i];
        } else if (i === 'wednesday') {
          obj.wednesday = value[i];
        } else if (i === 'thursday') {
          obj.thursday = value[i];
        } else if (i === 'friday') {
          obj.friday = value[i];
        } else if (i === 'saturday') {
          obj.saturday = value[i];
        } else if (i === 'sunday') {
          obj.sunday = value[i];
        }
      }

      this.setState({
        value: {
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

  handleDelete = (e) => {
    const { value } = this.state;
    const index = e.target.getAttribute('data-id');
    const valueDay = e.target.getAttribute('data-label');

    if (value[valueDay].length === 1) {
      delete value[valueDay];
    } else {
      value[valueDay].splice(index, 1);
    }

    this.setState({
      value,
    });
  };

  handleOnSubmit = () => {
    const { value } = this.state;

    const { update, retrieved } = this.props;

    const data = {
      value,
    };

    update(retrieved['hydra:member'][0], data);
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

  render() {
    const {
      value,
      from,
      to,
      selectDay,
      selectedDayError,
      fromError,
      toError,
    } = this.state;

    const { retrieveLoading, updateLoading, updateError, t } = this.props;

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

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('companiesOpeningHours')}</Header>
            <EssorButton as={Link} to="/company/settings/opening-hours" type="chevron left" size="tiny" floated="right">
              {t('buttonBack')}
            </EssorButton>
          </div>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form loading={retrieveLoading || updateLoading} size="small">
                  <Grid>
                    <Grid.Row>
                      <Grid.Column width={5}>
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
                      <Grid.Column width={4}>
                        <h5>{t('formFrom')}</h5>
                        <Form.Input error={fromError}>
                          <Cleave
                            label={t('formFrom')}
                            name="from"
                            placeholder={t('formHour')}
                            value={from}
                            onInit={this.onFromCleaveInit}
                            onChange={this.handleInputChange}
                            options={{
                              time: true, timePattern: ['h', 'm'],
                            }}
                            ref={this.from}
                          />
                        </Form.Input>
                      </Grid.Column>

                      <Grid.Column width={4}>
                        <h5>{t('formTo')}</h5>
                        <Form.Input error={toError}>
                          <Cleave
                            label={t('formTo')}
                            name="to"
                            placeholder={t('formHour')}
                            value={to}
                            onInit={this.onToCleaveInit}
                            onChange={this.handleInputChange}
                            options={{
                              time: true, timePattern: ['h', 'm'],
                            }}
                            ref={this.to}
                          />
                        </Form.Input>
                      </Grid.Column>

                      <Grid.Column width={3}>
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
                      <Grid.Column width={16}>

                        <div className="select-list">
                          <label>{t('companiesList')}</label>

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
                              {!isEmpty(value)
                                && Object.keys(value).map((item, index) => {
                                  let label;
                                  switch (item) {
                                    case 'monday': label = t('monday');
                                      break;
                                    case 'tuesday': label = t('tuesday');
                                      break;
                                    case 'wednesday': label = t('wednesday');
                                      break;
                                    case 'thursday': label = t('thursday');
                                      break;
                                    case 'friday': label = t('friday');
                                      break;
                                    case 'saturday': label = t('saturday');
                                      break;
                                    case 'sunday': label = t('sunday');
                                      break;
                                    default: break;
                                  }
                                  return (
                                    <React.Fragment key={index}>
                                      {value[item].map((hour, index2) => (
                                        <Table.Row key={`t${index2}`}>
                                          {index2 === 0
                                            && (
                                              <Table.Cell rowSpan={value[item].length}>
                                                {label}
                                              </Table.Cell>
                                            )
                                          }
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
                                      ))
                                      }
                                    </React.Fragment>
                                  );
                                })
                              }
                            </Table.Body>
                          </Table>
                        </div>

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
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
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
  retrieve: id => dispatch(retrieve(id)),
  update: (item, values) => dispatch(update(item, values)),
  reset: () => {
    dispatch(reset());
  },
});

const mapStateToProps = state => ({
  retrieveError: state.companySettings.update.retrieveError,
  retrieveLoading: state.companySettings.update.retrieveLoading,
  updateError: state.companySettings.update.updateError,
  updateLoading: state.companySettings.update.updateLoading,
  retrieved: state.companySettings.update.retrieved,
  updated: state.companySettings.update.updated,
  selectedCompany: state.userCompanies.select.selectedCompany,
});


const Main = connect(mapStateToProps, mapDispatchToProps)(OpeningHours);

export default withNamespaces('translation')(withRouter(Main));
