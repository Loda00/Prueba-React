import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty, find } from 'lodash';
import moment from 'moment';
import { retrieve as retrieveCompanySettings, reset as resetCompanySettings } from 'actions/company-settings/show';
import { list as listHolidays, reset as resetHolidays } from 'actions/holiday/list';
import { update as updateHoliday, reset as resetUpdateHoliday } from 'actions/holiday/update';
import { del as deleteHoliday, success as successDeleteHoliday, loading as loadingDeleteHoliday, error as errorDeleteHoliday } from 'actions/holiday/delete';
import { create as createHoliday, error as errorCreateHoliday, loading as loadingCreateHoliday, success as successHoliday } from 'actions/holiday/create';
import { Button, Dimmer, Form, Header, Loader, Modal, Segment, Table } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';
import classnames from 'classnames';
import ReactTooltip from 'react-tooltip';
import DatePicker from 'react-datepicker';

import 'moment/locale/fr';

moment.locale('fr');

class ShowProduct extends Component {
  state = {
    holidayLabel: '',
    date: null,
    holidayLabelError: false,
    dateError: false,
    toDelete: null,
    toEdit: null,
    holidayData: null,
    isHolidaysLoaded: false,
    deleteHolidayModalOpen: false,
    createHolidayModalOpen: false,
  };

  componentDidMount() {
    const {
      getHolidays,
      getValidDays,
      selectedCompany,
      selectedFiscalYear,
      reset,
    } = this.props;
    reset();
    getHolidays(`/holidays?fiscalYear=${selectedFiscalYear.id}`);
    getValidDays(`/company_settings?company=${selectedCompany.id}&name=OPENING_HOURS`);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.successHoliday || nextProps.updatedHoliday) {
      const {
        resetCreateHoliday,
        resetUpdateHoliday,
        resetHolidayList,
        getHolidays,
        match,
      } = nextProps;
      resetCreateHoliday();
      resetUpdateHoliday();
      resetHolidayList();
      getHolidays(`/holidays?fiscalYear=${match.params.fiscalYearId}`);

      return {
        holidayData: null,
        holidayLabel: '',
        date: null,
        isHolidaysLoaded: false,
        createHolidayModalOpen: false,
      };
    }

    if (nextProps.successDeleteHoliday) {
      const { resetDeleteHoliday, resetHolidayList, getHolidays, match } = nextProps;
      resetDeleteHoliday();
      resetHolidayList();
      getHolidays(`/holidays?fiscalYear=${match.params.fiscalYearId}`);

      return {
        isHolidaysLoaded: false,
        deleteHolidayModalOpen: false,
      };
    }

    if (!isEmpty(nextProps.dataHoliday) && !prevState.isHolidaysLoaded) {
      return {
        holidayData: nextProps.dataHoliday['hydra:member'],
        isHolidaysLoaded: true,
      };
    }

    return null;
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  openDeleteHolidayModal = (id) => {
    const { holidayData } = this.state;
    const item = find(holidayData, {
      '@id': id,
    });

    this.setState({
      deleteHolidayModalOpen: true,
      toDelete: item,
    });
  };

  closeDeleteHolidayModal = () => {
    this.setState({
      deleteHolidayModalOpen: false,
      toDelete: null,
    });
  };

  handleDeleteHoliday = () => {
    const { toDelete } = this.state;
    const { deleteHoliday } = this.props;

    deleteHoliday(toDelete);
  };

  openCreateHolidayModal = (id) => {
    const { holidayData } = this.state;
    const item = find(holidayData, {
      '@id': id,
    });

    this.setState({
      createHolidayModalOpen: true,
      toEdit: item || null,
      holidayLabel: item ? item.label : '',
      date: item ? moment(item.date) : null,
    });
  };

  closeCreateHolidayModal = () => {
    this.setState({
      createHolidayModalOpen: false,
      holidayLabel: '',
      date: null,
      holidayLabelError: false,
      dateError: false,
      toEdit: null,
    });
  };

