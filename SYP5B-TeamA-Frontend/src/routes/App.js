import React from 'react';
import {
  BrowserRouter as Router,
  Route,
} from "react-router-dom";

import Login from './Login';
import Logout from './Logout';
import Register from './Register';
import Dashboard from './Dashboard/Dashboard';
import Profile from './Profile/Profile';
import Exchange from './Exchange/Exchange';
import PrivateRoute from '../components/PrivateRoute';
import NotificationsPage from './NotificationsPage'

import Cookies from 'universal-cookie';
import NavBar from '../components/NavBar/NavBar';
import UserProfile from './User/UserProfile';
import { NotificationsContextProvider } from '../globals/NotificationsContext';
const cookies = new Cookies();


class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      logoutTimer: 0,
    }

    this.updateComponent = this.updateComponent.bind(this);
  }
  updateComponent() {
    console.log("Authentication state updated!");
    this.forceUpdate();
  }

  componentDidMount() {
    let accInfo = cookies.get('accountinfo');
    if (accInfo) {
      if (!isNaN(accInfo.exp)) {
        clearInterval(this.state.logoutTimer);
        setTimeout(() => {
          window.location.pathname = '/logout';
          console.log('Token expired!');
        }, accInfo.exp - new Date().getTime());

        console.log(`User will automatically be logged out at '${new Date(accInfo.exp)}'`);
      }
    }
  }

  render() {
    return (
      <Router>
        <NotificationsContextProvider>

          <div style={{ overflow: 'hidden' }}>

            <NavBar style={{ overflow: 'hidden' }} />
            <Route exact path='/logout'>
              <Logout onLogout={this.updateComponent} />
            </Route>
            <Route exact path='/login'>
              <Login onLogin={this.updateComponent} />
            </Route>
            <Route exact path="/register" component={Register} />
            <PrivateRoute exact path="/dashboard" component={Dashboard} />
            <PrivateRoute exact path="/exchange" component={Exchange} />
            <PrivateRoute path="/exchange/category/:categoryId" component={Exchange} />

            <PrivateRoute path="/notifications" component={NotificationsPage} />
            <PrivateRoute exact path="/profile" component={Profile} />
            <PrivateRoute path="/users/:id" component={UserProfile} />
            {<PrivateRoute exact path="/" component={Dashboard} />}
            {/* <Route path="/">
              <Redirect to="/login"></Redirect>
            </Route> */}
          </div>
        </NotificationsContextProvider>
      </Router>
    );
  }
}

export default (App);
