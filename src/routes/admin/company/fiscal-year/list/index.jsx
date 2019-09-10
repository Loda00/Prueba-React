import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { Button, Dimmer, Header, Icon, Loader, Segment, Table } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';
import classnames from 'classnames';
import ReactTooltip from 'react-tooltip';

class ListFiscalYear extends Component {
  state = {
    fiscalYearData: null,
  };

  static getDerivedStateFromProps(nextProps) {
    if (!isEmpty(nextProps.dataFiscalYear)) {
      return {
        fiscalYearData: nextProps.dataFiscalYear['hydra:member'],
      };
    }

    return null;
  }

  render() {
    const { fiscalYearData } = this.state;

    const {
      loadingFiscalYear,
      t,
    } = this.props;

    return (
      <div className="section-container">

        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('fiscalYearsHomeTitle')}</Header>
            <EssorButton as={Link} to="/company/fiscal_years/create" type="plus" size="tiny" floated="right">
              {t('buttonAdd')}
            </EssorButton>
          </div>

          <Segment
            basic
            className={classnames('table-container', {
              'is-loading': loadingFiscalYear,
            })}
          >
            <Dimmer active={loadingFiscalYear} inverted>
              <Loader>{t('loading')}</Loader>
            </Dimmer>
            <Table celled striped>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell />
                  <Table.HeaderCell>{t('formLabel')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('formDateStart')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('formDateEnd')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('formDefaultYear')}</Table.HeaderCell>
                  <Table.HeaderCell />
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {fiscalYearData && fiscalYearData.map((fiscalYear, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{index + 1}</Table.Cell>
                    <Table.Cell>{fiscalYear.label}</Table.Cell>
                    <Table.Cell>{fiscalYear.dateStart}</Table.Cell>
                    <Table.Cell>{fiscalYear.dateEnd}</Table.Cell>
                    <Table.Cell textAlign="center">
                      <Icon color={fiscalYear.defaultYear ? 'green' : 'red'} name={fiscalYear.defaultYear ? 'checkmark' : 'close'} size="large" />
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Button as={Link} to={`/company/fiscal_years/${fiscalYear.id}`} className="table-button" data-tip="Voir la fiche" icon="eye" />
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

const mapStateToProps = state => ({
  dataFiscalYear: state.fiscalYear.list.data,
  loadingFiscalYear: state.fiscalYear.list.loading,
  errorFiscalYear: state.fiscalYear.list.error,
});

const Main = connect(mapStateToProps)(ListFiscalYear);

export default withNamespaces('translation')(withRouter(Main));
