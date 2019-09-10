import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { find, isEmpty } from 'lodash';

import { create as createDocumentNumbering, error as errorCreateDocumentNumbering, loading as loadingCreateDocumentNumbering, success as successCreateDocumentNumbering } from 'actions/document-numbering/create';

import { list as listDocumentNumberings, reset as resetDocumentNumbering } from 'actions/document-numbering/list';
import { update as updateDocumentNumbering, reset as resetUpdateDocumentNumbering } from 'actions/document-numbering/update';


import { Button, Dimmer, Form, Header, Input, Loader, Modal, Segment, Table } from 'semantic-ui-react';
import { EssorButton } from 'components';
import { withNamespaces } from 'react-i18next';
import classnames from 'classnames';
import ReactTooltip from 'react-tooltip';
import Cleave from 'cleave.js/react';


class DocumentNumbering extends Component {
  state = {
    documentNumberingData: null,
    fiscalYear: null,
    documentType: '',
    label: '',
    number: '',

    documentTypeError: false,
    labelError: false,
    numberError: false,
    reset: false,

    toEdit: null,
    createDocumentModalOpen: false,
    isDocumentLoaded: false,
  };

  componentDidMount() {
    const {
      getDocumentNumbering,
      selectedFiscalYear,
      reset,
    } = this.props;
    reset();

    getDocumentNumbering(`/document_numberings?fiscalYear=${selectedFiscalYear.id}`);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.successCreateDocumentNumbering || nextProps.updatedDocumentNumbering) {
      const {
        resetCreateDocumentNumbering,
        resetUpdateDocumentNumbering,
        resetDocumentNumberingList,
        getDocumentNumbering,
        match,
      } = nextProps;
      resetCreateDocumentNumbering();
      resetUpdateDocumentNumbering();
      resetDocumentNumberingList();
      getDocumentNumbering(`/document_numberings?fiscalYear=${match.params.fiscalYearId}`);

      return {
        documentNumberingData: null,
        documentType: '',
        label: '',
        number: '',
        reset: false,
        toEdit: null,
        createDocumentModalOpen: false,
        isDocumentLoaded: false,
      };
    }

    if (!isEmpty(nextProps.dataDocumentNumbering) && !prevState.isDocumentLoaded) {
      return {
        documentNumberingData: nextProps.dataDocumentNumbering['hydra:member'],
        isDocumentLoaded: true,
      };
    }
    return null;
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  openCreateDocumentNumberingModal = (id) => {
    const { documentNumberingData } = this.state;
    const item = find(documentNumberingData, {
      '@id': id,
    });

    this.setState({
      createDocumentModalOpen: true,
      toEdit: item || null,
      documentType: item ? item.documentType : '',
      label: item ? item.label : '',
      number: item ? item.number : '',
    });
  };

