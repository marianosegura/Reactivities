import { useField } from 'formik';
import * as React from 'react';
import { Form, Label } from 'semantic-ui-react';

export interface Props {
    placeholder: string;
    name: string;
    rows: number;
    label?: string;
}

export default function MyTextArea (props: Props) {
    const [field, meta] = useField(props.name);
    return (
        <Form.Field error={ meta.touched && meta.error }>
            <label>{ props.label }</label>
            <textarea { ...field } { ...props } />
            { meta.touched && meta.error && (
                <Label basic color='red'>{ meta.error }</Label>
            )}
        </Form.Field>
    );
}
