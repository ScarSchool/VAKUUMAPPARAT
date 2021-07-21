import { FormHelperText, Grid, makeStyles, Typography, withStyles } from '@material-ui/core';
import { Star } from '@material-ui/icons';
import React from 'react';

// import Cookies from 'universal-cookie';
// const cookies = new Cookies();

const styles = (theme) => ({

    ratingContainer: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(1),
    },
    
    ratingError: {
        marginLeft: theme.spacing(1.75),
        marginRight: theme.spacing(1.75),
    },
    starContainer: {
        cursor: 'pointer',
    },
});

function StarPicker(props) {
    const { classes, count, defaultSelection, editable, scale, error, helperText, onSelectionChanged } = props;

    const scaleBy = (!scale || isNaN(scale)) ? 1 : scale;
    const dynClasses = makeStyles(theme => ({
        fullStar: {
            color: theme.palette.utility.star,
            fontSize: (1.8 * scaleBy) + 'rem',
        },
        emptyStar: {
            color: theme.palette.utility.emptystar,
            fontSize: (1.8 * scaleBy) + 'rem',
        },
        ratingText: {
            color: (error) ? theme.palette.error.main : theme.palette.utility.ratingText,
            marginBottom: theme.spacing(0.5),
        },
    }))();

    let [hover, setHover] = React.useState(null);
    let [selected, setSelected] = React.useState(defaultSelection);

    let starsJSX = [];

    let filled = hover !== null ? hover : selected;

    for (let i = 0; i < count; i++) {
        let star = <Star className={i < filled ? dynClasses.fullStar : dynClasses.emptyStar}/>;

        if (editable) {
            starsJSX.push(
                <Grid item key={i}
                    className={classes.starContainer}
                    onMouseEnter={() => starHoverSelection(i + 1)}
                    onMouseLeave={() => starHoverSelection(null)}
                    onClick={() => starSelected(i + 1)}
                >
                    {star}
                </Grid>
            );
        } else {
            starsJSX.push(
                <Grid item key={i}>
                    {star}
                </Grid>
            );
        }
    }

    function starHoverSelection(starCount) {
        setHover(starCount);
    }

    function starSelected(starCount) {
        setSelected(starCount);

        if (onSelectionChanged)
            onSelectionChanged(starCount)
    }

    if (editable) {
        return (
            <Grid container direction="column" justify="flex-start" alignItems="stretch" 
                className={classes.ratingContainer}>
                <Grid item>
                    <Typography className={dynClasses.ratingText}>Pick a rating</Typography>
                </Grid>
                <Grid item>
                    <Grid container direction="row" justify="flex-start" alignItems="center" spacing={1}>
                        {starsJSX}
                    </Grid>
                </Grid>
                { error &&
                    <Grid item className={classes.ratingError}>
                        <FormHelperText error={true}>
                            {helperText}
                        </FormHelperText>
                    </Grid>
                }
            </Grid>
        )
    } else {
        return (
            <Grid container direction="row" justify="flex-start" alignItems="center" spacing={1}>
                {starsJSX}
            </Grid>
        )
    }
}

export default withStyles(styles)(StarPicker);