import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { isEmpty } from 'lodash';
import { connect } from 'react-redux';
import moment from 'moment';
import { Grid, Table, Header, Segment, Dimmer, Loader } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class ShowSchedule extends Component {
  state = {
    data: null,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      !isEmpty(nextProps.retrievedEmployeeData)
      && !isEmpty(nextProps.retrievedEmployeeData['hydra:member'])
      && nextProps.retrievedEmployeeData['hydra:member'][0] !== prevState.employeeData
    ) {
      return {
        data: nextProps.retrievedEmployeeData['hydra:member'][0],
      };
    }

    return null;
  }

  render() {
    const {
      loadingEmployeeData,
      match,
      t,
    } = this.props;

    const { data } = this.state;

    let getHours = 0;

    const getHoursTotal = (t, f) => {
      const start = moment.duration(f, 'HH:mm');
      const end = moment.duration(t, 'HH:mm');
      const diff = end.subtract(start);
      getHours += diff.as('milliseconds');

      return moment.utc(diff.as('milliseconds')).format('HH:mm');
    };

    const formatTotalHour = (getHours) => {
      let hours = (getHours / 1000) / 3600;

      hours = parseInt(hours, 10);
      const minutes = moment.utc(getHours).format('mm');

      return `${hours}:${minutes}`;
    };

    const dataHours = [];

    if (!isEmpty(data)) {
      const sorter = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ];

      sorter.forEach((k) => {
        if (data.hours[k]) {
          dataHours.push({
            day: k,
            hours: data.hours[k],
          });
        }
      });
    }

    return (
      <div className="section-container">
        {loadingEmployeeData
          ? (
            <Segment
              basic
              className="section-loading"
            >
              <Dimmer active={loadingEmployeeData} inverted>
                <Loader>{t('loading')}</Loader>
              </Dimmer>
            </Segment>
          )
          : (
            <div className="section-general">
              {!isEmpty(data)
              && (
                <React.Fragment>
                  <div className="option-buttons-container clearfix">
                    <Header as="h3">{t('employeeWorkSchedule')}</Header>
                    <EssorButton
                      as={Link}
                      to={`/employees/${match.params.id}/work-schedule/edit`}
                      type="edit"
                      size="tiny"
                      floated="right"
                      disabled={!data}
                    >
                      {t('buttonEdit')}
                    </EssorButton>
                  </div>

                  <Grid>
                    {!isEmpty(data.hours)
                    && (
                      <Grid.Row>
                        <Grid.Column width={16}>
                          <div className="select-list">
                            <Table celled structured className="margin-bot">
                              <Table.Header>
                                <Table.Row>
                                  <Table.HeaderCell>{t('formDays')}</Table.HeaderCell>
                                  <Table.HeaderCell>{t('formFrom')}</Table.HeaderCell>
                                  <Table.HeaderCell>{t('formTo')}</Table.HeaderCell>
                                  <Table.HeaderCell textAlign="center">Total</Table.HeaderCell>
                                </Table.Row>
                              </Table.Header>

                              <Table.Body>
                                {dataHours.map((item, index) => (
                                  <React.Fragment key={index}>
                                    {item.hours.map((hour, index) => (
                                      <Table.Row key={`t${index}`}>
                                        {index === 0
                                        && (
                                          <Table.Cell
                                            rowSpan={item.hours.length}
                                          >
                                            {t(item.day)}
                                          </Table.Cell>
                                        )}
                                        <Table.Cell collapsing textAlign="center">
                                          {hour.from}
                                        </Table.Cell>
                                        <Table.Cell collapsing textAlign="center">
                                          {hour.to}
                                        </Table.Cell>
                                        <Table.Cell collapsing textAlign="center">
                                          {getHoursTotal(hour.to, hour.from, true)}
                                        </Table.Cell>
                                      </Table.Row>
                                    ))}
                                  </React.Fragment>
                                ))}
                                <Table.Row>
                                  <Table.Cell />
                                  <Table.Cell colSpan={2}>
                                    {t('companiesTotal')}
                                  </Table.Cell>
                                  <Table.Cell>{formatTotalHour(getHours)}</Table.Cell>
                                </Table.Row>
                              </Table.Body>
                            </Table>
                          </div>
                        </Grid.Column>
                      </Grid.Row>
                    )}
                  </Grid>
                </React.Fragment>
              )}
            </div>
          )
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  retrievedEmployeeData: state.employeeData.show.retrieved,
  loadingEmployeeData: state.employeeData.show.loading,
  errorEmployeeData: state.employeeData.show.error,
});

const Main = connect(mapStateToProps)(ShowSchedule);

export default withNamespaces('translation')(withRouter(Main));
