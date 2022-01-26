import * as React from 'react';
import { Cropper } from 'react-cropper';
import 'cropperjs/dist/cropper.css';  // required (added manually)


export interface Props {
  imagePreview: string;
  setCropper: (cropper: Cropper) => void;
}


export default function PhotoWidgetCropper ({ imagePreview, setCropper }: Props) {
  return (
    <Cropper
      src={imagePreview}
      style={{ height: 200, width: '100%' }}
      initialAspectRatio={1}
      aspectRatio={1}  // enforces square images
      preview='.img-preview'  // give preview in a css class named img-preview

      guides={false}
      viewMode={1}
      autoCropArea={1}
      background={false}
      onInitialized={cropper => setCropper(cropper)}
    />
  );
}
