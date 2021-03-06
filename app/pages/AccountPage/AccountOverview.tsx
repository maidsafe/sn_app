import React from 'react';
import { Grid, List, Typography } from '@material-ui/core';
import { withRouter } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';

import styles from './Account.css';

import { logger } from '$Logger';
import {
    ACCOUNT_CREATE,
    ACCOUNT_CREATE_REDEEM,
    ACCOUNT_INVITES_GET,
    ACCOUNT_INVITES_EARN,
    ACCOUNT_INVITES_REQUEST
} from '$Constants/routes.json';

// Whatever you expect in 'this.props.match.params.*'
type PathParamsType = {};

type ProtoAccountOverviewProps = RouteComponentProps<PathParamsType> & {
    history: { push: Function };
    isLoggedIn?: boolean;
};

export const ProtoAccountOverview = ( props: ProtoAccountOverviewProps ) => {
    const { history } = props;

    return (
        <div>
            <Card // TODO move to css
                style={{ maxWidth: 250 }}
            >
                <CardActionArea
                    aria-label="Get Invite"
                    onClick={() => {
                        logger.info( 'Get an invite clicked' );
                        history.push( ACCOUNT_INVITES_GET );
                    }}
                >
                    <CardContent>
                        <Typography
                            gutterBottom
                            variant="h3"
                            // component="h2"
                        >
                            Get An Invite
                        </Typography>
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            component="p"
                        >
                            Request an invite from a friend....
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
            <Card
                // TODO move to css
                style={{ maxWidth: 250 }}
            >
                <CardActionArea
                    aria-label="Request Invite"
                    onClick={() => {
                        logger.info( 'Request an invite clicked' );
                        history.push( ACCOUNT_INVITES_REQUEST );
                    }}
                >
                    <CardContent>
                        <Typography
                            gutterBottom
                            variant="h3"
                            // component="h2"
                        >
                            Request an invite
                        </Typography>
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            component="p"
                        >
                            Ask the community for an invite to get started
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
            <Card // TODO move to css
                style={{ maxWidth: 250 }}
            >
                <CardActionArea
                    aria-label="Earn Invite"
                    onClick={() => {
                        logger.info( 'Earn account invite clicked' );
                        history.push( ACCOUNT_INVITES_EARN );
                    }}
                >
                    <CardContent>
                        <Typography
                            gutterBottom
                            variant="h3"
                            // component="h2"
                        >
                            Earn one Yourself
                        </Typography>
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            component="p"
                        >
                            use your computer to earn safecoins
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
            <Typography
                aria-label="IAlreadyHaveInvite"
                variant="body2"
                onClick={() => {
                    logger.info( 'Already have invite clicked' );
                    history.push( ACCOUNT_CREATE_REDEEM );
                }}
            >
                I already have an invite
            </Typography>
        </div>
    );
};

export const AccountOverview = withRouter( ProtoAccountOverview );
