import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, Header, Icon, Segment } from 'semantic-ui-react';

export interface Props {
    message: string;
}

export default function App (props: Props) {
  return (
    <Segment placeholder>
        <Header icon>
            <Icon name='search' />
            Oops - we've looked everywhere and couldn't find this :(
        </Header>

        <Segment.Inline>
            <Button as={Link} to='/activities' primary>
                Return to activities page
            </Button>
        </Segment.Inline>
    </Segment>
  );
}
