import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { useParams } from 'react-router';
import { Grid } from 'semantic-ui-react';
import LoadingComponent from '../../app/layout/LoadingComponent';
import { useStore } from '../../app/stores/store';
import ProfileContent from './ProfileContent';
import ProfileHeader from './ProfileHeader';


export default observer(function ProfilePage () {
  const { username } = useParams<{username: string}>();
  const { loadingProfile, loadProfile, profile, setActiveTab } = useStore().profileStore;

  React.useEffect(() => {
    loadProfile(username);
    return () => setActiveTab(0);  // cleanup followings list
  }, [loadProfile, username, setActiveTab]);

  if (loadingProfile) return <LoadingComponent content='Loading profile...' />

  return (
    <Grid>
        <Grid.Column width={16}>
            {profile &&
              <>
                <ProfileHeader profile={profile} />
                <ProfileContent profile={profile} />
              </>
            }
        </Grid.Column>
    </Grid>
  );
})
