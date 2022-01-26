import React, { useEffect } from 'react';
import { Container } from 'semantic-ui-react';
import NavBar from './NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import { observer } from 'mobx-react-lite';
import HomePage from '../../features/home/HomePage';
import { Route, Switch, useLocation } from 'react-router-dom';
import ActivityForm from '../../features/activities/form/ActivityForm';
import ActivityDetails from '../../features/activities/details/ActivityDetails';
import TestErrors from '../../features/errors/TestError';
import { ToastContainer } from 'react-toastify';
import NotFound from '../../features/errors/NotFound';
import ServerError from '../../features/errors/ServerError';
import { useStore } from '../stores/store';
import LoadingComponent from './LoadingComponent';
import ModalContainer from '../common/modals/ModalContainer';
import ProfilePage from '../../features/profiles/ProfilePage';
import PrivateRoute from './PrivateRoute';
import RegisterSuccess from '../../features/users/RegisterSuccess';
import ConfirmEmail from '../../features/users/ConfirmEmail';


function App() {
  const location = useLocation();
  const { commonStore, userStore } = useStore();


  useEffect(() => {  // try to auto login
    if (commonStore.token) {
      userStore.getUser().finally(() => commonStore.setAppLoaded());
    } else {
      commonStore.setAppLoaded();
    }
  }, [commonStore, userStore]);


  if (!commonStore.appLoaded) return <LoadingComponent content='Loading app...' />


  return (
    <>
      <ToastContainer position='bottom-right' hideProgressBar />  {/* to show toasts */}
      <ModalContainer />  {/* to show modals */}

      <Route exact path='/' component={HomePage} />

      <Route 
        path={'/(.+)'}  // match expr /(anything)+ to have home page without navbar
        render={() => (
          <>
            <NavBar />
            <Container style={{marginTop: '6em'}}>  {/* we need marginTop since navbar has fixed top */}
              
              <Switch>  {/* only match 1, for NotFound to be a catch all */}
                <PrivateRoute exact path='/activities' component={ActivityDashboard} />
                <PrivateRoute exact path='/activities/:id' component={ActivityDetails} />
                <PrivateRoute exact path='/profiles/:username' component={ProfilePage} />
                <PrivateRoute exact path='/errors' component={TestErrors} />
                <Route exact path='/server-error' component={ServerError} />

                <Route exact path='/account/registerSuccess' component={RegisterSuccess} />
                <Route exact path='/account/verifyEmail' component={ConfirmEmail} />
                
                <Route 
                  exact 
                  path={['/createActivity', '/manage/:id']} 
                  key={location.key}  // giving a key ensures the component is re-rendered when location.key changes (when going between edit-create activity form)
                  component={ActivityForm} 
                />
                <Route component={NotFound} />
              </Switch>
              
            </Container>
          </>
        )}
      />
    </>
  );
}

export default observer(App);  // observe store changes (aka re render)
