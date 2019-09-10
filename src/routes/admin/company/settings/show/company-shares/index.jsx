import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { retrieve, reset } from 'actions/company-settings/show';
import { Header, Table, Segment, Dimmer, Loader } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';
import { isEmpty } from 'lodash';
import classnames from 'classnames';

class CompanyShares extends Component {
  state = {
    value: null,
  };

  componentDidMount() {
    const { retrieve, selectedCompany } = this.props;

    retrieve(`/company_settings?company=${selectedCompany.id}&name=COMPANY_SHARES`);
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      !isEmpty(nextProps.retrieved)
      && nextProps.retrieved['hydra:member'][0].value !== prevState.value
      && nextProps.retrieved['hydra:member'][0].name === 'COMPANY_SHARES'
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
            <Header as="h3">{t('companiesCompanyShares')}</Header>
            <EssorButton as={Link} to="/company/settings/company-shares/edit" type="edit" size="tiny" floated="right">
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
                  <Table.HeaderCell>{t('formFullName')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('formShares')}</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {value && value.map((companyShare, index) => (
                  <Table.Row key={`v${index}`}>
                    <Table.Cell>
                      {companyShare.fullName}
                    </Table.Cell>
                    <Table.Cell>
                      {companyShare.shares}
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


const Main = connect(mapStateToProps, mapDispatchToProps)(CompanyShares);

export default withNamespaces('translation')(withRouter(Main));
