import { Grid, withStyles, TextField, } from '@material-ui/core';

import React from 'react';

import Cookies from 'universal-cookie';
import TagPicker from './TagPicker';
import webHelper from '../globals/webHelper';
import StatusBarContext from '../globals/StatusBarContext';
const cookies = new Cookies();

const styles = (theme) => ({
    searchContainer: {
        padding: theme.spacing()
    },
    offer: {
        margin: theme.spacing(),
        padding: theme.spacing()
    },
    attendeeList: {
        maxHeight: "100%",
        overflow: "auto",
        maxWidth: "30em"
    },
    button: {
        marginTop: theme.spacing(3),
    },
    avatarSmall: {
        width: theme.spacing(4),
        height: theme.spacing(4),
    },
})

function OffersSearch(props) {
    const { setMessage } = React.useContext(StatusBarContext);
    const { classes, setOffers, selectedCat } = props

    const [tags, setTags] = React.useState([]);

    const searchField = React.createRef();

    const onTagsChanged = (event, values) => {
        setTags(values)
        onSearchSubmit(event, values);
    }

    const onSearchSubmit = (e, newTags) => {
        e.preventDefault();

        let userSelection = {
            tags: newTags ? newTags : tags,
            title: searchField.current.value

        };


        webHelper.getSomeOffersOfCategory(cookies.get('token'),
            selectedCat._id,
            userSelection.tags,
            userSelection.title).then((offers) => {
                setOffers(offers);
            }).catch(err => {
                console.error(`Got an error while filtering offers: ${err}`);
                setMessage(err);
            })


        // setOffers(offers)
    }


    return (
        <form onChange={onSearchSubmit}>
            <Grid
                container
                direction="column"
                justify="center"
                className={classes.searchContainer}
            >
                <Grid item>
                    <TextField
                        className={classes.numberText}
                        margin="dense"
                        id="searchText"
                        label="Title"
                        type="text"
                        inputRef={searchField}
                        fullWidth
                    />
                </Grid>
                <Grid item>
                    <TagPicker onChange={onTagsChanged} />
                </Grid>
            </Grid>
        </form>
      )

}

export default withStyles(styles)((OffersSearch))
