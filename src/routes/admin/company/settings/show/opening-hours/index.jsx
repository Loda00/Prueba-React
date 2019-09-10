import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { retrieve, reset } from 'actions/company-settings/show';
import { Header, Table, Segment, Dimmer, Loader } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';
import { isEmpty } from 'lodash';
import classnames from 'classnames';

class OpeningHours extends Component {
  state = {
    value: null,
  };

  componentDidMount() {
    const { retrieve, selectedCompany } = this.props;

    retrieve(`/company_settings?company=${selectedCompany.id}&name=OPENING_HOURS`);
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      !isEmpty(nextProps.retrieved)
      && nextProps.retrieved['hydra:member'][0].value !== prevState.value
      && nextProps.retrieved['hydra:member'][0].name === 'OPENING_HOURS'
    ) {
      return {
        value: nextProps.retrieved['hydra:member'][0].value,
      };
    }

    return null;
  }

  render() {
    const { value } = this.state;

    const { loading, t } = this.props;

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('companiesOpeningHours')}</Header>
            <EssorButton as={Link} to="/company/settings/opening-hours/edit" type="edit" size="tiny" floated="right">
              {t('buttonEdit')}
            </EssorButton>
          </div>

          <Segment
            basic
            className={classnames('table-container', {
              'is-loading': loading,
            })}
          >
            <Dimmer active={loading} inverted>
              <Loader>{t('loading')}</Loader>
            </Dimmer>
            <Table celled striped>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>{t('formDays')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('formFrom')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('formTo')}</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {value && Object.keys(value).map((day, index) => {
                  let label;
                  switch (day) {
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
                    <React.Fragment key={`d${index}`}>
                      {value[day].map((hour, index2) => (
                        <Table.Row key={`t${index2}`}>
                          {index2 === 0
                          && (
                            <Table.Cell rowSpan={value[day].length}>
                              {label}
                            </Table.Cell>
                          )}
                          <Table.Cell collapsing textAlign="center">
                            {hour.from}
                          </Table.Cell>
                          <Table.Cell collapsing textAlign="center">
                            {hour.to}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </React.Fragment>
                  );
                })}
              </Table.Body>
            </Table>
          </Segment>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  retrieve: id => dispatch(retrieve(id)),
  reset: () => {
    dispatch(reset());
  },
});

const mapStateToProps = state => ({
  error: state.companySettings.show.error,
  loading: state.companySettings.show.loading,
  retrieved: state.companySettings.show.retrieved,
  selectedCompany: state.userCompanies.select.selectedCompany,
});


const Main = connect(mapStateToProps, mapDispatchToProps)(OpeningHours);

export default withNamespaces('translation')(withRouter(Main));
