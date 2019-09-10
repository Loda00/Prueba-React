import React, { Component } from 'react';
import { connect } from 'react-redux';
import { isEmpty, findIndex, find } from 'lodash';
import moment from 'moment';
import { withRouter, Link } from 'react-router-dom';
import { Label, Dropdown, Table, Checkbox, Icon, Image, Form, Input, Grid, Select, TextArea, Message } from 'semantic-ui-react';
import { withNamespaces } from 'react-i18next';
import DatePicker from 'react-datepicker';
import Cleave from 'cleave.js/react';
import { EssorButton } from 'components';
import uploadDefaultImage from 'assets/images/uploadDefault.png';

moment.locale('fr');

class Document extends Component {
  state = {
    selectedItemList: [],
    defaultRate: null,
    selectedLine: null,

    globalDiscount: 0,
    globalDiscountType: 'e',

    visibility: {
      reference: true,
      label: true,
      unitCost: true,
      unit: true,
      vat: true,
      quantity: true,
      discount: true,
      total: true,
    },

    reference: '',
    creationDate: moment(),
    responseDate: moment().add(15, 'd'),
    paymentDate: moment(),
    subject: '',
    showLatePaymentLawText: false,
    showVATLawText: false,
    showCompanySignature: false,
    saveDocumentSettings: false,
    note: '',

    quote: '',

    subjectError: false,
    selectedListError: false,
    creationDateError: false,
    responseDateError: false,
    paymentDateError: false,

    vat: [],
    totalPrice: 0,
    netTotalPrice: 0,
    totalTax: 0,
  };

  componentDidMount() {
    const { documentData } = this.props;

    if (!isEmpty(documentData)) {
      const selectedItemList = documentData.content.body.map((article) => {
        let itemList = {};

        if (article.id) {
          itemList = {
            type: article.type,
            id: article.id,
            label: article.label,
            reference: article.reference,
            quantity: article.quantity,
            vatRate: article.vatRate,
            price: article.price,
            totalPrice: article.totalPrice,
            discount: article.discount,
            discountType: article.discountType,
            optional: article.optional,
            activity1: article.activity1,
            activity2: article.activity2,
            unit: article.unit,
            stockManagement: article.stockManagement,
          };

          if (article.type === 'Ensemble') {
            itemList.items = article.items;
          } else if (article.type === 'Product') {
            itemList.calculationMode = article.calculationMode;
            itemList.margin = article.margin;
            itemList.soldAs = article.soldAs;
            itemList.unitCost = article.unitCost;
          } else {
            itemList.soldAs = article.soldAs;
          }
        } else if (article.type === 'blankLine') {
          itemList.type = 'blankLine';
        } else if (article.type === 'comment') {
          itemList = {
            comment: article.comment,
            type: 'comment',
          };
        } else if (article.type === 'subtotal') {
          itemList.type = 'subtotal';
        }

        return itemList;
      });

      this.setState({
        content: documentData.content,
        selectedItemList,
        documentId: documentData.documentId,
        creationDate: documentData.creationDate,
        responseDate: documentData.responseDate,
        paymentDate: documentData.paymentDate,
        reference: documentData.reference,
        note: documentData.note,

        showLatePaymentLawText: documentData.content.showLatePaymentLawText,
        showVATLawText: documentData.content.showVATLawText,
        showCompanySignature: documentData.content.showCompanySignature,
        saveDocumentSettings: documentData.content.saveDocumentSettings,

        visibility: documentData.content.visibility,
        globalDiscount: documentData.content.globalDiscount,
        globalDiscountType: documentData.content.globalDiscountType,
        subject: documentData.content.subject,
      }, this.setVatValues);
    } else {
      this.setState({
        content: {},
      });
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.documentData.content)
      && JSON.stringify(nextProps.documentData.content) !== JSON.stringify(prevState.content)) {
      const selectedItemList = nextProps.documentData.content.body.map((article) => {
        let itemList = {};

        if (article.id) {
          itemList = {
            type: article.type,
            id: article.id,
            label: article.label,
            reference: article.reference,
            quantity: article.quantity,
            vatRate: article.vatRate,
            price: article.price,
            totalPrice: article.totalPrice,
            discount: article.discount,
            discountType: article.discountType,
            optional: article.optional,
            activity1: article.activity1,
            activity2: article.activity2,
            unit: article.unit,
          };

          if (article.type === 'Ensemble') {
            itemList.items = article.items;
          } else if (article.type === 'Product') {
            itemList.calculationMode = article.calculationMode;
            itemList.margin = article.margin;
            itemList.soldAs = article.soldAs;
            itemList.unitCost = article.unitCost;
          } else {
            itemList.soldAs = article.soldAs;
          }
        } else if (article.type === 'blankLine') {
          itemList.type = 'blankLine';
        } else if (article.type === 'comment') {
          itemList = {
            comment: article.comment,
            type: 'comment',
          };
        } else if (article.type === 'subtotal') {
          itemList.type = 'subtotal';
        }

        return itemList;
      });

      return {
        content: nextProps.documentData.content,
        visibility: nextProps.documentData.content.visibility,
        globalDiscount: nextProps.documentData.content.globalDiscount,
        globalDiscountType: nextProps.documentData.content.globalDiscountType,
        subject: nextProps.documentData.content.subject,
        selectedItemList,
      };
    }

    if (!isEmpty(nextProps.listCompanySettings)) {
      const vatRates = find(nextProps.listCompanySettings['hydra:member'], {
        name: 'VAT_RATES',
      });

      let rate;

      for (let i = 0; i < vatRates.value.length; i++) {
        ({ rate } = vatRates.value[i]);

        if (vatRates.value[i].default) {
          break;
        }
      }

      return {
        defaultRate: rate,
      };
    }

    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    const { content } = this.state;
    const { validData, validContent } = this.props;

    if (content !== prevState.content) {
      this.setVatValues();
    }

    if (validData && validData !== prevProps.validData) {
      this.validateForm();
    }

