import { Grid, IconButton, makeStyles, Typography, withStyles } from '@material-ui/core';
import { Favorite } from '@material-ui/icons';
import React from 'react';

const styles = (theme) => ({
    iconContainer: {
        cursor: 'pointer',
    },
    textLikeCount: {
        color: theme.palette.grey[600],
    },
});

function ToggleIcon(props) {
    const { classes, isFilled, scale, customColorFull, customColorEmpty, onFilledChanged, count: countProp } = props;

    const scaleBy = (!scale || isNaN(scale)) ? 1 : scale;

    const dynClasses = makeStyles(theme => ({
        iconFull: {
            color: !customColorFull ? theme.palette.secondary.main : customColorFull,
            fontSize: (1 * scaleBy) + 'rem',
        },
        iconEmpty: {
            color: !customColorEmpty ? theme.palette.grey[400] : customColorEmpty,
            fontSize: (1 * scaleBy) + 'rem',
        },
    }))();

    const [filled, setFilled] = React.useState(!isFilled ? false : isFilled)
    const [count, setCount] = React.useState(countProp)

    function onIconClick() {
        let newCount = null

        if (count !== null && count !== undefined) {
            newCount = filled ? count - 1 : count + 1;      // The current filled is still the old filled
            setCount(newCount)
        }
        
        setFilled(!filled)

        if (onFilledChanged)
            onFilledChanged(!filled, newCount)
    }
    
    return (
        <Grid container direction="row" justify="center" alignItems="center">
            <Grid item className={classes.iconContainer} onClick={onIconClick}>
                <IconButton>
                    <Favorite className={filled ? dynClasses.iconFull : dynClasses.iconEmpty}/>
                </IconButton>
            </Grid>
            <Grid item>
                <Typography className={classes.textLikeCount}>{count}</Typography>
            </Grid>
        </Grid>
    )
}

export default withStyles(styles)(ToggleIcon);