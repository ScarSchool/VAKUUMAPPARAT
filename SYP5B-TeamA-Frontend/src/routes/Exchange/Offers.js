import { Button, CircularProgress, Divider, Fab, Grid, TextField, Typography, withStyles, withWidth } from '@material-ui/core';

import React from 'react';

import DraggableDialog from '../../components/DraggableDialog';

import Cookies from 'universal-cookie';
import webHelper from '../../globals/webHelper';
import { Add as AddIcon, Search, ExploreOutlined } from '@material-ui/icons';
import Offer from './OfferDetailView/Offer';
import validateFullRequired from '../../globals/formValidator';
import TagPicker from '../../components/TagPicker';
import OffersSearch from '../../components/OffersSearch';
import StatusBarContext from '../../globals/StatusBarContext';
import AppMessage from '../../globals/AppMessage';
import ReportDemand from './ReportDemand';
import OfferSkeleton from '../../components/OfferSkeleton';
const cookies = new Cookies();

const styles = (theme) => ({
    cat: {
        margin: theme.spacing(),
    },
    catContainer: {
        width: "100%",
    },
    searchContainer: {
        marginTop: theme.spacing(),
    },
    noCategoriesText: {
        marginLeft: theme.spacing(),
        fontStyle: 'italic',
        color: theme.palette.utility.noContent
    },
    fab: {
        margin: theme.spacing(), // You might not need this now
        position: "fixed",
        bottom: theme.spacing(7),
        right: theme.spacing(10)
    },
    numberText: {
        "& input::-webkit-clear-button, & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
            display: "none"
        }
    },
    siteHeading: {
        fontSize: '2rem',
        margin: theme.spacing()
    },
    formText: {
        marginBottom: theme.spacing(),
        marginTop: theme.spacing(2)
    },
    search: {
        fontSize: "2rem"
    },
    loadingContainer: {
        height: '100%',
        flexWrap: 'wrap'
    },
    loadingItem: {
        display: 'flex'
    },
    noCategoriesTextContainer: {
        height: '100%',
        flexWrap: 'wrap'
    },
    selectCatTextContainer: {
        height: '100%'
    }
});

const defaultOffer = {
    title: "",
    description: ""
}

const defaultRequirements = [
    { label: "Price", defaultValue: '' },
    { label: "Location", defaultValue: '' },
    { label: "Level of knowledge", defaultValue: '' },
];

class Offers extends React.Component {

    static contextType = StatusBarContext;
    constructor(props) {
        super(props);

        this.state = {
            offers: [],
            selectedCat: null,
            dialogOpen: false,
            loading: false,
            errors: {},
            createOfferTags: []
        };

        this.categoryForm = {
            name: React.createRef(),
        }

        this.offerForm = {
            title: React.createRef(),
            description: React.createRef(),
            maxAttendees: React.createRef(),
            minAttendees: React.createRef()
        }

        defaultRequirements.forEach(requirement => {
            this.offerForm[requirement.label] = React.createRef();
        });

        this.createOfferForm = this.createOfferForm.bind(this);
        this.onOfferAdd = this.onOfferAdd.bind(this);
        this.handleClickOpenDialog = this.handleClickOpenDialog.bind(this);
        this.onTagsChange = this.onTagsChange.bind(this);
    }

    fetchData(category) {
        this.setState({ loading: true });
        if (!this.state.fetchLock)
            webHelper.getAllOffersOfCategory(cookies.get('token'), category._id).then((offers) => {
                console.debug("DEBUG: Got new offers", offers)
                this.setState({ offers: offers, loading: false });

            }).catch(err => {
                console.error(`Could not retrieve offers for category ${category.name}`);

                this.setState({ loading: false });
                this.context.setMessage(err)
            });

    }

    componentDidUpdate() {
        if (this.props.category && this.props.category !== this.state.selectedCat) {
            this.setState({ selectedCat: this.props.category })
            this.fetchData(this.props.category);
        }
    }

    validateOfferForm(offer) {
        let errors = validateFullRequired(offer);

        if ((isNaN(this.offerForm.minAttendees.current.value)))
            errors.minAttendees = 'MinAttendees has to be an integer!'
        if ((isNaN(this.offerForm.maxAttendees.current.value)))
            errors.maxAttendees = 'MaxAttendees has to be an integer!'

        this.setState({ errors: errors })
        return Object.keys(errors).length === 0;
    }