  handleInputChange = (e) => {
    e.preventDefault();

    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleDateChange = (date) => {
    this.setState({
      date,
    });
  };

  handleHolidaySubmit = () => {
    const { holidayLabel, date, toEdit } = this.state;
    const {
      selectedFiscalYear,
      postHoliday,
      updateHoliday,
    } = this.props;

    const dateEnd = moment(selectedFiscalYear.dateEnd);
    const dateStart = moment(selectedFiscalYear.dateStart);
    const id = selectedFiscalYear['@id'];

    let isValid = true;

    this.setState({
      holidayLabelError: false,
      dateError: false,
    });

    if (holidayLabel.trim() === '') {
      isValid = false;

      this.setState({
        holidayLabelError: true,
      });
    }

    if (!date || date > dateEnd || date < dateStart) {
      isValid = false;

      this.setState({
        dateError: true,
      });
    }

    if (!isValid) return;

    const data = {
      label: holidayLabel,
      date: date.format(),
      fiscalYear: id,
    };

    toEdit ? updateHoliday(toEdit, data) : postHoliday(data);
  };

  fillBusinessDays = () => {
    const { holidayData } = this.state;
    const { selectedFiscalYear, retrievedCompanySettings, t } = this.props;

    if (!selectedFiscalYear) return;

    let { dateStart, dateEnd } = selectedFiscalYear;

    dateStart = moment(dateStart);
    dateEnd = moment(dateEnd);

    const months = [
      t('january'),
      t('february'),
      t('march'),
      t('april'),
      t('may'),
      t('june'),
      t('july'),
      t('august'),
      t('september'),
      t('october'),
      t('november'),
      t('december'),
    ];
    const table = [];
    const validDaysArray = [];

    if (dateStart === '' || retrievedCompanySettings === null || dateEnd === '' || holidayData === null) {
      return null;
    }

    // Getting business days for company

    const validDays = retrievedCompanySettings['hydra:member'][0].value;

    for (const key in validDays) {
      if (Object.prototype.hasOwnProperty.call(validDays, key)) {
        switch (key) {
          case 'monday':
            if (validDays[key].length > 0) validDaysArray.push(1);
            break;
          case 'tuesday':
            if (validDays[key].length > 0) validDaysArray.push(2);
            break;
          case 'wednesday':
            if (validDays[key].length > 0) validDaysArray.push(3);
            break;
          case 'thursday':
            if (validDays[key].length > 0) validDaysArray.push(4);
            break;
          case 'friday':
            if (validDays[key].length > 0) validDaysArray.push(5);
            break;
          case 'saturday':
            if (validDays[key].length > 0) validDaysArray.push(6);
            break;
          case 'sunday':
            if (validDays[key].length > 0) validDaysArray.push(0);
            break;
          default:
            break;
        }
      }
    }

    let aux;
    let monthAux;

    // Total number of iterations based on start date and end date
    const loop = dateEnd.month() > dateStart.month()
      ? (12 * (dateEnd.year() - dateStart.year()) + dateEnd.month() - dateStart.month())
      : (12 * (dateEnd.year() - dateStart.year()) - dateStart.month() + dateEnd.month());

    for (let i = 0; i <= loop; i++) {
      let businessDays = 0;
      let holidayCount = 0;

      switch (i) {
        case 0: { // First iteration
          monthAux = dateStart.month();
          const lastDay = (dateStart.month() === dateEnd.month() && dateStart.year() === dateEnd.year()) // eslint-disable-line
            ? dateEnd.date()
            : dateStart.daysInMonth();
          // From initial date to last day in month
          for (let j = dateStart.date(); j <= lastDay; j++) {
            aux = moment().year(dateStart.year()).month(dateStart.month()).date(j);
            // If day is include on valid days count for business days
            if (validDaysArray.includes(aux.day())) businessDays += 1;
          }
          // Holidays check
          for (let m = 0; m < holidayData.length; m++) {
            const d = moment(holidayData[m].date);
            // If the holiday date coincide with date, it counts for holiday
            if (d.month() === dateStart.month() && d.year() === dateStart.year()) {
              holidayCount += 1;

              if (validDaysArray.includes(d.day())) businessDays -= 1;
            }
          }

          table.push(
            <Table.Row key={`${i}${months[monthAux]}`}>
              <Table.Cell>
                {`${months[monthAux]} - ${aux.year()}`}
              </Table.Cell>
              <Table.Cell>{businessDays}</Table.Cell>
              <Table.Cell>{holidayCount}</Table.Cell>
              <Table.Cell>{aux.daysInMonth()}</Table.Cell>
            </Table.Row>,
          );
          break;
        }
        case loop: { // Last iteration
          monthAux = dateEnd.month();
          for (let j = 1; j <= dateEnd.date(); j++) {
            aux = moment().year(dateEnd.year()).month(dateEnd.month()).date(j);

            if (validDaysArray.includes(aux.day())) businessDays += 1;
          }

          for (let n = 0; n < holidayData.length; n++) {
            const d = moment(holidayData[n].date);

            if (d.month() === dateEnd.month() && d.year() === dateEnd.year()) {
              holidayCount += 1;

              if (validDaysArray.includes(d.day())) businessDays -= 1;
            }
          }

          table.push(
            <Table.Row key={`${i}${months[monthAux]}`}>
              <Table.Cell>
                {`${months[monthAux]} - ${aux.year()}`}
              </Table.Cell>
              <Table.Cell>{businessDays}</Table.Cell>
              <Table.Cell>{holidayCount}</Table.Cell>
              <Table.Cell>{aux.daysInMonth()}</Table.Cell>
            </Table.Row>,
          );
          break;
        }
        default: {
          // Calculating date's month and year
          let actualMonth = dateStart.month() + i;
          const actualYear = actualMonth >= 12
            ? (dateStart.year() + parseInt(actualMonth / 12, 10))
            : dateStart.year();
          actualMonth %= 12; // Set month on range 0-11
          // Set date on moment object
          const forLoopDate = moment().year(actualYear).month(actualMonth).date(1);
          forLoopDate.date(forLoopDate.daysInMonth());

          for (let j = 1; j <= forLoopDate.date(); j++) {
            aux = moment().year(forLoopDate.year()).month(forLoopDate.month()).date(j);

            if (validDaysArray.includes(aux.day())) businessDays += 1;
          }

          for (let n = 0; n < holidayData.length; n++) {
            const d = moment(holidayData[n].date);

            if (d.month() === forLoopDate.month() && d.year() === forLoopDate.year()) {
              holidayCount += 1;

              if (validDaysArray.includes(d.day())) businessDays -= 1;
            }
          }

          table.push(
            <Table.Row key={`${i}${months[actualMonth]}`}>
              <Table.Cell>
                {`${months[actualMonth]} - ${aux.year()}`}
              </Table.Cell>
              <Table.Cell>{businessDays}</Table.Cell>
              <Table.Cell>{holidayCount}</Table.Cell>
              <Table.Cell>{aux.daysInMonth()}</Table.Cell>
            </Table.Row>,
          );
          break;
        }
      }
    }

    return table;
  };

  render() {
    const {
      holidayLabel,
      date,
      holidayLabelError,
      dateError,
      holidayData,
      toEdit,
      createHolidayModalOpen,
      deleteHolidayModalOpen,
    } = this.state;

    const {
      loadingHoliday,
      loadingCreateHoliday,
      loadingDeleteHoliday,
      loadingCompanySettings,
      loadingUpdateHoliday,
      t,
    } = this.props;

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('holidaysHomeTitle')}</Header>
            <EssorButton type="plus" size="tiny" floated="right" onClick={this.openCreateHolidayModal}>
              {t('buttonAdd')}
            </EssorButton>
          </div>

          <Modal
            open={createHolidayModalOpen}
            closeOnEscape={false}
            closeOnDimmerClick={false}
            className="full-content"
          >
            <Modal.Header>{toEdit ? t('holidaysUpdateTitle') : t('holidaysCreateTitle')}</Modal.Header>
            <Modal.Content scrolling>
              <Modal.Description>
                <Form className="margin-top-bot main-form" loading={loadingCreateHoliday || loadingUpdateHoliday} size="small">
                  <Form.Group inline>
                    <Form.Input
                      label={t('formLabel')}
                      name="holidayLabel"
                      placeholder={t('formPHLabel')}
                      value={holidayLabel}
                      onChange={this.handleInputChange}
                      error={holidayLabelError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formDate')}
                      name="date"
                      control={DatePicker}
                      selected={date}
                      onChange={this.handleDateChange}
                      locale="fr"
                      autoComplete="off"
                      error={dateError}
                    />
                  </Form.Group>

                </Form>
              </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
              <EssorButton disabled={loadingCreateHoliday || loadingUpdateHoliday} secondary type="x" size="small" onClick={this.closeCreateHolidayModal}>
                {t('buttonCancel')}
              </EssorButton>

              <EssorButton disabled={loadingCreateHoliday || loadingUpdateHoliday} type="plus" size="small" onClick={this.handleHolidaySubmit}>
                {t('buttonSave')}
              </EssorButton>
            </Modal.Actions>
          </Modal>

          <Segment
            basic
            className={classnames('table-container', {
              'is-loading': loadingHoliday,
            })}
          >
            <Dimmer active={loadingHoliday} inverted>
              <Loader>{t('loading')}</Loader>
            </Dimmer>
            <Table celled striped>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell />
                  <Table.HeaderCell>{t('formLabel')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('formDate')}</Table.HeaderCell>
                  <Table.HeaderCell />
                  <Table.HeaderCell />
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {holidayData && holidayData.map((holiday, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{index + 1}</Table.Cell>
                    <Table.Cell>{holiday.label}</Table.Cell>
                    <Table.Cell>{moment(holiday.date).format('DD/MM/YYYY')}</Table.Cell>
                    <Table.Cell textAlign="center">
                      <Button className="table-button" data-tip="Modifier" icon="edit" onClick={() => this.openCreateHolidayModal(holiday['@id'])} />
                      <ReactTooltip className="essor-tooltip" effect="solid" place="bottom" />
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Button className="table-button" data-tip="Supprimer" icon="trash" onClick={() => this.openDeleteHolidayModal(holiday['@id'])} />
                      <ReactTooltip className="essor-tooltip" effect="solid" place="bottom" />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </Segment>

          <Modal
            open={deleteHolidayModalOpen}
            closeOnEscape
            closeOnDimmerClick={false}
          >
            <Modal.Header>{t('holidayDeleteTitle')}</Modal.Header>
            <Modal.Content scrolling>
              <p>
                Are you sure ?
              </p>
            </Modal.Content>
            <Modal.Actions>
              <EssorButton disabled={loadingDeleteHoliday} loading={loadingDeleteHoliday} secondary type="x" size="small" onClick={this.closeDeleteHolidayModal}>
                {t('buttonCancel')}
              </EssorButton>

              <EssorButton disabled={loadingDeleteHoliday} loading={loadingDeleteHoliday} type="check" size="small" onClick={this.handleDeleteHoliday}>
                {t('buttonYes')}
              </EssorButton>
            </Modal.Actions>
          </Modal>

          <Segment
            basic
            className={classnames('table-container', {
              'is-loading': loadingHoliday || loadingCompanySettings,
            })}
          >
            <Dimmer active={loadingHoliday || loadingCompanySettings} inverted>
              <Loader>{t('loading')}</Loader>
            </Dimmer>
            <Table celled striped>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>{t('month')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('businessDays')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('holidays')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('monthDays')}</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {this.fillBusinessDays()}
              </Table.Body>
            </Table>
          </Segment>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  getValidDays: page => dispatch(retrieveCompanySettings(page)),
  getHolidays: page => dispatch(listHolidays(page)),

  postHoliday: data => dispatch(createHoliday(data)),
  updateHoliday: (item, data) => dispatch(updateHoliday(item, data)),
  deleteHoliday: item => dispatch(deleteHoliday(item)),

  resetCreateHoliday: () => {
    dispatch(successHoliday(null));
    dispatch(loadingCreateHoliday(false));
    dispatch(errorCreateHoliday(null));
  },
  resetDeleteHoliday: () => {
    dispatch(successDeleteHoliday(null));
    dispatch(loadingDeleteHoliday(false));
    dispatch(errorDeleteHoliday(null));
  },
  resetUpdateHoliday: () => dispatch(resetUpdateHoliday()),
  resetHolidayList: () => dispatch(resetHolidays()),
  reset: () => {
    dispatch(resetHolidays());
    dispatch(resetCompanySettings());
  },
});

const mapStateToProps = state => ({
  selectedCompany: state.userCompanies.select.selectedCompany,
  selectedFiscalYear: state.userCompanies.select.selectedFiscalYear,

  dataHoliday: state.holiday.list.data,
  loadingHoliday: state.holiday.list.loading,
  errorHoliday: state.holiday.list.error,
  retrievedCompanySettings: state.companySettings.show.retrieved,
  loadingCompanySettings: state.companySettings.show.loading,
  errorCompanySettings: state.companySettings.show.error,
  updatedHoliday: state.holiday.update.updated,
  loadingUpdateHoliday: state.holiday.update.updateLoading,
  errorUpdateHoliday: state.holiday.update.updateError,
  successDeleteHoliday: state.holiday.del.deleted,
  loadingDeleteHoliday: state.holiday.del.loading,
  errorDeleteHoliday: state.holiday.del.error,
  successHoliday: state.holiday.create.created,
  loadingCreateHoliday: state.holiday.create.loading,
  errorCreateHoliday: state.holiday.create.error,
});


const Main = connect(mapStateToProps, mapDispatchToProps)(ShowProduct);

export default withNamespaces('translation')(withRouter(Main));
