/* eslint-disable */
import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { find, isEmpty } from 'lodash';
import moment from 'moment';
import { retrieve, reset } from 'actions/fiscal-year/show';
import { Form, Grid, Header } from 'semantic-ui-react';
import { withNamespaces } from 'react-i18next';
import { EssorButton } from 'components';
import NotFound from '../../../404';

import 'moment/locale/fr';

moment.locale('fr');

class ShowFiscalYear extends Component {
  state = {
    isValid: true,
  };

  componentDidMount() {
    const {
      dataFiscalYear,
      getFiscalYear,
      match,
    } = this.props;
    console.log('did mount show');
    if (find(dataFiscalYear['hydra:member'], {
      id: parseInt(match.params.fiscalYearId, 10),
    })) {
      getFiscalYear(`/fiscal_years/${match.params.fiscalYearId}`);
    } else {
      this.setState({
        isValid: false,
      });
    }
  }

  // static getDerivedStateFromProps(nextProps, prevState) {
  //   if (
  //     !isEmpty(nextProps.dataFiscalYear['hydra:member'])
  //     && prevState.selfFinancing !== nextProps.retrievedSelfFinancing['hydra:member'][0]
  //   ) {
  //     return {
  //       selfFinancing: nextProps.retrievedSelfFinancing['hydra:member'][0],
  //       operatingProfit: nextProps.retrievedSelfFinancing['hydra:member'][0].operatingProfit,
  //       provisionAndDepreciation:
  //       nextProps.retrievedSelfFinancing['hydra:member'][0].provisionAndDepreciation,
  //       result: nextProps.retrievedSelfFinancing['hydra:member'][0].result,
  //     };
  //   }
  //
  //   return null;
  // }
  //
  componentDidUpdate(prevProps, prevState, snapshot) {

  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  render() {
    const { isValid } = this.state;
    const { retrieved, loading, match, t } = this.props;

    if (!isValid) {
      return (
        <div className="section-container">
          <NotFound />
        </div>
      );
    }

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('fiscalYearsShowTitle')}</Header>
            <EssorButton as={Link} to={`/company/fiscal_years/${match.params.fiscalYearId}/edit`} type="edit" size="tiny" floated="right">
              {t('buttonEdit')}
            </EssorButton>
          </div>

          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form className="margin-top-bot main-form" loading={loading} size="small">
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formLabel')}</label>
                      <h5 className="informative-field">{retrieved && retrieved.label}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formCompany')}</label>
                      <h5 className="informative-field">{retrieved && retrieved.company}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formDateStart')}</label>
                      <h5 className="informative-field">{retrieved && moment(retrieved.dateStart).format('DD/MM/YYYY')}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formDateEnd')}</label>
                      <h5 className="informative-field">{retrieved && moment(retrieved.dateEnd).format('DD/MM/YYYY')}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formNewClientsGoal')}</label>
                      <h5 className="informative-field">{retrieved && retrieved.newClientsGoal}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formLastFiscalYearMonth')}</label>
                      <h5 className="informative-field">{retrieved && retrieved.lastFiscalYearMonth}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formDaysOff')}</label>
                      <h5 className="informative-field">{retrieved && retrieved.daysOff}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formRegion')}</label>
                      <h5 className="informative-field">{retrieved && retrieved.region}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Checkbox
                      label={t('formDefaultYear')}
                      checked={retrieved ? retrieved.defaultYear : false}
                      readOnly
                    />
                  </Form.Group>
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
  getFiscalYear: page => dispatch(retrieve(page)),
  reset: () => dispatch(reset()),
});

const mapStateToProps = state => ({
  retrieved: state.fiscalYear.show.retrieved,
  loading: state.fiscalYear.show.loading,
  error: state.fiscalYear.show.error,

  dataFiscalYear: state.fiscalYear.list.data,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(ShowFiscalYear);

export default withNamespaces('translation')(withRouter(Main));
