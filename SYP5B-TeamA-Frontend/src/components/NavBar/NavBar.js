
import React from 'react';

import { AppBar, Avatar, Button, Grid, IconButton, ListItemIcon, ListItemText, makeStyles, Menu, MenuItem, Toolbar, Typography } from '@material-ui/core';

import { Link } from 'react-router-dom';
import NotificationMenu from './NotificationMenu';

import Cookies from 'universal-cookie';
import { AccountCircle, ExitToApp, Settings } from '@material-ui/icons';
const cookies = new Cookies();

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    noStyleLink: {
        color: "inherit",
        textDecoration: "none",
    },
    heading: {
        color: "inherit",
        textDecoration: "none",
        flexGrow: 1,
    },
    title: {
    },
    subHeading: {
        fontSize: "1rem",
    },
    avatar: {
        backgroundColor: theme.palette.utility.avatar,
    },
    navBarItem: {
        color: "inherit",
        textDecoration: "none",
        marginLeft: "1vw",
    },
    listIcon: {
        minWidth: theme.spacing(4.5)
    }
}));

function NavBar() {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const avatarRef = React.createRef();

    const [registerOrLogin, setRegisterOrLogin] = React.useState(null);

    const handleAvatarClick = () => {
        setAnchorEl(avatarRef.current);
    };
    const handleAvatarMenuClose = () => {
        setAnchorEl(null);
    };

    const classes = useStyles();

    let user = cookies.get('accountinfo');
    let authenticated = (user !== undefined && cookies.get('token') !== undefined);

    function generateLinkButton() {
        let pathname = !registerOrLogin ? window.location.pathname : registerOrLogin;
        if (pathname === '/login') {
            return (
                <Link to="/register" className={classes.noStyleLink}
                onClick={() => {setRegisterOrLogin('/register')}}>
                    <Button color="inherit" variant="outlined">Register</Button>
                </Link>
            );
        } else if (pathname === '/register') {
            return <Link to="/login" className={classes.noStyleLink}
            onClick={() => {setRegisterOrLogin('/login')}}>
                <Button color="inherit" variant="outlined">Login</Button>
            </Link>
        } else {
            return <React.Fragment></React.Fragment>
        }
    }

    function generateProfileMenu() {
        let accountuser = cookies.get('accountinfo').user;

        return (
            <Menu
                id="navbarMenu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleAvatarMenuClose}
            >
                <Link to={`/users/${accountuser._id}`} className={classes.noStyleLink} onClick={handleAvatarMenuClose}>
                    <MenuItem>
                        <ListItemIcon className={classes.listIcon}>
                            <AccountCircle />
                        </ListItemIcon>
                        <ListItemText primary="My Profile" />
                    </MenuItem>
                </Link>
                <Link to="/profile" className={classes.noStyleLink} onClick={handleAvatarMenuClose}>
                    <MenuItem>
                        <ListItemIcon className={classes.listIcon}>
                            <Settings />
                        </ListItemIcon>
                        <ListItemText primary="Settings" />
                    </MenuItem>
                </Link>
                <Link onClick={handleAvatarMenuClose} to="/logout" className={classes.noStyleLink}>
                    <MenuItem>
                        <ListItemIcon className={classes.listIcon}>
                            <ExitToApp />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                    </MenuItem>
                </Link>
            </Menu>
        )
    }

    return (
        <AppBar position="static">
            <Toolbar>
                <Grid
                    container
                    direction="row"
                    alignItems="center">
                    <Grid item margin="normal">
                        <Link to="/dashboard" className={classes.heading}>
                            <Typography variant="h6" className={classes.title}> VAKUUMAPPARAT </Typography>
                        </Link>
                    </Grid>
                    {
                        authenticated === true &&
                        <Grid item margin="normal" className={classes.navBarItem}>
                            <Grid container
                                direction="row"
                                alignItems="center">
                                <Grid item margin="normal" className={classes.navBarItem}>
                                    <Link to="/dashboard" className={classes.heading}>
                                        <Typography variant="h6" className={classes.subHeading}> Dashboard </Typography>
                                    </Link>
                                </Grid>
                                <Grid item margin="normal" className={classes.navBarItem}>
                                    <Link to="/exchange" className={classes.heading}>
                                        <Typography variant="h6" className={classes.subHeading}> Browse offers </Typography>
                                    </Link>
                                </Grid>
                            </Grid>
                        </Grid>
                    }
                </Grid>

                {authenticated === false
                    ?
                    <React.Fragment>
                        { generateLinkButton() }
                    </React.Fragment>
                    :
                    <React.Fragment>
                        <NotificationMenu />
                        <IconButton onClick={handleAvatarClick} ref={avatarRef}>
                            <Avatar className={classes.avatar}>
                                {user.user.firstname.substring(0, 1).toUpperCase()}
                            </Avatar>
                        </IconButton>
                        {/* This throws a findDomNode warning, dunno if its the fault of material-ui or if we are just retarded */}
                        { generateProfileMenu() }
                    </React.Fragment>
                }
                
            </Toolbar>
        </AppBar>
    );
}

export default NavBar;