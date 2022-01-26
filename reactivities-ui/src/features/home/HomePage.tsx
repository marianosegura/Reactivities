import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Header, Image, Segment } from 'semantic-ui-react';
import { useStore } from '../../app/stores/store';
import LoginForm from '../users/LoginForm';
import RegisterForm from '../users/RegisterForm';


export default observer(function HomePage () {
  const { isLoggedIn } = useStore().userStore;
  const { openModal } = useStore().modalStore;

  return (
    <Segment inverted textAlign='center' vertical className='masthead'>
      <Container text>
        <Header as='h1' inverted>
          <Image size='massive' src='/assets/logo.png' alt='logo' style={{ marginBottom: 12 }} />
          Reactivities
        </Header>

        { isLoggedIn ? (
          <>
            <Header as='h2' inverted content='Welcome to Reactivities' />
            <Button as={Link} to='/activities' size='huge' inverted>Go to Activities</Button>
          </>
        ) : (
          <>
            <Button onClick={() => openModal(<LoginForm />)} to='/login' size='huge' inverted>Login</Button>
            <Button onClick={() => openModal(<RegisterForm />)} to='/login' size='huge' inverted>Register</Button>
          </>
        )}


      </Container>
    </Segment>
  );
})
