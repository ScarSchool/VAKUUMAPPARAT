import React from 'react';
import { Avatar, Button, CssBaseline, TextField, Grid, Typography, Container, withStyles } from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import webHelper from '../globals/webHelper';

import Cookies from 'universal-cookie';
import { Redirect, Link } from 'react-router-dom';
import validateFullRequired from '../globals/formValidator';
import StatusBarContext from '../globals/StatusBarContext';
import AppMessage from '../globals/AppMessage';
const cookies = new Cookies();

const styles = (theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    marginTop: theme.spacing(3),
  },
});

class Login extends React.Component {

  static contextType = StatusBarContext;

  constructor(props) {
    super(props);

    this.state = {
      authenticated: false,
      errors: {},
    }

    this.loginForm = {
      user: React.createRef(),
      password: React.createRef()
    }


    this.onButtonLoginClicked = this.onButtonLoginClicked.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }

  componentWillUnmount() {
    console.log("Component unmount!");
    this.setState({
      authenticated: false,
    });
  }

  onButtonLoginClicked(event) {
    event.preventDefault();

    let credentials = {
      username: this.loginForm.user.current.value,
      password: this.loginForm.password.current.value
    }
    if (!this.validateForm(credentials))
      return;

    webHelper.userLogin(credentials)
      .then((data) => {
        cookies.set('accountinfo', JSON.stringify(data.information));
        cookies.set('token', data.token);
        this.context.setMessage(new AppMessage(AppMessage.types.SUCCESS, 'Login successful', 200))

        this.setState({ authenticated: true });
      })
      .catch(err => { this.context.setMessage(err) });
  }

  validateForm(creds) {
    let errors = validateFullRequired(creds);

    this.setState({ errors: errors })
    return Object.keys(errors).length === 0;
  }

  render() {
    if (this.state.authenticated) {
      console.log("Authenticated. Redirecting to dashboard.");
      if (this.props.onLogin)
        this.props.onLogin();

      return <Redirect to="/dashboard" />
    }

    const { classes } = this.props;

    return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
        </Typography>
          <form className={classes.form} noValidate onSubmit={this.onButtonLoginClicked}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              inputRef={this.loginForm.user}
              error={Boolean(this.state.errors.username)}
              helperText={this.state.errors.username}
              autoFocus
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              inputRef={this.loginForm.password}
              error={Boolean(this.state.errors.password)}
              helperText={this.state.errors.password}
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Sign In
          </Button>
            <Grid container justify="flex-end">
              <Grid item>
                <Link to="/register" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
      </Container>
    )
  }
}

export default withStyles(styles)(Login);
