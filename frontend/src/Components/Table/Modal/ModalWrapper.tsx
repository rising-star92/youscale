import React from 'react'

interface ModalWrapperProps {
    showModal: boolean,
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
    children: JSX.Element | JSX.Element[] | any,
    closeModal?: () => void
    isVideoModal?: boolean
    title: string,
    id: string
}
export default function ModalWrapper({ showModal, setShowModal, children, id, title, closeModal, isVideoModal }: ModalWrapperProps): JSX.Element {

    const handleCloseModal = () => {
        var body = document.querySelector<HTMLBodyElement>('body');

        if (closeModal) {
            closeModal()
        } else {
            if (body) {
                body.classList.remove('modal-open');
                body.style.overflow = '';
                body.style.paddingRight = '';

                var existingBackdrop = document.querySelectorAll('.modal-backdrop.fade.show');

                if (existingBackdrop) existingBackdrop.forEach(it => it.remove());


                setShowModal(false)
            }
        }
    }

    return (
        <div style={{ display: 'block' }} className={`modal fade show ${id}`} id={id}>
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button
                            onClick={handleCloseModal}
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                        ></button>
                    </div>
                    <div className={isVideoModal ? '' : 'modal-body'}>
                        {children}
                    </div>
                    {
                        isVideoModal ? <></> :
                            <div className="modal-footer">
                                <button
                                    onClick={handleCloseModal}
                                    type="button"
                                    className="btn btn-danger light fermer-btn"
                                    data-bs-dismiss="modal"
                                >
                                    Fermer
                                </button>
                            </div>
                    }
                </div>
            </div>
        </div>
    )
}
