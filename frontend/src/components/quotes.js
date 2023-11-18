import React from 'react';
import { skeletonList } from './skeletons';

const Quotes = (props) => {
    console.log(props.props.height);


    return (
        <>
            {skeletonList()}

        </>

    );
};

export default Quotes;
