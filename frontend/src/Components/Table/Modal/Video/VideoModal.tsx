import React, { useEffect } from 'react'
import ModalWrapper from '../ModalWrapper'
import ReactPlayer from 'react-player/youtube'
import styles from './video.module.css'

interface Props {
  showModal: boolean,
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
  urlVideo: string
  closeTutorial: () => void
}
export default function VideoModal({ showModal, setShowModal, urlVideo, closeTutorial }: Props): JSX.Element {

  useEffect(() => {
    var body = document.querySelector<HTMLBodyElement>('body');

    var modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop fade show';

    if (body) {
      body.classList.add('modal-open');
      body.style.overflow = 'hidden';
      body.style.paddingRight = '17px';

      body.appendChild(modalBackdrop);
    }
  }, [])

  const handleCloseModal = () => {
    var body = document.querySelector<HTMLBodyElement>('body');

    if (body) {
      body.classList.remove('modal-open');
      body.style.overflow = '';
      body.style.paddingRight = '';

      var existingBackdrop = document.querySelectorAll('.modal-backdrop.fade.show');

      if (existingBackdrop) existingBackdrop.forEach(it => it.remove());

      closeTutorial()
      setShowModal(false)
    }
  }

  return (
    <ModalWrapper isVideoModal title={'Video'} closeModal={handleCloseModal} showModal={showModal} setShowModal={setShowModal} id='AddOrderModal'>
      <FormBody handleCloseModal={handleCloseModal} urlVideo={urlVideo} />
    </ModalWrapper>
  )
}

interface FormBodyProps {
  handleCloseModal: () => void
  urlVideo: string
}
const FormBody = ({ handleCloseModal, urlVideo }: FormBodyProps) => {

  return (
    <div className={styles.video}>
      <ReactPlayer width={460} height={330} controls={true} url={urlVideo} />
    </div>
  )
}