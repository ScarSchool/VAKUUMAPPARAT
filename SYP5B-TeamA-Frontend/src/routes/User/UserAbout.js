import { Avatar, Divider, Grid, List, ListItem, ListItemAvatar, ListItemText, Typography, withStyles } from '@material-ui/core';
import { Home as HomeIcon, School as SchoolIcon, Work as WorkIcon } from '@material-ui/icons';
import React from 'react';
import ListItemUnknown from '../../components/ListItemUnknown';
import ToggleIcon from '../../components/ToggleIcon';
import webHelper from '../../globals/webHelper';

import Cookies from 'universal-cookie';
import StatusBarContext from '../../globals/StatusBarContext';
import AppMessage from '../../globals/AppMessage';
import theme from '../../configs/theme';

const cookies = new Cookies();

const styles = (theme) => ({
    header: {
        fontSize: '1.8rem',
    },
    userAboutContainer: {
        padding: theme.spacing(2),
    },
    infoParagraph: {
        marginTop: '0.6rem',
        marginBottom: '1rem',
        overflowWrap: 'anywhere', 
        whiteSpace: 'break-spaces',
        paddingLeft: theme.spacing(2),
    },
    noInformation: {
        fontStyle: 'italic',
        color: theme.palette.grey[600],
    },
    likeButtonContainer: {
        alignSelf: 'flex-end',
        marginRight: theme.spacing(2)
    },
});

function UserAbout(props) {
    const { classes, user } = props;

    const { setMessage } = React.useContext(StatusBarContext);

    const [likeState, setLikeState] = React.useState(user.statistics.likedState);
    const [likeCount, setLikeCount] = React.useState(user.statistics.likeCount);

    if (!user.generalInfo || user.generalInfo.visibility === 'private')
        return (
            <Grid container direction="column" spacing={1} className={classes.userAboutContainer}>
                <Grid item> <Typography className={classes.header}>About</Typography> </Grid>
                <Grid item> <Divider/> </Grid>
                <Grid item>
                    <List>
                        <ListItemUnknown>This user does not want to share this information.</ListItemUnknown>
                    </List>
                </Grid>
            </Grid>
        );

    let biography = (!user.generalInfo.biography) ? 'This user has not yet written about themselves.' : user.generalInfo.biography;
    let jobTitle = (!user.additionalInfo.jobTitle) ? 'No information' : user.additionalInfo.jobTitle;
    let education = (!user.additionalInfo.education) ? 'No information' : user.additionalInfo.education;
    let residency = (!user.additionalInfo.residency) ? 'No information' : user.additionalInfo.residency;

    function onToggleIconClicked(newLikeState, newLikeCount) {
        webHelper.likeOneUser(cookies.get('token'), user._id, newLikeState)
        .then(() => {
            let message = newLikeState ? `Liked ${user.firstname} ${user.lastname}` : 'Removed like';
            setMessage(new AppMessage(AppMessage.types.INFO, message));
            setLikeState(likeState)
            setLikeCount(newLikeCount)
        }).catch((err) => {
            setMessage(err);
            setLikeState(!newLikeState)
            setLikeCount(newLikeState ? newLikeCount - 1 : newLikeCount + 1)
        });

    }

    return (
        <Grid container
        direction="column"
        spacing={1}
        className={classes.userAboutContainer}>
            <Grid item>
                <Typography className={classes.header}>About</Typography>
            </Grid>
            <Grid item>
                <Divider/>
            </Grid>
            <Grid item>
                <Grid container direction="column" justify="flex-start" alignItems="stretch" spacing={2}>
                    <Grid item>
                        <Typography className={!user.generalInfo.biography ? classes.noInformation : classes.infoParagraph}>
                            {biography}
                        </Typography>
                    </Grid>
                    <Grid item className={classes.likeButtonContainer}>
                        <ToggleIcon customColorFull={theme.palette.utility.likeButton} isFilled={likeState} count={likeCount} scale={1.8} onFilledChanged={onToggleIconClicked}/>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item>
                <Typography className={classes.header}>Personal information</Typography>    
            </Grid>
            <Grid item>
                <Divider/>
            </Grid>
            <Grid item>
                <List>
                    <ListItem>
                        <ListItemAvatar>
                            <Avatar>
                                <WorkIcon/>
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary='Job Title' secondary={jobTitle} secondaryTypographyProps={{className: !user.additionalInfo.jobTitle ? classes.noInformation : undefined}}/>
                    </ListItem>
                    <ListItem>
                        <ListItemAvatar>
                            <Avatar>
                                <SchoolIcon/>
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary='Education' secondary={education} secondaryTypographyProps={{className: !user.additionalInfo.education ? classes.noInformation : undefined}}/>
                    </ListItem>
                    <ListItem>
                        <ListItemAvatar>
                            <Avatar>
                                <HomeIcon/>
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary='Place of residence' secondary={residency} secondaryTypographyProps={{className: !user.additionalInfo.residency ? classes.noInformation : undefined}}/>
                    </ListItem>
                </List>
            </Grid>
        </Grid>
    );
}

export default withStyles(styles)(UserAbout);