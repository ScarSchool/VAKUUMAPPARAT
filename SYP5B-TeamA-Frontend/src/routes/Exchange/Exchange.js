import React, { useEffect } from 'react';
import { Grid, withStyles, withWidth } from '@material-ui/core';

import Categories from './Categories';
import Offers from './Offers';
import { useParams } from 'react-router';
import webHelper from '../../globals/webHelper';

import Cookies from 'universal-cookie';
import StatusBarContext from '../../globals/StatusBarContext';
const cookies = new Cookies();

const styles = (theme) => ({
    exchangeContainer: {
        height: '100%'
    }
});

function Exchange(props) {

    const { categoryId } = useParams();
    const { width, classes } = props;
    const [ category, setCategory ] = React.useState(null);
    const { setMessage } = React.useContext(StatusBarContext);

    const onCategorySelected = (cat) => {
        setCategory(cat)
    }

    // eslint-disable-next-line
    useEffect(() => {
        if (categoryId){
            webHelper.getOneCategory(cookies.get('token'), categoryId).then((category) => {
                onCategorySelected(category)
            }).catch(err => setMessage(err))
        }
    }, [categoryId, setMessage])

    return (
        <React.Fragment>
            <Grid
                container
                direction="row"
                justify="flex-start"
                alignItems="stretch"
                wrap={['md', 'lg', 'xl'].includes(width) ? "nowrap" : "wrap"}
                className={classes.exchangeContainer}>
                <Categories onCategorySelected={onCategorySelected} category={category}/>
                <Offers category={category} />
            </Grid>
        </React.Fragment>
    );
}

export default withStyles(styles)(withWidth()(Exchange));
