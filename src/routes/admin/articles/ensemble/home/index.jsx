import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { list, reset } from 'actions/ensemble/list';
import { TableList } from 'components';
import { Header } from 'semantic-ui-react';
import { withNamespaces } from 'react-i18next';

class HomeEnsemble extends Component {
  state = {
    data: {},
    isLoaded: false,
  };

  componentDidMount() {
    const { getEnsembles, selectedCompany } = this.props;

    getEnsembles(`/ensembles?company=${selectedCompany.id}`);
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
        name: t('formReference'),
        attribute: 'reference',
        filterable: true,
        sortable: true,
      },
      {
        name: t('formSellingPrice'),
        attribute: 'sellingPrice',
        filterable: true,
        sortable: true,
      },
    ];

    return (
      <div className="section-container">
        <div className="section-general section-list">
          <Header as="h3">{t('ensemblesHomeTitle')}</Header>
          <TableList
            columns={columns}
            filterBtn
            exportBtn
            addLink="/articles/ensembles/create"
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
  getEnsembles: page => dispatch(list(page)),
  reset: () => dispatch(reset()),
});

const mapStateToProps = state => ({
  data: state.ensemble.list.data,
  loading: state.ensemble.list.loading,
  error: state.ensemble.list.error,

  selectedCompany: state.userCompanies.select.selectedCompany,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(HomeEnsemble);

export default withNamespaces('translation')(withRouter(Main));
