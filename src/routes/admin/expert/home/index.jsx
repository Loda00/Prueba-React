import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { list, reset } from 'actions/expert/list';
import { TableList } from 'components';
import { Header } from 'semantic-ui-react';
import { withNamespaces } from 'react-i18next';

class HomeExpert extends Component {
  state = {
    data: {},
    isLoaded: false,
  };

  componentDidMount() {
    const { getExperts } = this.props;

    getExperts();
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

  render() {
    const { data } = this.state;

    const { loading, t } = this.props;

    const columns = [
      {
        name: t('formFirstName'),
        attribute: 'firstName',
        filterable: true,
        sortable: false,
      },
      {
        name: t('formLastName'),
        attribute: 'lastName',
        filterable: true,
        sortable: true,
      },
      {
        name: t('formJobTitle'),
        attribute: 'jobTitle',
        filterable: false,
        sortable: true,
      },
    ];

    return (
      <div className="section-container no-margin">
        <div className="section-general section-list">
          <Header as="h3">{t('expertsHomeTitle')}</Header>
          <TableList
            columns={columns}
            filterBtn
            exportBtn
            addLink="/experts/create"
            loading={loading}
            data={data}
          />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  getExperts: page => dispatch(list(page)),
  reset: () => dispatch(reset()),
});

const mapStateToProps = state => ({
  data: state.expert.list.data,
  loading: state.expert.list.loading,
  error: state.expert.list.error,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(HomeExpert);

export default withNamespaces('translation')(withRouter(Main));
