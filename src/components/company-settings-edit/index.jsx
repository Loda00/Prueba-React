import React, { Component } from 'react';
import { isEmpty } from 'lodash';
import { Form, Icon, Modal, Table } from 'semantic-ui-react';
import { withNamespaces } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { EssorButton } from '../index';

class CompanyListEdit extends Component {
  state = {
    createOfferModalOpen: false,
    idModal: null,
    dataClone: null,
  };

  componentDidMount() {
    const { dataValue } = this.props;
    if (dataValue) {
      this.setState({
        dataValue,
      });

      Object.keys(dataValue[0]).map(item => (
        this.setState({
          [item]: item === 'id' ? null : '',
        })
      ));
    }
  }

  componentDidUpdate(prevProps) {
    const { dataValue } = this.state;
    const { onEditList } = this.props;

    if (dataValue !== prevProps.dataValue) {
      onEditList(dataValue);
    }
  }

  handleInputChange = (e) => {
    e.preventDefault();

    const { dataClone } = this.state;
    const { name, value } = e.target;
    dataClone[name] = value;
    this.setState({
      dataClone,
    });
  };

  handleCheckBoxChange = (e, value) => {
    e.preventDefault();

    const { dataClone } = this.state;
    const { name } = value;

    dataClone[name] = !dataClone[name];
    this.setState({
      dataClone,
    });
  };

  openCreateOfferModal = (e, index) => {
    const dataClone = Object.assign({}, e);
    this.setState({
      dataClone,
      createOfferModalOpen: true,
      idModal: index,
    });
  };

  closeCreateOfferModal = () => {
    this.setState({
      createOfferModalOpen: false,
    });
  };

  handleOnSubmit = () => {
    const { idModal, dataClone } = this.state;
    const { dataValue } = this.props;
    const updateValueData = [...dataValue];
    updateValueData[idModal] = dataClone;

    this.setState({
      dataValue: updateValueData,
      createOfferModalOpen: false,
    });
  };

  capitalizeLabel = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  render() {
    const { createOfferModalOpen, idModal, dataClone } = this.state;
    const { t, dataValue, updateLoading } = this.props;

    return (
      <div className="section-general">
        <div className="select-list margin-top">
          <Table celled structured className="margin-bot">
            <Table.Header>
              <Table.Row>
                {
                  !isEmpty(dataValue) && Object.keys(dataValue[0]).map((item, indexValue) => (
                    item !== 'id' ? <Table.HeaderCell key={indexValue}>{t(`form${this.capitalizeLabel(item)}`)}</Table.HeaderCell> : ''
                  ))
                }
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {!isEmpty(dataValue) && dataValue.map((itemData, index) => (
                <Table.Row key={index}>
                  {
                    Object.values(dataValue[index]).map((item, index2) => (
                      !(typeof item === 'number') && typeof item !== 'boolean' ? (
                        <Table.Cell key={index2}>
                          {item}
                        </Table.Cell>
                      ) : typeof item === 'boolean' ? (
                        <Table.Cell textAlign="center" key={index2}>
                          <Icon
                            color={item ? 'green' : 'red'}
                            name={item ? 'check' : 'close'}
                            size="large"
                          />
                        </Table.Cell>
                      ) : ''
                    ))
                  }
                  <Table.Cell collapsing textAlign="center">
                    <Icon
                      className="table-button"
                      name="edit"
                      data-id={index}
                      onClick={() => this.openCreateOfferModal(itemData, index)}
                    />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>

        <Modal
          open={createOfferModalOpen}
          closeOnEscape={false}
          closeOnDimmerClick={false}
          className="full-content"
        >
          <Modal.Header>Modal edit</Modal.Header>
          <Modal.Content scrolling>
            <Modal.Description>

              <Form className="margin-top-bot main-form" size="small">
                { idModal !== null
                  && (
                    Object.entries(dataClone).map((item, indexCl) => (
                      item[0] !== 'id' && item[0] !== 'default' ? (
                        <Form.Group inline key={indexCl}>
                          <Form.Input
                            label={t(`form${this.capitalizeLabel(item[0])}`)}
                            name={item[0]}
                            placeholder={t(`form${this.capitalizeLabel(item[0])}`)}
                            value={item[1]}
                            onChange={this.handleInputChange}
                          />
                        </Form.Group>
                      ) : item[0] === 'default' ? (
                        <Form.Group inline key={indexCl}>
                          <Form.Checkbox
                            label={t(`form${this.capitalizeLabel(item[0])}`)}
                            name={item[0]}
                            checked={item[1]}
                            onChange={this.handleCheckBoxChange}
                          />
                        </Form.Group>
                      ) : ''
                    ))
                  )
                }
              </Form>
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <EssorButton disabled={updateLoading} secondary type="x" size="small" onClick={this.closeCreateOfferModal}>
              {t('buttonCancel')}
            </EssorButton>

            <EssorButton disabled={updateLoading} type="plus" size="small" onClick={this.handleOnSubmit}>
              {t('buttonSave')}
            </EssorButton>
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

export default withNamespaces('translation')(withRouter(CompanyListEdit));
