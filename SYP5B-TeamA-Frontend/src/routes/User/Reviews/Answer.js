import { Grid, IconButton, Menu, MenuItem, Typography, withStyles } from '@material-ui/core';
import { Edit, MoreVert, Reply } from '@material-ui/icons';
import React from 'react';
import UserAvatar from '../../../components/UserAvatar';
import StatusBarContext from '../../../globals/StatusBarContext';
import webHelper from '../../../globals/webHelper';
import AnswerForm from './AnswerForm';

import Cookies from 'universal-cookie';
import AppMessage from '../../../globals/AppMessage';
import ReactMarkdown from 'react-markdown';
const cookies = new Cookies();

const styles = (theme) => ({
    answerContainer: {
        marginTop: theme.spacing(1),
    },
    answerTextContainer: {
        whiteSpace: 'break-spaces',
        marginLeft: theme.spacing(1.5),
    },
    bottomContainer: {
        paddingLeft: theme.spacing(1.5),
    },
    timestampText: {
        fontSize: '0.8rem',
    },
    editedText: {
        fontSize: '0.9rem',
    },
    editedIcon: {
        fontSize: '1.05rem',
        color: '#777777',
    },
    userAvatar: {
        color: theme.palette.text.primary,
        fontSize: '1.2rem',
    },
});

function Answer(props) {
    const { classes, answer: answerProp, userId, reviewId, isEditable, editMode, canReply, onReplyClicked: onReplyClickedCallback, onAnswerChanged: onAnswerChangedCallback, onAnswerDeleted: onAnswerDeletedCallback } = props;

    const answerMenuOptions = [
        { label: 'Edit', callback: onAnswerEditClick },
        { label: 'Delete', callback: onAnswerDeleteClick },
    ];

    const { setMessage } = React.useContext(StatusBarContext);

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [answer, setAnswer] = React.useState(answerProp);
    const [editing, setEditing] = React.useState(editMode ? editMode : false);
    const answerDate = React.useState(new Date(answer.timestamp))[0];

    const menuRef = React.createRef()

    function generateMenuOptions() {
        let JSXMenuOptions = []

        answerMenuOptions.forEach(menuOption => {
            JSXMenuOptions.push(
                <MenuItem key={JSXMenuOptions.length} onClick={(e) => handleMenuItemClicked(e, menuOption)}>{menuOption.label}</MenuItem>
            )
        });

        return JSXMenuOptions;
    }
    function handleMenuOpen() {
        setAnchorEl(menuRef.current);
    }
    function handleMenuClose() {
        setAnchorEl(null);
    }
    function handleMenuItemClicked(e, menuOption) {
        handleMenuClose(); 
        
        menuOption.callback(e, answer);
    }
    function onReplyClicked() {
        console.log('Reply!');

        if (onReplyClickedCallback)
            onReplyClickedCallback();
    }

    function onEditCancel(e) {
        setEditing(false);
    }
    function onAnswerEditClick() {
        setEditing(true);
    }

    function onEditComplete(newAnswer) {
        webHelper.patchOneAnswer(cookies.get('token'), userId, reviewId, answer._id, newAnswer)
        .then((newReview) => {
            let updatedAnswer = newReview.answers.find((ans) => {
                return (ans._id === answer._id);
            });

            if (updatedAnswer)
                setAnswer(updatedAnswer)
            else
                console.warn('The new answers-list does not contain the current answer anymore!');
            
            setEditing(false);
            setMessage(new AppMessage(AppMessage.types.INFO, 'Answer was edited'));
    
            if (onAnswerChangedCallback)
                onAnswerChangedCallback(newReview)
        }).catch((err) => {
            setMessage(err)
        })
    }
    function onAnswerDeleteClick() {
        console.info('Deleting answer, with id and content', answer._id, answer.content)

        webHelper.deleteOneAnswer(cookies.get('token'), userId, reviewId, answer._id)
        .then(() => {
            if (onAnswerDeletedCallback)
                onAnswerDeletedCallback(answer._id)
            
            setMessage(new AppMessage(AppMessage.types.INFO, 'Answer was deleted'));
        }).catch((err) => {
            setMessage(err);
        })
    }

    return (
        <Grid container direction="column" justify="flex-start" alignItems="stretch"
            className={classes.answerContainer}
            spacing={2}
        >
            <Grid item>
                <Grid container direction="row" justify="space-between" alignItems="center">
                    <Grid item className={classes.userAvatar}>
                        <UserAvatar user={answer.user} />
                    </Grid>
                        <Grid item>
                            <Grid container direction="row" justify="flex-end" alignItems="center" >
                                { canReply &&
                                        <Grid item>
                                            <IconButton onClick={onReplyClicked}>
                                                <Reply />
                                            </IconButton>
                                        </Grid>
                                }
                                {isEditable &&
                                    <React.Fragment>
                                        <Grid item>
                                            <IconButton ref={menuRef} onClick={handleMenuOpen}>
                                                <MoreVert />
                                            </IconButton>
                                        </Grid>

                                        <Menu id="answer-long-menu"
                                            anchorEl={anchorEl}
                                            open={Boolean(anchorEl)}
                                            onClose={handleMenuClose}
                                            anchorReference={menuRef}
                                            anchorOrigin={
                                                { vertical: "bottom", horizontal: "right" }}
                                            anchorPosition={
                                                { vertical: "bottom", horizontal: "right" }}
                                            MenuListProps={{
                                                classes: { padding: classes.menuListPadding },
                                            }}
                                            transformOrigin={{ vertical: "bottom", horizontal: "right" }}>
                                            {generateMenuOptions()}

                                        </Menu>
                                    </React.Fragment>
                                }
                            </Grid>
                        </Grid>
                </Grid>
            </Grid>
            { !editing 
            ?
                <React.Fragment>
                    <Grid item className={classes.answerTextContainer}>
                    <ReactMarkdown>{answer.content}</ReactMarkdown>
                    </Grid>
                    <Grid item>
                        <Grid container direction="row" justify="space-between" alignItems="center"
                        className={classes.bottomContainer}>
                            <Grid item>
                                <Typography className={classes.timestampText}>{`${answerDate.toLocaleDateString()} ${answerDate.toTimeString().slice(0, 5)}`}</Typography>
                            </Grid>
                            {answer.edited &&
                                <Grid item>
                                    <Grid container direction="row" justify="flex-end" alignItems="center" spacing={1}>
                                        <Grid item>
                                            <Edit className={classes.editedIcon} />
                                        </Grid>
                                        <Grid item>
                                            <Typography className={classes.editedText}>Edited</Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            }
                        </Grid>
                    </Grid>
                </React.Fragment>
            :
                <Grid item>
                    <AnswerForm userId={userId} reviewId={reviewId} onAnswerCanceled={onEditCancel} onAnswerSubmitted={onEditComplete} answer={answer}/>
                </Grid>
            }
        </Grid>
    );
}

export default withStyles(styles)(Answer);