import React from 'react';
import { Button, Grid, TextField, withStyles } from '@material-ui/core';
import StarPicker from './StarPicker';
import { validateSomeRequired } from '../../../globals/formValidator';

import StatusBarContext from '../../../globals/StatusBarContext';

const styles = (theme) => ({
    form: {
        width: '100%', // Fix IE 11 issue. No
        marginTop: theme.spacing(1),
    },
    submit: {
        marginTop: theme.spacing(3),
    },
});

function ReviewForm(props) {
    const { classes, review: reviewProp, onEditingComplete, onButtonCancel: onButtonCancelCallback } = props;

    const { setMessage } = React.useContext(StatusBarContext);
    const [errors, setErrors] = React.useState({});
    const [rating, setRating] = React.useState(reviewProp ? reviewProp.rating : 0);
    const [review, setReview] = React.useState(reviewProp);

    const createReviewForm = {
        title: React.createRef(),
        content: React.createRef(),
    }
    
    function onButtonSave(e) {
        e.preventDefault();

        let newReview = {
            title: createReviewForm.title.current.value,
            content: createReviewForm.content.current.value,
            rating: rating
        }

        console.debug(review)

        if (!validateForm(newReview))
            return;
        
        if (onEditingComplete)
            onEditingComplete(newReview);
    }

    function validateForm(fields) {
        console.debug('validating ', fields)
        let errors = validateSomeRequired(fields, 'content', 'rating');

        if (!fields.rating || fields.rating < 1 || fields.rating > 5)
            errors.rating = 'A rating is required';

        setErrors(errors);
        return Object.keys(errors).length === 0;
    }

    function onButtonCancel(e) {
        if(onButtonCancelCallback)
            onButtonCancelCallback()
    }

    function onRatingChanged(newRating) {
        console.log('Set rating to ', newRating)
        setRating(newRating);
    }

    return (
        <form noValidate onSubmit={onButtonSave}>
            <Grid container direction="column" justify="flex-start" alignItems="stretch" spacing={2}>
                <Grid item xs={12}>
                    <StarPicker
                        count={5}
                        defaultSelection={rating}
                        editable={true}
                        scale={1.3}
                        inputRef={createReviewForm.rating}
                        error={Boolean(errors.rating)}
                        helperText={errors.rating}
                        onSelectionChanged={onRatingChanged}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        autoComplete="title"
                        name="title"
                        variant="outlined"
                        fullWidth
                        id="title"
                        label="Give your review a title"
                        error={Boolean(errors.title)}
                        inputRef={createReviewForm.title}
                        helperText={errors.title}
                        defaultValue={review ? review.title : ''}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        autoComplete="content"
                        name="content"
                        variant="outlined"
                        fullWidth
                        id="content"
                        label="Describe your experience"
                        error={Boolean(errors.content)}
                        inputRef={createReviewForm.content}
                        helperText={errors.content}
                        defaultValue={review ? review.content : ''}
                        multiline
                        rows={4}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Grid container direction="row" justify="flex-end" alignItems="flex-start"
                    spacing={2}>
                        { (review !== null) &&          // if not null, an existing one is edited
                            <Grid item>
                                <Button onClick={onButtonCancel} variant="contained" color="secondary" className={classes.submit}>
                                    Cancel
                                </Button>
                            </Grid>
                        }

                        <Grid item>
                            <Button type="submit" variant="contained" color="primary" className={classes.submit}>
                                Save
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </form>
    );
}

export default withStyles(styles)(ReviewForm);