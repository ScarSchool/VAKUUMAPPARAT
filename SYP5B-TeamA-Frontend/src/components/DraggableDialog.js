import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import Draggable from 'react-draggable';
import { Button } from '@material-ui/core';


function PaperComponent(props) {
    return (
        <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper {...props} />
        </Draggable>
    );
}

/**
 * 
 * @param {*} props classes, children, title, dialogActions, submitCallback
 */
function DraggableDialog(props) {
    const { children, title, dialogTitle, dialogactions: dialogActions, submitCallback, open, onClose, submittext: submitText, outsourceclasses, noSubmitClose, completeDialogObject, paperComponent } = props;
    const classes = outsourceclasses ? outsourceclasses : {};
    const forceReload = React.useState()[1];

    const handleClickSubmit = (event, submitCallback) => {
        if (submitCallback)
            submitCallback(event);
        if (onClose && !noSubmitClose) {

            onClose()
            forceReload();
        }
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperComponent={paperComponent ? paperComponent : PaperComponent}
            aria-labelledby="draggable-dialog-title"
            {...props}
            className={classes.dialog}
        >
            {
                Boolean(completeDialogObject) ?
                    children
                    :
                    <React.Fragment>
                        {Boolean(dialogTitle || title) &&
                            <DialogTitle id="draggable-dialog-title" style={{ cursor: 'move' }}>{dialogTitle ? dialogTitle : title}</DialogTitle>
                        }

                        <DialogContent>
                            {children}
                        </DialogContent>
                        {
                            (submitCallback !== undefined || dialogActions !== undefined) &&
                            <DialogActions className={classes.dialogActions}>
                                {
                                    submitCallback !== undefined &&
                                    <Button type="submit" onClick={(event) => handleClickSubmit(event, submitCallback)} color="primary">
                                        {Boolean(submitText) ? submitText : "Submit"}
                                    </Button>
                                }

                                {
                                    dialogActions !== undefined &&
                                    dialogActions
                                }
                            </DialogActions>
                        }
                    </React.Fragment>
            }
        </Dialog>
    );
}

export default (DraggableDialog);