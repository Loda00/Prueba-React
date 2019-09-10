import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { Form, Grid, Header } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

class ShowSelfFinancing extends Component {
  state = {
    selfFinancingData: null,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      !isEmpty(nextProps.retrievedSelfFinancing['hydra:member'])
      && prevState.selfFinancingData !== nextProps.retrievedSelfFinancing['hydra:member'][0]
    ) {
      return {
        selfFinancingData: nextProps.retrievedSelfFinancing['hydra:member'][0],
      };
    }

    return null;
  }

  render() {
    const { selfFinancingData } = this.state;

    const {
      loadingSelfFinancing,
      t,
    } = this.props;

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('selfFinancingsHomeTitle')}</Header>
            {(!loadingSelfFinancing && isEmpty(selfFinancingData))
            && (
              <EssorButton
                as={Link}
                to="/forecast/self-financing/create"
                type="plus"
                size="tiny"
                floated="right"
              >
                {t('buttonCreate')}
              </EssorButton>
            )}

            {(!loadingSelfFinancing && !isEmpty(selfFinancingData))
            && (
              <EssorButton
                as={Link}
                to="/forecast/self-financing/edit"
                type="edit"
                size="tiny"
                floated="right"
              >
                {t('buttonEdit')}
              </EssorButton>
            )}
          </div>

          {(!loadingSelfFinancing && !isEmpty(selfFinancingData))
          && (
            <Grid>
              <Grid.Row>
                <Grid.Column width={12}>
                  <Form className="margin-top-bot main-form" loading={loadingSelfFinancing} size="small">
                    <Form.Group inline>
                      <Form.Field>
                        <label>{t('formOperatingProfit')}</label>
                        <h5 className="informative-field">{parseFloat(selfFinancingData.operatingProfit).toFixed(2)}</h5>
                      </Form.Field>
                    </Form.Group>

                    <Form.Group inline>
                      <Form.Field>
                        <label>{t('formProvisionAndDepreciation')}</label>
                        <h5 className="informative-field" id="Label">{parseFloat(selfFinancingData.provisionAndDepreciation).toFixed(2)}</h5>
                      </Form.Field>
                    </Form.Group>

                    <Form.Group inline>
                      <Form.Field>
                        <label>{t('formResult')}</label>
                        <h5 className="informative-field">{parseFloat(selfFinancingData.result).toFixed(2)}</h5>
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
  retrievedSelfFinancing: state.selfFinancing.show.retrieved,
  loadingSelfFinancing: state.selfFinancing.show.loading,
  errorSelfFinancing: state.selfFinancing.show.error,
});

const Main = connect(mapStateToProps)(ShowSelfFinancing);

export default withNamespaces('translation')(withRouter(Main));
