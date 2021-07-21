import { Chip, withStyles, TextField, ListItem, CircularProgress } from '@material-ui/core';

import React from 'react';


import Cookies from 'universal-cookie';
import { Autocomplete } from '@material-ui/lab';
import webHelper from '../globals/webHelper';
import { difference } from 'underscore';
import StatusBarContext from '../globals/StatusBarContext';
const cookies = new Cookies();

const styles = (theme) => ({
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

const title = "Tags";

function TagPicker(props) {
    const { setMessage } = React.useContext(StatusBarContext);
    const { defaultTags, onChange, noOptionsText, createMode } = props;

    const [tags, setTags] = React.useState([]);
    const [loading, setLoading] = React.useState([]);
    const doRefresh = React.useState()[1];

    const autocompleteInput = React.createRef();

    const getTags = () => {
        setLoading(true);

        webHelper.getAllTags(cookies.get('token')).then((newTags) => {
            let tagStrings = [];
            newTags.forEach((tag) => {
                tagStrings.push(tag.name);
            });

            let diffTags = difference(tags, tagStrings);

            setTags(tagStrings.concat(diffTags));
            setLoading(false)
        }).catch(err => {
            setLoading({ loading: false }, () => { setMessage(err) });
            doRefresh();
        });
    }

    const createNewTag = () => {
        tags.push(autocompleteInput.current.value)

        setTags(tags)
        autocompleteInput.current.focus();
    }

    const generateNoOptionsText = () => {
        if (createMode)
            return (
                <ListItem
                    fullWidth
                    alignItems="flex-start"
                    button
                    dense
                    selected
                    onClick={createNewTag}
                >
                    Create new tag
                </ListItem>
            )

        if (noOptionsText)
            return noOptionsText;

        return 'No matches'
    }

    return (
        <Autocomplete
            multiple
            options={tags}
            getOptionLabel={(tag) => { return tag }}
            id="tags"
            debug
            loading={
                Boolean(loading)
            }
            loadingText={
                <CircularProgress />
            }
            defaultValue={defaultTags}

            noOptionsText={
                generateNoOptionsText()
            }
            renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => (
                    <Chip
                        label={option}
                        color="secondary"
                        size="small"
                        {...getTagProps({ index })}
                    />
                ))
            }
            onChange={onChange}
            renderInput={(params) => <TextField inputRef={autocompleteInput} {...params} onFocus={getTags} title={title} label={title} margin="normal" />}
        />
    )
}

export default withStyles(styles)((TagPicker))
