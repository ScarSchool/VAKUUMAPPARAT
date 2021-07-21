import React from 'react';
import { Redirect, Route } from 'react-router-dom';

import Cookies from 'universal-cookie';
const cookies = new Cookies();

function PrivateRoute({ component: Component, ...rest}) {
    let authenticated = (cookies.get('accountinfo') !== undefined && cookies.get('token') !== undefined);

    return <Route {...rest} render={(props) => (
        (authenticated === true)
        ? <Component {...props}/>
        : <Redirect to="/login"/>
    )}/>
}

export default PrivateRoute;