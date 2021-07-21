class AppMessage {
    constructor(type, message, statuscode) {
        this.type = type ? type : 'error';
        this.message = message;
        this.statuscode = statuscode;
    }

    static types = {
        ERROR: 'error',
        WARNING: 'warning',
        SUCCESS: 'success',
        INFO: 'info'
    }
}

class ErrorMessage extends AppMessage {
    constructor(err) {
        console.debug(`DEBUG: Error while doing a web call. Status: ${err.status}, Message: ${err.message}. Error object was `, err);
        super('error', err.message, err.status)
    }

}

export default AppMessage
export { ErrorMessage, AppMessage }
