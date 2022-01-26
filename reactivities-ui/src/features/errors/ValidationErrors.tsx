import * as React from 'react';
import { Message } from 'semantic-ui-react';


export interface Props {
    errors: any;
}

export default function ValidationErrors ({ errors }: Props) {  
  return (  // just a list component of strings as errors
    <Message error>
        { errors && (
            <Message.List>
                { errors.map((error: any, i: any) => (
                    <Message.Item key={i}>{error}</Message.Item>
                )) }
            </Message.List>
        )}
    </Message>
  );
}
