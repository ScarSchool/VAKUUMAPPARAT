import React from 'react';
import { Divider, Grid, IconButton, Menu, MenuItem, Typography, withStyles } from '@material-ui/core';
import UserAvatar from '../../../components/UserAvatar';
import { Edit, MoreVert, Reply } from '@material-ui/icons';
import StarPicker from './StarPicker';
import AnswerForm from './AnswerForm';
import Answer from './Answer';

import Cookies from 'universal-cookie';
import webHelper from '../../../globals/webHelper';
import StatusBarContext from '../../../globals/StatusBarContext';
import ReviewForm from './ReviewForm';
import AppMessage from '../../../globals/AppMessage';
import ReactMarkdown from 'react-markdown';
const cookies = new Cookies();

const styles = (theme) => ({
    titleText: {
        fontSize: '1.13rem',
    },
    timestampText: {
        fontSize: '0.9rem',
    },
    reviewContainer: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1.5),
        paddingLeft: theme.spacing(0.5),
        paddingRight: theme.spacing(0.5),
        color: theme.palette.common.grey,
    },
    userAvatar: {
        color: theme.palette.text.primary,
        fontSize: '1.2rem',
    },
    editedText: {
        fontSize: '0.85rem',
    },
    editedIcon: {
        fontSize: '1rem',
        color: '#777777',
    },
    menuListPadding: {
        padding: '0px'
    },
    contentText: {
        whiteSpace: 'break-spaces',
    },
    answersContainer: {
        marginTop: theme.spacing(1),
    },
    headerContainer: {
        marginTop: theme.spacing(3),
    },
});

