import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';

import './css/text-format.css'
import './css/index.css'
import './css/App.css'
import App from './routes/App';
import { StatusBarContextProvider } from './globals/StatusBarContext';
import ErrorBoundary from './globals/ErrorBoundary';
import { SnackbarProvider } from 'notistack';
import theme from './configs/theme'
import { MuiThemeProvider } from '@material-ui/core';

document.title = 'VAKUUMAPPARAT'

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <StatusBarContextProvider>
      <SnackbarProvider
        maxSnack={3}>
        <ErrorBoundary  >
          <App />
        </ErrorBoundary>

      </SnackbarProvider>

    </StatusBarContextProvider>
  </MuiThemeProvider>
  ,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
