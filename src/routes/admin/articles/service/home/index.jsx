import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { list, reset } from 'actions/service/list';
import { TableList } from 'components';
import { Header } from 'semantic-ui-react';
import { withNamespaces } from 'react-i18next';

class HomeService extends Component {
  state = {
    data: {},
    isLoaded: false,
  };

  componentDidMount() {
    const { getServices, selectedCompany } = this.props;

    getServices(`/services?company=${selectedCompany.id}`);
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
    history.push(`/articles${e['@id']}`);
  };

  render() {
    const { data } = this.state;
    const { loading, t } = this.props;

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
        name: t('formUnitPrice'),
        attribute: 'unitPrice',
        filterable: false,
        sortable: true,
      },
    ];

    return (
      <div className="section-container">
        <div className="section-general section-list">
          <Header as="h3">{t('servicesHomeTitle')}</Header>

          <TableList
            columns={columns}
            filterBtn
            exportBtn
            addLink="/articles/services/create"
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
  getServices: page => dispatch(list(page)),
  reset: () => dispatch(reset()),
});

const mapStateToProps = state => ({
  data: state.service.list.data,
  loading: state.service.list.loading,
  error: state.service.list.error,

  selectedCompany: state.userCompanies.select.selectedCompany,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(HomeService);

export default withNamespaces('translation')(withRouter(Main));
