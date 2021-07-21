import { Button, Grid, makeStyles, withStyles } from "@material-ui/core";
import React from 'react'
import AppMessage from "../../globals/AppMessage";
import StatusBarContext from "../../globals/StatusBarContext";
import webHelper from "../../globals/webHelper";

import Cookies from 'universal-cookie';
const cookies = new Cookies();

const useStyles = makeStyles((theme) => ({
    reportDemandContainer: {
        marginRight: theme.spacing(2)
    }
}))

function ReportDemand(props) {
    const { selectedCat, setNewSelectedCat } = props
    const classes = useStyles()
    const { setMessage } = React.useContext(StatusBarContext)

    const reportDemand = () => {
        webHelper.reportDemand(cookies.get('token'), selectedCat._id)
            .then((res) => {
                setMessage(new AppMessage(AppMessage.types.INFO, 'Reported demand', 200))
                let newSelectedCat = selectedCat;
                newSelectedCat.demandsCount = res.demandsCount;
                newSelectedCat.userDemands = res.userDemands;
                setNewSelectedCat(newSelectedCat);
            }).catch((err) => {
                setMessage(err)
            });
    }

    const removeDemand = () => {
        webHelper.removeDemand(cookies.get('token'), selectedCat._id)
            .then((res) => {
                setMessage(new AppMessage(AppMessage.types.INFO, 'Removed demand', 200))
                let newSelectedCat = selectedCat;
                newSelectedCat.demandsCount = res.demandsCount;
                newSelectedCat.userDemands = res.userDemands;
                setNewSelectedCat(newSelectedCat)
            }).catch((err) => {
                setMessage(err)
            });
    }

    return (
        <Grid item>
            <Grid
                container
                direction="row"
                justify="flex-start"
                alignItems="center"
                spacing={2}
                className={classes.reportDemandContainer}
            >
                {selectedCat.userDemands === false
                    ?
                    <React.Fragment>
                        <Grid item key="demandsText">
                            {`${selectedCat.demandsCount} user(s) want more offers in ${selectedCat.name}.`}
                        </Grid>
                        <Grid item>
                            <Button variant="outlined" onClick={reportDemand}>Report demand</Button>
                        </Grid>
                    </React.Fragment>
                    :
                    <React.Fragment>
                        <Grid item>
                            {selectedCat.demandsCount > 1
                                ? `You and ${selectedCat.demandsCount - 1} other(s) reported demand for ${selectedCat.name}.`
                                : `You reported demand in ${selectedCat.name}.`
                            }
                        </Grid>
                        <Grid item>
                            <Button onClick={removeDemand}>Undo</Button>
                        </Grid>
                    </React.Fragment>
                }

            </Grid>
        </Grid>
    )
}

export default (ReportDemand)