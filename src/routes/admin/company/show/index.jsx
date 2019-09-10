import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Form, Grid, Header } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

const ShowCompany = ({ selectedCompany, t }) => (
  <div className="section-container">
    <div className="section-general">
      <div className="option-buttons-container clearfix">
        <Header as="h3">{t('companiesShowTitle')}</Header>
        <EssorButton as={Link} to="/company/edit" type="edit" size="tiny" floated="right">
          {t('buttonEdit')}
        </EssorButton>
      </div>
      <Grid>
        <Grid.Row>
          <Grid.Column width={12}>
            <Form className="margin-top-bot main-form" size="small">
              <Form.Group inline>
                <Form.Field>
                  <label>{t('formName')}</label>
                  <h5 className="informative-field">{selectedCompany && selectedCompany.name}</h5>
                </Form.Field>
              </Form.Group>

              {/*
              <Form.Group inline>
                <Form.Field>
                  <label>{t('formOffice')}</label>
                  <h5 className="informative-field">{selectedCompany && selectedCompany.office}</h5>
                </Form.Field>
              </Form.Group>
              */}

              <Form.Group inline>
                <Form.Field>
                  <label>{t('formCalculationMode')}</label>
                  <h5 className="informative-field">
                    {selectedCompany
                    && (selectedCompany.calculationMode === 'coef'
                      ? t('formSellingCoefficient')
                      : t('formMarginRate')
                    )}
                  </h5>
                </Form.Field>
              </Form.Group>
            </Form>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  </div>
);

const mapStateToProps = state => ({
  selectedCompany: state.userCompanies.select.selectedCompany,
});

const Main = connect(mapStateToProps)(ShowCompany);

export default withNamespaces('translation')(withRouter(Main));