  handleInputChange = (e) => {
    e.preventDefault();

    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleCheckBoxChange = (e, value) => {
    const { name } = value;
    this.setState(prevState => (
      {
        [name]: !prevState[name],
      }
    ));
  };

  closeCreateDocumentNumberingModal = () => {
    this.setState({
      documentType: '',
      label: '',
      number: '',

      documentTypeError: false,
      labelError: false,
      numberError: false,
      reset: false,

      toEdit: null,
      createDocumentModalOpen: false,
    });
  };

  handleDocumentNumberingSubmit = () => {
    const { documentType, label, number, reset, toEdit } = this.state;
    const {
      selectedFiscalYear,
      updateDocumentNumbering,
      postDocumentNumbering,
    } = this.props;

    const id = selectedFiscalYear['@id'];

    let isValid = true;

    this.setState({
      documentTypeError: false,
      labelError: false,
      numberError: false,
      resetError: false,
    });

    if (documentType === '') {
      isValid = false;
      this.setState({
        documentTypeError: true,
      });
    }

    if (label === '') {
      isValid = false;
      this.setState({
        labelError: true,
      });
    }

    if (number === '') {
      isValid = false;
      this.setState({
        numberError: true,
      });
    }

    if (!isValid) return;

    const data = {
      fiscalYear: id,
      documentType,
      label,
      number: Number(number),
      reset,
    };
    toEdit ? updateDocumentNumbering(toEdit, data) : postDocumentNumbering(data);
  };

  render() {
    const {
      documentNumberingData,
      documentType,
      label,
      number,

      documentTypeError,
      labelError,
      numberError,
      reset,
      createDocumentModalOpen,
      toEdit,
    } = this.state;

    const {
      t,
      loadingDocumentNumbering,
      loadingCreateDocumentNumbering,
      loadingUpdateDocumentNumbering,
    } = this.props;

    return (
      <div className="section-container">
        <div className="section-general">
          <div className="option-buttons-container clearfix">
            <Header as="h3">{t('documentNumberingTitle')}</Header>
            <EssorButton type="plus" size="tiny" floated="right" onClick={this.openCreateDocumentNumberingModal}>
              {t('buttonAdd')}
            </EssorButton>
          </div>

          <Modal
            open={createDocumentModalOpen}
            closeOnEscape={false}
            closeOnDimmerClick={false}
            className="full-content"
          >
            <Modal.Header>{toEdit ? t('documentNumberingUpdateTitle') : t('documentNumberingCreateTitle')}</Modal.Header>
            <Modal.Content scrolling>
              <Modal.Description>
                <Form className="margin-top-bot main-form" loading={loadingCreateDocumentNumbering || loadingUpdateDocumentNumbering} size="small">
                  <Form.Group inline>
                    <Form.Input
                      label={t('documentNumberingType')}
                      name="documentType"
                      placeholder={t('documentNumberingType')}
                      value={documentType}
                      onChange={this.handleInputChange}
                      error={documentTypeError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Input
                      label={t('formLabel')}
                      name="label"
                      placeholder={t('formLabel')}
                      value={label}
                      onChange={this.handleInputChange}
                      error={labelError}
                    />
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Field error={numberError}>
                      <label>{t('formNumber')}</label>
                      <Input labelPosition="left">
                        <Cleave
                          options={{
                            numeral: true,
                            numeralThousandsGroupStyle: 'none',
                            numeralPositiveOnly: true,
                            numeralDecimalScale: 0,
                          }}
                          onChange={this.handleInputChange}
                          name="number"
                          placeholder="number"
                          value={number}
                        />
                      </Input>
                    </Form.Field>
                  </Form.Group>

                  <Form.Group inline>
                    <Form.Checkbox
                      label={t('reset')}
                      name="reset"
                      checked={reset}
                      onChange={this.handleCheckBoxChange}
                    />
                  </Form.Group>
                </Form>
              </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
              <EssorButton disabled={loadingCreateDocumentNumbering || loadingUpdateDocumentNumbering} secondary type="x" size="small" onClick={this.closeCreateDocumentNumberingModal}>
                {t('buttonCancel')}
              </EssorButton>

              <EssorButton disabled={loadingCreateDocumentNumbering || loadingUpdateDocumentNumbering} type="plus" size="small" onClick={this.handleDocumentNumberingSubmit}>
                {t('buttonSave')}
              </EssorButton>
            </Modal.Actions>
          </Modal>


          <Segment
            basic
            className={classnames('table-container', {
              'is-loading': loadingDocumentNumbering,
            })}
          >
            <Dimmer active={loadingDocumentNumbering} inverted>
              <Loader>{t('loading')}</Loader>
            </Dimmer>
            <Table celled striped>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell />
                  <Table.HeaderCell>{t('documentNumberingType')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('formLabel')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('formNumber')}</Table.HeaderCell>
                  <Table.HeaderCell />
                </Table.Row>
              </Table.Header>

              <Table.Body>

                {documentNumberingData && documentNumberingData.map((document, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{index + 1}</Table.Cell>
                    <Table.Cell>{document.documentType}</Table.Cell>
                    <Table.Cell>{document.label}</Table.Cell>
                    <Table.Cell>{document.number}</Table.Cell>
                    <Table.Cell textAlign="center">
                      <Button className="table-button" data-tip="Modifier" icon="edit" onClick={() => this.openCreateDocumentNumberingModal(document['@id'])} />
                      <ReactTooltip className="essor-tooltip" effect="solid" place="bottom" />
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
  getDocumentNumbering: page => dispatch(listDocumentNumberings(page)),
  postDocumentNumbering: data => dispatch(createDocumentNumbering(data)),
  updateDocumentNumbering: (item, values) => dispatch(updateDocumentNumbering(item, values)),

  resetCreateDocumentNumbering: () => {
    dispatch(successCreateDocumentNumbering(null));
    dispatch(loadingCreateDocumentNumbering(false));
    dispatch(errorCreateDocumentNumbering(null));
  },

  resetUpdateDocumentNumbering: () => dispatch(resetUpdateDocumentNumbering()),
  resetDocumentNumberingList: () => dispatch(resetDocumentNumbering()),

  reset: () => {
    dispatch(resetDocumentNumbering());
  },
});

const mapStateToProps = state => ({
  selectedFiscalYear: state.userCompanies.select.selectedFiscalYear,

  dataDocumentNumbering: state.documentNumbering.list.data,
  loadingDocumentNumbering: state.documentNumbering.list.loading,
  errorDocumentNumbering: state.documentNumbering.list.error,

  successCreateDocumentNumbering: state.documentNumbering.create.created,
  loadingCreateDocumentNumbering: state.documentNumbering.create.loading,
  errorCreateDocumentNumbering: state.documentNumbering.create.error,

  updatedDocumentNumbering: state.documentNumbering.update.updated,
  loadingUpdateDocumentNumbering: state.documentNumbering.update.updateLoading,
  errorUpdateDocumentNumbering: state.documentNumbering.update.updateError,

});
const Main = connect(mapStateToProps, mapDispatchToProps)(DocumentNumbering);

export default withNamespaces('translation')(withRouter(Main));
