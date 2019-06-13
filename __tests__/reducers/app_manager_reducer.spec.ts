import { appManager, initialState } from '$Reducers/app_manager_reducer';
import { TYPES } from '$Actions/app_manager_actions';
import { generateRandomString } from '$Utils/app_utils';
import { ERRORS } from '$Constants/index';

const getApp = () => ( {
    id: generateRandomString(),
    name: 'Safe Browser',
    isInstalling: false,
    isUpdating: false,
    isUninstalling: false,
    hasUpdate: false,
    lastSkippedVersion: null,
    error: null,
    progress: null
} );

describe( 'app manager reducer', () => {
    it( 'should return the initial state', () => {
        expect( appManager( undefined, {} ) ).toEqual( initialState );
    } );

    describe( 'FETCH_APPS', () => {
        it( 'Should add apps to store on fetch success', () => {
            const applicationList = [];
            const app1 = getApp();
            const app2 = getApp();
            app2.name = 'Safe Wallet';
            applicationList.push( app1 );
            applicationList.push( app2 );

            expect(
                Object.keys(
                    appManager( undefined, {
                        type: `${TYPES.FETCH_APPS}_SUCCESS`,
                        payload: {
                            applicationList
                        }
                    } ).applicationList
                ).length
            ).toEqual( 2 );
        } );

        it( 'Should throw if application has no ID', () => {
            const applicationList = [];
            const app1 = getApp();
            app1.name = 'Safe Browser';
            delete app1.id;
            applicationList.push( app1 );

            expect( () =>
                appManager( undefined, {
                    type: `${TYPES.FETCH_APPS}_SUCCESS`,
                    payload: {
                        applicationList
                    }
                } )
            ).toThrow( ERRORS.APP_ID_NOT_FOUND );
        } );
    } );

    describe( 'INSTALL_APP', () => {
        const applicationList = [];
        const app1 = getApp();
        app1.name = 'Safe Browser';
        applicationList.push( app1 );
        let store = null;

        beforeEach( () => {
            store = appManager( undefined, {
                type: `${TYPES.FETCH_APPS}_SUCCESS`,
                payload: {
                    applicationList
                }
            } );
        } );

        it( 'Should set application to installing', () => {
            const appId = applicationList[0].id;
            const nextStore = appManager( store, {
                type: `${TYPES.INSTALL_APP}_PENDING`,
                payload: {
                    appId
                }
            } );
            expect( nextStore.applicationList[appId].isInstalling ).toBeTruthy();
            expect( nextStore.applicationList[appId] ).not.toEqual(
                store.applicationList[appId]
            );
        } );

        it( 'Should return previous store if application not found', () => {
            expect(
                appManager( store, {
                    type: `${TYPES.INSTALL_APP}_PENDING`,
                    payload: {}
                } )
            ).toEqual( store );
        } );

        it( 'Should update progress on installation', () => {
            const appId = applicationList[0].id;
            expect(
                appManager( store, {
                    type: `${TYPES.INSTALL_APP}_PENDING`,
                    payload: {
                        appId,
                        progress: 89
                    }
                } ).applicationList[appId].progress
            ).toEqual( 89 );
        } );

        it( 'Should reset app installation on success', () => {
            const appId = applicationList[0].id;
            let nextStore = appManager( store, {
                type: `${TYPES.INSTALL_APP}_PENDING`,
                payload: {
                    appId
                }
            } );

            nextStore = appManager( nextStore, {
                type: `${TYPES.INSTALL_APP}_SUCCESS`,
                payload: {
                    appId
                }
            } );
            expect( nextStore.applicationList[appId].progress ).toEqual( 100 );
            expect( nextStore.applicationList[appId].isInstalling ).toBeFalsy();
        } );

        it( "Should return previous store if couldn't find app on app installation success", () => {
            const appId = applicationList[0].id;
            const nextStore = appManager( store, {
                type: `${TYPES.INSTALL_APP}_PENDING`,
                payload: {
                    appId
                }
            } );
            expect(
                appManager( nextStore, {
                    type: `${TYPES.INSTALL_APP}_SUCCESS`,
                    payload: {}
                } )
            ).toEqual( nextStore );
        } );

        it( 'Should stop installation on failure', () => {
            const appId = applicationList[0].id;
            const installationError = new Error( 'Unable to install' );

            let nextStore = appManager( store, {
                type: `${TYPES.INSTALL_APP}_PENDING`,
                payload: {
                    appId,
                    progress: 86
                }
            } );
            nextStore = appManager( nextStore, {
                type: `${TYPES.INSTALL_APP}_FAILURE`,
                payload: {
                    appId,
                    error: installationError
                }
            } );
            expect( nextStore.applicationList[appId].isInstalling ).toBeFalsy();
            expect( nextStore.applicationList[appId].progress ).toEqual( 0 );
            expect( nextStore.applicationList[appId].error ).not.toBeNull();
        } );

        it( "Should return previous store if couldn't find app on app installation failure", () => {
            const appId = applicationList[0].id;
            const installationError = new Error( 'Unable to install' );

            const nextStore = appManager( store, {
                type: `${TYPES.INSTALL_APP}_PENDING`,
                payload: {
                    appId,
                    progress: 86
                }
            } );
            expect(
                appManager( nextStore, {
                    type: `${TYPES.INSTALL_APP}_FAILURE`,
                    payload: {}
                } )
            ).toEqual( nextStore );
        } );
    } );

    describe( 'CANCEL_APP_INSTALLATION', () => {
        it( 'Should cancel app installation', () => {
            const app = getApp();
            const appId = app.id;
            app.isInstalling = true;
            const store = {
                applicationList: {
                    [appId]: { ...app }
                }
            };
            const nextStore = appManager( store, {
                type: TYPES.CANCEL_APP_INSTALLATION,
                payload: {
                    appId
                }
            } );
            expect( nextStore.applicationList[appId].isInstalling ).toBeFalsy();
            expect( nextStore.applicationList[appId].progress ).toEqual( 0 );
            expect( nextStore.applicationList[appId] ).not.toEqual(
                store.applicationList[appId]
            );
        } );

        it( "Should return previous store if couldn't find app on app install cancellation", () => {
            const app = getApp();
            app.isInstalling = true;
            const appId = app.id;
            const store = {
                applicationList: {
                    [appId]: { ...app }
                }
            };
            expect(
                appManager( store, {
                    type: TYPES.CANCEL_APP_INSTALLATION,
                    payload: {}
                } )
            ).toEqual( store );
        } );
        it( 'Should return previous store if app not installing', () => {
            const progress = 76;
            const app = getApp();
            app.progress = progress;
            const appId = app.id;
            const store = {
                applicationList: {
                    [appId]: { ...app }
                }
            };
            expect(
                appManager( store, {
                    type: TYPES.CANCEL_APP_INSTALLATION,
                    payload: {
                        appId
                    }
                } ).applicationList[appId].isInstalling
            ).toBeFalsy();
        } );
    } );

    describe( 'PAUSE_APP_INSTALLATION', () => {
        it( 'Should pause app installation', () => {
            const progress = 76;
            const app = getApp();
            app.isInstalling = true;
            app.progress = progress;
            const appId = app.id;
            const store = {
                applicationList: {
                    [appId]: { ...app }
                }
            };
            const nextStore = appManager( store, {
                type: TYPES.PAUSE_APP_INSTALLATION,
                payload: {
                    appId
                }
            } );

            expect( nextStore.applicationList[appId].isInstalling ).toBeFalsy();
            expect( nextStore.applicationList[appId].progress ).toEqual( progress );
            expect( nextStore.applicationList[appId] ).not.toEqual(
                store.applicationList[appId]
            );
        } );

        it( "Should return previous store if couldn't find app on pausing app install", () => {
            const progress = 76;
            const app = getApp();
            app.isInstalling = true;
            app.progress = progress;
            const appId = app.id;
            const store = {
                applicationList: {
                    [appId]: { ...app }
                }
            };
            expect(
                appManager( store, {
                    type: TYPES.PAUSE_APP_INSTALLATION,
                    payload: {}
                } )
            ).toEqual( store );
        } );
        it( 'Should return previous store if app not installing', () => {
            const progress = 76;
            const app = getApp();
            app.progress = progress;
            const appId = app.id;
            const store = {
                applicationList: {
                    [appId]: { ...app }
                }
            };
            expect(
                appManager( store, {
                    type: TYPES.PAUSE_APP_INSTALLATION,
                    payload: {
                        appId
                    }
                } ).applicationList[appId].isInstalling
            ).toBeFalsy();
        } );
    } );

    describe( 'RETRY_APP_INSTALLATION', () => {
        it( 'Should retry app installation', () => {
            const progress = 76;
            const app = getApp();
            app.progress = progress;
            const appId = app.id;
            const store = {
                applicationList: {
                    [appId]: { ...app }
                }
            };
            const nextStore = appManager( store, {
                type: TYPES.RETRY_APP_INSTALLATION,
                payload: {
                    appId
                }
            } );
            expect( nextStore.applicationList[appId].isInstalling ).toBeTruthy();
            expect( nextStore.applicationList[appId] ).not.toEqual(
                store.applicationList[appId]
            );
        } );
        it( "Should return previous store if couldn't find app on retry installation", () => {
            const progress = 76;
            const app = getApp();
            app.progress = progress;
            const appId = app.id;
            const store = {
                applicationList: {
                    [appId]: { ...app }
                }
            };
            expect(
                appManager( store, {
                    type: TYPES.RETRY_APP_INSTALLATION,
                    payload: {}
                } )
            ).toEqual( store );
        } );
        it( 'Should return previous store if app already in installation', () => {
            const progress = 76;
            const app = getApp();
            app.isInstalling = true;
            app.progress = progress;
            const appId = app.id;
            const store = {
                applicationList: {
                    [appId]: { ...app }
                }
            };
            expect(
                appManager( store, {
                    type: TYPES.RETRY_APP_INSTALLATION,
                    payload: {
                        appId
                    }
                } ).applicationList[appId].isInstalling
            ).toBeTruthy();
        } );
    } );

    describe( 'UNINSTALL_APP', () => {
        it( 'Should uninstall app', () => {
            const progress = 76;
            const app = getApp();
            app.progress = progress;
            const appId = app.id;
            const store = {
                applicationList: {
                    [appId]: { ...app }
                }
            };
            const nextStore = appManager( store, {
                type: `${TYPES.UNINSTALL_APP}_PENDING`,
                payload: {
                    appId
                }
            } );
            expect(
                nextStore.applicationList[appId].isUninstalling
            ).toBeTruthy();
            expect( nextStore.applicationList[appId] ).not.toEqual(
                store.applicationList[appId]
            );
        } );
        it( "Should return previous store if couldn't find app on uninstall", () => {
            const progress = 76;
            const app = getApp();
            app.progress = progress;
            const appId = app.id;
            const store = {
                applicationList: {
                    [appId]: { ...app }
                }
            };
            expect(
                appManager( store, {
                    type: `${TYPES.UNINSTALL_APP}_PENDING`,
                    payload: {}
                } )
            ).toEqual( store );
        } );
        it( 'Should finish app uninstallation', () => {
            const progress = 76;
            const app = getApp();
            app.progress = progress;
            app.isUninstalling = true;
            const appId = app.id;
            const store = {
                applicationList: {
                    [appId]: { ...app }
                }
            };
            expect(
                appManager( store, {
                    type: `${TYPES.UNINSTALL_APP}_SUCCESS`,
                    payload: {
                        appId
                    }
                } ).applicationList[appId].isUninstalling
            ).toBeFalsy();
        } );
        it( "Should return previous store if couldn't find app on finishing uninstall", () => {
            const progress = 76;
            const app = getApp();
            app.progress = progress;
            const appId = app.id;
            const store = {
                applicationList: {
                    [appId]: { ...app }
                }
            };
            expect(
                appManager( store, {
                    type: `${TYPES.UNINSTALL_APP}_SUCCESS`,
                    payload: {}
                } )
            ).toEqual( store );
        } );
    } );

    describe( 'UPDATE_APP', () => {
        it( 'Should update app', () => {
            const progress = 20;
            const app = getApp();
            app.progress = progress;
            const appId = app.id;
            const store = {
                applicationList: {
                    [appId]: { ...app }
                }
            };
            const nextStore = appManager( store, {
                type: `${TYPES.UPDATE_APP}_PENDING`,
                payload: {
                    appId,
                    progress
                }
            } );

            expect( nextStore.applicationList[appId].isUpdating ).toBeTruthy();
            expect( nextStore.applicationList[appId].progress ).toEqual( progress );
        } );
        it( "Should return previous store if couldn't find app on updating", () => {
            const progress = 20;
            const app = getApp();
            app.progress = progress;
            const appId = app.id;
            const store = {
                applicationList: {
                    [appId]: { ...app }
                }
            };
            expect(
                appManager( store, {
                    type: `${TYPES.UPDATE_APP}_PENDING`,
                    payload: {}
                } )
            ).toEqual( store );
        } );
        it( 'Should finish app updating', () => {
            const progress = 20;
            const app = getApp();
            app.isUpdating = true;
            app.progress = progress;
            const appId = app.id;
            const store = {
                applicationList: {
                    [appId]: { ...app }
                }
            };
            const nextStore = appManager( store, {
                type: `${TYPES.UPDATE_APP}_SUCCESS`,
                payload: {
                    appId,
                    progress
                }
            } );

            expect( nextStore.applicationList[appId].isUpdating ).toBeFalsy();
            expect( nextStore.applicationList[appId].progress ).toEqual( 100 );
        } );

        it( "Should return previous store if couldn't find app on finishing update", () => {
            const progress = 80;
            const app = getApp();
            app.progress = progress;
            app.isUpdating = true;
            const appId = app.id;
            const store = {
                applicationList: {
                    [appId]: { ...app }
                }
            };
            expect(
                appManager( store, {
                    type: `${TYPES.UPDATE_APP}_SUCCESS`,
                    payload: {}
                } )
            ).toEqual( store );
        } );

        it( 'Should stop updating on failure', () => {
            const progress = 80;
            const app = getApp();
            app.isUpdating = true;
            app.progress = progress;
            const appId = app.id;
            const store = {
                applicationList: {
                    [appId]: { ...app }
                }
            };
            const nextStore = appManager( store, {
                type: `${TYPES.UPDATE_APP}_FAILURE`,
                payload: {
                    appId,
                    progress,
                    error: new Error( 'Failed to update' )
                }
            } );
            expect( nextStore.applicationList[appId].isUpdating ).toBeFalsy();
            expect( nextStore.applicationList[appId].progress ).toEqual( 0 );
            expect( nextStore.applicationList[appId].error ).not.toBeNull();
        } );
    } );

    describe( 'SKIP_APP_UPDATE', () => {
        it( 'Should skip app from updating', () => {
            const newVersion = '0.12.0';
            const app = getApp();
            const appId = app.id;
            const store = {
                applicationList: {
                    [appId]: { ...app }
                }
            };
            expect(
                appManager( store, {
                    type: TYPES.SKIP_APP_UPDATE,
                    payload: {
                        appId,
                        version: newVersion
                    }
                } ).applicationList[appId].lastSkippedVersion
            ).toEqual( newVersion );
        } );

        it( "Should return previous store if couldn't find app on skipping update", () => {
            const newVersion = '0.12.0';
            const app = getApp();
            const appId = app.id;
            const store = {
                applicationList: {
                    [appId]: { ...app }
                }
            };
            expect(
                appManager( store, {
                    type: TYPES.SKIP_APP_UPDATE,
                    payload: {
                        version: newVersion
                    }
                } )
            ).toEqual( store );
        } );
        it( 'Should throw if version to skip not found', () => {
            const newVersion = '0.12.0';
            const app = getApp();
            const appId = app.id;
            const store = {
                applicationList: {
                    [appId]: { ...app }
                }
            };
            expect( () =>
                appManager( store, {
                    type: TYPES.SKIP_APP_UPDATE,
                    payload: {
                        appId
                    }
                } )
            ).toThrow( ERRORS.VERSION_NOT_FOUND );
        } );
    } );

    describe( 'RESET_APP_STATE', () => {
        it( 'Should reset app state', () => {
            const app = getApp();
            const appId = app.id;
            app.isUpdating = true;
            app.isInstalling = true;
            app.isUninstalling = true;
            app.progress = 89;
            app.error = new Error( 'Invalid property' );
            const store = {
                applicationList: {
                    [appId]: { ...app }
                }
            };
            const nextStore = appManager( store, {
                type: TYPES.RESET_APP_STATE,
                payload: {
                    appId
                }
            } );

            expect( nextStore.applicationList[appId].isInstalling ).toBeFalsy();
            expect( nextStore.applicationList[appId].isUninstalling ).toBeFalsy();
            expect( nextStore.applicationList[appId].isUpdating ).toBeFalsy();
            expect( nextStore.applicationList[appId].error ).toEqual( null );
            expect( nextStore.applicationList[appId].progress ).toEqual( null );
        } );

        it( "Should return previous store if couldn't find app on skipping update", () => {
            const app = getApp();
            const appId = app.id;
            const store = {
                applicationList: {
                    [appId]: { ...app }
                }
            };
            expect(
                appManager( store, {
                    type: TYPES.RESET_APP_STATE,
                    payload: {}
                } )
            ).toEqual( store );
        } );
    } );
} );
