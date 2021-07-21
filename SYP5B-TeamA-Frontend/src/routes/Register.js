import React from 'react';
import webHelper from '../globals/webHelper';
import { Avatar, Button, CssBaseline, TextField, Grid, Typography, Container, withStyles } from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

import { Link, Redirect } from 'react-router-dom';
import validateFullRequired, { validateEmail } from '../globals/formValidator';
import AppMessage from '../globals/AppMessage';
import StatusBarContext from '../globals/StatusBarContext';

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
        width: '100%', // Fix IE 11 issue. No
        marginTop: theme.spacing(1),
    },
    submit: {
        marginTop: theme.spacing(3),
    },
});

const defaultValues = {
    firstname: '',
    lastname: '',
    email: '',
    password: ''
}


class Register extends React.Component {

    static contextType = StatusBarContext;

    constructor(props) {
        super(props);

        this.state = {
            redirect: false,
            errors: {},
        }

        this.loginForm = {
            firstname: React.createRef(),
            lastname: React.createRef(),
            email: React.createRef(),
            password: React.createRef(),
            confirmPassword: React.createRef(),
        }

        this.onButtonRegisterClicked = this.onButtonRegisterClicked.bind(this);
        this.validateForm = this.validateForm.bind(this);
    }

    onButtonRegisterClicked(event) {
        event.preventDefault();

        if (!this.validateForm())
            return;

        let userdata = {
            firstname: this.loginForm.firstname.current.value,
            lastname: this.loginForm.lastname.current.value,
            username: this.loginForm.email.current.value,
            password: this.loginForm.password.current.value,
            state: 'active',
        }

        console.log('Got data for new user:');
        console.log(userdata);

        webHelper.postOneUser(userdata)
            .then(() => {
                this.setState({ redirect: true });

                this.context.setMessage(new AppMessage(AppMessage.types.SUCCESS, 'Register successful', 201))
            })
            .catch(err => {
                this.context.setMessage(err)
            })
    }

    validateForm() {
        let creds = {
            firstname: this.loginForm.firstname.current.value,
            lastname: this.loginForm.lastname.current.value,
            email: this.loginForm.email.current.value,
            password: this.loginForm.password.current.value,
            confirmPassword: this.loginForm.confirmPassword.current.value
        }

        let errors = validateFullRequired(creds);


        if (!errors.email && !validateEmail(creds.email))
            errors.email = "Please enter a valid email address"

        if (creds.password !== creds.confirmPassword)
            errors.confirmPassword = "Passwords do not match";

        this.setState({ errors: errors })
        return Object.keys(errors).length === 0;
    }

    render() {
        if (this.state.redirect)
            return <Redirect to='/login' />

        const { classes } = this.props;

        return <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign up
              </Typography>
                <form className={classes.form} noValidate onSubmit={this.onButtonRegisterClicked}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                autoComplete="fname"
                                name="firstName"
                                variant="outlined"
                                required
                                fullWidth
                                id="firstName"
                                label="First Name"
                                error={Boolean(this.state.errors.firstname)}
                                inputRef={this.loginForm.firstname}
                                helperText={this.state.errors.firstname}
                                defaultValue={defaultValues.firstname}
                                autoFocus
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="lastName"
                                label="Last Name"
                                name="lastName"
                                autoComplete="lname"
                                inputRef={this.loginForm.lastname}
                                error={Boolean(this.state.errors.lastname)}
                                defaultValue={defaultValues.lastname}
                                helperText={this.state.errors.lastname}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                inputRef={this.loginForm.email}
                                error={Boolean(this.state.errors.email)}
                                defaultValue={defaultValues.email}
                                helperText={this.state.errors.email}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                error={Boolean(this.state.errors.password)}
                                inputRef={this.loginForm.password}
                                defaultValue={defaultValues.password}
                                helperText={this.state.errors.password}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                name="repeatpassword"
                                label="Confirm Password"
                                type="password"
                                id="repeatpassword"
                                autoComplete="repeat-password"
                                error={Boolean(this.state.errors.confirmPassword)}
                                inputRef={this.loginForm.confirmPassword}
                                defaultValue={defaultValues.password}
                                helperText={this.state.errors.confirmPassword}
                            />
                        </Grid>

                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                    >
                        Sign Up
                </Button>
                    <Grid container justify="flex-end">
                        <Grid item>
                            <Link to="/login" variant="body2">
                                Already have an account? Sign in
                            </Link>
                        </Grid>
                    </Grid>
                </form>
            </div>
        </Container>
    }
}

export default withStyles(styles)(Register);
