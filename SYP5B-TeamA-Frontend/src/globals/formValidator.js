const EMAIL_REGEX = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+.)+[^<>()[\].,;:\s@"]{2,})$/i;

function validateFullRequired(object) {
    let errors = {};
    Object.keys(object).forEach(value => {
        if(!object[value]){
            errors[value] = `${value[0].toUpperCase()}${value.slice(1, value.length)} is a required field`
        }
    });
    return errors
}
function validateSomeRequired(object, ...ignoreFields) {
    let errors = {};

    Object.keys(object).forEach(value => {
        if (!object[value] && !ignoreFields.includes(value)) {
            errors[value] = `${value[0].toUpperCase()}${value.slice(1, value.length)} is a required field`
        }
    });
    return errors
}
function validateEmail(email) {
    return EMAIL_REGEX.test(email);
}

export default validateFullRequired;

export {
    validateFullRequired, validateSomeRequired, validateEmail
}