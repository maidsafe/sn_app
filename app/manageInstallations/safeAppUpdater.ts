/* eslint no-underscore-dangle: off */
import fs from 'fs';
// import * as cp from 'child_process';
import { spawn, exec, execFile } from 'child_process';

import compareVersions from 'compare-versions';
import { pushNotification } from '$Actions/launchpad_actions';
import { getCommandLineParam } from '$Utils/app_utils';
import { notificationTypes } from '$Constants/notifications';
import { getLocalAppVersion, getInstalledLocation } from './helpers';
import {
    appHasUpdate,
    resetAppUpdateState
} from '$Actions/app_manager_actions';
import { initialAppManager } from '$Reducers/initialAppManager';
import {
    isDryRun,
    isRunningOnLinux,
    isRunningOnWindows,
    isRunningOnMac,
    openAppsInDebugMode,
    useTestPackages
} from '$Constants';
import { logger } from '$Logger';

export class SafeAppUpdater {
    private _store;

    set store( store ) {
        this._store = store;
    }

    checkAppsForUpdate( application ) {
        const newVersion = application.latestVersion;
        const updateNotification = notificationTypes.UPDATE_AVAILABLE(
            application,
            newVersion
        );
        const installPath = getInstalledLocation( application );
        logger.info( `Checking for apps updates` );

        // if ( isDryRun ) {
        //     if (
        //         application.id !==
        //         Object.keys( initialAppManager.applicationList )[0]
        //     ) {
        //         return;
        //     }
        //     this._store.dispatch(
        //         appHasUpdate( {
        //             id: application.id,
        //             hasUpdate: true
        //         } )
        //     );
        //     this._store.dispatch( {
        //         id: Math.random().toString( 36 ),
        //         ...pushNotification( updateNotification )
        //     } );
        //     return;
        // }

        const store = this._store;

        const localVersion = getLocalAppVersion( application, store );

        if ( localVersion ) {
            const comparison = compareVersions.compare(
                newVersion,
                localVersion,
                '>'
            );

            this._store.dispatch(
                appHasUpdate( {
                    id: application.id,
                    hasUpdate: comparison
                } )
            );

            if ( fs.existsSync( installPath ) && comparison ) {
                this._store.dispatch(
                    pushNotification( {
                        id: `${application.packageName}-update-notification`,
                        ...updateNotification
                    } )
                );
            }
        } else {
            this._store.dispatch(
                appHasUpdate( {
                    id: application.id,
                    hasUpdate: false
                } )
            );
        }
    }

    updateApplication( application ) {
        logger.info( `Updating application: ${application}` );
        if ( isDryRun ) {
            logger.info( `DRY RUN: Update application ${application}` );
        }

        const appLocation = getInstalledLocation( application );
        let command = appLocation;

        const newEnvironment = {
            ...process.env,
            NODE_ENV: 'prod',
            HOT: 'false'
        };

        // needs to be actually deleted.
        delete newEnvironment.HOT;

        if ( isRunningOnMac ) {
            command = `open "${command}" -- --args --trigger-update`;

            if ( openAppsInDebugMode ) {
                command = `${command} --debug`;
            }

            logger.info( 'Opening app via path: ', command );

            if ( !isDryRun ) {
                exec( command, {
                    // eslint-disable-next-line unicorn/prevent-abbreviations
                    env: newEnvironment
                } );
            }
        }

        const cmdArguments = ['--trigger-update'];

        if ( openAppsInDebugMode ) {
            cmdArguments.push( '--debug' );
        }

        if ( isRunningOnWindows ) {
            logger.info(
                'Opening on windows via execFile command: ',
                command,
                cmdArguments
            );

            if ( !isDryRun ) {
                execFile( command, [...cmdArguments], {
                    // eslint-disable-next-line unicorn/prevent-abbreviations
                    env: newEnvironment
                } );
            }
        }

        if ( isRunningOnLinux ) {
            logger.info(
                'Opening on linux via spawn command: ',
                command,
                cmdArguments
            );

            if ( !isDryRun ) {
                logger.info( `DRY RUN: Update application ${application}` );
                // exec on linux doesnt give us a new process, so closing SNAPP
                // will close the spawned app :|
                spawn( command, [...cmdArguments], {
                    // eslint-disable-next-line unicorn/prevent-abbreviations
                    env: newEnvironment,
                    detached: true
                } );
            }
        }

        // lets check the app
        const TIME_TILL_UPDATE_ERROR = 900000; // ms  = 15 minutes
        const CHECK_FOR_UPDATED_VERSION_MS = 5000; // ms  = 5s
        let appHasUpdated = false;
        const targetVersion = application.latestVersion;

        const store = this._store;

        let updatedCheckTimeout;
        let updatedVersion: string;

        const checkLocalVersion = setInterval( () => {
            updatedVersion = getLocalAppVersion( application );

            if ( compareVersions.compare( targetVersion, updatedVersion, '=' ) ) {
                appHasUpdated = true;
                // we're done here!
                clearInterval( checkLocalVersion );

                if ( updatedCheckTimeout ) clearTimeout( updatedCheckTimeout );

                logger.info( 'Update successfull' );
                store.dispatch( resetAppUpdateState( application ) );
            }
        }, CHECK_FOR_UPDATED_VERSION_MS );

        updatedCheckTimeout = setTimeout( () => {
            // stop setInterval looping
            logger.verbose(
                'Clearing interval for version check for',
                application.name
            );

            clearInterval( checkLocalVersion );

            if ( !appHasUpdated ) {
                // throw error
                logger.error( 'Error, update timed out' );

                store.dispatch( resetAppUpdateState( application ) );
            }
        }, TIME_TILL_UPDATE_ERROR );
    }
}

export const safeAppUpdater = new SafeAppUpdater();
