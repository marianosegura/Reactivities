import { useField } from 'formik';
import * as React from 'react';
import { Form, Label } from 'semantic-ui-react';

export interface Props {
    placeholder: string;
    name: string;
    label?: string;
    type?: string;  // for password
}

export default function MyTextInput (props: Props) {
    const [field, meta] = useField(props.name);
    return (
        <Form.Field error={ meta.touched && meta.error }>
            <label>{ props.label }</label>
            <input { ...field } { ...props } />
            { meta.touched && meta.error && (
                <Label basic color='red'>{ meta.error }</Label>
            )}
        </Form.Field>
    );
}
