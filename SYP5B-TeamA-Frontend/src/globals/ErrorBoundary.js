import React from 'react';
import { withSnackbar } from 'notistack';
import StatusBarContext from './StatusBarContext';
import { IconButton } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import AppMessage from './AppMessage';



class ErrorBoundary extends React.Component {
    static contextType = StatusBarContext;
    static oldMessage = null;

    constructor(props) {
        super(props);

        this.state = { hasMessage: false }
    }

    static getDerivedStateFromError(error) { }
    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service    

        this.context.setMessage({
            message: error.message,
            status: error.statuscode,
            type: error.type
        })
    }

    componentDidUpdate() {
        // If React were to implement functional component Error boundaries, this would be replaced with an use effect when context is updated
        // The reason why we need this, is because we want the transitions
        if (this.context.message !== this.oldMessage) {
            if (this.context.message.type === AppMessage.types.ERROR) {
                return this.props.enqueueSnackbar(this.context.message.message, {
                    variant: this.context.message.type, autoHideDuration: 10000,
                    action: (key) => {
                        return <IconButton onClick={() => { this.props.closeSnackbar(key) }}><Close /></IconButton>
                    }
                });
            }
            return this.props.enqueueSnackbar(this.context.message.message, {
                variant: this.context.message.type, autoHideDuration: 2000
            });
        }
    }

    render() {

        return <React.Fragment >
            {this.props.children}
        </React.Fragment>
    }
}

export default withSnackbar(ErrorBoundary);