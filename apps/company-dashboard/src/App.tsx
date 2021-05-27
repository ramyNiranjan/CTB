/* eslint-disable @typescript-eslint/no-empty-interface */

import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import Dashboard from './pages/dashboard/dashboard';
import { Login } from './pages/login/login';
import Reservation from './pages/reservation/reservation';
import PrivateRoute from './components/private-route';
import PublicRoute from './components/public-route';
import Users from './pages/users/users';
import Tables from './pages/tables/tables';
import ComingSoon from './pages/coming-soon/coming-soon';

interface AppProps {}

export const App: React.FC<AppProps> = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" render={() => <Redirect to="/login" />} />
        <PublicRoute component={Login} path="/login" />
        <PrivateRoute path="/dashboard" component={Dashboard} />
        <PrivateRoute path="/reservation" component={Reservation} />
        <PrivateRoute path="/users" component={Users} />
        <PrivateRoute path="/tables" component={Tables} />
        <PrivateRoute path="/settings" component={ComingSoon} />
        <PrivateRoute path="/support" component={ComingSoon} />
        <PrivateRoute path="/faq" component={ComingSoon} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
