import { observer } from 'mobx-react-lite';
import React from 'react';
import Calendar from 'react-calendar';
import { Header, Menu } from 'semantic-ui-react';
import { useStore } from '../../../app/stores/store';


export default observer(function ActivityFilters () {
  const { predicateFilters: filters, setPredicateFilter } = useStore().activityStore;
  return (
    <> 
        <Menu vertical size='large' style={{ width : '100%', marginTop: 27 }}>  {/* margin to align to first activity */} 
            <Header icon='filter' attached color='teal' content='Filters' />
            <Menu.Item 
              content='All Activities' 
              active={filters.has('all')} 
              onClick={() => setPredicateFilter('all', 'true')}  
            />

            <Menu.Item 
              content="I'm Going" 
              active={filters.has('isGoing')} 
              onClick={() => setPredicateFilter('isGoing', 'true')}  
            />

            <Menu.Item 
              content="I'm Hosting" 
              active={filters.has('isHost')} 
              onClick={() => setPredicateFilter('isHost', 'true')}  
            />
        </Menu>
        
        <Header />
        
        <Calendar 
          onChange={(date: Date) => setPredicateFilter('startDate', date)}
          value={filters.get('startDate') || new Date()}
        />
    </>
  );
})
