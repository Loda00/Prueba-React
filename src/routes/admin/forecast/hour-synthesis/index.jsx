import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { find, findIndex, isEmpty } from 'lodash';
import { list as listHourSynthesis, reset as resetListHourSynthesis } from 'actions/hour-synthesis/list';
import { update as updateHourSynthesis, reset as resetUpdateHourSynthesis } from 'actions/hour-synthesis/update';
import { retrieve as retrieveHourSynthesis, reset as resetRetrievedHourSynthesis } from 'actions/hour-synthesis/show';
import { Label, Dimmer, Input, Header, Loader, Segment, Table } from 'semantic-ui-react';
import { EssorButton, toast } from 'components';
import { withNamespaces } from 'react-i18next';
import classnames from 'classnames';
import Cleave from 'cleave.js/react';

class ShowCompany extends Component {
  state = {
    hourSynthesisData: [],
  };

  componentDidMount() {
    const { getHourSynthesis, getHourSynthesisList, selectedFiscalYear } = this.props;

    getHourSynthesis(`/fiscal_years/${selectedFiscalYear.id}/hours_synthesis/`);
    getHourSynthesisList(`/hour_syntheses?fiscalYear=${selectedFiscalYear.id}`);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.dataHourSynthesis) && nextProps.dataHourSynthesis['hydra:member'] !== prevState.hourSynthesisData) {
      return {
        hourSynthesisData: nextProps.dataHourSynthesis['hydra:member'],
      };
    }

    return null;
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  handleInputChange = (e) => {
    const { name, value } = e.target;
    const { hourSynthesisData } = this.state;
    const keys = name.split('.');

    const item = find(hourSynthesisData, {
      id: parseInt(keys[0], 10),
    });
    const index = findIndex(hourSynthesisData, {
      id: parseInt(keys[0], 10),
    });

    item[keys[1]] = value;

    switch (keys[1]) {
      case 'adaptedHours':
        if (parseFloat(item.adaptedHours) && parseFloat(item.hoursToSell)
          && parseFloat(item.hoursToSell) !== 0) {
          item.percentage = (item.adaptedHours * 100 / item.hoursToSell).toFixed(2).toString();
        } else {
          item.percentage = '0';
        }
        break;
      case 'percentage':
        if (parseFloat(item.hoursToSell) && parseFloat(item.percentage)) {
          item.adaptedHours = Math.ceil(item.hoursToSell * item.percentage / 100).toString();
        } else {
          item.adaptedHours = '0';
        }
        break;
      default: break;
    }

    hourSynthesisData[index] = item;

    this.setState({
      hourSynthesisData,
    });
  };

  handleOnSubmit = () => {
    const { hourSynthesisData } = this.state;
    const { updateHourSynthesis, t } = this.props;
    const promises = [];

    hourSynthesisData.forEach((item) => {
      promises.push(updateHourSynthesis(item, item));
    });

    Promise.all(promises)
      .then(() => toast.success(t('hourSynthesisUpdateSuccess')));
  };

  render() {
    const { hourSynthesisData } = this.state;

    const {
      retrievedHourSynthesis,
      loadingRetrieveHourSynthesis,

      loadingUpdateHourSynthesis,

      loadingListHourSynthesis,

      t,
    } = this.props;

    let workedDaysTotal = 0;
    let hoursToSellTotal = 0;
    let adaptedHoursTotal = 0;

    if (!isEmpty(hourSynthesisData)) {
      hourSynthesisData.forEach((item) => {
        workedDaysTotal += parseFloat(item.workedDays);
        hoursToSellTotal += parseFloat(item.hoursToSell);
        adaptedHoursTotal += parseFloat(item.adaptedHours);
      });
    }

    const percentageTotal = hoursToSellTotal !== 0
      ? (adaptedHoursTotal * 100 / hoursToSellTotal)
      : 0;

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('companiesHoursSynthesis')}</Header>
          </div>

          <Segment
            basic
            className={classnames('table-container', {
              'is-loading': loadingRetrieveHourSynthesis,
            })}
          >
            <Dimmer active={loadingRetrieveHourSynthesis} inverted>
              <Loader>{t('loading')}</Loader>
            </Dimmer>
            <Table celled striped>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell />
                  <Table.HeaderCell>{t('companiesHours')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('companiesHourlyCost')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('companiesTotalCost')}</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {retrievedHourSynthesis
                && (
                  <React.Fragment>
                    <Table.Row>
                      <Table.Cell>{t('companiesWorkingHours')}</Table.Cell>
                      <Table.Cell>{retrievedHourSynthesis.workedHours.hours}</Table.Cell>
                      <Table.Cell>{retrievedHourSynthesis.workedHours.hourlyCost}</Table.Cell>
                      <Table.Cell>{retrievedHourSynthesis.workedHours.totalCost}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>{t('companiesSellingHours')}</Table.Cell>
                      <Table.Cell>{retrievedHourSynthesis.sellingHours.hours}</Table.Cell>
                      <Table.Cell>{retrievedHourSynthesis.sellingHours.hourlyCost}</Table.Cell>
                      <Table.Cell>{retrievedHourSynthesis.sellingHours.totalCost}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>{t('companiesUnsoldHours')}</Table.Cell>
                      <Table.Cell>{retrievedHourSynthesis.unsoldHours.hours}</Table.Cell>
                      <Table.Cell>{retrievedHourSynthesis.unsoldHours.hourlyCost}</Table.Cell>
                      <Table.Cell>{retrievedHourSynthesis.unsoldHours.totalCost}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>{t('companiesTotal')}</Table.Cell>
                      <Table.Cell>{retrievedHourSynthesis.total.hours}</Table.Cell>
                      <Table.Cell>{retrievedHourSynthesis.total.hourlyCost}</Table.Cell>
                      <Table.Cell>{retrievedHourSynthesis.total.totalCost}</Table.Cell>
                    </Table.Row>
                  </React.Fragment>
                )}
              </Table.Body>
            </Table>
          </Segment>
        </div>

        {!isEmpty(hourSynthesisData)
        && (
          <div className="section-general">
            <div className="option-buttons-container clearfix">
              <Header as="h3">Monthly hour synthesis</Header>
            </div>

            <Segment
              basic
              className={classnames('table-container', {
                'is-loading': loadingListHourSynthesis || loadingUpdateHourSynthesis,
              })}
            >
              <Dimmer active={loadingListHourSynthesis || loadingUpdateHourSynthesis} inverted>
                <Loader>{t('loading')}</Loader>
              </Dimmer>
              <Table celled striped>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Date</Table.HeaderCell>
                    <Table.HeaderCell>Worked days</Table.HeaderCell>
                    <Table.HeaderCell>Hours to sell</Table.HeaderCell>
                    <Table.HeaderCell>Adapted hours</Table.HeaderCell>
                    <Table.HeaderCell>Percentage</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {hourSynthesisData.map(item => (
                    <Table.Row key={item['@id']}>
                      <Table.Cell>{`${item.year} - ${item.month}`}</Table.Cell>
                      <Table.Cell textAlign="center">{parseFloat(item.workedDays)}</Table.Cell>
                      <Table.Cell textAlign="center">
                        {parseFloat(item.hoursToSell).toFixed(2)}
                      </Table.Cell>
                      <Table.Cell>
                        <Input>
                          <Cleave
                            options={{
                              numeral: true,
                              numeralThousandsGroupStyle: 'none',
                              numeralDecimalScale: 0,
                            }}
                            name={`${item.id}.adaptedHours`}
                            value={item.adaptedHours}
                            onChange={this.handleInputChange}
                          />
                        </Input>
                      </Table.Cell>
                      <Table.Cell>
                        <Input labelPosition="left">
                          <Label>%</Label>
                          <Cleave
                            options={{
                              numeral: true,
                              numeralThousandsGroupStyle: 'none',
                              numeralDecimalScale: 2,
                            }}
                            name={`${item.id}.percentage`}
                            value={item.percentage}
                            onChange={this.handleInputChange}
                          />
                        </Input>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
                <Table.Footer>
                  <Table.Row textAlign="center">
                    <Table.HeaderCell>{t('companiesTotal')}</Table.HeaderCell>
                    <Table.HeaderCell>{workedDaysTotal}</Table.HeaderCell>
                    <Table.HeaderCell>{hoursToSellTotal}</Table.HeaderCell>
                    <Table.HeaderCell>{adaptedHoursTotal}</Table.HeaderCell>
                    <Table.HeaderCell>{percentageTotal.toFixed(2)}</Table.HeaderCell>
                  </Table.Row>
                </Table.Footer>
              </Table>

              <EssorButton
                type="check"
                primary
                onClick={this.handleOnSubmit}
                disabled={hoursToSellTotal > adaptedHoursTotal}
              >
                {t('buttonSave')}
              </EssorButton>
            </Segment>
          </div>
        )}
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  getHourSynthesis: page => dispatch(retrieveHourSynthesis(page)),
  getHourSynthesisList: page => dispatch(listHourSynthesis(page)),
  updateHourSynthesis: (item, data) => dispatch(updateHourSynthesis(item, data)),
  resetUpdateHourSynthesis: () => dispatch(resetUpdateHourSynthesis()),
  reset: () => {
    dispatch(resetListHourSynthesis());
    dispatch(resetUpdateHourSynthesis());
    dispatch(resetRetrievedHourSynthesis());
  },
});

const mapStateToProps = state => ({
  retrievedHourSynthesis: state.hourSynthesis.show.retrieved,
  loadingRetrieveHourSynthesis: state.hourSynthesis.show.loading,
  errorRetrieveHourSynthesis: state.hourSynthesis.show.error,

  updatedHourSynthesis: state.hourSynthesis.update.updated,
  loadingUpdateHourSynthesis: state.hourSynthesis.update.updateLoading,
  errorUpdateHourSynthesis: state.hourSynthesis.update.updateError,

  dataHourSynthesis: state.hourSynthesis.list.data,
  loadingListHourSynthesis: state.hourSynthesis.list.loading,
  errorListHourSynthesis: state.hourSynthesis.list.error,

  selectedFiscalYear: state.userCompanies.select.selectedFiscalYear,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(ShowCompany);

export default withNamespaces('translation')(withRouter(Main));
