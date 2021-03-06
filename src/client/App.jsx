import React from "react";
import { hot } from "react-hot-loader/root";
import { BrowserRouter as Router } from "react-router-dom";
import { ApolloProvider } from "react-apollo";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { StyleSheet, css } from "aphrodite";

import AppRoutes from "../routes";
import ApolloClientSingleton from "../network/apollo-client-singleton";
import muiTheme from "../styles/mui-theme";
import theme from "../styles/theme";
import VersionNotifier from "./VersionNotifier";

const styles = StyleSheet.create({
  root: {
    ...theme.text.body,
    height: "100%"
  }
});

const App = () => (
  <ApolloProvider client={ApolloClientSingleton}>
    <MuiThemeProvider muiTheme={muiTheme}>
      <div className={css(styles.root)}>
        <VersionNotifier />
        <Router>
          <AppRoutes />
        </Router>
      </div>
    </MuiThemeProvider>
  </ApolloProvider>
);

export default hot(App);
