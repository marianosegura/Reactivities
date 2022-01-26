import { format } from 'date-fns';
import { observer } from 'mobx-react-lite';
import React from 'react'
import { Link } from 'react-router-dom';
import {Button, Header, Item, Segment, Image, Label} from 'semantic-ui-react'
import {Activity} from "../../../app/models/activity";
import { useStore } from '../../../app/stores/store';


const activityImageStyle = {
    filter: 'brightness(30%)'  // dimming image
};

const activityImageTextStyle = {
    position: 'absolute',  // can makes the text in top of the image
    bottom: '5%',  // what makes the text positioned relative to the bottom of the image
    left: '5%',
    width: '100%',
    height: 'auto',
    color: 'white'
};

interface Props {
    activity: Activity
}

export default observer(function ActivityDetailedHeader({activity}: Props) {
    const { updateAttendance, loading, cancelActivitToggle } = useStore().activityStore;
    return (
        <Segment.Group>
            <Segment basic attached='top' style={{padding: '0'}}>
                {activity.isCancelled &&
                    <Label ribbon color='red' content='Cancelled' style={{ position: 'absolute', zIndex: 1000, left: -14, top: 20 }} />
                }

                <Image src={`/assets/categoryImages/${activity.category}.jpg`} fluid style={activityImageStyle}/>
                
                <Segment style={activityImageTextStyle} basic>
                    <Item.Group>
                        <Item>
                            <Item.Content>
                                <Header
                                    size='huge'
                                    content={activity.title}
                                    style={{color: 'white'}}
                                />

                                <p>{format(activity.date!, 'dd MMM yyyy')}</p>

                                <p>Hosted by <strong>
                                    <Link to={`/profiles/${activity.host?.username}`}>
                                        {activity.host?.displayName}
                                    </Link>
                                </strong></p>
                            </Item.Content>
                        </Item>
                    </Item.Group>
                </Segment>
            </Segment>
            
            <Segment clearing attached='bottom'>

                {activity.isHost ? (
                    <>
                        <Button onClick={cancelActivitToggle} loading={loading} color={activity.isCancelled ? 'teal' : 'red'} content={activity.isCancelled ? 'Re-activate': 'Cancel' } basic floated='left' />
                        <Button as={Link} to={`/manage/${activity.id}`} disabled={activity.isCancelled} color='blue' floated='right'>Manage Event</Button>
                    </>
                ) : activity.isGoing ? (
                    <Button onClick={updateAttendance} loading={loading}>Cancel attendance</Button>
                ) : (
                    <Button onClick={updateAttendance} color='teal' loading={loading} disabled={activity.isCancelled}>Join Activity</Button>
                )}

            </Segment>
        </Segment.Group>
    )
})
