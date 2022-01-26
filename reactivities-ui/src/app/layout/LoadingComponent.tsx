import * as React from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';


export interface Props {
    inverted?: boolean;
    content?: string;
}

export default function LoadingComponent ({inverted = true, content = 'Loading...'}: Props) {
  return (  // to show when something is loading in our page
    <Dimmer active={true} inverted={inverted}>
        <Loader content={content} />
    </Dimmer>
  );
}
