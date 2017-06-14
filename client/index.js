

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
import OrdersContainer from './containers/OrdersContainer';
import OrderContainer from './containers/OrderContainer';
import CartContainer from './containers/CartContainer';
import AddProductContainer from './containers/AddProductContainer'

import { receiveProducts, getProductById, loadAllProducts } from './action-creators/products';
import { getOrdersByUserId, getOrderById, getOrderProductsByOrderId } from './action-creators/orders';
import {getAllUsers} from './reducer/users'
import {setUser} from './reducer/user'
import {setUserToView} from './action-creators/vieweduser';
import { getReviewsByProductId } from './action-creators/reviews';

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
  const gettingProducts = axios.get('/api/products');
// Remove Promise.all if unneeded
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
  store.dispatch(setUserToView(userId));
}

const onProductEnter = nextRouterState => {
  const productId = nextRouterState.params.productId;
  store.dispatch(getProductById(productId));
  store.dispatch(getReviewsByProductId(productId));
}

const onOrdersEnter = nextRouterState => {
  const userId = nextRouterState.params.userId;
  store.dispatch(getOrdersByUserId(userId));
}

const onOrderEnter = nextRouterState => {
  const orderId = nextRouterState.params.orderId;
  store.dispatch(getOrderProductsByOrderId(orderId));
}

const onCartEnter = nextRouterState => {
  const orderId = nextRouterState.params.orderId;
  store.dispatch(getOrderProductsByOrderId(orderId));
}

ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/" component={App} onEnter={onAppEnter}>
        <Route path="/products" component={ProductsContainer} />
        <Route path ="/users" component = {UsersContainer} onEnter = {onUsersEnter} />
        <Route path = "/users/:userId" component = {UserContainer} onEnter = {onUserEnter} />
        <Route path="/products/:productId" component={ProductContainer} onEnter={onProductEnter} />
        <Route path="/addProduct" component={AddProductContainer} />
        <Route path="orders/user/:userId" component={OrdersContainer} onEnter={onOrdersEnter} />
        <Route path="orders/order/:orderId" component={OrderContainer} onEnter={onOrderEnter} />
        <Route path="/cart/:orderId" component={CartContainer} onEnter={onCartEnter} />
        <Route path="signup" component={Main}>
          <IndexRoute component={Login} />
          <Route path="login" component={Login} />
          <Route path="signup" component={Signup} />
          <Route onEnter={requireLogin}>
            <Route path="/" component={UserHome} />
          </Route>
        </Route>
        <IndexRedirect to="/products" />
      </Route>
    </Router>
  </Provider>,
  document.getElementById('app')
);
