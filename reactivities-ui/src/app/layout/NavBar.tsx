import { observer } from 'mobx-react-lite';
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Button, Container, Dropdown, Image, Menu } from 'semantic-ui-react';
import { useStore } from '../stores/store';


export default observer(function NavBar() {
  const { user, logout, isLoggedIn } = useStore().userStore;
  return (
    <Menu inverted fixed='top'>
      <Container>

        <Menu.Item as={NavLink} to='/' exact header>
          <img src="/assets/logo.png" alt="logo" style={{marginRight: '10px'}} />
          Reactivities
        </Menu.Item>

        {isLoggedIn && 
          <>
            <Menu.Item as={NavLink} to='/activities' exact name='Activities' />

            <Menu.Item>
              <Button as={NavLink} to='/createActivity' exact positive content='Create Activity' />
            </Menu.Item>

            <Menu.Item as={NavLink} to='/errors' exact name='Errors' />

            <Menu.Item position='right'>
              <Image src={user?.image || '/assets/user.png'} avatar spaced='right' />
              
              <Dropdown pointing='top left' text={user?.displayName}>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to={`/profiles/${user?.username}`} text='My Profile' icon='user' />
                  <Dropdown.Item onClick={logout} text='Logout' icon='sign-out' />
                </Dropdown.Menu>
              </Dropdown>
            </Menu.Item>
          </>
        }


      </Container>
    </Menu>
  )
})