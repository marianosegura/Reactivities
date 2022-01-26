import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Grid, Loader } from 'semantic-ui-react';
import { PagingParams } from '../../../app/models/pagination';
import { useStore } from '../../../app/stores/store';
import ActivityFilters from './ActivityFilters';
import AcivityList from './ActivityList';
import ActivityListItemPlaceholder from './ActivityListItemPlaceholder';


export default observer(function ActivityDashboard() {
  const { loadActivities, activityRegistry, loadingInitial, setPagingParams, pagination } = useStore().activityStore;

  const [loadingMoreActivities, setLoadingMoreActivities] = useState(false);  // are we loading next batch of activities?

  function handleLoadMoreActivities() {
    setLoadingMoreActivities(true);
    setPagingParams(new PagingParams(pagination!.currentPage + 1));
    loadActivities().then(() => setLoadingMoreActivities(false)); 
  }

  useEffect(() => {
    if (activityRegistry.size <= 1) loadActivities();  // when creating updating size is 1
  }, [activityRegistry, loadActivities]);  // dependency

  return (
    <Grid>
      <Grid.Column width='10'>
        {loadingInitial && !loadingMoreActivities ? ( 
          <>  {/* show animated placeholder */}
            <ActivityListItemPlaceholder />  
            <ActivityListItemPlaceholder />
          </>
        ) : (
          <InfiniteScroll
          pageStart={0}
          loadMore={handleLoadMoreActivities}
          hasMore={!loadingMoreActivities && !!pagination && pagination.currentPage < pagination.totalPages}  // stop condition
          initialLoad={false}
          >
            <AcivityList />
          </InfiniteScroll>
        )}
      </Grid.Column>

      <Grid.Column width='6'>
        <ActivityFilters />
      </Grid.Column>

      <Grid.Column width='10'>  {/* loader will appear at the bottom when loading activities */}
        <Loader active={loadingMoreActivities} />  
      </Grid.Column>
    </Grid>
  )
})