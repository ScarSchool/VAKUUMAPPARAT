import { Divider, Grid, Typography, withStyles } from '@material-ui/core';
import React, { useEffect } from 'react';
import Review from './Review';

const styles = (theme) => ({
    header: {
        fontSize: '1.8rem',
    },
    header2: {
        fontSize: '1.4rem',
    },
    userReviewsContainer: {
        padding: theme.spacing(2),
    },
});

function UserReviews(props) {
    const { classes, user, fetchData } = props;

    function generateReviews() {
        let reviewsJSX = [];

        user.reviews.forEach((review) => {
            reviewsJSX.push(<Review key={reviewsJSX.length} review={review} canReview={user.canReview} userId={user._id} fetchData={fetchData} />)
        })

        return (
            <Grid container direction="column" justify="center" alignItems="center">
                {reviewsJSX}
            </Grid>
        )
    }

    function generateMyReview() {
        return (
            <React.Fragment>
                <Grid item>
                    <Typography className={classes.header2}>
                        {!user.myReview
                            ?
                            <React.Fragment>
                                {user.reviews.length === 0
                                    ? 'Be the first person to leave a review'
                                    : 'Leave a review for this user'
                                }
                            </React.Fragment>
                            :
                            'Your review'
                        }
                    </Typography>
                </Grid>
                <Grid item>
                    <Divider />
                </Grid>
                <Grid item>
                    <Review userId={user._id} review={user.myReview} canReview={user.canReview} isEditable={true}  fetchData={fetchData} />
                </Grid>
            </React.Fragment>)
    }

    function generateUserReviews() {
        return <React.Fragment>
            {user.reviews.length > 0
                ?
                <React.Fragment>
                    <Grid item>
                        <Typography className={classes.header2}>Reviews by others</Typography>
                    </Grid>
                    <Grid item>
                        <Divider />
                    </Grid>
                    <Grid item>
                        {generateReviews()}
                    </Grid>
                </React.Fragment>
                :
                <React.Fragment>
                    {!user.myReview &&
                        <Grid item>
                            <Typography>{"There are no reviews here."}</Typography>
                        </Grid>
                    }
                </React.Fragment>
            }
        </React.Fragment>
    }

    return (
        <Grid container
            direction="column"
            spacing={1}
            className={classes.userReviewsContainer}>
            <Grid item>
                <Typography className={classes.header}>User ratings and reviews</Typography>
            </Grid>
            <Grid item>
                <Divider />
            </Grid>
            <Grid item>
                <Grid
                    container
                    direction="column"
                    justify="center"
                    alignItems="stretch"
                >
                    <React.Fragment>
                        {(user.canReview || user.myReview !== null) &&        // This is kind of confusing in this context. CanReview refers to the person looking at the profile, the profile data is contained in object 'user'
                            <React.Fragment>
                                {generateMyReview()}
                            </React.Fragment>
                        }
                        {generateUserReviews()}
                    </React.Fragment>
                </Grid>
            </Grid>
        </Grid>
    );
}

export default withStyles(styles)(UserReviews);