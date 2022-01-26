import { Formik, Form, Field, FieldProps } from 'formik'
import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {Segment, Header, Comment, Loader } from 'semantic-ui-react'
import { useStore } from '../../../app/stores/store'
import * as Yup from 'yup';
import { formatDistanceToNow } from 'date-fns/esm'

interface Props {
    activityId: string;
}


export default observer(function ActivityDetailedChat({ activityId }: Props) {
  const { commentStore } = useStore();
  
  useEffect(() => {
    if (activityId) {
      commentStore.createHubConnection(activityId);  // create hub connection after creation
    }
    return () => commentStore.clearComments();  // cleanup connection onDestroy
  }, [commentStore, activityId]);

  return (
      <>
          <Segment
            textAlign='center'
            attached='top'
            inverted
            color='teal'
            style={{border: 'none'}}
          >
            <Header>Chat about this event</Header>
          </Segment>

          <Segment attached clearing>
            <Formik
              onSubmit={(values, {resetForm}) => 
                commentStore.addComment(values).then(() => resetForm())}  // reset form after sending
              initialValues={{ body: '' }}
              validationSchema={Yup.object({
                body: Yup.string().required()
              })}
            >
              {({ isSubmitting, isValid, handleSubmit }) => ( 
                <Form className='ui form'>  
                  <Field name='body'>
                    {(props: FieldProps) => (
                      <div style={{ position: 'relative' }}>
                        <Loader active={isSubmitting} />

                        <textarea 
                          placeholder='Enter your comment (ENTER to submit, SHIFT+ENTER for new line)'
                          rows={2}
                          {...props.field}
                          onKeyPress={event => { 
                            if (event.key === 'Enter' && event.shiftKey) {
                              return;
                            }
                            if (event.key === 'Enter' && !event.shiftKey) {
                              event.preventDefault();  // prevent normal behaviour of adding a new line
                              if (isValid) handleSubmit();
                            }
                          }}
                        />
                      </div>
                    )}
                  </Field>
                </Form>
              )}
            </Formik>


            <Comment.Group>
              {commentStore.comments.map(comment => (
                <Comment key={comment.id}>
                  <Comment.Avatar src={comment.image || '/assets/user.png'} />

                  <Comment.Content>
                    <Comment.Author as={Link} to={`/profiles/${comment.username}`}>
                      {comment.displayName}
                    </Comment.Author>

                    <Comment.Metadata>
                      <div>{formatDistanceToNow(comment.createdAt)} ago</div>
                    </Comment.Metadata>

                    <Comment.Text style={{ whiteSpace: 'pre-wrap' }}>{comment.body}</Comment.Text>
                  </Comment.Content>
                </Comment>
              ))}
            </Comment.Group>
          </Segment>
      </>
  )
})