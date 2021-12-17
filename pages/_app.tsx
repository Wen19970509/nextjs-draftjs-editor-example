import '../styles/globals.css';
import type { AppProps } from 'next/app';
import React from 'react';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <React.Fragment>
            <Head>
                <link href='https://fonts.googleapis.com/icon?family=Material+Icons' rel='stylesheet' />
            </Head>
            <Component {...pageProps} />
        </React.Fragment>
    );
}

export default MyApp;
