import { Button, Grid, TextField, withStyles } from '@material-ui/core';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import validateFullRequired from '../../../globals/formValidator';
const styles = (theme) => ({
    textFieldContainer: {
        marginTop: theme.spacing(1),
    }
});

function AnswerForm(props) {
    const { classes, onAnswerSubmitted, onAnswerCanceled, answer: answerProp } = props;

    const [errors, setErrors] = React.useState({});
    const [answer, setAnswer] = React.useState(answerProp);

    const formRef = {
        'content': React.createRef(),
    }

    function onButtonCancel() {
        if (onAnswerCanceled)
            onAnswerCanceled()
    }

    function onButtonSave() {
        let newAnswer = {
            'content': formRef.content.current.value,
        }

        if (!validateForm(newAnswer))
            return;

        setAnswer(newAnswer);
        
        if (onAnswerSubmitted)
            onAnswerSubmitted(newAnswer);
    }

    function validateForm(fields) {
        let errors = validateFullRequired(fields);

        setErrors(errors);
        return Object.keys(errors).length === 0;
    }

    return (
        <Grid container direction="column" justify="flex-start" alignItems="stretch" 
        spacing={2}>
            <Grid item className={classes.textFieldContainer}>
                <TextField
                    autoComplete="content"
                    name="content"
                    variant="outlined"
                    fullWidth
                    id="content"
                    label="Type your answer here"
                    error={Boolean(errors.content)}
                    inputRef={formRef.content}
                    helperText={errors.content}
                    defaultValue={answer ? answer.content : ''}
                    multiline
                    rows={4}
                />
            </Grid>
            <Grid item>
                <Grid container direction="row" justify="flex-end" alignItems="center" spacing={2}>
                    <Grid item>
                        <Button onClick={onButtonCancel} variant="outlined" color="secondary">Cancel</Button>
                    </Grid>
                    <Grid item>
                        <Button onClick={onButtonSave} variant="outlined" color="primary">Save</Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}

export default withStyles(styles)(AnswerForm);