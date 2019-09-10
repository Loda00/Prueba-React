import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import { Form, Grid, Header } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';

const ShowEmployee = ({ selectedEmployee, match, t }) => (
  <div className="section-container">
    <div className="section-general">
      <div className="option-buttons-container clearfix">
        <Header as="h3">{selectedEmployee && `${selectedEmployee.firstName} ${selectedEmployee.lastName}`}</Header>
        <EssorButton as={Link} to={`/employees/${match.params.id}/edit`} type="edit" size="tiny" floated="right">
          {t('buttonEdit')}
        </EssorButton>
      </div>

      <Grid>
        <Grid.Row>
          <Grid.Column width={12}>
            <Form className="margin-top-bot main-form" size="small">
              <Form.Group inline>
                <Form.Field>
                  <label>{t('formInDate')}</label>
                  <h5 className="informative-field">
                    {selectedEmployee && moment(selectedEmployee.inDate).format('DD/MM/YY')}
                  </h5>
                </Form.Field>
              </Form.Group>

              <Form.Group inline>
                <Form.Field>
                  <label>{t('formOutDate')}</label>
                  <h5 className="informative-field">
                    {selectedEmployee && (selectedEmployee.outDate === null
                      ? '-'
                      : moment(selectedEmployee.outDate).format('DD/MM/YY')
                    )}
                  </h5>
                </Form.Field>
              </Form.Group>

              {(selectedEmployee && selectedEmployee.createIdentity)
                && (
                <React.Fragment>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formEmail')}</label>
                      <h5 className="informative-field">{selectedEmployee && selectedEmployee.username}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formPassword')}</label>
                      <h5 className="informative-field">{selectedEmployee && selectedEmployee.password}</h5>
                    </Form.Field>
                  </Form.Group>

                </React.Fragment>
                )
              }

              <Form.Group inline>
                <Form.Field>
                  <label>{t('formAddress')}</label>
                  <h5 className="informative-field">{selectedEmployee && selectedEmployee.details.address}</h5>
                </Form.Field>
              </Form.Group>

              <Form.Group inline>
                <Form.Field>
                  <label>{t('formZipCode')}</label>
                  <h5 className="informative-field">{selectedEmployee && selectedEmployee.details.zipCode}</h5>
                </Form.Field>
              </Form.Group>

              <Form.Group inline>
                <Form.Field>
                  <label>{t('formCity')}</label>
                  <h5 className="informative-field">{selectedEmployee && selectedEmployee.details.city}</h5>
                </Form.Field>
              </Form.Group>

              <Form.Group inline>
                <Form.Field>
                  <label>{t('formRegion')}</label>
                  <h5 className="informative-field">{selectedEmployee && selectedEmployee.details.region}</h5>
                </Form.Field>
              </Form.Group>

              <Form.Group inline>
                <Form.Field>
                  <label>{t('formCountry')}</label>
                  <h5 className="informative-field">{selectedEmployee && selectedEmployee.details.country}</h5>
                </Form.Field>
              </Form.Group>

              <Form.Group inline>
                <Form.Field>
                  <label>{t('formContractType')}</label>
                  <h5 className="informative-field">{selectedEmployee && selectedEmployee.details.contractType}</h5>
                </Form.Field>
              </Form.Group>

              <Form.Group inline>
                <Form.Field>
                  <label>{t('formJobTitle')}</label>
                  <h5 className="informative-field">{selectedEmployee && selectedEmployee.details.jobTitle}</h5>
                </Form.Field>
              </Form.Group>

              <Form.Group inline>
                <Form.Field>
                  <label>{t('formGender')}</label>
                  <h5 className="informative-field">{selectedEmployee && selectedEmployee.details.gender}</h5>
                </Form.Field>
              </Form.Group>

              <Form.Group inline>
                <Form.Field>
                  <label>{t('formBirthday')}</label>
                  <h5 className="informative-field">
                    {selectedEmployee && (selectedEmployee.details.birthday === ''
                      ? '-'
                      : moment(selectedEmployee.details.birthday).format('DD/MM/YY')
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
  selectedEmployee: state.userCompanies.select.selectedEmployee,
});

const Main = connect(mapStateToProps)(ShowEmployee);

export default withNamespaces('translation')(withRouter(Main));
