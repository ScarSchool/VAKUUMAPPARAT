import { Button, Grid, TextField, withStyles } from '@material-ui/core';
import React from 'react';
import webHelper from '../../globals/webHelper';

import Cookies from 'universal-cookie';
import StatusBarContext from '../../globals/StatusBarContext';
const cookies = new Cookies();

const styles = (theme) => ({
    form: {
        marginTop: theme.spacing(1),
        width: '100%'
    },
    submit: {
        marginTop: theme.spacing(3),
    },
});

function GeneralDataForm(props) {
    const { user, classes, onSaveSuccess } = props;
    
    const { setMessage } = React.useContext(StatusBarContext);

    const generalDataForm = {
        biography: React.createRef(),
        jobTitle: React.createRef(),
        education: React.createRef(),
        residency: React.createRef(),
    }

    function onButtonSave(e) {
        e.preventDefault();

        let userData = {
            generalInfo: {
                visibility: user.generalInfo.visibility,
                biography: generalDataForm.biography.current.value,
            },
            additionalInfo: {
                visibility: user.additionalInfo.visibility,
                jobTitle: generalDataForm.jobTitle.current.value,
                education: generalDataForm.education.current.value,
                residency: generalDataForm.residency.current.value,
            }
        }

        webHelper.patchOneUser(cookies.get('token'), user._id, userData).then((newUser) => {
            onSaveSuccess(newUser);
        }).catch((err) => {
            console.warn('Error during patch: ', err);
            setMessage(err);
        });
    }

    return (
        <form className={classes.form} noValidate onSubmit={onButtonSave}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Grid
                        container
                        direction="row"
                        justify="flex-start"
                        alignItems="flex-start"
                        spacing={2}
                    >
                        <Grid item xs={12} >
                            <TextField
                                id="biography"
                                label="About me"
                                type="text"
                                variant="outlined"
                                inputRef={generalDataForm.biography}
                                defaultValue={user.generalInfo.biography}
                                multiline
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                id="jobTitle"
                                label="Job Title"
                                type="text"
                                
                                variant="outlined"
                                inputRef={generalDataForm.jobTitle}
                                defaultValue={user.additionalInfo.jobTitle}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                id="education"
                                label="Education"
                                type="text"
                                
                                variant="outlined"
                                inputRef={generalDataForm.education}
                                defaultValue={user.additionalInfo.education}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                id="residency"
                                label="Place of residence"
                                type="text"
                                
                                variant="outlined"
                                inputRef={generalDataForm.residency}
                                defaultValue={user.additionalInfo.residency}
                                fullWidth
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
                </Grid>
            </Grid>

        </form >
    );
}

export default withStyles(styles)(GeneralDataForm);