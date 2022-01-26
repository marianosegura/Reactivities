import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { Grid } from 'semantic-ui-react';
import LoadingComponent from '../../../app/layout/LoadingComponent';
import { useStore } from '../../../app/stores/store';
import ActivityDetailedChat from './ActivityDetailedChat';
import ActivityDetailedHeader from './ActivityDetailedHeader';
import ActivityDetailedSidebar from './ActivityDetailedSidebar';
import ActivityDetailedInfo from './ActivityDetailsInfo';


export default observer(function ActivityDetails () {
  const { selectedActivity: activity, loadActivity, loadingInitial, clearSelectedActivity } = useStore().activityStore;
  
  const { id } = useParams<{ id: string }>();  // routing id
  useEffect(() => {
    if (id) loadActivity(id);
    return () => clearSelectedActivity();  // clear activity to close hub connection
  }, [id, loadActivity, clearSelectedActivity]);
  
  if (loadingInitial || !activity) return <LoadingComponent />;  // activity would never be undefined

  return (
    <Grid>
      <Grid.Column width={10}>
        <ActivityDetailedHeader activity={activity} />
        <ActivityDetailedInfo activity={activity} />
        <ActivityDetailedChat activityId={activity.id} />
      </Grid.Column>

      <Grid.Column width={6}>
        <ActivityDetailedSidebar activity={activity} />
      </Grid.Column>
    </Grid>
  );
})
