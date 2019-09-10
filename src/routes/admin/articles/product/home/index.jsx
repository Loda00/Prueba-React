/* eslint-disable */
import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { list, reset } from 'actions/product/list';
import { TableList } from 'components';
import { Header, Message } from 'semantic-ui-react';
import { withNamespaces } from 'react-i18next';

class HomeProduct extends Component {
  state = {
    data: {},
    isLoaded: false,
  };

  componentDidMount() {
    const { getProducts, selectedCompany } = this.props;

    getProducts(`/products?company=${selectedCompany.id}`);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.data) && !prevState.isLoaded) {
      return {
        data: nextProps.data['hydra:member'],
        isLoaded: true,
      };
    }
    return null;
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  articleTableLink = (e) => {
    const { history } = this.props;
    history.push(`/articles${e['@id']}`)
  };

  render() {
    const { data } = this.state;

    const { loading, location, t } = this.props;

    const columns = [
      {
        name: t('formLabel'),
        attribute: 'label',
        filterable: true,
        sortable: true,
      },
      {
        name: t('formUnit'),
        attribute: 'unit',
        filterable: true,
        sortable: true,
      },
      {
        name: t('formMarginRate'),
        attribute: 'marginRate',
        filterable: false,
        sortable: true,
      },
    ];

    return (
      <div className="section-container">
        <div className="section-general section-list">
          <Header as="h3">{t('productsHomeTitle')}</Header>

          {location.message
          && (
            <Message
              positive={location.message.type === 'positive'}
              negative={location.message.type === 'negative'}
            >
              <p>{location.message.text}</p>
            </Message>
          )
          }

          <TableList
            columns={columns}
            filterBtn
            exportBtn
            addLink="/articles/products/create"
            as={Link}
            loading={loading}
            data={data}
            onView={this.articleTableLink}
          />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  getProducts: page => dispatch(list(page)),
  reset: () => dispatch(reset()),
});

const mapStateToProps = state => ({
  data: state.product.list.data,
  loading: state.product.list.loading,
  error: state.product.list.error,

  selectedCompany: state.userCompanies.select.selectedCompany,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(HomeProduct);

export default withNamespaces('translation')(withRouter(Main));
