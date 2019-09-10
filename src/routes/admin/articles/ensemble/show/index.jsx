import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { retrieve, reset } from 'actions/ensemble/show';
import { Form, Grid, Header, Table } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';
import { map } from 'lodash';

class ShowEnsemble extends Component {
  componentDidMount() {
    const { getEnsemble, match } = this.props;
    getEnsemble(`/ensembles/${match.params.id}`);
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  render() {
    const {
      retrieved,
      loading,
      t,
      match,
    } = this.props;

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('ensemblesShowTitle')}</Header>
            <EssorButton as={Link} to={`/articles/ensembles/${match.params.id}/edit`} type="edit" size="tiny" floated="right">
              {t('buttonEdit')}
            </EssorButton>

            <EssorButton as={Link} to="/articles/ensembles" type="chevron left" size="tiny" floated="right">
              {t('buttonBack')}
            </EssorButton>
          </div>

          <Form className="margin-top-bot main-form" loading={loading} size="small">
            <Grid>
              <Grid.Row>
                <Grid.Column width={12}>
                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formLabel')}</label>
                      <h5 className="informative-field">{retrieved && retrieved.label}</h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formReference')}</label>
                      <h5 className="informative-field">
                        {retrieved && (
                          retrieved.reference === '' ? '-' : retrieved.reference
                        )}
                      </h5>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field>
                      <label>{t('formSellingPrice')}</label>
                      <h5 className="informative-field">{retrieved && parseFloat(retrieved.sellingPrice).toFixed(2)}</h5>
                    </Form.Field>
                  </Form.Group>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column width={16}>
                  <Table celled selectable className="margin-bot">
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>{t('formReference')}</Table.HeaderCell>
                        <Table.HeaderCell>{t('ensemblesTableName')}</Table.HeaderCell>
                        <Table.HeaderCell>{t('ensemblesTableType')}</Table.HeaderCell>
                        <Table.HeaderCell textAlign="center">{t('formUnitPrice')}</Table.HeaderCell>
                        <Table.HeaderCell>{t('ensemblesTableQuantity')}</Table.HeaderCell>
                        <Table.HeaderCell textAlign="center">{t('formTotalPrice')}</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>

                    <Table.Body>
                      {retrieved && map(retrieved.items, item => (
                        <Table.Row key={item['@id']}>
                          <Table.Cell>
                            {item.reference}
                          </Table.Cell>
                          <Table.Cell>
                            {item.label}
                          </Table.Cell>
                          <Table.Cell>
                            {item['@type']}
                          </Table.Cell>

                          <Table.Cell textAlign="center">
                            {parseFloat(item.price).toFixed(2)}
                          </Table.Cell>

                          <Table.Cell collapsing textAlign="center">
                            {item.quantity}
                          </Table.Cell>

                          <Table.Cell textAlign="center">
                            {parseFloat(item.totalPrice).toFixed(2)}
                          </Table.Cell>

                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Form>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  getEnsemble: page => dispatch(retrieve(page)),
  reset: () => dispatch(reset()),
});

const mapStateToProps = state => ({
  retrieved: state.ensemble.show.retrieved,
  loading: state.ensemble.show.loading,
  error: state.ensemble.show.error,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(ShowEnsemble);

export default withNamespaces('translation')(withRouter(Main));
