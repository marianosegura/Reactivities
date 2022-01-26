import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { SyntheticEvent, useState } from 'react';
import { Card, Header, Image, Tab, Grid, Button } from 'semantic-ui-react';
import PhotoUploadWidget from '../../app/common/imageUpload/PhotoUploadWidget';
import { Photo, Profile } from '../../app/models/profile';
import { useStore } from '../../app/stores/store';


export interface Props {
  profile: Profile
}


export default observer(function ProfilePhotos ({ profile }: Props) {
  const { isCurrentUser, uploadPhoto, uploading, loading, setMainPhoto, deletePhoto } = useStore().profileStore;
  const [addPhotoMode, setAddPhotoMode] = useState(false);
  const [target, setTarget] = useState('');  // to single out the loading for the main photo

  function handlePhotoUpload(file: Blob) {
    uploadPhoto(file).then(() => setAddPhotoMode(false))
  }

  function handleSetMainPhoto(photo: Photo, e: SyntheticEvent<HTMLButtonElement>) {
    setTarget(e.currentTarget.name);
    setMainPhoto(photo);
  }
  
  function handleDeletePhoto(photo: Photo, e: SyntheticEvent<HTMLButtonElement>) {
    setTarget(e.currentTarget.name);
    deletePhoto(photo);
  }

  return (
    <Tab.Pane>
      <Grid>
        <Grid.Column width={16}>
          <Header floated='left' icon='image' content='Photos' />
          
          {isCurrentUser && (
            <Button floated='left' onClick={() => setAddPhotoMode(!addPhotoMode)} basic content={addPhotoMode ? 'Cancel' : 'Add Photo'} />
          )}
        </Grid.Column>

        <Grid.Column width={16}>
          {addPhotoMode ? (
            <PhotoUploadWidget uploadPhoto={handlePhotoUpload} loading={uploading} />
            
          ) : (
            <Card.Group itemsPerRow={5}>
              {profile.photos?.map(photo => (
                <Card key={photo.id}>
                  <Image src={photo.url} />
                  {isCurrentUser && (
                    <Button.Group fluid widths={2}>
                      <Button 
                        basic 
                        color='green' 
                        content='Main' 
                        name={'main' + photo.id}  // 'main'+ to single out loading between buttons 
                        disabled={photo.isMain} 
                        loading={target === 'main' + photo.id && loading}  // to show loading just of the singled out main photo
                        onClick={e => handleSetMainPhoto(photo, e)}
                      />
                      <Button 
                        basic 
                        name={photo.id} 
                        color='red' 
                        icon='trash' 
                        disabled={photo.isMain} 
                        loading={target === photo.id && loading}
                        onClick={e => handleDeletePhoto(photo, e)}
                      />
                    </Button.Group>
                  )}
                </Card>
              ))}
            </Card.Group>
          )}
        </Grid.Column>
      </Grid>

    </Tab.Pane>
  );
})