    onOfferAdd(event) {
        event.preventDefault();

        let requirements = [];

        defaultRequirements.forEach(reqName => {
            let reqValue = this.offerForm[reqName.label].current.value;
            if (reqValue !== '')
                requirements.push({
                    'requirementName': reqName.label,
                    'requirementValue': reqValue
                });
        });

        let newOffer = {
            'title': this.offerForm.title.current.value,
            'description': this.offerForm.description.current.value,
            'tags': this.state.createOfferTags,
            'requirements': requirements,
        };

        if (!this.validateOfferForm(newOffer))
            return;

        newOffer.minAttendees = (this.offerForm.minAttendees.current.value) === '' ? -1 : this.offerForm.minAttendees.current.value;
        newOffer.maxAttendees = (this.offerForm.maxAttendees.current.value) === '' ? -1 : this.offerForm.maxAttendees.current.value;

        webHelper.postOneOfferOfCategory(
            cookies.get('token'),
            this.state.selectedCat._id,
            newOffer
        ).then((offer) => {

            this.context.setMessage(new AppMessage(AppMessage.types.SUCCESS, 'Created offer', 200))
            console.log(`Successfully added offer ${offer.name}`);
            let allOffers = this.state.offers;
            allOffers.push(offer);

            // Resets the value of the textbox so you could instantly add another one

            Object.keys(this.offerForm).forEach(ref => {
                this.offerForm[ref].current.value = '';
            });
            this.setState({
                offers: allOffers,
                dialogOpen: false,
                createOfferTags: [],
            });
        }).catch((err) => {
            console.error(`Got an error while trying to add a category: ${err}`);
            this.context.setMessage(err)
        });
    }

