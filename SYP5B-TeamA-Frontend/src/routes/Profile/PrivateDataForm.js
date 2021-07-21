import { Button, Grid, TextField, withStyles } from '@material-ui/core';
import React from 'react';

import Cookies from 'universal-cookie';
import webHelper from '../../globals/webHelper';
import { validateEmail, validateSomeRequired } from '../../globals/formValidator';
import StatusBarContext from '../../globals/StatusBarContext';
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
        width: '100%', // Fix IE 11 issue. No
        marginTop: theme.spacing(1),
    },
    submit: {
        marginTop: theme.spacing(3),
    },
});

function PrivateDataForm(props) {
    const { classes, user, onSaveSuccess } = props;

    const [errors, setErrors] = React.useState({});
    
    const { setMessage } = React.useContext(StatusBarContext);

    const userdataForm = {
        firstname: React.createRef(),
        lastname: React.createRef(),
        username: React.createRef(),
        phonenumber: React.createRef(),
    }

    function onButtonSave(e) {
        e.preventDefault();

        let updated = {
            'firstname': userdataForm.firstname.current.value,
            'lastname': userdataForm.lastname.current.value,
            'username': userdataForm.username.current.value,
            'privateInfo': {
                'visibility': user.privateInfo.visibility,
                'phoneNumber': userdataForm.phonenumber.current.value,
            },
        };

        if (!validateForm())
            return;

        webHelper.patchOneUser(cookies.get('token'), user._id, updated).then((newUser) => {            
            onSaveSuccess(newUser);
        }).catch((err) => {
            setMessage(err)
        });
    }

    function validateForm() {
        let fields = {
            'firstname': userdataForm.firstname.current.value,
            'lastname': userdataForm.lastname.current.value,
            'username': userdataForm.username.current.value,
            'phonenumber': userdataForm.phonenumber.current.value,
        };
        let errors = validateSomeRequired(fields, 'phonenumber');

        if (!errors.username && !validateEmail(fields.username))
            errors.username = "Please enter a valid email address"

        setErrors(errors);
        return Object.keys(errors).length === 0;
    }

    return (
        <form className={classes.form} noValidate onSubmit={onButtonSave}>
            <Grid container

                spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        autoComplete="fname"
                        name="firstName"
                        variant="outlined"
                        required
                        fullWidth
                        id="firstName"
                        label="First Name"
                        error={Boolean(errors.firstname)}
                        inputRef={userdataForm.firstname}
                        helperText={errors.firstname}
                        defaultValue={user.firstname}
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
                        inputRef={userdataForm.lastname}
                        error={Boolean(errors.lastname)}
                        defaultValue={user.lastname}
                        helperText={errors.lastname}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        required
                        fullWidth
                        id="username"
                        label="Email Address"
                        name="username"
                        autoComplete="username"
                        inputRef={userdataForm.username}
                        error={Boolean(errors.username)}
                        defaultValue={user.privateInfo.username}
                        helperText={errors.username}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        fullWidth
                        id="phonenumber"
                        label="Phone Number"
                        name="phonenumber"
                        autoComplete="phonenumber"
                        inputRef={userdataForm.phonenumber}
                        error={Boolean(errors.phonenumber)}
                        defaultValue={user.privateInfo.phoneNumber}
                        helperText={errors.phonenumber}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Grid
                        container
                        direction="row"
                        justify="flex-end"
                        alignItems="flex-start"
                    >
                        <Grid item>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                            >
                                Save
                        </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </form>
    );
}

export default withStyles(styles)(PrivateDataForm);