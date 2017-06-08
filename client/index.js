import './index.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory, IndexRoute, IndexRedirect } from 'react-router';
import store from './store';
import { Main, Login, Signup, UserHome, Users } from './components';
import { me } from './reducer/user';
import axios from 'axios';


import App from './components/App';

import ProductsContainer from './containers/ProductsContainer';
import ProductContainer from './containers/ProductContainer';
import UsersContainer from './containers/UsersContainer';
import UserContainer from './containers/UserContainer';

import { receiveProducts, getProductById, loadAllProducts } from './action-creators/products';

import {getAllUsers} from './reducer/users'
import {setUser} from './reducer/user'

const whoAmI = store.dispatch(me());

const requireLogin = (nextRouterState, replace, next) =>
  whoAmI
    .then(() => {
      const { user } = store.getState();
      if (!user.id) replace('/login');
      next();
    })
    .catch(err => console.log(err));

const onAppEnter = () => {
  console.log('hit onAppEnter')
  const gettingProducts = axios.get('/api/products');


  return Promise
    .all([gettingProducts])
    .then(responses => responses.map(res => res.data))
    .then(([products]) => {
      store.dispatch(receiveProducts(products));
    })
    .catch(err => console.log(err));
};

const onUsersEnter = () => {
  store.dispatch(getAllUsers())
}

const onUserEnter = (nextRouterState) => {
  const userId = nextRouterState.params.userId;
  store.dispatch(setUser(userId));
}

ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/" component={App} onEnter={onAppEnter}>
        <Route path="/products" component={ProductsContainer} />
        <Route path="/products/1" component={ProductContainer} />
        <Route path ="/users" component = {UsersContainer} onEnter = {onUsersEnter}/>
        <Route path = "/users/:userId" component = {UserContainer} onEnter = {onUserEnter}/>
        <IndexRedirect to="/products" />
      </Route>
      {/*<Route path="/" component={Main}>
        <IndexRoute component={Login} />
        <Route path="login" component={Login} />
        <Route path="signup" component={Signup} />
        <Route onEnter={requireLogin}>
          <Route path="home" component={UserHome} />
        </Route>
      </Route>*/}
    </Router>
  </Provider>,
  document.getElementById('app')
);
