import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { SyntheticEvent } from 'react';
import { Button, Reveal } from 'semantic-ui-react';
import { Profile } from '../../app/models/profile';
import { useStore } from '../../app/stores/store';


export interface Props {
    profile: Profile;
}


export default observer(function FollowButton ({ profile }: Props) {
  const { updateFollowing, loading } = useStore().profileStore;
  // we don't want to show if the use is watching his own profile
  if (useStore().userStore.user?.username === profile.username) return null;

  function handleFollow(e: SyntheticEvent) {
    e.preventDefault();
    updateFollowing(profile.username, !profile.following);
  }

  return (
    <Reveal animated='move'>  {/* one is visible and the other is hidden, so they alternate when hovering */}
        <Reveal.Content visible style={{width: '100%'}}>
            <Button 
              fluid 
              color='teal' 
              content={profile.following ? 'Following' : 'Not following'} />
        </Reveal.Content>

        <Reveal.Content hidden style={{width: '100%'}}>
            <Button 
                fluid 
                basic
                color={profile.following ? 'red' : 'green'} 
                content={profile.following ? 'Unfollow' : 'Follow'} 
                loading={loading}
                onClick={e => handleFollow(e)}
            />
        </Reveal.Content>
    </Reveal>
  );
})
