import { Button, Grid, MenuItem, Select, Typography, withStyles } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';

import Cookies from 'universal-cookie';
import AppMessage from '../../globals/AppMessage';
import StatusBarContext from '../../globals/StatusBarContext';
import webHelper from '../../globals/webHelper';
const cookies = new Cookies();

const styles = (theme) => ({
    hintText: {
        fontSize: '0.8rem',
    },
    settingsChooseContainer: {
        width: '100%',
        marginTop: theme.spacing(1)
    },

});
function SettingsForm(props) {
    const { classes, user } = props;

    const { setMessage } = React.useContext(StatusBarContext);
    const [personalSelected, setPersonalSelected] = React.useState(user.privateInfo.visibility);
    const [generalSelected, setGeneralSelected] = React.useState(user.generalInfo.visibility);

    const settingsForm = {
        generalVisibility: React.createRef(),
        personalVisibility: React.createRef(),
    }

    function updateVisibility() {
        let updated = {
            'privateInfo': {
                visibility: settingsForm.personalVisibility.current.value,
                phoneNumber: user.privateInfo.phoneNumber,
            },
            'additionalInfo': {
                visibility: settingsForm.generalVisibility.current.value,
                jobTitle: user.additionalInfo.jobTitle,
                education: user.additionalInfo.education,
                residency: user.additionalInfo.residency,
            },
            'generalInfo': {
                visibility: settingsForm.generalVisibility.current.value,
                biography: user.generalInfo.biography,
            },
        }

        webHelper.patchOneUser(cookies.get('token'), user._id, updated).then((newUser) => {
            setMessage(new AppMessage(AppMessage.types.SUCCESS, 'Settings were successfully updated.'));
        }).catch((err) => {
            setMessage(err)
        })
    }

    function onPersonalVisiblityChanged(event) {
        setPersonalSelected(event.target.value);
    }
    function onGeneralVisiblityChanged(event) {
        setGeneralSelected(event.target.value);
    }

    return (
        <div className={classes.settingsChooseContainer}>
            <Grid container
                spacing={2}
            >
                <Grid item xs={12}>
                    <Grid
                        container
                        direction="row"
                        justify="space-between"
                        alignItems="flex-start"
                    >
                        <Grid item>
                            <Typography>Choose who can see your general information:</Typography>
                        </Grid>
                        <Grid item>
                            <Select
                                onChange={onGeneralVisiblityChanged}
                                inputRef={settingsForm.generalVisibility}
                                label="General data visibility" value={generalSelected} select
                            >
                                <MenuItem value="public">Everyone (public)</MenuItem>
                                <MenuItem value="private">Only me (private)</MenuItem>
                            </Select>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Grid
                        container
                        direction="row"
                        justify="space-between"
                        alignItems="flex-start"
                    >
                        <Grid item>
                            <Typography>Choose who can see your personal data:</Typography>
                        </Grid>
                        <Grid item>
                            <Select
                                onChange={onPersonalVisiblityChanged}
                                inputRef={settingsForm.personalVisibility}
                                label="Personal data visibility" value={personalSelected} select
                            >
                                <MenuItem value="public">Everyone (public)</MenuItem>
                                <MenuItem value="private">Only me (private)</MenuItem>
                            </Select>
                        </Grid>
                    </Grid>
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
                                onClick={updateVisibility}
                            >
                                Save
                        </Button>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Grid
                        container
                        direction="row"
                        justify="flex-end"
                        alignItems="center"
                    >
                        <Grid item >
                            <Link to={`/users/${user._id}`}>
                                <Typography className={classes.hintText}>Click here to see how your profile looks for others.</Typography>
                            </Link>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </div>

    );
}

export default withStyles(styles)(SettingsForm);