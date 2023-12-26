import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default function Error403(): JSX.Element {
    return (
        <div className="text-center">
            <h1 className="display-1 font-weight-bold">403</h1>
            <p className="h1">Forbidden</p>
            <p className="h2 font-weight-normal mt-3 mb-4">
                You do not have permission to access this page.
            </p>
            <Button tag={Link} to="/" color="primary" className="btn-shadow btn-wide">
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                Back to Home
            </Button>
        </div>
    );
};