    if (validContent && validContent !== prevProps.validContent) {
      this.returnContent();
    }
  }

  validateForm = () => {
    const { getData, selectedCompany, type } = this.props;

    const {
      selectedItemList,
      reference,
      creationDate,
      responseDate,
      paymentDate,
      subject,
      showLatePaymentLawText,
      showVATLawText,
      showCompanySignature,
      saveDocumentSettings,
      note,
      globalDiscount,
      globalDiscountType,
      visibility,

      vat,
      totalPrice,
      netTotalPrice,
      totalTax,
      // quote,
    } = this.state;

    this.setState({
      subjectError: false,
      selectedListError: false,
      creationDateError: false,
      responseDateError: false,
      paymentDateError: false,
    });

    let isValid = true;

    if (selectedItemList.length === 0) {
      isValid = false;

      this.setState({
        selectedListError: true,
      });
    }

    if (type !== 'model' && subject.trim() === '') {
      isValid = false;

      this.setState({
        subjectError: true,
      });
    }

    if (!creationDate) {
      isValid = false;

      this.setState({
        creationDateError: true,
      });
    }

    if ((type === 'quote' || type === 'invoice') && (!responseDate || responseDate.isBefore(creationDate))) {
      isValid = false;

      this.setState({
        responseDateError: true,
      });
    }

    if (type === 'invoice' && (!paymentDate || paymentDate.isBefore(creationDate))) {
      isValid = false;

      this.setState({
        paymentDateError: true,
      });
    }

    if (!isValid) {
      getData(null);
      return;
    }

    const body = selectedItemList.map((item) => {
      let obj = {};
      if (item.id) {
        obj = {
          type: item.type,
          id: item.id,
          label: item.label,
          reference: item.reference,
          quantity: item.quantity,
          vatRate: item.vatRate,
          price: item.price,
          totalPrice: item.totalPrice,
          discount: item.discount,
          discountType: item.discountType,
          optional: item.optional,
          activity1: item.activity1,
          activity2: item.activity2,
          unit: item.unit,
          stockManagement: item.stockManagement,
        };

        if (item.type === 'Ensemble') {
          obj.items = item.items;
        } else if (item.type === 'Product') {
          obj.calculationMode = selectedCompany.calculationMode;
          obj.margin = item.margin;
          obj.unitCost = item.unitCost;
          obj.soldAs = item.soldAs;
        } else {
          obj.soldAs = item.soldAs;
        }
      } else if (item.type === 'blankLine') {
        obj.type = 'blankLine';
      } else if (item.type === 'comment') {
        obj = {
          comment: item.comment,
          type: 'comment',
        };
      } else if (item.type === 'subtotal') {
        obj.type = 'subtotal';
      }

      return obj;
    });

    const total = {
      beforeTaxes: totalPrice,
      withDiscount: netTotalPrice,
      vat,
      withTaxes: netTotalPrice + totalTax,
    };

    const content = {
      body,
      total,
      subject,
      globalDiscount,
      globalDiscountType,
      visibility,
    };

    if (type === 'model') {
      getData({
        content,
      });
      return;
    }

    if (type === 'invoice') {
      content.showLatePaymentLawText = showLatePaymentLawText;
      content.showVATLawText = showVATLawText;
      content.showCompanySignature = showCompanySignature;
      content.saveDocumentSettings = saveDocumentSettings;
    }

    const data = {
      content,
      reference,
      responseDate: responseDate.format(),
      creationDate: creationDate.format(),
      totalPrice: totalPrice.toString(),
      totalVAT: totalTax.toString(),
    };

    if (type === 'quote') {
      data.note = note;
    }

    if (type === 'invoice') {
      data.customerComment = note;
      data.paymentDate = paymentDate;
    }

    getData(data);
  };

  returnContent = () => {
    const { selectedItemList } = this.state;
    const { getContent } = this.props;

    getContent(selectedItemList);
  };

  onPriceCleaveInit = (cleave) => {
    this.setState({
      priceCleave: cleave,
    });
  };

  onDiscountCleaveInit = (cleave) => {
    this.setState({
      discountCleave: cleave,
    });
  };

  setVatValues = () => {
    const {
      selectedItemList,
      globalDiscount,
      globalDiscountType,
    } = this.state;

    const vat = [];
    let discountPercent = 0;
    let totalPrice = 0;
    let totalTax = 0;

    if (!isEmpty(selectedItemList)) {
      selectedItemList.forEach((item) => {
        if (item.price && !item.optional) {
          totalPrice += item.totalPrice;
        }
      });

      if (parseFloat(globalDiscount) > 0) {
        if (globalDiscountType === 'e') {
          discountPercent = (globalDiscount * 100) / totalPrice;
        } else {
          discountPercent = globalDiscount;
        }
      }

      selectedItemList.forEach((item, index) => {
        if (item.price && !item.optional) {
          let totalForRate = 0;
          let percentage = null;
          let alreadyAdded;

          if (item.type === 'Ensemble') {
            item.items.forEach((article) => {
              totalForRate = 0;

              alreadyAdded = findIndex(vat, {
                percentage: article.item.vatRate,
              });

              if (alreadyAdded !== -1) return;

              percentage = article.item.vatRate;

              for (let i = index; i < selectedItemList.length; i++) {
                if (selectedItemList[i].type === 'Ensemble' && !selectedItemList[i].optional) {
                  for (let n = 0; n < selectedItemList[i].items.length; n++) {
                    if (selectedItemList[i].items[n].item.vatRate === percentage) {
                      totalForRate += selectedItemList[i].items[n].item.totalPrice;
                    }
                  }
                } else if (selectedItemList[i].vatRate === percentage
                  && !selectedItemList[i].optional) {
                  totalForRate += selectedItemList[i].totalPrice;
                }
              }

              const obj = {
                percentage,
                value: ((totalForRate * percentage) / 100) * ((100 - discountPercent) / 100),
              };

              totalTax += obj.value;

              vat.push(obj);
            });
          } else {
            alreadyAdded = findIndex(vat, {
              percentage: item.vatRate,
            });

            if (alreadyAdded !== -1) return;

            percentage = item.vatRate;

            for (let i = index; i < selectedItemList.length; i++) {
              if (selectedItemList[i].type === 'Ensemble' && !selectedItemList[i].optional) {
                for (let n = 0; n < selectedItemList[i].items.length; n++) {
                  if (selectedItemList[i].items[n].item.vatRate === percentage) {
                    totalForRate += selectedItemList[i].items[n].item.totalPrice;
                  }
                }
              } else if (selectedItemList[i].vatRate === percentage
                && !selectedItemList[i].optional) {
                totalForRate += selectedItemList[i].totalPrice;
              }
            }

            const obj = {
              percentage,
              value: ((totalForRate * percentage) / 100) * ((100 - discountPercent) / 100),
            };

            totalTax += obj.value;

            vat.push(obj);
          }
        }
      });
    }

    let netTotalPrice = totalPrice;

    if (parseFloat(globalDiscount) > 0) {
      if (globalDiscountType === 'e') {
        netTotalPrice -= globalDiscount;
      } else {
        netTotalPrice = (100 - globalDiscount) * netTotalPrice / 100;
      }
    }

    this.setState({
      vat,
      totalPrice,
      netTotalPrice,
      totalTax,
    });
  };

  getSubtotal = (index) => {
    const { selectedItemList } = this.state;

    let subtotal = 0;

    for (let i = index - 1; i >= 0; i--) {
      if (selectedItemList[i].type === 'subtotal') {
        break;
      } else if (selectedItemList[i].totalPrice && !selectedItemList[i].optional) {
        subtotal += selectedItemList[i].totalPrice;
      }
    }

    return subtotal.toFixed(2);
  };

  handleVisibility = (name) => {
    const { status } = this.props;

    if (status >= 4) return;

    this.setState(prevState => ({
      visibility: {
        ...prevState.visibility,
        [name]: !prevState.visibility[name],
      },
    }));
  };

  handleCreationDateChange = (creationDate) => {
    this.setState({
      creationDate,
    });
  };

  handleResponseDateChange = (responseDate) => {
    this.setState({
      responseDate,
    });
  };

  handlePaymentDateChange = (paymentDate) => {
    this.setState({
      paymentDate,
    });
  };

  handleCheckBoxChange = (e, { name }) => {
    e.preventDefault();

    this.setState(prevState => (
      {
        [name]: !prevState[name],
      }
    ));
  };

  handleItemCheckBoxChange = (e, item, index) => {
    const { selectedItemList } = this.state;

    selectedItemList[index].optional = !selectedItemList[index].optional;

    this.setState({
      selectedItemList,
    }, this.setVatValues);
  };

  handleInputChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;

    this.setState({
      [name]: value,
    }, () => {
      if (name === 'globalDiscount') {
        this.setVatValues();
      }
    });
  };

  handleSelectChange = (e, { name, value }) => {
    e.preventDefault();
    const { totalPrice, globalDiscount, globalDiscountType } = this.state;
    let discount = globalDiscount;

    if (name === 'globalDiscountType' && (globalDiscountType !== value)) {
      if (value === 'p') {
        discount = 100 - ((totalPrice - globalDiscount) * 100) / totalPrice;
      } else if (value === 'e') {
        discount = (totalPrice * globalDiscount) / 100;
      }
    }

    this.setState({
      [name]: value,
      globalDiscount: discount,
    }, this.setVatValues);
  };

  handleAddLine = () => {
    const { selectedLine, selectedItemList } = this.state;

    if (!selectedLine) return;

    const line = {};

    switch (selectedLine) {
      case 'blankLine':
        line.type = 'blankLine';
        break;
      case 'comment':
        line.comment = '';
        line.type = 'comment';
        break;
      case 'subtotal':
        line.type = 'subtotal';
        break;
      default: break;
    }

    selectedItemList.push(line);

    this.setState({
      selectedLine: null,
      selectedItemList,
    });
  };

  handleAddItem = (e, { value }) => {
    const { selectedItemList, defaultRate } = this.state;
    const { listArticle, selectedCompany } = this.props;
    const item = JSON.parse(value);

    const index = findIndex(selectedItemList, {
      id: item.id,
    });

    if (index === -1) {
      if (item.type === 'Ensemble') {
        let obj = null;

        item.items.forEach((article, index) => {
          obj = find(listArticle, {
            id: article.item,
          });

          if (obj.type === 'Product') {
            obj.soldAs = 'md';
            obj.unitCost = obj.price;

            if (selectedCompany.calculationMode === 'coef') {
              obj.price = obj.margin * obj.unitCost;
            } else if (parseFloat(item.margin) === 100) {
              obj.price = obj.unitCost;
            } else {
              obj.price = obj.unitCost / (1 - (obj.margin / 100));
            }
          } else {
            obj.soldAs = 'h';
          }

          obj.activity1 = null;
          obj.activity2 = null;
          obj.vatRate = defaultRate;
          // obj.discountType = 'p';
          // obj.discount= 0;
          obj.totalPrice = obj.price * article.quantity;
          obj.originalPrice = obj.price;
          item.items[index].item = obj;
        });
      } else if (item.type === 'Product') {
        item.unitCost = item.price;
        item.soldAs = 'md';
        item.vatRate = defaultRate;
        item.activity1 = null;
        item.activity2 = null;

        if (selectedCompany.calculationMode === 'coef') {
          item.price = item.margin * item.unitCost;
        } else if (parseFloat(item.margin) === 100) {
          item.price = item.unitCost;
        } else {
          item.price = item.unitCost / (1 - (item.margin / 100));
        }
      } else {
        item.soldAs = 'h';
        item.vatRate = defaultRate;
        item.activity1 = null;
        item.activity2 = null;
      }

      item.discountType = 'e';
      item.discount = 0;
      item.quantity = 1;
      item.optional = false;
      item.totalPrice = item.price * item.quantity;

      selectedItemList.push(item);

      this.setState({
        selectedItemList,
      }, this.setVatValues);
    }
  };

  handleChangeItem = (e, item) => {
    const { name, value } = e.target;
    const { selectedItemList } = this.state;
    const { selectedCompany } = this.props;
    const index = findIndex(selectedItemList, {
      id: item.id,
    });

    item[name] = value;

    switch (name) {
      case 'price':
        if (selectedCompany.calculationMode === 'coef') {
          item.margin = item.price / item.unitCost;
        } else {
          item.margin = 100 + (item.unitCost / item.price) * 100;
        }
        break;
      case 'margin':
        if (selectedCompany.calculationMode === 'coef') {
          item.price = item.margin * item.unitCost;
        } else if (parseFloat(item.margin) === 100) {
          item.price = item.unitCost;
        } else {
          item.price = item.unitCost / (1 - (item.margin / 100));
        }
        break;
      default: break;
    }

    if (item.discountType === 'p') {
      item.totalPrice = (100 - item.discount) * (item.price * item.quantity) / 100;
    } else if (item.discountType === 'e') {
      item.totalPrice = (item.price * item.quantity) - item.discount;
    }

    selectedItemList[index] = item;

    this.setState({
      selectedItemList,
    }, this.setVatValues);
  };

  handleOnBlurItemPrice = (e, article) => {
    const { selectedItemList, priceCleave } = this.state;
    const { selectedCompany } = this.props;
    const { value } = e.target;

    if (article.type !== 'Ensemble') return;

    const index = findIndex(selectedItemList, {
      id: article.id,
    });

    let minValue = 0;
    let productQuantity = 0;
    let totalValue = 0;

    for (let i = 0; i < article.items.length; i++) {
      totalValue += article.items[i].item.totalPrice;

      switch (article.items[i].item.type) {
        case 'Product':
          productQuantity += 1;
          break;
        case 'Service':
          minValue += article.items[i].item.totalPrice;
          break;
        default: break;
      }
    }

    if (value - minValue < 0) {
      article.price = minValue;
      priceCleave.setRawValue(minValue);
    }

    const toProduct = (totalValue - article.price) / productQuantity;

    for (let j = 0; j < article.items.length; j++) {
      if (article.items[j].item.type === 'Product') {
        article.items[j].item.price -= toProduct / article.items[j].quantity;
        article.items[j].item.totalPrice = article.items[j].item.price * article.items[j].quantity;

        if (selectedCompany.calculationMode === 'coef') {
          article.items[j].item.margin = article.items[j].item.price
            / article.items[j].item.unitCost;
        } else {
          article.items[j].item.margin = 100
            - (article.items[j].item.unitCost / article.items[j].item.price)
            * 100;
        }
      }
    }

    selectedItemList[index] = article;

    this.setState({
      selectedItemList,
    }, this.setVatValues);
  };

  handleOnFocusItemDiscount = (e, article) => {
    if (article.type !== 'Ensemble') return;

    const actualDiscount = (article.price * article.quantity) - article.totalPrice;

    this.setState({
      actualDiscount,
    });
  };

  handleOnBlurItemDiscount = (e, article) => {
    const { selectedItemList, discountCleave, actualDiscount } = this.state;
    const { selectedCompany } = this.props;

    if (article.type !== 'Ensemble') return;

    const index = findIndex(selectedItemList, {
      id: article.id,
    });

    let discount = (article.price * article.quantity) - article.totalPrice;
    let productMaxDiscount = Infinity;
    let productQuantity = 0;

    for (let i = 0; i < article.items.length; i++) {
      if (article.items[i].item.type === 'Product') {
        productQuantity += 1;

        if (article.items[i].item.price < productMaxDiscount) {
          productMaxDiscount = article.items[i].item.originalPrice * article.items[i].quantity;
        }
      }
    }

    const maxDiscount = productMaxDiscount === Infinity
      ? 0
      : productMaxDiscount;

    if (maxDiscount < discount) {
      if (article.discountType === 'p') {
        article.discount = (maxDiscount * 100) / (article.price * article.quantity);
        article.totalPrice = (100 - article.discount) * (article.price * article.quantity) / 100;
      } else if (article.discountType === 'e') {
        article.discount = maxDiscount;
        article.totalPrice = (article.price * article.quantity) - article.discount;
      }

      discount = (article.price * article.quantity) - article.totalPrice;
      discountCleave.setRawValue(article.discount);
    }

    const toProduct = (discount - actualDiscount) / productQuantity;

    for (let j = 0; j < article.items.length; j++) {
      if (article.items[j].item.type === 'Product') {
        article.items[j].item.price -= toProduct / article.items[j].quantity;
        article.items[j].item.totalPrice = article.items[j].item.price * article.items[j].quantity;

        if (selectedCompany.calculationMode === 'coef') {
          article.items[j].item.margin = article.items[j].item.price
            / article.items[j].item.unitCost;
        } else {
          article.items[j].item.margin = 100
            - (article.items[j].item.unitCost / article.items[j].item.price)
            * 100;
        }
      }
    }

    selectedItemList[index] = article;

    this.setState({
      selectedItemList,
    }, this.setVatValues);
  };

  handleChangeSelectItem = (e, data, item) => {
    const { name, value } = data;

    const { selectedItemList } = this.state;
    const index = findIndex(selectedItemList, {
      id: item.id,
    });

    item[name] = value;

    if (item.discountType === 'p') {
      item.discount = 100 - (item.totalPrice * 100 / (item.price * item.quantity));
    } else if (item.discountType === 'e') {
      item.discount = (item.price * item.quantity) - item.totalPrice;
    }

    selectedItemList[index] = item;

    this.setState({
      selectedItemList,
    }, this.setVatValues);
  };

  handleChangeComment = (e, item, index) => {
    const { name, value } = e.target;
    const { selectedItemList } = this.state;

    selectedItemList[index][name] = value;

    this.setState({
      selectedItemList,
    });
  };

  handleEnsembleInputChange = (e, item, article) => {
    const { value, name } = e.target;
    const { selectedItemList } = this.state;

    const ensembleIndex = findIndex(selectedItemList, {
      id: item.id,
    });

    const ensembleArticle = findIndex(item.items, {
      item: article.item,
    });

    article.item[name] = value;

    item.items[ensembleArticle] = article;
    selectedItemList[ensembleIndex] = item;

    this.setState({
      selectedItemList,
    });
  };

  handleEnsembleSelectChange = (e, data, item, article) => {
    const { value, name } = data;
    const { selectedItemList } = this.state;

    const ensembleIndex = findIndex(selectedItemList, {
      id: item.id,
    });

    const ensembleArticle = findIndex(item.items, {
      item: article.item,
    });

    article.item[name] = value;

    item.items[ensembleArticle] = article;
    selectedItemList[ensembleIndex] = item;

    this.setState({
      selectedItemList,
    }, () => {
      if (name === 'vatRate') {
        this.setVatValues();
      }
    });
  };

  handleDeleteItem = (item, itemIndex = null) => {
    const { selectedItemList } = this.state;

    const index = itemIndex !== null
      ? itemIndex
      : findIndex(selectedItemList, {
        id: item.id,
      });

    selectedItemList.splice(index, 1);

    this.setState({
      selectedItemList,
    }, this.setVatValues);
  };

  render() {
    const {
      documentId,
      selectedItemList,
      selectedLine,

      globalDiscount,
      globalDiscountType,

      visibility,

      reference,
      creationDate,
      responseDate,
      paymentDate,
      subject,
      showLatePaymentLawText,
      showVATLawText,
      showCompanySignature,
      note,

      subjectError,
      selectedListError,
      creationDateError,
      responseDateError,
      paymentDateError,

      vat,
      totalPrice,
      netTotalPrice,
      totalTax,
    } = this.state;

    const {
      status,
      customer,
      type,
      selectedCompany,
      listCompanySettings,
      listArticle,
      loadingCompanySettings,
      loadingListArticle,
      t,
    } = this.props;

    let itemList = [];
    let companyDetails = null;
    let contactInformation = null;
    let vatRates = [];

    if (!isEmpty(listArticle)) {
      itemList = listArticle.map(article => ({
        key: `pro${article.id}`,
        text: article.label,
        value: JSON.stringify(article),
      }));
    }

    if (!isEmpty(listCompanySettings)) {
      companyDetails = find(listCompanySettings['hydra:member'], {
        name: 'COMPANY_DETAILS',
      });
      if (companyDetails) {
        companyDetails = companyDetails.value;
      }

      contactInformation = find(listCompanySettings['hydra:member'], {
        name: 'CONTACT_INFORMATION',
      });
      if (contactInformation) {
        contactInformation = contactInformation.value;
      }

      vatRates = find(listCompanySettings['hydra:member'], {
        name: 'VAT_RATES',
      });
      vatRates = vatRates.value;
    }

    if (vatRates) {
      vatRates = vatRates.map((rates, index) => ({
        key: `rate${index}`,
        text: rates.rate,
        value: rates.rate,
      }));
    }

    const productSoldOptions = [
      {
        key: 'md',
        text: 'MD',
        value: 'md',
      },
      {
        key: 'mp',
        text: 'MP',
        value: 'mp',
      },
    ];

    const serviceSoldOptions = [
      {
        key: 'h',
        text: 'H',
        value: 'h',
      },
      {
        key: 'hst',
        text: 'HST',
        value: 'hst',
      },
    ];

    const total = netTotalPrice + totalTax;
    let label;

    switch (type) {
      case 'quote':
        label = t('formQuoteNumber');
        break;
      case 'purchaseOrder':
        label = t('purchaseOrderNumber');
        break;
      case 'invoice':
        label = t('invoiceOrderNumber');
        break;
      default: break;
    }

    const discountOptions = [
      {
        key: 'E', text: '\u20AC', value: 'e',
      },
      {
        key: 'P', text: '%', value: 'p',
      },
    ];

    const lineOptions = [
      {
        key: 'line', text: 'Blank line', value: 'blankLine',
      },
      {
        key: 'comment', text: 'Comment', value: 'comment',
      },
      {
        key: 'subtotal', text: 'Subtotal', value: 'subtotal',
      },
    ];

    const activityOptions = [
      {
        key: 'ac1', text: 'Activity value 1', value: 'value 1',
      },
      {
        key: 'ac2', text: 'Activity value 2', value: 'value 2',
      },
      {
        key: 'ac3', text: 'Activity value 3', value: 'value 3',
      },
    ];

    return (
      <div className="document-container">
        <Grid>
          {type !== 'model'
          && (
            <React.Fragment>
              <Grid.Row>
                <Grid.Column width={9}>
                  <div style={{
                    width: '182px',
                  }}
                  >
                    <Image src={uploadDefaultImage} />
                  </div>

                  <h5 className="informative-field">
                    {companyDetails ? companyDetails.legalName : `${t('loading')} ...`}
                  </h5>

                  <p>{contactInformation ? contactInformation.streetName : `${t('loading')} ...`}</p>
                  <p>
                    {contactInformation
                      ? `${contactInformation.zipCode} ${contactInformation.city}`
                      : `${t('loading')} ...`
                    }
                  </p>
                  <p>{contactInformation ? contactInformation.country : `${t('loading')} ...`}</p>

                  <h5 className="informative-field">
                    N° TVA Intracommunautaire
                  </h5>

                  <p>{companyDetails ? companyDetails.vat : `${t('loading')} ...`}</p>
                </Grid.Column>

                <Grid.Column width={7}>
                  <Form className="margin-top-bot main-form" loading={false} size="small">
                    <Form.Group inline>
                      <Form.Field>
                        <label>{label}</label>
                        <h5 className="informative-field">{documentId || '-'}</h5>
                      </Form.Field>
                    </Form.Group>

                    <Form.Group inline>
                      {(status < 4)
                        ? (
                          <Form.Input
                            label={t('formReference')}
                            placeholder={t('formPHReference')}
                            onChange={this.handleInputChange}
                            name="reference"
                            value={reference}
                          />
                        )
                        : (
                          <Form.Field>
                            <label>{t('formReference')}</label>
                            <h5 className="informative-field">{reference}</h5>
                          </Form.Field>
                        )
                      }
                    </Form.Group>

                    <Form.Group inline>
                      {(status < 4)
                        ? (
                          <Form.Input
                            label={t('formDate')}
                            name="creationDate"
                            control={DatePicker}
                            selected={creationDate}
                            onChange={this.handleCreationDateChange}
                            locale="fr"
                            autoComplete="off"
                            error={creationDateError}
                          />
                        )
                        : (
                          <Form.Field>
                            <label>{t('formDate')}</label>
                            <h5 className="informative-field">{moment(creationDate).format('DD/MM/YYYY')}</h5>
                          </Form.Field>
                        )
                      }
                    </Form.Group>

                    {(type === 'quote' || type === 'invoice')
                    && (
                      <Form.Group inline>
                        {(status < 4)
                          ? (
                            <Form.Input
                              label={t('quoteSignBefore')}
                              name="responseDate"
                              control={DatePicker}
                              minDate={creationDate}
                              selected={responseDate}
                              onChange={this.handleResponseDateChange}
                              locale="fr"
                              autoComplete="off"
                              error={responseDateError}
                            />
                          )
                          : (
                            <Form.Field>
                              <label>{t('quoteSignBefore')}</label>
                              <h5 className="informative-field">{moment(responseDate).format('DD/MM/YYYY')}</h5>
                            </Form.Field>
                          )
                        }
                      </Form.Group>
                    )}

                    {type === 'invoice'
                    && (
                      <Form.Group inline>
                        {(status < 4)
                          ? (
                            <Form.Input
                              label={t('quotePaymentDay')}
                              name="paymentDate"
                              control={DatePicker}
                              minDate={creationDate}
                              selected={paymentDate}
                              onChange={this.handlePaymentDateChange}
                              locale="fr"
                              autoComplete="off"
                              error={paymentDateError}
                            />
                          )
                          : (
                            <Form.Field>
                              <label>{t('quotePaymentDay')}</label>
                              <h5 className="informative-field">{moment(paymentDate).format('DD/MM/YYYY')}</h5>
                            </Form.Field>
                          )
                        }
                      </Form.Group>
                    )}

                    <h5 className="informative-field">
                      {customer.companyName}
                    </h5>

                    <p style={{
                      marginBottom: '10px',
                    }}
                    >
                      {`${t('quoteAttentionOf')} ${customer.contactName}`}
                    </p>

                    <p>{customer.details.streetName}</p>
                    <p>{`${customer.details.zipCode} ${customer.details.city}`}</p>
                    <p>{customer.details.country}</p>
                  </Form>
                </Grid.Column>
              </Grid.Row>
            </React.Fragment>
          )}

          <Grid.Row>
            <Grid.Column>
              <h5 className="informative-field">
                {t('formSubject')}
              </h5>
              {(status < 4)
                ? (
                  <Input
                    fluid
                    name="subject"
                    onChange={this.handleInputChange}
                    value={subject}
                    error={subjectError}
                  />
                )
                : (
                  <p>{subject}</p>
                )
              }
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column>
              <Table celled structured size="small">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell />
                    <Table.HeaderCell>
                      <div className="flex-cell">
                        {t('formReference')}
                        <Icon
                          link
                          name={visibility.reference ? 'eye' : 'eye slash'}
                          onClick={() => this.handleVisibility('reference')}
                        />
                      </div>
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      <div className="flex-cell">
                        {t('formLabel')}
                        <Icon
                          link
                          name={visibility.label ? 'eye' : 'eye slash'}
                          onClick={() => this.handleVisibility('label')}
                        />
                      </div>
                    </Table.HeaderCell>
                    <Table.HeaderCell className="default-cell">
                      <div className="flex-cell">
                        {t('quotePreTax')}
                        <Icon
                          link
                          name={visibility.unitCost ? 'eye' : 'eye slash'}
                          onClick={() => this.handleVisibility('unitCost')}
                        />
                      </div>
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      <div className="flex-cell">
                        {t('formUnit')}
                        <Icon
                          link
                          name={visibility.unit ? 'eye' : 'eye slash'}
                          onClick={() => this.handleVisibility('unit')}
                        />
                      </div>
                    </Table.HeaderCell>

                    <Table.HeaderCell>
                      <div className="flex-cell">
                        {t('formVat')}
                        <Icon
                          link
                          name={visibility.vat ? 'eye' : 'eye slash'}
                          onClick={() => this.handleVisibility('vat')}
                        />
                      </div>
                    </Table.HeaderCell>
                    <Table.HeaderCell className="default-cell">
                      <div className="flex-cell">
                        {t('quoteQty')}
                        <Icon
                          link
                          name={visibility.quantity ? 'eye' : 'eye slash'}
                          onClick={() => this.handleVisibility('quantity')}
                        />
                      </div>
                    </Table.HeaderCell>

                    <Table.HeaderCell className="double-cell">
                      <div className="flex-cell">
                        Discount
                        <Icon
                          link
                          name={visibility.discount ? 'eye' : 'eye slash'}
                          onClick={() => this.handleVisibility('discount')}
                        />
                      </div>
                    </Table.HeaderCell>
                    <Table.HeaderCell className="default-cell">
                      <div className="flex-cell">
                        {t('quotePreTaxTotal')}
                        <Icon
                          link
                          name={visibility.total ? 'eye' : 'eye slash'}
                          onClick={() => this.handleVisibility('total')}
                        />
                      </div>
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {!isEmpty(selectedItemList) && selectedItemList.map((item, index) => {
                    if (item.type === 'blankLine') {
                      return (
                        <Table.Row key={`itemList${index}`}>
                          <Table.Cell collapsing textAlign="center">
                            {(status < 4)
                            && (
                              <Icon
                                link
                                className="table-button"
                                name="trash alternate"
                                onClick={() => this.handleDeleteItem(item, index)}
                              />
                            )}
                          </Table.Cell>
                          <Table.Cell colSpan={8} />
                        </Table.Row>
                      );
                    } if (item.type === 'comment') {
                      return (
                        <Table.Row key={`itemList${index}`}>
                          <Table.Cell collapsing textAlign="center">
                            {(status < 4)
                            && (
                              <Icon
                                link
                                className="table-button"
                                name="trash alternate"
                                onClick={() => this.handleDeleteItem(item, index)}
                              />
                            )}
                          </Table.Cell>
                          <Table.Cell colSpan={2}>
                            {(status < 4)
                              ? (
                                <Input
                                  size="tiny"
                                  fluid
                                  name="comment"
                                  value={item.comment}
                                  onChange={e => this.handleChangeComment(e, item, index)}
                                />
                              )
                              : (
                                <React.Fragment>{item.comment}</React.Fragment>
                              )
                            }
                          </Table.Cell>
                          <Table.Cell colSpan={6} />
                        </Table.Row>
                      );
                    } if (item.type === 'subtotal') {
                      return (
                        <Table.Row key={`itemList${index}`}>
                          <Table.Cell collapsing textAlign="center">
                            {(status < 4)
                            && (
                              <Icon
                                link
                                className="table-button"
                                name="trash alternate"
                                onClick={() => this.handleDeleteItem(item, index)}
                              />
                            )}
                          </Table.Cell>
                          <Table.Cell />
                          <Table.Cell>Subtotal</Table.Cell>
                          <Table.Cell colSpan={5} />
                          <Table.Cell textAlign="center">{this.getSubtotal(index)}</Table.Cell>
                        </Table.Row>
                      );
                    }

                    return (
                      <React.Fragment key={`itemList${index}`}>
                        {/* ARTICLE LINE */}
                        <Table.Row>
                          <Table.Cell rowSpan={item.type === 'Ensemble' ? (2 * item.items.length + 1) : 2} collapsing textAlign="center">
                            <div style={{
                              marginBottom: '10px',
                            }}
                            >
                              {(status < 4)
                              && (
                                <Icon
                                  link
                                  className="table-button"
                                  name="trash alternate"
                                  onClick={() => this.handleDeleteItem(item)}
                                />
                              )}
                            </div>

                            {type === 'quote'
                            && (
                              <div>
                                <Checkbox
                                  name="optional"
                                  checked={item.optional}
                                  onChange={e => this.handleItemCheckBoxChange(e, item, index)}
                                  disabled={status >= 4}
                                />
                              </div>
                            )}

                            <div>
                              <Link
                                to={`/articles${item.id}`}
                                target="_blank"
                              >
                                <Icon
                                  link
                                  className="table-button"
                                  name="external"
                                />
                              </Link>
                            </div>

                          </Table.Cell>
                          <Table.Cell>
                            {item.reference}
                          </Table.Cell>
                          <Table.Cell>
                            {(status < 4)
                              ? (
                                <Input
                                  size="tiny"
                                  fluid
                                  name="label"
                                  value={item.label}
                                  onChange={e => this.handleChangeItem(e, item)}
                                />
                              )
                              : (
                                <React.Fragment>{item.label}</React.Fragment>
                              )
                            }
                          </Table.Cell>
                          <Table.Cell collapsing textAlign="center">
                            {(status < 4)
                              ? (
                                <Input
                                  size="tiny"
                                  fluid
                                >
                                  <Cleave
                                    options={{
                                      numeral: true,
                                      numeralThousandsGroupStyle: 'none',
                                      numeralDecimalScale: 2,
                                    }}
                                    onChange={e => this.handleChangeItem(e, item)}
                                    onBlur={e => this.handleOnBlurItemPrice(e, item)}
                                    onInit={this.onPriceCleaveInit}
                                    name="price"
                                    value={item.price}
                                  />
                                </Input>
                              )
                              : (
                                <React.Fragment>{item.price}</React.Fragment>
                              )
                            }
                          </Table.Cell>
                          <Table.Cell collapsing textAlign="center">{item.unit || '-'}</Table.Cell>
                          <Table.Cell collapsing textAlign="center">
                            {item.type === 'Ensemble'
                              ? (
                                '-'
                              )
                              : (
                                <React.Fragment>
                                  {(status < 4)
                                    ? (
                                      <Select
                                        placeholder={t('formPHSelect')}
                                        size="tiny"
                                        fluid
                                        name="vatRate"
                                        loading={loadingCompanySettings}
                                        disabled={loadingCompanySettings}
                                        options={vatRates}
                                        noResultsMessage="No results"
                                        value={item.vatRate}
                                        onChange={
                                          (e, data) => this.handleChangeSelectItem(e, data, item)
                                        }
                                      />
                                    )
                                    : (
                                      <React.Fragment>{item.vatRate}</React.Fragment>
                                    )
                                  }
                                </React.Fragment>
                              )
                            }
                          </Table.Cell>
                          <Table.Cell collapsing textAlign="center">
                            {(status < 4)
                              ? (
                                <Input
                                  size="tiny"
                                  fluid
                                >
                                  <Cleave
                                    options={{
                                      numeral: true,
                                      numeralThousandsGroupStyle: 'none',
                                      numeralDecimalScale: 2,
                                    }}
                                    onChange={e => this.handleChangeItem(e, item)}
                                    name="quantity"
                                    value={item.quantity}
                                  />
                                </Input>
                              )
                              : (
                                <React.Fragment>{item.quantity}</React.Fragment>
                              )
                            }
                          </Table.Cell>

                          <Table.Cell collapsing textAlign="center">
                            {(status < 4)
                              ? (
                                <Input
                                  size="tiny"
                                  fluid
                                  labelPosition="left"
                                >
                                  <Label style={{
                                    padding: '0',
                                  }}
                                  >
                                    <Dropdown
                                      options={discountOptions}
                                      value={item.discountType}
                                      name="discountType"
                                      onChange={
                                        (e, data) => this.handleChangeSelectItem(e, data, item)
                                      }
                                      style={{
                                        padding: '11px',
                                      }}
                                    />
                                  </Label>
                                  <Cleave
                                    options={{
                                      numeral: true,
                                      numeralThousandsGroupStyle: 'none',
                                      numeralDecimalScale: 2,
                                    }}
                                    onChange={e => this.handleChangeItem(e, item)}
                                    onBlur={e => this.handleOnBlurItemDiscount(e, item)}
                                    onFocus={e => this.handleOnFocusItemDiscount(e, item)}
                                    onInit={this.onDiscountCleaveInit}
                                    name="discount"
                                    value={item.discount}
                                  />
                                </Input>
                              )
                              : (
                                <React.Fragment>
                                  {item.discountType === 'e' && '\u20AC'}
                                  {item.discount}
                                  {item.discountType === 'p' && '%'}
                                </React.Fragment>
                              )
                            }
                          </Table.Cell>
                          <Table.Cell textAlign="center" collapsing>
                            {item.totalPrice
                              ? item.totalPrice.toFixed(2)
                              : '0.00'
                            }
                          </Table.Cell>
                        </Table.Row>

                        {/* ITEMS LINES */}
                        {item.items
                        && item.items.map((article, index) => (
                          <React.Fragment key={`art${index}`}>
                            <Table.Row>
                              <Table.Cell>
                                {article.item.reference}
                              </Table.Cell>
                              <Table.Cell>
                                {(status < 4)
                                  ? (
                                    <Input
                                      size="tiny"
                                      fluid
                                      name="label"
                                      value={article.item.label}
                                      onChange={e => this.handleEnsembleInputChange(
                                        e, item, article,
                                      )}
                                    />
                                  )
                                  : (
                                    <React.Fragment>{article.item.label}</React.Fragment>
                                  )
                                }
                              </Table.Cell>
                              <Table.Cell textAlign="center">
                                {parseFloat(article.item.price).toFixed(2)}
                              </Table.Cell>
                              <Table.Cell textAlign="center">
                                {article.item.unit}
                              </Table.Cell>
                              <Table.Cell>
                                {(status < 4)
                                  ? (
                                    <Select
                                      placeholder={t('formPHSelect')}
                                      size="tiny"
                                      fluid
                                      name="vatRate"
                                      loading={loadingCompanySettings}
                                      disabled={loadingCompanySettings}
                                      options={vatRates}
                                      value={article.item.vatRate}
                                      onChange={
                                        (e, data) => this.handleEnsembleSelectChange(
                                          e, data, item, article,
                                        )
                                      }
                                    />
                                  )
                                  : (
                                    <React.Fragment>{article.item.vatRate}</React.Fragment>
                                  )
                                }
                              </Table.Cell>
                              <Table.Cell textAlign="center">
                                {parseFloat(article.quantity).toFixed(2)}
                              </Table.Cell>
                              <Table.Cell />
                              <Table.Cell />
                            </Table.Row>

                            <Table.Row>
                              <Table.Cell colSpan={8}>
                                <Form
                                  size="small"
                                  className="full-line-cell"
                                >
                                  <div>
                                    <Form.Field inline>
                                      <label style={{
                                        marginBottom: '5px',
                                      }}
                                      >
                                        {`${t('quoteActivity')} 1`}
                                      </label>
                                      {(status < 4)
                                        ? (
                                          <Select
                                            style={{
                                              maxWidth: '200px',
                                            }}
                                            placeholder={t('formPHSelect')}
                                            search
                                            allowAdditions
                                            name="activity1"
                                            value={item.activity1}
                                            options={activityOptions}
                                            onChange={
                                              (e, data) => this.handleEnsembleSelectChange(
                                                e, data, item, article,
                                              )
                                            }
                                          />
                                        )
                                        : (
                                          <p className="info-line">{item.activity1 || '-'}</p>
                                        )
                                      }
                                    </Form.Field>
                                  </div>

                                  <div>
                                    <Form.Field inline>
                                      <label style={{
                                        marginBottom: '5px',
                                      }}
                                      >
                                        {`${t('quoteActivity')} 2`}
                                      </label>
                                      {(status < 4)
                                        ? (
                                          <Select
                                            style={{
                                              maxWidth: '200px',
                                            }}
                                            placeholder={t('formPHSelect')}
                                            name="activity2"
                                            value={item.activity2}
                                            options={activityOptions}
                                            onChange={
                                              (e, data) => this.handleEnsembleSelectChange(
                                                e, data, item, article,
                                              )
                                            }
                                          />
                                        )
                                        : (
                                          <p className="info-line">{item.activity2 || '-'}</p>
                                        )
                                      }
                                    </Form.Field>
                                  </div>

                                  {article.item.type === 'Product'
                                  && (
                                    <React.Fragment>
                                      <div>
                                        <Form.Field inline>
                                          <label style={{
                                            marginBottom: '5px',
                                          }}
                                          >
                                            {t('quoteUnitCost')}
                                          </label>
                                          <p className="info-line">{parseFloat(article.item.unitCost).toFixed(2)}</p>
                                        </Form.Field>
                                      </div>
                                      <div>
                                        <Form.Field inline>
                                          <label style={{
                                            marginBottom: '5px',
                                          }}
                                          >
                                            {selectedCompany.calculationMode === 'coef'
                                              ? t('formSellingCoefficient')
                                              : t('formMarginRate')
                                            }
                                          </label>
                                          <p className="info-line">{parseFloat(article.item.margin).toFixed(2)}</p>
                                        </Form.Field>
                                      </div>
                                      <div>
                                        <Form.Field inline>
                                          <label style={{
                                            marginBottom: '5px',
                                          }}
                                          >
                                            {t('quoteSoldAs')}
                                          </label>
                                          {(status < 4)
                                            ? (
                                              <Select
                                                compact
                                                style={{
                                                  maxWidth: '120px',
                                                }}
                                                name="soldAs"
                                                value={article.item.soldAs}
                                                options={productSoldOptions}
                                                onChange={
                                                  (e, data) => this.handleEnsembleSelectChange(
                                                    e, data, item, article,
                                                  )
                                                }
                                              />
                                            )
                                            : (
                                              <p className="info-line">{article.item.soldAs}</p>
                                            )
                                          }
                                        </Form.Field>
                                      </div>
                                    </React.Fragment>
                                  )}

                                  {article.item.type === 'Service'
                                  && (
                                    <div>
                                      <Form.Field inline>
                                        <label style={{
                                          marginBottom: '5px',
                                        }}
                                        >
                                          {t('quoteSoldAs')}
                                        </label>
                                        {(status < 4)
                                          ? (
                                            <Select
                                              compact
                                              style={{
                                                maxWidth: '120px',
                                              }}
                                              name="soldAs"
                                              value={article.item.soldAs}
                                              options={serviceSoldOptions}
                                              onChange={
                                                (e, data) => this.handleEnsembleSelectChange(
                                                  e, data, item, article,
                                                )
                                              }
                                            />
                                          )
                                          : (
                                            <p className="info-line">{article.item.soldAs}</p>
                                          )
                                        }
                                      </Form.Field>
                                    </div>
                                  )}
                                </Form>
                              </Table.Cell>
                            </Table.Row>
                          </React.Fragment>
                        ))}

                        {/* SECOND LINE */}
                        {item.type !== 'Ensemble'
                        && (
                          <Table.Row>
                            <Table.Cell colSpan={8}>
                              <Form
                                size="small"
                                className="full-line-cell"
                              >
                                <div>
                                  <Form.Field inline>
                                    <label style={{
                                      marginBottom: '5px',
                                    }}
                                    >
                                      {`${t('quoteActivity')} 1`}
                                    </label>
                                    {(status < 4)
                                      ? (
                                        <Select
                                          style={{
                                            maxWidth: '200px',
                                          }}
                                          placeholder={t('formPHSelect')}
                                          search
                                          allowAdditions
                                          name="activity1"
                                          value={item.activity1}
                                          options={activityOptions}
                                          onChange={
                                            (e, data) => this.handleChangeSelectItem(e, data, item)
                                          }
                                        />
                                      )
                                      : (
                                        <p className="info-line">{item.activity1 || '-'}</p>
                                      )
                                    }
                                  </Form.Field>
                                </div>

                                <div>
                                  <Form.Field inline>
                                    <label style={{
                                      marginBottom: '5px',
                                    }}
                                    >
                                      {`${t('quoteActivity')} 2`}
                                    </label>
                                    {(status < 4)
                                      ? (
                                        <Select
                                          style={{
                                            maxWidth: '200px',
                                          }}
                                          placeholder={t('formPHSelect')}
                                          name="activity2"
                                          value={item.activity2}
                                          options={activityOptions}
                                          onChange={
                                            (e, data) => this.handleChangeSelectItem(e, data, item)
                                          }
                                        />
                                      )
                                      : (
                                        <p className="info-line">{item.activity2 || '-'}</p>
                                      )
                                    }
                                  </Form.Field>
                                </div>

                                {item.type === 'Product'
                                && (
                                  <React.Fragment>
                                    <div>
                                      <Form.Field inline>
                                        <label style={{
                                          marginBottom: '5px',
                                        }}
                                        >
                                          {t('quoteUnitCost')}
                                        </label>
                                        <p className="info-line">{item.unitCost}</p>
                                      </Form.Field>
                                    </div>
                                    <div>
                                      <Form.Field inline>
                                        <label style={{
                                          marginBottom: '5px',
                                        }}
                                        >
                                          {selectedCompany.calculationMode === 'coef'
                                            ? t('formSellingCoefficient')
                                            : t('formMarginRate')
                                          }
                                        </label>
                                        {(status < 4)
                                          ? (
                                            <Input
                                              style={{
                                                maxWidth: '100px',
                                              }}
                                            >
                                              <Cleave
                                                options={{
                                                  numeral: true,
                                                  numeralThousandsGroupStyle: 'none',
                                                  numeralDecimalScale: 2,
                                                }}
                                                onChange={e => this.handleChangeItem(e, item)}
                                                name="margin"
                                                value={item.margin}
                                              />
                                            </Input>
                                          )
                                          : (
                                            <p className="info-line">{item.margin}</p>
                                          )
                                        }
                                      </Form.Field>
                                    </div>
                                    <div>
                                      <Form.Field inline>
                                        <label style={{
                                          marginBottom: '5px',
                                        }}
                                        >
                                          {t('quoteSoldAs')}
                                        </label>
                                        {(status < 4)
                                          ? (
                                            <Select
                                              compact
                                              style={{
                                                maxWidth: '120px',
                                              }}
                                              name="soldAs"
                                              value={item.soldAs}
                                              options={productSoldOptions}
                                              onChange={
                                                (e, data) => this.handleChangeSelectItem(
                                                  e, data, item,
                                                )
                                              }
                                            />
                                          )
                                          : (
                                            <p className="info-line">{item.soldAs}</p>
                                          )
                                        }
                                      </Form.Field>
                                    </div>
                                  </React.Fragment>
                                )}

                                {item.type === 'Service'
                                && (
                                  <div>
                                    <Form.Field inline>
                                      <label style={{
                                        marginBottom: '5px',
                                      }}
                                      >
                                        {t('quoteSoldAs')}
                                      </label>
                                      {(status < 4)
                                        ? (
                                          <Select
                                            compact
                                            style={{
                                              maxWidth: '120px',
                                            }}
                                            name="soldAs"
                                            value={item.soldAs}
                                            options={serviceSoldOptions}
                                            onChange={
                                              (e, data) => this.handleChangeSelectItem(
                                                e, data, item,
                                              )
                                            }
                                          />
                                        )
                                        : (
                                          <p className="info-line">{item.soldAs}</p>
                                        )
                                      }
                                    </Form.Field>
                                  </div>
                                )}
                              </Form>
                            </Table.Cell>
                          </Table.Row>
                        )}
                      </React.Fragment>
                    );
                  })}
                </Table.Body>
              </Table>
            </Grid.Column>
          </Grid.Row>

          {(status < 4)
          && (
            <React.Fragment>
              <Grid.Row>
                <Grid.Column width={8}>
                  <Select
                    placeholder={t('formPHSelect')}
                    fluid
                    search
                    loading={loadingListArticle}
                    disabled={loadingListArticle}
                    noResultsMessage="No results"
                    options={itemList}
                    onChange={this.handleAddItem}
                    value={null}
                  />
                </Grid.Column>
              </Grid.Row>

              <Grid.Row>
                <Grid.Column width={6}>
                  <Select
                    placeholder={t('formPHSelect')}
                    fluid
                    search
                    noResultsMessage="No results"
                    name="selectedLine"
                    options={lineOptions}
                    onChange={this.handleSelectChange}
                    value={selectedLine}
                  />
                </Grid.Column>

                <Grid.Column width={2}>
                  <EssorButton
                    fluid
                    icon
                    type="plus"
                    size="small"
                    onClick={this.handleAddLine}
                  />
                </Grid.Column>
              </Grid.Row>
            </React.Fragment>
          )}

          {selectedListError
          && (
            <Grid.Row>
              <Grid.Column>
                <Message negative>
                  <p>No items selected</p>
                </Message>
              </Grid.Column>
            </Grid.Row>
          )}

          <Grid.Row>
            {(type === 'quote' || type === 'invoice')
            && (
              <Grid.Column floated="left" width={6}>
                <h5 className="informative-field">
                  {type !== 'quote' ? t('formCustomerComment') : t('formNotes')}
                </h5>
                <Form className="main-form">
                  {(status < 4)
                    ? (
                      <TextArea
                        autoHeight
                        rows={4}
                        name="note"
                        value={note}
                        onChange={this.handleInputChange}
                      />
                    )
                    : (
                      <Form.Group inline>
                        <Form.Field>
                          <h5 className="informative-field">{note}</h5>
                        </Form.Field>
                      </Form.Group>
                    )
                  }
                </Form>
              </Grid.Column>
            )}

            <Grid.Column floated="right" width={6}>
              <Table celled definition size="small">
                <Table.Body>
                  <Table.Row textAlign="right">
                    <Table.Cell>{t('quoteTotalBeforeTaxes')}</Table.Cell>
                    <Table.Cell>{totalPrice.toFixed(2)}</Table.Cell>
                  </Table.Row>

                  <Table.Row textAlign="right">
                    <Table.Cell>Global discount</Table.Cell>
                    <Table.Cell>
                      {(status < 4)
                        ? (
                          <Input
                            size="tiny"
                            fluid
                            labelPosition="left"
                          >
                            <Label style={{
                              padding: '0',
                            }}
                            >
                              <Dropdown
                                options={discountOptions}
                                value={globalDiscountType}
                                name="globalDiscountType"
                                onChange={this.handleSelectChange}
                                style={{
                                  padding: '11px',
                                }}
                              />
                            </Label>
                            <Cleave
                              options={{
                                numeral: true,
                                numeralThousandsGroupStyle: 'none',
                                numeralDecimalScale: 2,
                              }}
                              onChange={this.handleInputChange}
                              name="globalDiscount"
                              value={globalDiscount}
                            />
                          </Input>
                        )
                        : (
                          <React.Fragment>
                            {globalDiscountType === 'e' && '\u20AC'}
                            {globalDiscount}
                            {globalDiscountType === 'p' && '%'}
                          </React.Fragment>
                        )
                      }
                    </Table.Cell>
                  </Table.Row>

                  <Table.Row textAlign="right">
                    <Table.Cell>{t('quoteNetTotalBeforeTaxes')}</Table.Cell>
                    <Table.Cell>{netTotalPrice.toFixed(2)}</Table.Cell>
                  </Table.Row>

                  {isEmpty(vat)
                    ? (
                      <Table.Row textAlign="right">
                        <Table.Cell>{t('quoteTotalVAT')}</Table.Cell>
                        <Table.Cell>0.00</Table.Cell>
                      </Table.Row>
                    ) : (
                      vat.map((rate, index) => (
                        <Table.Row textAlign="right" key={`singleRate${index}`}>
                          <Table.Cell>{`${t('formVat')} ${rate.percentage}%`}</Table.Cell>
                          <Table.Cell>{rate.value.toFixed(2)}</Table.Cell>
                        </Table.Row>
                      ))
                    )
                  }

                  <Table.Row textAlign="right">
                    <Table.Cell>{t('quoteTotalWithTaxes')}</Table.Cell>
                    <Table.Cell>{total.toFixed(2)}</Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Grid.Column>
          </Grid.Row>

          {type === 'invoice'
          && (
            <React.Fragment>
              <Grid.Row>
                <Grid.Column>
                  <Checkbox
                    name="showLatePaymentLawText"
                    checked={showLatePaymentLawText}
                    label="Afficher le texte de loi sur les intérêts de retard de paiement"
                    onChange={this.handleCheckBoxChange}
                    disabled={status >= 4}
                  />

                  <Message info>
                    <Message.Header>Article L441-6 du Code de Commerce</Message.Header>
                    <p>
                      La présente facture sera payable au plus
                      tard dans les 7 jours suivant sa date d&apos;edition.
                    </p>
                    <p>
                      Passé ce délai, sans obligation d&apos;envoi d&apos;une relance,
                      conformément à l&apos;article L441-6 du Code de Commerce il sera
                      appliqué une pénalité calculée à un taux annuel de 12% sans que
                      ce taux solt inférieur à 3 fois le taux d&apos;intérêt légal.
                      Une indemnité forfaltaire de recouvrement de 40 Euros sera aussi
                      exigible.
                    </p>
                  </Message>
                </Grid.Column>
              </Grid.Row>

              <Grid.Row>
                <Grid.Column>
                  <Checkbox
                    disabled
                    name="showVATLawText"
                    checked={showVATLawText}
                    label="Afficher le texte de loi dédié â la TVA intracommunautaire"
                    onChange={this.handleCheckBoxChange}
                  />

                  <Message info>
                    <p>
                      Vous n&apos;avez pas de texte de loi relatif à la TVA.
                      Vous pouvez en définir un depuis vos préférences de
                      documents.
                    </p>
                  </Message>
                </Grid.Column>
              </Grid.Row>

              <Grid.Row>
                <Grid.Column>
                  <Checkbox
                    disabled
                    checked={showCompanySignature}
                    name="showCompanySignature"
                    label="Afficher la ligne Signature et cachet de l'entreprise sur le PDF"
                    onChange={this.handleCheckBoxChange}
                  />
                </Grid.Column>
              </Grid.Row>
            </React.Fragment>
          )}
        </Grid>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  selectedCompany: state.userCompanies.select.selectedCompany,

  listCompanySettings: state.companySettings.list.data,
  loadingCompanySettings: state.companySettings.list.loading,
  errorCompanySettings: state.companySettings.list.error,

  listArticle: state.article.list.data,
  loadingListArticle: state.article.list.loading,
  errorListArticle: state.article.list.error,
});

const Main = connect(mapStateToProps, null)(Document);

export default withNamespaces('translation')(withRouter(Main));
