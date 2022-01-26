import * as React from 'react';
import { Redirect, Route, RouteComponentProps, RouteProps } from 'react-router-dom';
import { useStore } from '../stores/store';


export interface Props extends RouteProps {
  component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType
}


export default function PrivateRoute ({ component: Component, ...rest }: Props) {
  const { isLoggedIn } = useStore().userStore;
  return (  // redirect to home page if not LoggedIn
    <Route 
      {...rest}
      render={(props) => isLoggedIn ? <Component {...props} /> : <Redirect to='/' />}
    />
  );
}
