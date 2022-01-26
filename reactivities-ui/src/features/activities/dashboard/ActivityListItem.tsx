import { format } from 'date-fns';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, Icon, Item, Label, Segment } from 'semantic-ui-react';
import { Activity } from '../../../app/models/activity';
import ActivityListItemAttendee from './ActivityListItemAttendee';

interface Props {
    activity: Activity
}

export default function ActivityListItem ({ activity }: Props) {
  return (
    <Segment.Group>
        <Segment>
            {activity.isCancelled &&
                <Label attached='top' color='red' content='Cancelled' style={{ textAlign: 'center' }} />
            }

            <Item.Group>
                <Item>
                    <Item.Image style={{ marginBottom: 6 }} size='tiny' circular src={activity.host?.image || '/assets/user.png'} />

                    <Item.Content>
                        <Item.Header as={Link} to={`/activities/${activity.id}`}>
                            {activity.title}
                        </Item.Header>

                        <Item.Description>Hosted by <Link to={`/profiles/${activity.hostUsername}`}>{activity.host?.displayName}</Link></Item.Description>
                        
                        {activity.isHost && (
                            <Item.Description>
                                <Label basic color='orange'>Hosting</Label>
                            </Item.Description>
                        )}

                        {activity.isGoing && !activity.isHost && (
                            <Item.Description>
                                <Label basic color='teal'>Going</Label>
                            </Item.Description>
                        )}
                    </Item.Content>
                </Item>
            </Item.Group>
        </Segment>

        <Segment>
            <span>  {/* spane because this is basically inline */}
                <Icon name='clock' /> {format(activity.date!, 'dd MMM yyyy h:mm aa')}
                <Icon name='marker' /> {activity.venue}
            </span>
        </Segment>

        <Segment secondary>  {/* secondary = grey background */}
            <ActivityListItemAttendee attendees={activity.attendees!} />
        </Segment>

        <Segment clearing>  {/* for our button to float correctly */}
            <span>{activity.description}</span>
            <Button 
                as={Link}
                to={`/activities/${activity.id}`}
                color='teal'
                floated='right'
                content='View'
            />
        </Segment>
    </Segment.Group>
  );
}