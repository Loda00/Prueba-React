import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import { isEmpty, sortBy, findIndex, find } from 'lodash';
import { selectDocument } from 'actions/user-companies/select';
import { create as createFollowUp, success as successFollowUp, loading as loadingFollowUp, error as errorFollowUp } from 'actions/follow-up/create';
import { update as updateFollowUp, reset as resetFollowUp } from 'actions/follow-up/update';
import { Button, Dimmer, Header, Loader, Modal, Segment, Table, Form, Dropdown } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';
import classnames from 'classnames';
import ReactTooltip from 'react-tooltip';
import DatePicker from 'react-datepicker';

moment.locale('fr');

const typeOptions = [
  {
    key: 'p', text: 'Phone', value: 'phone',
  },
  {
    key: 'e', text: 'Email', value: 'email',
  },
  {
    key: 'm', text: 'Meeting', value: 'meeting',
  },
];

class ListQuote extends Component {
  state = {
    typeOptions,

    quoteData: null,
    column: null,
    direction: null,

    showFollowUpForm: false,
    followUpModal: false,
    editQuote: null,

    date: null,
    comment: '',
    type: null,

    dateError: false,
    typeError: false,
  };

  componentDidMount() {
    const { selectDocument } = this.props;

    selectDocument(null);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.dataQuote) && nextProps.dataQuote['hydra:member'] !== prevState.quoteData) {
      return {
        quoteData: nextProps.dataQuote['hydra:member'],
      };
    }

    if (nextProps.updatedFollowUp) {
      const { followUpData, quoteData, editQuote } = prevState;

      const index = findIndex(followUpData, {
        '@id': nextProps.updatedFollowUp['@id'],
      });

      followUpData[index] = nextProps.updatedFollowUp;
      editQuote.followUpData = followUpData;

      const quoteIndex = findIndex(quoteData, {
        '@id': editQuote['@id'],
      });

      quoteData[quoteIndex] = editQuote;

      return {
        quoteData,
        followUpData,
        showFollowUpForm: false,
        date: null,
        comment: '',
        type: null,
      };
    }

    if (nextProps.createdFollowUp) {
      const { followUpData, quoteData, editQuote } = prevState;

      followUpData.unshift(nextProps.createdFollowUp);
      editQuote.followUpData = followUpData;

      const quoteIndex = findIndex(quoteData, {
        '@id': editQuote['@id'],
      });

      quoteData[quoteIndex] = editQuote;

      return {
        quoteData,
        followUpData,
        showFollowUpForm: false,
        date: null,
        comment: '',
        type: null,
      };
    }

    return null;
  }

  componentDidUpdate(prevProps) {
    const {
      updatedFollowUp,
      createdFollowUp,
      resetUpdateFollowUp,
      resetCreateFollowUp,
    } = this.props;

    if (updatedFollowUp && updatedFollowUp !== prevProps.updatedFollowUp) {
      resetUpdateFollowUp();
    }

    if (createdFollowUp && createdFollowUp !== prevProps.createdFollowUp) {
      resetCreateFollowUp();
    }
  }

  selectDocument = (quote) => {
    const { selectDocument, history } = this.props;

    selectDocument(quote);

    history.push(`/business/quotes/${quote.id}`);
  };

  handleAddition = (e, { value }) => {
    this.setState(prevState => ({
      typeOptions: [
        {
          text: value,
          value,
        },
        ...prevState.typeOptions,
      ],
    }));
  };

  handleSort = clickedColumn => () => {
    const { column, quoteData, direction } = this.state;

    if (column !== clickedColumn) {
      this.setState({
        column: clickedColumn,
        quoteData: sortBy(quoteData, [clickedColumn]),
        direction: 'ascending',
      });

      return;
    }

    this.setState({
      quoteData: quoteData.reverse(),
      direction: direction === 'ascending' ? 'descending' : 'ascending',
    });
  };

  handleDateChange = (date) => {
    this.setState({
      date,
    });
  };

  handleSelectChange = (e, { value, name }) => {
    this.setState({
      [name]: value,
    });
  };

  handleInputChange = (e) => {
    e.preventDefault();

    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  openFollowUpModal = (quote) => {
    this.setState({
      editQuote: quote,
      followUpModal: true,
      followUpData: quote.followUp,
    });
  };

  closeFollowUpModal = () => {
    this.setState({
      editQuote: null,
      followUpModal: false,
      showFollowUpForm: false,
    });
  };

  showFollowUpForm = (followUp) => {
    if (followUp) {
      this.setState({
        editFollowUp: followUp,
        date: moment(followUp.date),
        comment: followUp.comment,
        type: followUp.type,
      });
    }

    this.setState({
      showFollowUpForm: true,
    });
  };

  closeFollowUpForm = () => {
    this.setState({
      showFollowUpForm: false,
      editFollowUp: null,
      date: null,
      comment: '',
      type: null,
    });
  };

  handleOnFollowUpSubmit = () => {
    const {
      editQuote,
      editFollowUp,
      date,
      comment,
      type,
    } = this.state;

    const {
      postFollowUp,
      updateFollowUp,
      selectedCompany,
    } = this.props;

    this.setState({
      dateError: false,
      typeError: false,
    });

    let isValid = true;

    if (!date) {
      isValid = false;

      this.setState({
        dateError: true,
      });
    }

    if (!type) {
      isValid = false;

      this.setState({
        typeError: true,
      });
    }

    if (!isValid) return;

    const data = {
      company: selectedCompany['@id'],
      type,
      date: date.format(),
    };

    if (comment.trim() !== '') {
      data.comment = comment;
    }

    if (editFollowUp) {
      updateFollowUp(editFollowUp, data);
    } else {
      data.quote = editQuote['@id'];

      postFollowUp(data);
    }
  };

  render() {
    const {
      typeOptions,

      quoteData,
      column,
      direction,

      showFollowUpForm,
      followUpModal,

      followUpData,
      date,
      comment,
      type,

      dateError,
      typeError,
    } = this.state;

    const {
      loadingQuote,
      loadingCreateFollowUp,
      loadingUpdateFollowUp,
      t,
    } = this.props;

    if (type) {
      const isAdd = find(typeOptions, {
        value: type,
      });

      if (!isAdd) {
        typeOptions.push({
          text: type,
          value: type,
        });
      }
    }

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('quotesHomeTitle')}</Header>
            <EssorButton as={Link} to="/business/quotes/create" type="plus" size="tiny" floated="right">
              {t('buttonAdd')}
            </EssorButton>
          </div>

          <Segment
            basic
            className={classnames('table-container', {
              'is-loading': loadingQuote,
            })}
          >
            <Dimmer active={loadingQuote} inverted>
              <Loader>{t('loading')}</Loader>
            </Dimmer>
            <Table sortable celled striped>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell
                    sorted={column === 'uniqueID' ? direction : null}
                    onClick={this.handleSort('uniqueID')}
                  >
                    #
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    sorted={column === 'creationDate' ? direction : null}
                    onClick={this.handleSort('creationDate')}
                  >
                    {t('formCreationDate')}
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    sorted={column === 'customer' ? direction : null}
                    onClick={this.handleSort('customer')}
                  >
                    {t('formCustomer')}
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    sorted={column === 'totalPrice' ? direction : null}
                    onClick={this.handleSort('totalPrice')}
                  >
                    {t('formTotalPrice')}
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    sorted={column === 'estimation' ? direction : null}
                    onClick={this.handleSort('estimation')}
                  >
                    {t('formEstimation')}
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    sorted={column === 'FollowUp' ? direction : null}
                    onClick={this.handleSort('FollowUp')}
                  >
                    {t('formFollowUpDate')}
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    sorted={column === 'responseDate' ? direction : null}
                    onClick={this.handleSort('responseDate')}
                  >
                    {t('formResponseDate')}
                  </Table.HeaderCell>
                  <Table.HeaderCell />
                  <Table.HeaderCell />
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {quoteData && quoteData.map((quote, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{quote.uniqueID}</Table.Cell>
                    <Table.Cell>{moment(quote.creationDate).format('DD/MM/YYYY')}</Table.Cell>
                    <Table.Cell>{quote.customer.companyName}</Table.Cell>
                    <Table.Cell>{parseFloat(quote.totalPrice).toFixed(2)}</Table.Cell>
                    <Table.Cell>
                      {(() => {
                        switch (quote.estimation) {
                          case 1:
                            return t('quoteAgreement');
                          case 2:
                            return t('quoteShortList');
                          case 3:
                            return t('quoteUndecided');
                          case 4:
                            return t('quoteUnlikely');
                          default:
                        }
                      })()}
                    </Table.Cell>
                    <Table.Cell selectable textAlign="center" onClick={() => this.openFollowUpModal(quote)}>
                      {isEmpty(quote.followUp)
                        ? '-'
                        : moment(quote.followUp[0].date).format('DD/MM/YYYY')}
                    </Table.Cell>
                    <Table.Cell textAlign="center">{moment(quote.responseDate).format('DD/MM/YYYY')}</Table.Cell>
                    <Table.Cell textAlign="center">
                      <Button
                        as={Link}
                        to={`/business/quotes/${quote.id}/edit`}
                        className="table-button"
                        data-tip="Edit"
                        icon="edit"
                      />
                      <ReactTooltip className="essor-tooltip" effect="solid" place="bottom" />
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Button
                        onClick={() => this.selectDocument(quote)}
                        className="table-button"
                        data-tip="Voir la fiche"
                        icon="eye"
                      />
                      <ReactTooltip className="essor-tooltip" effect="solid" place="bottom" />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </Segment>

          <Modal
            open={followUpModal}
            closeOnEscape={false}
            closeOnDimmerClick={false}
            className="full-content"
          >
            <Modal.Header>{t('followUpHomeTitle')}</Modal.Header>
            <Modal.Content scrolling>
              <Modal.Description>
                {showFollowUpForm
                  ? (
                    <React.Fragment>
                      <div className="option-buttons-container clearfix">
                        <EssorButton onClick={this.closeFollowUpForm} type="chevron left" size="tiny" floated="right">
                          {t('buttonBack')}
                        </EssorButton>
                      </div>

                      <Form className="margin-top-bot main-form" loading={loadingCreateFollowUp || loadingUpdateFollowUp} size="small">
                        <Form.Group inline>
                          <Form.Input
                            label={t('formDate')}
                            name="date"
                            minDate={moment()}
                            control={DatePicker}
                            selected={date}
                            onChange={this.handleDateChange}
                            locale="fr"
                            autoComplete="off"
                            error={dateError}
                          />
                        </Form.Group>

                        <Form.Group inline>
                          <Form.Select
                            label={t('formType')}
                            control={Dropdown}
                            placeholder={t('formPHSelect')}
                            fluid
                            selection
                            search
                            allowAdditions
                            options={typeOptions}
                            name="type"
                            onAddItem={this.handleAddition}
                            onChange={this.handleSelectChange}
                            value={type}
                            error={typeError}
                          />
                        </Form.Group>

                        <Form.Group inline>
                          <Form.Input
                            label={t('formComments')}
                            name="comment"
                            value={comment}
                            onChange={this.handleInputChange}
                          />
                        </Form.Group>

                      </Form>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <div className="option-buttons-container clearfix">
                        <EssorButton onClick={() => this.showFollowUpForm()} type="plus" size="tiny" floated="right">
                          {t('buttonAdd')}
                        </EssorButton>
                      </div>

                      <Table celled>
                        <Table.Header>
                          <Table.Row>
                            <Table.HeaderCell>{t('formDate')}</Table.HeaderCell>
                            <Table.HeaderCell>{t('formType')}</Table.HeaderCell>
                            <Table.HeaderCell>{t('formComments')}</Table.HeaderCell>
                            <Table.HeaderCell />
                          </Table.Row>
                        </Table.Header>

                        <Table.Body>
                          {followUpData && followUpData.map((followUp, index) => (
                            <Table.Row key={index}>
                              <Table.Cell>{moment(followUp.date).format('DD/MM/YYYY')}</Table.Cell>
                              <Table.Cell>{followUp.type}</Table.Cell>
                              <Table.Cell>{followUp.comment}</Table.Cell>
                              <Table.Cell textAlign="center">
                                <Button onClick={() => this.showFollowUpForm(followUp)} className="table-button" icon="edit" />
                              </Table.Cell>
                            </Table.Row>
                          ))}
                        </Table.Body>
                      </Table>
                    </React.Fragment>
                  )
                }

              </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
              <div>
                {showFollowUpForm
                  && (
                  <EssorButton type="check" onClick={this.handleOnFollowUpSubmit} size="small" disabled={loadingCreateFollowUp || loadingUpdateFollowUp}>
                    {t('buttonSave')}
                  </EssorButton>
                  )
                }
                <EssorButton secondary type="x" size="small" onClick={this.closeFollowUpModal} disabled={loadingCreateFollowUp || loadingUpdateFollowUp}>
                  {t('buttonCancel')}
                </EssorButton>
              </div>
            </Modal.Actions>
          </Modal>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  postFollowUp: data => dispatch(createFollowUp(data)),
  updateFollowUp: (item, data) => dispatch(updateFollowUp(item, data)),
  resetUpdateFollowUp: () => dispatch(resetFollowUp()),
  selectDocument: quote => dispatch(selectDocument(quote)),
  resetCreateFollowUp: () => {
    dispatch(successFollowUp(null));
    dispatch(errorFollowUp(null));
    dispatch(loadingFollowUp(false));
  },
});

const mapStateToProps = state => ({
  dataQuote: state.quote.list.data,
  loadingQuote: state.quote.list.loading,
  errorQuote: state.quote.list.error,

  createdFollowUp: state.followUp.create.created,
  loadingCreateFollowUp: state.followUp.create.loading,
  errorCreateFollowUp: state.followUp.create.error,

  updatedFollowUp: state.followUp.update.updated,
  loadingUpdateFollowUp: state.followUp.update.updateLoading,
  errorUpdateFollowUp: state.followUp.update.updateError,

  selectedCompany: state.userCompanies.select.selectedCompany,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(ListQuote);

export default withNamespaces('translation')(withRouter(Main));
