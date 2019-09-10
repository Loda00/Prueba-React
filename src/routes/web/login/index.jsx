import React, { Component } from 'react';
import { withRouter, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { auth, error, loading } from 'actions/auth/auth';

import { Button,
  Form,
  Grid,
  Message,
  Image } from 'semantic-ui-react';
import checkBlue from 'assets/images/checkblue.png';

class Login extends Component {
  state = {
    username: '',
    password: '',
    usernameError: false,
    passwordError: false,
  };

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  handleDataUser = (e) => {
    e.preventDefault();
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleLogin = (e) => {
    e.preventDefault();
    const { username, password } = this.state;
    const { loginUser } = this.props;
    let isValid = true;

    this.setState({
      usernameError: false,
      passwordError: false,
    });

    if (username === '') {
      isValid = false;

      this.setState({
        usernameError: true,
      });
    }

    if (password === '') {
      isValid = false;

      this.setState({
        passwordError: true,
      });
    }

    if (!isValid) return;

    const data = {
      username,
      password,
    };

    loginUser(data);
  };

  render() {
    const { usernameError, passwordError } = this.state;
    const { loading, error, success } = this.props;

    if (!loading && success) {
      return <Redirect to="/" />;
    }

    return (
      <div className="login-form">
        <Grid
          textAlign="center"
          style={{
            height: '100%', width: '100%',
          }}
          verticalAlign="middle"
        >
          <Grid.Column style={{
            maxWidth: 450,
          }}
          >
            <Form size="large">
              <Form.Input
                fluid
                icon="user"
                iconPosition="left"
                placeholder="Addresse mail"
                name="username"
                onChange={this.handleDataUser}
                error={usernameError}
              />
              <Form.Input
                fluid
                icon="lock"
                iconPosition="left"
                placeholder="Mot de passe"
                type="password"
                name="password"
                onChange={this.handleDataUser}
                error={passwordError}
              />

              <Button
                className="color-primary login-button"
                color="teal"
                fluid
                size="large"
                loading={loading}
                onClick={this.handleLogin}
              >
                CONEXXION
                <Image src={checkBlue} className="check" />
              </Button>
            </Form>
            {error
              && (
              <Message negative>
                <p>Bad credentials.</p>
              </Message>
              )
            }
            <div className="password-forgot">
              <a href="/">Mot de passe oublié?</a>
            </div>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  loginUser: data => dispatch(auth(data)),
  reset: () => {
    dispatch(loading(false));
    dispatch(error(null));
  },
});

const mapStateToProps = state => ({
  success: state.auth.created,
  error: state.auth.error,
  loading: state.auth.loading,
});

const Main = connect(mapStateToProps, mapDispatchToProps)(Login);

export default withRouter(Main);
