import React from 'react';
import { Redirect } from 'react-router-dom';

import Cookies from 'universal-cookie';
import AppMessage from '../globals/AppMessage';
import StatusBarContext from '../globals/StatusBarContext';
const cookies = new Cookies();

function Logout(props) {


    const { setMessage } = React.useContext(StatusBarContext);
    cookies.remove('accountinfo');
    cookies.remove('token');

    if (props.onLogout) {
        setMessage(new AppMessage(AppMessage.types.INFO, 'You just logged out!', 200))

        props.onLogout();
    }

    return <Redirect to="/login" />
}

export default Logout;