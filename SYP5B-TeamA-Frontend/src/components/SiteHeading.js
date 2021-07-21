import { Typography, withStyles } from '@material-ui/core';
import React from 'react';

const styles = (theme) => ({
    siteHeading: {
        fontSize: '2rem'
    },
});

function SiteHeading(props) {
    const { classes } = props;

    return (
        <Typography props className={classes.siteHeading}>
            {props.children}
        </Typography>
    );
}

export default withStyles(styles)(SiteHeading);