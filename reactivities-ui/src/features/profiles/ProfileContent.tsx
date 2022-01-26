import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { Tab } from 'semantic-ui-react';
import { Profile } from '../../app/models/profile';
import { useStore } from '../../app/stores/store';
import ProfileAbout from './ProfileAbout';
import ProfileActivities from './ProfileActivities';
import ProfileFollowings from './ProfileFollowings';
import ProfilePhotos from './ProfilePhotos';

export interface Props {
  profile: Profile
}

export default observer(function ProfileContent ({ profile }: Props) {
  const {setActiveTab} = useStore().profileStore;
  const panes = [
    { menuItem: 'About', render: () => <ProfileAbout />},
    { menuItem: 'Photos', render: () => <ProfilePhotos profile={profile} />},
    { menuItem: 'Events', render: () => <ProfileActivities />},
    { menuItem: 'Followers', render: () => <ProfileFollowings />},
    { menuItem: 'Following', render: () => <ProfileFollowings />}
  ];
  return (
    <Tab 
      menu={{ fluid: true, vertical: true }}
      menuPosition='right'
      panes={panes}
      onTabChange={(e, data) => setActiveTab(data.activeIndex)}
    />
  );
})
