import { useField } from 'formik';
import * as React from 'react';
import { Form, Label, Select } from 'semantic-ui-react';

export interface Props {
    placeholder: string;
    name: string;
    options: any;
    label?: string;
}

export default function MySelectInput (props: Props) {
    const [field, meta, helpers] = useField(props.name);  // helpers are used to manually set value
    return (
        <Form.Field error={ meta.touched && meta.error }>
            <label>{ props.label }</label>

            <Select
                clearable  // means the x at the right to clear/unselect value
                options={props.options}
                value={field.value || null}
                onChange={(event, data) => helpers.setValue(data.value)}
                onBlur={() => helpers.setTouched(true)}  // need to set manually since we can't spread all like in MyTextInput
                placeholder={props.placeholder}
            />

            { meta.touched && meta.error && (
                <Label basic color='red'>{ meta.error }</Label>
            )}
        </Form.Field>
    );
}
