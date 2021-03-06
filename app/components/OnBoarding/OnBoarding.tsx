import React, { Component } from 'react';
import { History } from 'history';
import Grid from '@material-ui/core/Grid';
import { Switch, Route, Redirect } from 'react-router';
import { styled } from '@material-ui/core/styles';


import { GetStarted } from './GetStarted';
import { Intro } from './Intro';
import { BasicSettings } from './BasicSettings/BasicSettings';
import styles from './OnBoarding.css';

import {
    HOME,
    ON_BOARDING_INTRO,
    ON_BOARDING_BASIC_SETTINGS,
    ON_BOARDING
} from '$Constants/routes.json';
import { Stepper } from '$Components/Stepper';
import {
    UserPreferences,
    AppPreferences,
    Preferences,
    LaunchpadState
} from '$Definitions/application.d';

interface Props {
    setAppPreferences: Function;
    triggerSetAsTrayWindow: Function;
    userPreferences: UserPreferences;
    appPreferences: AppPreferences;
    setUserPreferences: Function;
    getUserPreferences: Function;
    isTrayWindow: boolean;
    autoLaunch: Function;
    history?: History;
    location?: Location;
}

export class OnBoarding extends React.Component<Props> {
    componentDidMount() {
        const { triggerSetAsTrayWindow } = this.props;
        triggerSetAsTrayWindow( false );
    }

    completed = () => {
        const {
            userPreferences,
            autoLaunch,
            setAppPreferences,
            triggerSetAsTrayWindow
        } = this.props;

        const appPreferences: AppPreferences = {
            shouldOnboard: false
        };

        setAppPreferences( { shouldOnboard: false } );

        triggerSetAsTrayWindow( userPreferences.pinToMenuBar );

        if ( userPreferences.launchOnStart ) {
            autoLaunch( true );
        }
    };

    handleGetStarted = () => {
        const { history } = this.props;
        history.push( ON_BOARDING_INTRO );
    };

    render() {
        const {
            location,
            history,
            userPreferences,
            setUserPreferences,
            appPreferences,
            isTrayWindow
        } = this.props;

        const isGetStarted = location.pathname === ON_BOARDING;

        if ( !appPreferences.shouldOnboard ) return <Redirect to={HOME} />;

        return (
            <Grid className={styles.Base} container>
                <Grid item xs={12}>
                    <Switch>
                        <Route
                            exact
                            path={ON_BOARDING}
                            component={() => (
                                <GetStarted
                                    onClickGetStarted={this.handleGetStarted}
                                />
                            )}
                        />
                        <Route path={ON_BOARDING_INTRO} component={Intro} />
                        <Route
                            path={ON_BOARDING_BASIC_SETTINGS}
                            render={() => (
                                <BasicSettings
                                    userPreferences={userPreferences}
                                    setUserPreferences={setUserPreferences}
                                    isTrayWindow={isTrayWindow}
                                />
                            )}
                        />
                    </Switch>
                </Grid>
                <Stepper
                    theme={isGetStarted ? 'white' : 'default'}
                    showButtons={!isGetStarted}
                    noElevation={isGetStarted}
                    onFinish={this.completed}
                    steps={[
                        {
                            url: ON_BOARDING
                        },
                        {
                            url: ON_BOARDING_INTRO
                        },
                        {
                            url: ON_BOARDING_BASIC_SETTINGS,
                            nextText: 'Save'
                        }
                    ]}
                />
            </Grid>
        );
    }
}
