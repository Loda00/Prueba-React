import { Component } from 'react';
import setTime from 'actions/document-timer/create';
import { connect } from 'react-redux';

class DocumentTimer extends Component {
  state = {
    timeSpent: 0,
    countDownEdit: false,
    enableMinute: false,
  };

  componentDidMount() {
    const { setTime, isCreate, timeSpentTimer } = this.props;
    if (isCreate) {
      setTime(0);
      this.interval = setInterval(() => {
        this.tick();
      }, 60000);
    } else {
      this.setState({
        timeSpent: timeSpentTimer,
      });
      setTimeout(() => {
        this.setState({
          timeSpent: timeSpentTimer + 1,
          countDownEdit: true,
          enableMinute: true,
        });
      }, 30000);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { setTime } = this.props;
    const { timeSpent, enableMinute } = this.state;
    if ((prevState.timeSpent !== timeSpent) && timeSpent) {
      setTime(timeSpent);
    }
    if (prevState.enableMinute !== enableMinute && enableMinute) {
      this.interval = setInterval(() => {
        this.tick();
      }, 60000);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  tick = () => {
    const { timeSpent, countDownEdit } = this.state;
    const { isCreate } = this.props;
    if (isCreate) {
      this.setState({
        timeSpent: timeSpent + 1,
      });
    }
    if (countDownEdit) {
      this.setState({
        timeSpent: timeSpent + 1,
      });
    }
  };

  render() {
    return null;
  }
}

const mapDispatchToProps = dispatch => ({
  setTime: count => dispatch(setTime(count)),
});

const Main = connect(null, mapDispatchToProps)(DocumentTimer);

export default Main;
