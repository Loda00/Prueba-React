import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { list, reset } from 'actions/office/list';
import { Header, Message } from 'semantic-ui-react';
import { TableList } from 'components';
import { withNamespaces } from 'react-i18next';

class HomeOffice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      isCharged: false,
    };
  }

  componentDidMount() {
    const { getOffices } = this.props;

    getOffices();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.data) && !prevState.isCharged) {
      return {
        data: nextProps.data['hydra:member'],
        isCharged: true,
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

    const { loading, location, t } = this.props;

    const columns = [
      {
        name: 'ID',
        attribute: 'id',
        filterable: true,
        sortable: false,
      },
      {
        name: t('formName'),
        attribute: 'name',
        filterable: true,
        sortable: true,
      },
      {
        name: 'Status',
        attribute: 'status',
        filterable: true,
        sortable: false,
      },
    ];

    return (
      <div className="section-container">
        <div className="section-general section-list">
          <Header as="h3">Home office</Header>

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
            addLink="/offices/create"
            loading={loading}
            data={data}
          />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  getOffices: page => dispatch(list(page)),
  reset: () => dispatch(reset()),
});

const mapStateToProps = state => ({
  data: state.office.list.data,
  loading: state.office.list.loading,
  error: state.office.list.error,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(HomeOffice);

export default withNamespaces('translation')(withRouter(Main));
