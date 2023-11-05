import React from "react";
import ReactDOM from "react-dom";
import reportWebVitals from './reportWebVitals';
import { Container, Header } from 'semantic-ui-react'

import pkg from 'semantic-ui-react/package.json'
import App from "./App";

const AppContainer = ({ children }) => (
  <Container fluid style={{ padding: 20 }}>
    {children}
  </Container>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AppContainer>
        <React.StrictMode>
        <App />
      </React.StrictMode>
  </AppContainer>
);

reportWebVitals();
