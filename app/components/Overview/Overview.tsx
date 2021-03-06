import React, { Component } from 'react';
import { Grid, List, Typography } from '@material-ui/core';
import { Redirect } from 'react-router';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Fab from '@material-ui/core/Fab';
import LockIcon from '@material-ui/icons/Lock';

import styles from './Overview.css';

import { notificationTypes } from '$Constants/notifications';
import { isCI } from '$Constants';
import { logger } from '$Logger';
import { App, AppManagerState } from '$Definitions/application.d';
import { Deck } from '$Components/Deck';
import { ApplicationOverview } from '$Components/ApplicationOverview';
import { ON_BOARDING, HOME, ACCOUNT_LOGIN } from '$Constants/routes.json';

interface Props {
    unInstallApp: Function;
    openApp: Function;
    pauseDownload: Function;
    resetAppInstallationState: Function;
    cancelDownload: Function;
    pushNotification: Function;
    resumeDownload: Function;
    downloadAndInstallApp: Function;
    installApp: Function;
    updateApp: Function;
    history: {
        push: Function;
    };
    appPreferences: {
        shouldOnboard: boolean;
    };
    appList: {
        app: App;
    };
    triggerSetAsTrayWindow: Function;
    isTrayWindow: boolean;
    isLoggedIn: boolean;
    authDIsInstalled: boolean;
}

export class Overview extends Component<Props> {
    loadApps = () => {
        const {
            appList,
            unInstallApp,
            downloadAndInstallApp,
            pauseDownload,
            resetAppInstallationState,
            cancelDownload,
            pushNotification,
            resumeDownload,
            updateApp,
            openApp,
            history
        } = this.props;
        return (
            <Grid container className={styles.container}>
                <Typography variant="body2" className={styles.listHeader}>
                    Apps & Utilities
                </Typography>
                <Grid item xs={12}>
                    <List>
                        {Object.values( appList ).map( ( theApplication ) => (
                            <ApplicationOverview
                                key={theApplication.name}
                                // {...theApplication}
                                history={history}
                                application={theApplication}
                                downloadAndInstallApp={downloadAndInstallApp}
                                unInstallApp={unInstallApp}
                                resetAppInstallationState={
                                    resetAppInstallationState
                                }
                                openApp={openApp}
                                updateApp={updateApp}
                                pauseDownload={pauseDownload}
                                cancelDownload={cancelDownload}
                                pushNotification={pushNotification}
                                resumeDownload={resumeDownload}
                            />
                        ) )}
                    </List>
                </Grid>
                {
                    // TODO: If not logged in change header or?
                }
            </Grid>
        );
    };

    handleLogIn = () => {
        const { history } = this.props;
        history.push( ACCOUNT_LOGIN );
    };

    render() {
        const {
            triggerSetAsTrayWindow,
            isTrayWindow,
            appPreferences,
            isLoggedIn,
            authDIsInstalled
        } = this.props;

        if ( appPreferences.shouldOnboard ) return <Redirect to={ON_BOARDING} />;

        const shouldShowLogin = isCI || ( !isLoggedIn && authDIsInstalled );

        return (
            <div className={styles.container} data-tid="container">
                {shouldShowLogin && (
                    <div className={styles.loginNote}>
                        {
                            // <Typography variant="body2">
                            // Your Safe Account
                            // </Typography>
                            // <Typography variant="body1">
                            // Securely access you SAFE Network Account
                            // </Typography>
                        }
                        <Fab
                            className={styles.loginButton}
                            color="secondary"
                            variant="extended"
                            aria-label="Login Button"
                            onClick={this.handleLogIn}
                        >
                            <LockIcon />
                            Log In
                        </Fab>
                    </div>
                )}
                <span data-istraywindow={isTrayWindow} />
                {this.loadApps()}
                {
                    // <Deck />
                }
            </div>
        );
    }
}
