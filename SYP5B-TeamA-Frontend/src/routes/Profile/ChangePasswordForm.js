import { Button, Grid, TextField, withStyles } from '@material-ui/core';
import React from 'react';

import Cookies from 'universal-cookie';
import AppMessage from '../../globals/AppMessage';
import validateFullRequired from '../../globals/formValidator';
import StatusBarContext from '../../globals/StatusBarContext';
import webHelper from '../../globals/webHelper';
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

function ChangePasswordForm(props) {
    const { classes, user } = props;

    const [errors, setErrors] = React.useState({});
    
    const { setMessage } = React.useContext(StatusBarContext);

    const userdataForm = {
        currentPassword: React.createRef(),
        newPassword: React.createRef(),
        confirmPassword: React.createRef(),
    }

    function onButtonSave(e) {
        e.preventDefault();

        let formData = {
            'currentPassword': userdataForm.currentPassword.current.value,
            'newPassword': userdataForm.newPassword.current.value,
            'confirmPassword': userdataForm.confirmPassword.current.value,
        };
        if (!validateForm(formData))
            return;

        webHelper.userLogin({
            'username': user.privateInfo.username,
            'password': formData.currentPassword
        }).then(() => {
            let updated = { 'password': formData.newPassword };

            // Nested Error handling for better user error messages
            webHelper.patchOneUser(cookies.get('token'), user._id, updated).then(() => {
                setMessage(new AppMessage(AppMessage.types.SUCCESS, 'Password changed successfully.'));
            }).catch((err) => {
                setMessage(err)
            });
        }).catch((err) => {
            setErrors({ 'currentPassword': 'This password is not valid.' });
            setMessage(new AppMessage(AppMessage.types.ERROR, 'Current password is incorrect.'));
        });
    }

    function validateForm(formData) {
        let errors = validateFullRequired(formData);

        if (formData.newPassword !== formData.confirmPassword)
            errors.confirmPassword = 'New password and confirm password need to match!';

        setErrors(errors);
        return Object.keys(errors).length === 0;
    }

    return (
        <form className={classes.form} noValidate onSubmit={onButtonSave}>
            <Grid container
                spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        required
                        fullWidth
                        type="password"
                        id="currentPassword"
                        label="Current Password"
                        name="currentPassword"
                        autoComplete="currentPassword"
                        inputRef={userdataForm.currentPassword}
                        error={Boolean(errors.currentPassword)}
                        helperText={errors.currentPassword}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        required
                        fullWidth
                        type="password"
                        id="newPassword"
                        label="New Password"
                        name="newPassword"
                        autoComplete="newPassword"
                        inputRef={userdataForm.newPassword}
                        error={Boolean(errors.newPassword)}
                        helperText={errors.newPassword}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        required
                        fullWidth
                        type="password"
                        id="confirmPassword"
                        label="Confirm New Password"
                        name="confirmPassword"
                        autoComplete="confirmPassword"
                        inputRef={userdataForm.confirmPassword}
                        error={Boolean(errors.confirmPassword)}
                        helperText={errors.confirmPassword}
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

export default withStyles(styles)(ChangePasswordForm);