import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import { Root } from './pages/Root';
import { configureStore, history } from './store/configureStore';
import 'typeface-roboto/index.css';
import './app.global.css';

const store = configureStore();
declare const document;

render(
    <AppContainer>
        <Root store={store} history={history} />
    </AppContainer>,
    document.getElementById( 'root' )
);
if ( module.hot ) {
    module.hot.accept( './pages/Root', () => {
        // eslint-disable-next-line global-require
        const NextRoot = require( './pages/Root' ).default;
        render(
            <AppContainer>
                <NextRoot store={store} history={history} />
            </AppContainer>,
            document.getElementById( 'root' )
        );
    } );
}