function Review(props) {
    const { classes, review: reviewProp, canReview, userId, isEditable, editMode: editModeProp, onReviewChanged: onReviewChangedCallback, onReviewDeleted: onReviewDeletedCallback, fetchData } = props;

    const { setMessage } = React.useContext(StatusBarContext);

    const [review, setReview] = React.useState(reviewProp);
    const [answers, setAnswers] = React.useState(review ? review.answers : []);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [answering, setAnswering] = React.useState(false);
    const [editing, setEditing] = React.useState(editModeProp ? editModeProp : false);

    if ((editing && Boolean(anchorEl)) || (!review && Boolean(anchorEl)))   // Have to do this otherwise menu will plop up in certain cases
        setAnchorEl(null)

    const menuRef = React.createRef();

    const reviewDate = review ? new Date(review.timestamp) : null;

    const ownUserId = cookies.get('accountinfo').user._id;
    const canReply = (canReview || (ownUserId === userId));

    const reviewMenuOptions = [
        { label: 'Edit', callback: onEditReview },
        { label: 'Delete', callback: onDeleteReview },
    ];

    const generateMenuOptions = () => {
        let JSXMenuOptions = []

        reviewMenuOptions.forEach(menuOption => {
            JSXMenuOptions.push(
                <MenuItem key={JSXMenuOptions.length} onClick={(e) => menuOption.callback(e, review)}>{menuOption.label}</MenuItem>
            )
        });

        return JSXMenuOptions;
    }

    const handleMenuOpen = () => {
        setAnchorEl(menuRef.current);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    function onReplyClicked() {
        setAnswering(!answering);
    }

    function onReviewEditCancel() {
        setEditing(false);
    }
    function onEditReview() {
        setEditing(true);
    }
    function onReviewEditingComplete(updatedReview) {
        if (!review) {
            webHelper.postOneReview(cookies.get('token'), updatedReview, userId)
                .then((createdReview) => {
                    setMessage(new AppMessage(AppMessage.types.SUCCESS, 'Successfully created review'))
                    setReview(createdReview);
                    setEditing(false);

                    if (onReviewChangedCallback)
                        onReviewChangedCallback(createdReview)
                }).catch((err) => {
                    setMessage(err);
                });
        } else {
            webHelper.patchOneReview(cookies.get('token'), review._id, updatedReview, userId)
                .then((newReview) => {
                    setReview(newReview);
                    setEditing(false);

                    setMessage(new AppMessage(AppMessage.types.INFO, 'Successfully edited review'));

                    if (onReviewChangedCallback)
                        onReviewChangedCallback(newReview)
                }).catch((err) => {
                    setMessage(err);
                });
        }
    }
    function onDeleteReview() {
        webHelper.deleteOneReview(cookies.get('token'), review._id, userId)
            .then(() => {
                setMessage(new AppMessage(AppMessage.types.SUCCESS, 'Deleted review'));

                setReview(null);

                if (onReviewDeletedCallback)
                    onReviewDeletedCallback(review._id)
            }).catch((err) => {
                setMessage(err);
            });
    }

    function onAnswerCreated(newAnswer) {
        webHelper.postOneAnswer(cookies.get('token'), userId, review._id, newAnswer)
            .then((updatedReview) => {
                setAnswers(updatedReview.answers);
                setAnswering(false);

                setMessage(new AppMessage(AppMessage.types.SUCCESS, 'Answer was posted'))

                if (onReviewChangedCallback)
                    onReviewChangedCallback(updatedReview)
            }).catch((err) => {
                setMessage(err);
            });
    }
    function onAnswerChanged(newReview) {
        setAnswers(newReview.answers);

        if (onReviewChangedCallback)
            onReviewChangedCallback(newReview)
    }
    function onAnswerDeleted(answerId) {
        let updatedAnswers = answers.filter((ans) => {
            return (ans._id !== answerId);
        });
        console.info('New answers are', updatedAnswers);

        setAnswers(updatedAnswers);
    }

    function generateAnswers() {
        let answersJSX = [];

        answers.forEach((answer) => {
            answersJSX.push(
                <Answer
                    key={answer._id}
                    answer={answer}
                    reviewId={review._id}
                    userId={userId}
                    canReply={canReply}
                    isEditable={ownUserId === answer.user._id}
                    onReplyClicked={onReplyClicked}
                    onAnswerChanged={onAnswerChanged}
                    onAnswerDeleted={onAnswerDeleted}
                />
            )
        });

        return (
            <Grid container direction="column" justify="flex-start" alignItems="flex-start"
                spacing={2}>
                {answersJSX}
            </Grid>
        );
    }

    if (!isEditable && (review === null || review === undefined)) {
        console.warn('A review that is not editable and was of value null was passed! This is an invalid state of this component.');
        return (<React.Fragment></React.Fragment>);
    }

    console.debug(review)

    return (
        <Grid container direction="column" justify="center" alignItems="stretch" spacing={2} className={classes.reviewContainer}>
            { (editing || !review)
                ?
                <ReviewForm review={review} userId={userId} onEditingComplete={onReviewEditingComplete} onButtonCancel={onReviewEditCancel} />
                :
                <React.Fragment>
                    <Grid item>
                        <Grid container direction="row" justify="space-between" alignItems="center">
                            <Grid item className={classes.userAvatar}>
                                <UserAvatar user={review.author} />
                            </Grid>
                            <Grid item>
                                <Grid container direction="row" justify="flex-end" alignItems="center" >
                                    {canReply &&
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

                                            <Menu id="long-menu"
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
                    <Grid item>
                        <StarPicker count={5} defaultSelection={review.rating} editable={false} />
                    </Grid>
                    <Grid item>
                        <ReactMarkdown>{review.title[0] !== '#' ? `# ${review.title}` : review.title}</ReactMarkdown>
                    </Grid>
                    <Grid item className={classes.contentText}>
                        <ReactMarkdown>{review.content}</ReactMarkdown>
                    </Grid>
                    <Grid item>
                        <Grid container direction="row" justify="space-between" alignItems="center">
                            <Grid item>
                                <Typography className={classes.timestampText}>{`${reviewDate.toLocaleDateString()} ${reviewDate.toTimeString().slice(0, 5)}`}</Typography>
                            </Grid>
                            {review.edited &&
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
            }
            {(answers.length > 0 || answering) &&
                <Grid container direction="row" justify="space-between" alignItems="stretch">
                    <Grid item xs={1} />
                    <Grid item xs={11}>
                        <Grid container direction="column" justify="center" alignItems="stretch">
                            <Grid item>
                                <Divider />
                            </Grid>
                            {answers.length > 0 &&
                                <Grid item className={classes.answersContainer}>
                                    {generateAnswers()}
                                </Grid>
                            }
                            {answering &&

                                <Grid container direction="column" justify="flex-start" alignItems="stretch"
                                    spacing={1}>

                                    <Grid item className={classes.headerContainer}>
                                        <Typography>Write an answer</Typography>
                                    </Grid>
                                    <Grid item>
                                        <Divider />
                                    </Grid>
                                    <Grid item>
                                        <Grid item>
                                            <AnswerForm userId={userId} reviewId={review._id} onAnswerCanceled={() => setAnswering(false)} onAnswerSubmitted={onAnswerCreated} />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            }
                        </Grid>
                    </Grid>
                </Grid>
            }
        </Grid>
    );
}

export default withStyles(styles)(Review);