import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { Modal } from 'semantic-ui-react';
import { useStore } from '../../stores/store';


export default observer(function ModalContainer () {
  const { modal, closeModal } = useStore().modalStore;
  return (
    <Modal closeIcon dimmer='blurring' open={modal.open} onClose={closeModal} size='mini'>
        <Modal.Content>
            {modal.body}
        </Modal.Content>
    </Modal>
  );
})