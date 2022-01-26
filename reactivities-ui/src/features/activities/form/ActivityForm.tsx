import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { Button, Header, Segment } from 'semantic-ui-react';
import LoadingComponent from '../../../app/layout/LoadingComponent';
import { useStore } from '../../../app/stores/store';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import MyTextInput from '../../../app/common/form/MyTextInput';
import MyTextArea from '../../../app/common/form/MyTextArea';
import MySelectInput from '../../../app/common/form/MySelectInput';
import { categoryOptions } from '../../../app/common/options/categoryOptions';
import MyDateInput from '../../../app/common/form/MyDateInput';
import { ActivityFormValues } from '../../../app/models/activity';
import { v4 as uuid } from 'uuid';


export default observer(function ActivityForm () {
  const { createActivity, updateActivity, loadActivity, loadingInitial } = useStore().activityStore;
  const { id } = useParams<{ id: string }>();  // routing id
  const [activity, setActivity] = useState<ActivityFormValues>(new ActivityFormValues());


  useEffect(() => {  // load activity for edit mode
    if (id) loadActivity(id).then(activity => setActivity(new ActivityFormValues(activity)));
  }, [id, loadActivity]);


  let history = useHistory();
  function handleFormSubmit(activity: ActivityFormValues) {
    if (!activity.id) {
      let newActivity = { ...activity, id: uuid() };
      createActivity(newActivity).then(() => history.push(`/activities/${newActivity.id}`));
    } else {
      updateActivity(activity).then(() => history.push(`/activities/${activity.id}`));
    }
  }


  const validationSchema = Yup.object({
    title: Yup.string().required('The activity title is required'),
    description: Yup.string().required('The activity description is required'),
    category: Yup.string().required(),
    date: Yup.string().required('Date is required').nullable(),
    venue: Yup.string().required(),
    city: Yup.string().required()
  });


  if (loadingInitial) return <LoadingComponent content='Loading activity...' />;


  return (
    <Segment clearing>  {/* cleared floating content to prevent buttons popping out of the form */}
      <Header content='Activity Details' sub color='teal' />
      
      <Formik 
        validationSchema={validationSchema}  // using our yup validation
        enableReinitialize  // to populate and re-render the form when activity changes in the use effect (when editing)
        initialValues={activity} 
        onSubmit={values => handleFormSubmit(values)}
      >
        {({ handleSubmit, isValid, isSubmitting, dirty }) => (  // we are destructuring the props (render props pattern) given by Formik 
          <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>  {/* with just the name Formik chains the Fields to fields in the values object */}
            <MyTextInput placeholder='Title' name='title' />  
            <MyTextArea placeholder='Description' name='description' rows={3} />
            <MySelectInput options={categoryOptions} placeholder='Category' name='category' />
            <MyDateInput 
              placeholderText='Date' 
              name='date' 
              showTimeSelect
              timeCaption='time'
              dateFormat='MMMM d, yyyy h:mm aa'
            />

            <Header content='Location Details' sub color='teal' />
            <MyTextInput placeholder='City' name='city' />
            <MyTextInput placeholder='Venue' name='venue' />
            
            <Button 
              disabled={!isValid || isSubmitting || !dirty}
              loading={isSubmitting} 
              floated='right' 
              positive 
              type='submit' 
              content='Submit'
            />
            
            <Button as={Link} to={'/activities'} floated='right' type='button' content='Cancel' />
          </Form> 
        )}
      </Formik>
    </Segment>
  );
})
