import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { retrieve, update, reset } from 'actions/company-settings/update';
import { Form, Header, Grid, Message, Icon, Table } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';
import { isEmpty } from 'lodash';

class CompanyShares extends Component {
  state = {
    value: {},
    fullName: '',
    shares: '',
    fullNameError: false,
    sharesError: false,
    isSettingsLoaded: false,
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
    if (nextProps.retrieved && nextProps.retrieved['hydra:member'][0].name === 'COMPANY_SHARES' && !prevState.isSettingsLoaded) {
      return {
        isSettingsLoaded: true,
        value: nextProps.retrieved['hydra:member'][0].value,
      };
    }

    return null;
  }

  handleInputChange = (e) => {
    e.preventDefault();

    const { name, value } = e.target;

    this.setState({
      [name]: value,
    });
  };

  handleAddItem = () => {
    const {
      fullName,
      shares,
      value,
    } = this.state;

    this.setState({
      fullNameError: false,
      sharesError: false,
    });

    let isValid = true;

    if (fullName.trim() === '') {
      isValid = false;

      this.setState({
        fullNameError: true,
      });
    }

    if (shares.trim() === '') {
      isValid = false;

      this.setState({
        sharesError: true,
      });
    }

    if (!isValid) return;

    const data = {
      fullName,
      shares,
    };

    value.push(data);

    this.setState({
      value,
      fullName: '',
      shares: '',
    });
  };

  handleDelete = (e) => {
    const { value } = this.state;
    const index = e.target.getAttribute('data-id');

    value.splice(index, 1);

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

  render() {
    const {
      fullName,
      shares,
      fullNameError,
      sharesError,
      value,
    } = this.state;

    const { retrieveLoading, updateLoading, updateError, t } = this.props;

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('companiesCompanyShares')}</Header>
            <EssorButton as={Link} to="/company/settings/company-shares" type="chevron left" size="tiny" floated="right">
              {t('buttonBack')}
            </EssorButton>
          </div>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form className="margin-top-bot main-form" loading={retrieveLoading || updateLoading} size="small">
                  <Form.Group inline>
                    <Form.Input
                      label={t('formFullName')}
                      name="fullName"
                      placeholder={t('formPHFullName')}
                      value={fullName}
                      onChange={this.handleInputChange}
                      error={fullNameError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formShares')}
                      name="shares"
                      placeholder={t('formPHShares')}
                      value={shares}
                      onChange={this.handleInputChange}
                      error={sharesError}
                    />
                  </Form.Group>

                  <EssorButton type="plus" submit onClick={this.handleAddItem} size="tiny">
                    {t('buttonSubmit')}
                  </EssorButton>

                  <div className="select-list margin-top">
                    <Table celled structured className="margin-bot">
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>{t('formFullName')}</Table.HeaderCell>
                          <Table.HeaderCell>{t('formShares')}</Table.HeaderCell>
                          <Table.HeaderCell />
                        </Table.Row>
                      </Table.Header>

                      <Table.Body>
                        {!isEmpty(value) && value.map((companyShare, index) => (
                          <Table.Row key={index}>
                            <Table.Cell>
                              {companyShare.fullName}
                            </Table.Cell>
                            <Table.Cell>
                              {companyShare.shares}
                            </Table.Cell>
                            <Table.Cell collapsing textAlign="center">
                              <Icon
                                className="table-button"
                                name="trash alternate"
                                data-id={index}
                                onClick={e => this.handleDelete(e)}
                              />
                            </Table.Cell>
                          </Table.Row>
                        ))}

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


const Main = connect(mapStateToProps, mapDispatchToProps)(CompanyShares);

export default withNamespaces('translation')(withRouter(Main));
