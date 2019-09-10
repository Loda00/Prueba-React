import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { Form, Grid, Header } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class ShowWorkingCapital extends Component {
  state = {
    workingCapitalData: null,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      !isEmpty(nextProps.retrievedWorkingCapital['hydra:member'])
      && prevState.workingCapitalData !== nextProps.retrievedWorkingCapital['hydra:member'][0]
    ) {
      return {
        workingCapitalData: nextProps.retrievedWorkingCapital['hydra:member'][0],
      };
    }

    return null;
  }

  render() {
    const { workingCapitalData } = this.state;

    const {
      loadingWorkingCapital,
      t,
    } = this.props;

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">Working Capital</Header>
            {(!loadingWorkingCapital && isEmpty(workingCapitalData))
            && (
              <EssorButton
                as={Link}
                to="/forecast/working-capital/create"
                type="plus"
                size="tiny"
                floated="right"
              >
                {t('buttonCreate')}
              </EssorButton>
            )}

            {(!loadingWorkingCapital && !isEmpty(workingCapitalData))
            && (
              <EssorButton
                as={Link}
                to="/forecast/working-capital/edit"
                type="edit"
                size="tiny"
                floated="right"
              >
                {t('buttonEdit')}
              </EssorButton>
            )}
          </div>

          {(!loadingWorkingCapital && !isEmpty(workingCapitalData))
          && (
            <Grid>
              <Grid.Row>
                <Grid.Column width={12}>
                  <Form className="margin-top-bot main-form" loading={loadingWorkingCapital} size="small">
                    <Form.Group inline>
                      <Form.Field>
                        <label>{t('formInventoryValue')}</label>
                        <h5 className="informative-field">{parseFloat(workingCapitalData.inventoryValue).toFixed(2)}</h5>
                      </Form.Field>
                    </Form.Group>

                    <Form.Group inline>
                      <Form.Field>
                        <label>{t('formInventoryVAT')}</label>
                        <h5 className="informative-field" id="Label">{parseFloat(workingCapitalData.inventoryVAT).toFixed(2)}</h5>
                      </Form.Field>
                    </Form.Group>

                    <Form.Group inline>
                      <Form.Field>
                        <label>{t('formCustomerPayables')}</label>
                        <h5 className="informative-field">{parseFloat(workingCapitalData.customerPayables).toFixed(2)}</h5>
                      </Form.Field>
                    </Form.Group>

                    <Form.Group inline>
                      <Form.Field>
                        <label>{t('formSupplierDebts')}</label>
                        <h5 className="informative-field">{parseFloat(workingCapitalData.supplierDebts).toFixed(2)}</h5>
                      </Form.Field>
                    </Form.Group>

                    <Form.Group inline>
                      <Form.Field>
                        <label>{t('formFiscalDebts')}</label>
                        <h5 className="informative-field">{parseFloat(workingCapitalData.fiscalDebts).toFixed(2)}</h5>
                      </Form.Field>
                    </Form.Group>

                    <Form.Group inline>
                      <Form.Field>
                        <label>{t('formOtherDebts')}</label>
                        <h5 className="informative-field">{parseFloat(workingCapitalData.otherDebts).toFixed(2)}</h5>
                      </Form.Field>
                    </Form.Group>

                    <Form.Group inline>
                      <Form.Field>
                        <label>{t('formWCResult')}</label>
                        <h5 className="informative-field">{parseFloat(workingCapitalData.result).toFixed(2)}</h5>
                      </Form.Field>
                    </Form.Group>
                  </Form>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  retrievedWorkingCapital: state.workingCapital.show.retrieved,
  loadingWorkingCapital: state.workingCapital.show.loading,
  errorWorkingCapital: state.workingCapital.show.error,
});

const Main = connect(mapStateToProps)(ShowWorkingCapital);

export default withNamespaces('translation')(withRouter(Main));
