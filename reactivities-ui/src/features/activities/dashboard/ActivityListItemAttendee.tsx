import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Image, List, Popup } from 'semantic-ui-react';
import { Profile } from '../../../app/models/profile';
import ProfileCard from '../../profiles/ProfileCard';


export interface Props {
    attendees: Profile[];
}


export default observer(function ActivityListItemAttendee ({ attendees }: Props) {
  return (
    <List horizontal>
        { attendees.map(attendee => (
            <Popup 
              hoverable
              key={attendee.username}
              trigger={
                <List.Item key={attendee.username} as={Link} to={`/profiles/${attendee.username}`}>  {/* link to profile */}
                    <Image 
                      bordered
                      style={attendee.following ? { borderColor: 'teal', borderWidth: 4 } : null }
                      size='mini' 
                      circular 
                      src={ attendee.image || '/assets/user.png' } />  {/* image is optional */}
                </List.Item>
              }
            >
              <Popup.Content>
                <ProfileCard profile={attendee} />
              </Popup.Content>
            </Popup>

        ))}
    </List>
  );
})
