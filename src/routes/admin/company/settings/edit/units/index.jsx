import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { retrieve, update, reset } from 'actions/company-settings/update';
import { Form, Header, Grid, Message, Icon, Table } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';
import { isEmpty } from 'lodash';

class Units extends Component {
  state = {
    value: {},
    label: '',
    unit: '',
    labelError: false,
    unitError: false,
    isSettingsLoaded: false,
  };

  componentDidMount() {
    const { retrieve, selectedCompany } = this.props;

    retrieve(`/company_settings?company=${selectedCompany.id}&name=UNITS`);
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.retrieved && nextProps.retrieved['hydra:member'][0].name === 'UNITS' && !prevState.isSettingsLoaded) {
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
      label,
      unit,
      value,
    } = this.state;

    this.setState({
      labelError: false,
      unitError: false,
    });

    let isValid = true;

    if (label.trim() === '') {
      isValid = false;

      this.setState({
        labelError: true,
      });
    }

    if (unit.trim() === '') {
      isValid = false;

      this.setState({
        unitError: true,
      });
    }

    if (!isValid) return;

    const data = {
      label,
      unit,
    };

    value.push(data);

    this.setState({
      value,
      label: '',
      unit: '',
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
      label,
      unit,
      labelError,
      unitError,
      value,
    } = this.state;

    const { retrieveLoading, updateLoading, updateError, t } = this.props;

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('companiesUnits')}</Header>
            <EssorButton as={Link} to="/company/settings/units" type="chevron left" size="tiny" floated="right">
              {t('buttonBack')}
            </EssorButton>
          </div>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <Form className="margin-top-bot main-form" loading={retrieveLoading || updateLoading} size="small">
                  <Form.Group inline>
                    <Form.Input
                      label={t('formLabel')}
                      name="label"
                      placeholder={t('formPHLabel')}
                      value={label}
                      onChange={this.handleInputChange}
                      error={labelError}
                    />
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Input
                      label={t('formUnit')}
                      name="unit"
                      placeholder={t('formPHUnit')}
                      value={unit}
                      onChange={this.handleInputChange}
                      error={unitError}
                    />
                  </Form.Group>

                  <EssorButton type="plus" submit onClick={this.handleAddItem} size="tiny">
                    {t('buttonSubmit')}
                  </EssorButton>

                  <div className="select-list margin-top">
                    <Table celled structured className="margin-bot">
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>{t('formLabel')}</Table.HeaderCell>
                          <Table.HeaderCell>{t('formUnit')}</Table.HeaderCell>
                          <Table.HeaderCell />
                        </Table.Row>
                      </Table.Header>

                      <Table.Body>
                        {!isEmpty(value) && value.map((unit, index) => (
                          <Table.Row key={index}>
                            <Table.Cell>
                              {unit.label}
                            </Table.Cell>
                            <Table.Cell collapsing textAlign="center">
                              {unit.unit}
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


const Main = connect(mapStateToProps, mapDispatchToProps)(Units);

export default withNamespaces('translation')(withRouter(Main));