    createOfferForm(classes) {
        return (
            <form onSubmit={this.onOfferAdd}>
                <Divider></Divider>
                <TextField
                    autoFocus
                    margin="dense"
                    id="title"
                    label="Title"
                    type="text"
                    inputRef={this.offerForm.title}
                    error={Boolean(this.state.errors.title)}
                    helperText={this.state.errors.title}
                    defaultValue={defaultOffer.title}
                    fullWidth
                />
                <TextField
                    multiline
                    margin="dense"
                    id="description"
                    label="Description"
                    type="text"
                    defaultValue={defaultOffer.description}
                    inputRef={this.offerForm.description}
                    error={Boolean(this.state.errors.description)}
                    helperText={this.state.errors.description}
                    fullWidth
                />
                <Typography className={classes.formText}>Optional</Typography>
                <Divider></Divider>
                <Grid container spacing={2} >
                    <Grid item xs={6}>
                        <TextField
                            className={classes.numberText}
                            margin="dense"
                            id="maxAttendees"
                            label="Minimum Attendees"
                            type="tel"
                            inputRef={this.offerForm.minAttendees}
                            error={Boolean(this.state.errors.minAttendees)}
                            helperText={this.state.errors.minAttendees}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            className={classes.numberText}
                            margin="dense"
                            id="maxAttendees"
                            label="Maximum Attendees"
                            type="tel"
                            inputRef={this.offerForm.maxAttendees}
                            error={Boolean(this.state.errors.maxAttendees)}
                            helperText={this.state.errors.maxAttendees}
                            fullWidth
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2} >
                    {this.generateRequirementFields(classes)}
                </Grid>
                <TagPicker createMode onChange={this.onTagsChange} />
            </form>
        )
    }

    generateRequirementFields(classes) {
        let requirementsJSX = [];

        defaultRequirements.forEach(requirement => {
            requirementsJSX.push(

                <Grid item xs={6} key={requirement.label}>
                    <TextField
                        className={classes.numberText}
                        margin="dense"
                        id={requirement.label}
                        label={requirement.label}
                        defaultValue={requirement.defaultValue}
                        type="text"
                        inputRef={this.offerForm[requirement.label]}
                        fullWidth
                    />
                </Grid>
            );
        });

        return requirementsJSX;
    }

    onTagsChange(event, value) {

        console.log('values changed')
        this.setState({ createOfferTags: value })
    }

    handleClickOpenDialog() {
        this.setState({
            dialogOpen: true
        })
    }

    generateOfferSkeletons() {
        return [<OfferSkeleton />, <OfferSkeleton />, <OfferSkeleton />]
    }

    render() {
        const { classes } = this.props;

        let JSXOffers = [];
        this.state.offers.forEach((offer) => {

            JSXOffers.push(<Offer forceUpdate={() => { this.fetchData(this.state.selectedCat) }} selectedCat={this.state.selectedCat} offer={offer} key={offer._id} />);
        });

        return (
            <Grid item className={classes.catContainer}>
                {
                    this.state.selectedCat !== null
                        ?
                        <React.Fragment>

                            <React.Fragment>
                                <Grid
                                    container
                                    direction="row"
                                    justify="space-between"
                                    alignItems="center"
                                >
                                    <Grid item>
                                        <Grid
                                            container
                                            direction="row"
                                            justify="flex-start"
                                            alignItems="center"
                                            className={classes.searchContainer}
                                        >
                                            <Grid item>
                                                <Search className={classes.search}></Search>
                                            </Grid>
                                            <Grid item>
                                                <Typography variant="h3" className={classes.siteHeading}>Search offers</Typography>
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    {/* Report Demand */}
                                    <ReportDemand selectedCat={this.state.selectedCat} setNewSelectedCat={(newSelectedCat) => { this.setState({ selectedCat: newSelectedCat }) }} />
                                </Grid>

                                <Divider></Divider>
                                <OffersSearch selectedCat={this.state.selectedCat} setOffers={(offers) => { this.setState({ offers: offers }) }} />

                                <Grid item>
                                    <Typography variant="h3" className={classes.siteHeading}>Tutoring offers</Typography>
                                </Grid>
                                <Grid item>
                                    <Divider></Divider>
                                </Grid>
                                {this.state.loading &&
                                    <Grid
                                        container
                                        direction="column"
                                        justify="center"
                                        alignItems="stretch"
                                    >
                                        <Grid item>
                                            <Grid
                                                container
                                                direction="column"
                                                justify="center"
                                                alignItems="stretch"
                                            >
                                                {this.generateOfferSkeletons()}
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                }
                                {
                                    JSXOffers.length > 0
                                        ?
                                        <React.Fragment>
                                            <Grid
                                                container
                                                direction="column"
                                                justify="center"
                                                alignItems="stretch"
                                            >
                                                <Grid item>
                                                    <Grid
                                                        container
                                                        direction="column"
                                                        justify="center"
                                                        alignItems="stretch"
                                                    >
                                                        {JSXOffers}
                                                    </Grid>
                                                </Grid>
                                            </Grid>

                                        </React.Fragment>
                                        :
                                        <Grid
                                            className={classes.noCategoriesTextContainer}
                                            container
                                            direction="row"
                                            justify="center"
                                            alignItems="center"
                                        >

                                            <Grid item style={{ display: 'flex' }}>
                                                <ExploreOutlined />
                                                <Typography className={classes.noCategoriesText}>
                                                    There are no offers matching your selection.
                                                    </Typography>
                                            </Grid>
                                        </Grid>
                                }

                            </React.Fragment>
                            <Fab onClick={this.handleClickOpenDialog} color="primary" aria-label="add" className={classes.fab}>
                                <AddIcon />
                            </Fab>
                            <DraggableDialog dialogTitle={"Create new Offer"} title="Create new Offer" submitCallback={this.onOfferAdd} noSubmitClose={true} open={this.state.dialogOpen} onClose={() => { this.setState({ dialogOpen: false }) }} >
                                {this.createOfferForm(classes)}
                            </DraggableDialog>
                        </React.Fragment>
                        :
                        <Grid
                            className={classes.selectCatTextContainer}
                            container
                            direction="column"
                            justify="center"
                            alignItems="center">
                            <Grid item>
                                <Typography>You have to select a category to see offers.</Typography>
                            </Grid>
                        </Grid>
                }

            </Grid>
        );
    }
}

export default withStyles(styles)(withWidth()(Offers));
