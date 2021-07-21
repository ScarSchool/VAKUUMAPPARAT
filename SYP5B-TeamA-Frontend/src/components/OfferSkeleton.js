import { Chip, Grid, Paper, Typography, withStyles, Badge } from '@material-ui/core';

import React from 'react';

import { Skeleton } from '@material-ui/lab';

const styles = (theme) => ({
    offer: {
        margin: theme.spacing(),
        padding: theme.spacing(),
    },
    attendeeList: {
        maxHeight: "100%",
        overflow: "auto",
        maxWidth: "30em"
    },
    button: {
        marginTop: theme.spacing(3),
    },
    tagsContainer: {
        marginTop: '0.5rem',
    },
    enrolled: {
        color: theme.palette.utility.status.enrolled
    },
    offeror: {
        color: theme.palette.utility.status.offeror
    },
    attendee: {
        color: theme.palette.utility.status.attendee
    },
    requirementContainer: {
        borderRadius: 12
    }
})

function OfferSkeleton(props) {
    const { classes, id } = props

    return (
        <React.Fragment>
            <Paper className={classes.offer} key={id} style={{ cursor: "pointer" }} >
                <Grid container
                    direction="column"
                    spacing={1}>
                    <Grid item >
                        <Typography variant="h6">
                            <Skeleton />
                        </Typography>
                    </Grid>
                    <Grid item >
                        <Grid
                            container
                            direction="row"
                            justify="flex-start"
                            alignItems="center"
                            spacing={2}
                        >
                            <Grid item>
                                <Skeleton className={classes.requirementContainer} variant="rect" width={50} height={50} />
                            </Grid>
                            <Grid item>
                                <Skeleton className={classes.requirementContainer} variant="rect" width={50} height={50} />
                            </Grid>
                            <Grid item>
                                <Skeleton className={classes.requirementContainer} variant="rect" width={50} height={50} />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item >
                        <Grid container
                            direction="column">
                            <Grid item>
                                <Skeleton height={10} width={'80%'} />
                            </Grid>
                            <Grid item>
                                <Skeleton height={10} width={'50%'} />
                            </Grid>
                            <Grid item>
                                <Skeleton height={10} width={'30%'} />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item>
                        <Grid
                            container
                            direction="row"
                            justify="flex-end"
                            alignItems="center"
                            spacing={1}
                        >
                            <Grid item>
                                <Skeleton animation="wave" variant="circle" width={40} height={40} />
                            </Grid>
                            <Grid item>
                                <Skeleton animation="wave" variant='text' width={60} height={15} />
                            </Grid>
                            <Grid item>
                                <Skeleton animation="wave" variant='text' width={60} height={15} />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        </React.Fragment>
    )
}

export default withStyles(styles)((OfferSkeleton))
