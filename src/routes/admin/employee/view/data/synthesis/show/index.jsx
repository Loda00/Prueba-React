import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { Form, Grid, Table, Header, Dimmer, Loader, Segment } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class ShowData extends Component {
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
                    <Header as="h3">{t('employeeDataAndSynthesis')}</Header>
                    <EssorButton
                      as={Link}
                      to={`/employees/${match.params.id}/data-synthesis/edit`}
                      type="edit"
                      size="tiny"
                      floated="right"
                      disabled={!data}
                    >
                      {t('buttonEdit')}
                    </EssorButton>
                  </div>

                  <Grid>
                    <Grid.Row>
                      <Grid.Column width={12}>
                        <Form className="margin-top-bot main-form" size="small">
                          <Form.Group inline>
                            <Form.Field>
                              <label>{t('formFiscalYear')}</label>
                              <h5 className="informative-field">
                                {data.fiscalYear.label}
                              </h5>
                            </Form.Field>
                          </Form.Group>

                          <Form.Group inline>
                            <Form.Field>
                              <label>{t('formExploitationRate')}</label>
                              <h5 className="informative-field">
                                {data.exploitationRate}
                              </h5>
                            </Form.Field>
                          </Form.Group>

                          <Form.Group inline>
                            <Form.Field>
                              <label>{t('formEfficiencyRate')}</label>
                              <h5 className="informative-field">
                                {data.efficiencyRate}
                              </h5>
                            </Form.Field>
                          </Form.Group>

                          <Form.Group inline>
                            <Form.Field>
                              <label>{t('formDaysOff')}</label>
                              <h5 className="informative-field">
                                {data.daysOff}
                              </h5>
                            </Form.Field>
                          </Form.Group>

                          <Form.Group inline>
                            <Form.Field>
                              <label>{t('formEmployerTaxRate')}</label>
                              <h5 className="informative-field">
                                {data.employerTaxRate}
                              </h5>
                            </Form.Field>
                          </Form.Group>

                          <Form.Group inline>
                            <Form.Field>
                              <label>{t('formExploitationRate')}</label>
                              <h5 className="informative-field">
                                {data.exploitationRate}
                              </h5>
                            </Form.Field>
                          </Form.Group>

                          <Form.Group inline>
                            <Form.Field>
                              <label>{t('formGrossMonthlyPay')}</label>
                              <h5 className="informative-field">
                                {parseFloat(data.grossMonthlyPay).toFixed(2)}
                              </h5>
                            </Form.Field>
                          </Form.Group>

                          <Form.Group inline>
                            <Form.Field>
                              <label>{t('formGrossAnnualBonus')}</label>
                              <h5 className="informative-field">
                                {parseFloat(data.grossAnnualBonus).toFixed(2)}
                              </h5>
                            </Form.Field>
                          </Form.Group>

                          <Form.Group inline>
                            <Form.Checkbox
                              label={t('formHoursToSell')}
                              checked={data ? data.hoursToSell : false}
                              readOnly
                            />
                          </Form.Group>
                        </Form>
                      </Grid.Column>
                    </Grid.Row>

                    {!isEmpty(data.hoursSynthesis)
                    && (
                      <Grid.Row>
                        <Grid.Column width={16}>
                          <div className="select-list">
                            <label>{t('companiesHoursSynthesis')}</label>

                            <Table celled definition className="margin-bot">
                              <Table.Header>
                                <Table.Row>
                                  <Table.HeaderCell />
                                  <Table.HeaderCell>{t('companiesHours')}</Table.HeaderCell>
                                  <Table.HeaderCell>{t('companiesHourlyCost')}</Table.HeaderCell>
                                  <Table.HeaderCell>{t('companiesTotalCost')}</Table.HeaderCell>
                                </Table.Row>
                              </Table.Header>

                              <Table.Body>
                                {data && data.hoursToSell
                                  ? (
                                    <React.Fragment>
                                      <Table.Row>
                                        <Table.Cell>{t('companiesSellingHours')}</Table.Cell>
                                        <Table.Cell>
                                          {data.hoursSynthesis.sellingHours.hours}
                                        </Table.Cell>
                                        <Table.Cell>
                                          {data.hoursSynthesis.sellingHours.hourlyCost}
                                        </Table.Cell>
                                        <Table.Cell>
                                          {data.hoursSynthesis.sellingHours.totalCost}
                                        </Table.Cell>
                                      </Table.Row>
                                      <Table.Row>
                                        <Table.Cell>{t('companiesUnsoldHours')}</Table.Cell>
                                        <Table.Cell>
                                          {data.hoursSynthesis.unsoldHours.hours}
                                        </Table.Cell>
                                        <Table.Cell>
                                          {data.hoursSynthesis.unsoldHours.hourlyCost}
                                        </Table.Cell>
                                        <Table.Cell>
                                          {data.hoursSynthesis.unsoldHours.totalCost}
                                        </Table.Cell>
                                      </Table.Row>
                                      <Table.Row>
                                        <Table.Cell>{t('companiesTotal')}</Table.Cell>
                                        <Table.Cell>
                                          {data.hoursSynthesis.total.hours}
                                        </Table.Cell>
                                        <Table.Cell>
                                          {data.hoursSynthesis.total.hourlyCost}
                                        </Table.Cell>
                                        <Table.Cell>
                                          {data.hoursSynthesis.total.totalCost}
                                        </Table.Cell>
                                      </Table.Row>
                                    </React.Fragment>
                                  ) : (
                                    <Table.Row>
                                      <Table.Cell>{t('companiesWorkingHours')}</Table.Cell>
                                      <Table.Cell>
                                        {data.hoursSynthesis.workedHours.hours}
                                      </Table.Cell>
                                      <Table.Cell>
                                        {data.hoursSynthesis.workedHours.hourlyCost}
                                      </Table.Cell>
                                      <Table.Cell>
                                        {data.hoursSynthesis.workedHours.totalCost}
                                      </Table.Cell>
                                    </Table.Row>
                                  )
                                }
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

const Main = connect(mapStateToProps)(ShowData);

export default withNamespaces('translation')(withRouter(Main));
