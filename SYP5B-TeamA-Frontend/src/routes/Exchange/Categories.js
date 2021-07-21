import { Grid, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Paper, TextField, withStyles, withWidth } from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import React from 'react';

import validateFullRequired from '../../globals/formValidator';
import webHelper from '../../globals/webHelper';
import Cookies from 'universal-cookie';
import AppMessage from '../../globals/AppMessage';
import StatusBarContext from '../../globals/StatusBarContext'
import { Skeleton } from '@material-ui/lab';
const cookies = new Cookies();

const styles = (theme) => ({
    cat: {
        margin: theme.spacing()
    },

    offer: {
        margin: theme.spacing(),
        padding: theme.spacing()
    }
});

class Categories extends React.Component {

    static contextType = StatusBarContext;

    constructor(props) {
        super(props);

        this.state = {
            categories: [],
            catAddMode: false,
            errors: {},
            loading: false,
        };

        this.categoryForm = {
            name: React.createRef(),
        }

        this.onCategoryAdd = this.onCategoryAdd.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.handleCatSelect = this.handleCatSelect.bind(this);
    }
    componentDidMount() {
        this.fetchData();
    }

    fetchData() {
        this.setState({ loading: true })
        webHelper.getAllCategories(cookies.get('token')).then((newCategories) => {
            console.debug("DEBUG: Got new categories ", newCategories);

            this.setState({
                categories: newCategories,
                loading: false
            });
        }).catch((err) => {
            console.error(`Caught error while getting categories: ${err}`);
            this.context.setMessage(err);
        });
    }

    validateForm(cat) {
        let errors = validateFullRequired(cat);

        this.setState({ errors: errors })
        return Object.keys(errors).length === 0;
    }

    onCategoryAdd(event) {
        event.preventDefault();

        // TODO: What about empty fields?
        let newCategory = { 'name': this.categoryForm.name.current.value };

        if (!this.validateForm(newCategory))
            return

        webHelper.postOneCategory(cookies.get('token'), newCategory).then((cat) => {

            this.context.setMessage(new AppMessage(AppMessage.types.SUCCESS, 'Created category', 201))
            console.log(`Successfully added category ${cat.name}`);
            let allCategories = this.state.categories;
            allCategories.push(cat);

            // Resets the value of the textbox so you could instantly add another one
            this.categoryForm.name.current.value = '';
            this.setState({
                categories: allCategories,
            });
        }).catch((err) => {
            console.error(`Got an error while trying to add a category: ${err}`);
            this.context.setMessage(err)
        });

        this.setState({
            catAddMode: false,
        });
    }

    componentDidUpdate() {
        if (this.props.category && this.props.category._id !== this.state.selectedCat)
            this.setState({ selectedCat: this.props.category._id })
    }

    handleCatSelect(category) {
        this.props.onCategorySelected(category)
        this.setState({ selectedCat: category._id })
    }

    createCardFromCategory(category, classes) {
        return (
            <Paper style={{ cursor: "pointer" }} onClick={() => this.handleCatSelect(category)} className={classes.cat} key={category._id} variant={category._id === this.state.selectedCat ? "outlined" : "elevation"}>
                <ListItem>
                    <ListItemText primary={category.name} />
                </ListItem>
            </Paper>
        )
    }


    render() {
        const { classes, width } = this.props;

        // First entry is there to easily create a category
        let JSXCategories = [
            // <Paper className={classes.cat} key="createCat" >
            //     <form onSubmit={this.onCategoryAdd}>
            //         <ListItem >
            //             <ListItemText autoFocus primary={<TextField placeholder="Create new category" inputRef={this.categoryForm.name} error={Boolean(this.state.errors.name)} helperText={this.state.errors.name} />} />
            //             <ListItemSecondaryAction >
            //                 <IconButton type="submit" edge="end" aria-label="create" onClick={this.onCategoryAdd}>
            //                     <AddIcon />
            //                 </IconButton>
            //             </ListItemSecondaryAction>
            //         </ListItem>
            //     </form>
            // </Paper>
        ];
        if (this.state.loading) {
            let skeletonCats = []
            for (let index = 0; index < 12; index++) {
                skeletonCats.push(
                    <Paper style={{ cursor: "pointer" }} className={classes.cat}  >
                        <ListItem>
                            <Skeleton variant='text' height={24} width={213}> </Skeleton>
                        </ListItem>
                    </Paper>
                )

            }
            return <Grid item style={!['md', 'lg', 'xl'].includes(width) ? { width: "100%" } : { width: "auto" }}>
                <List style={!['md', 'lg', 'xl'].includes(width) ? { width: "auto" } : { width: "max-content" }}>
                    {skeletonCats}
                </List>
            </Grid>
        }
        this.state.categories.forEach((category) => {
            JSXCategories.push(this.createCardFromCategory(category, classes));
        });


        return (
            <Grid item style={!['md', 'lg', 'xl'].includes(width) ? { width: "100%" } : { width: "auto" }}>
                <List style={!['md', 'lg', 'xl'].includes(width) ? { width: "auto" } : { width: "max-content" }}>
                    {JSXCategories}
                </List>
            </Grid>
        );
    }
}

export default withStyles(styles)(withWidth()(Categories));
