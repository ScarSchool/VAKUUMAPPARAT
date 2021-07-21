import React, { useState } from 'react';
import webHelper from '../../globals/webHelper';

import Cookies from 'universal-cookie';
import StatusBarContext from '../../globals/StatusBarContext';
import Offer from '../Exchange/OfferDetailView/Offer';
import OfferSkeleton from '../../components/OfferSkeleton';
const cookies = new Cookies();
// import { Redirect } from 'react-router-dom';

function TypedOfferList(props) {
    const { setMessage } = React.useContext(StatusBarContext)
    const { offerId, selectedCatId, reload } = props;
    const [offer, setOffer] = React.useState(null)
    const [loading, setLoading] = React.useState(false);

    useState(() => {
        setLoading(true)
        webHelper.getOneOfferOfCategory(cookies.get('token'), selectedCatId, offerId).then((resOffer) => {
            setLoading(false)
            setOffer(resOffer)
        }).catch(err => setMessage(err))
    }, [offerId, selectedCatId])

    return <React.Fragment>
        {
            offer !== null && !loading ?
            <Offer offer={offer} selectedCat={{_id: selectedCatId}} forceUpdate={reload} />
            :
            <OfferSkeleton id={offerId} />
        }
    </React.Fragment>

}



export default (TypedOfferList);