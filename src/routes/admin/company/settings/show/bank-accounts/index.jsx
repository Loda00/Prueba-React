import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { retrieve, reset } from 'actions/company-settings/show';
import { Header, Table, Segment, Dimmer, Loader } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';
import { isEmpty } from 'lodash';
import classnames from 'classnames';

class BankAccounts extends Component {
  state = {
    value: null,
  };

  componentDidMount() {
    const { retrieve, selectedCompany } = this.props;

    retrieve(`/company_settings?company=${selectedCompany.id}&name=BANK_ACCOUNTS`);
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      !isEmpty(nextProps.retrieved)
      && nextProps.retrieved['hydra:member'][0].value !== prevState.value
      && nextProps.retrieved['hydra:member'][0].name === 'BANK_ACCOUNTS'
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
            <Header as="h3">{t('companiesBankAccounts')}</Header>
            <EssorButton as={Link} to="/company/settings/bank-accounts/edit" type="edit" size="tiny" floated="right">
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
                  <Table.HeaderCell>{t('formBankName')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('formIBAN')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('formBIC')}</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {value && value.map((bankAccount, index) => (
                  <Table.Row key={`v${index}`}>
                    <Table.Cell>
                      {bankAccount.bankName}
                    </Table.Cell>
                    <Table.Cell>
                      {bankAccount.IBAN}
                    </Table.Cell>
                    <Table.Cell>
                      {bankAccount.BIC}
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


const Main = connect(mapStateToProps, mapDispatchToProps)(BankAccounts);

export default withNamespaces('translation')(withRouter(Main));
