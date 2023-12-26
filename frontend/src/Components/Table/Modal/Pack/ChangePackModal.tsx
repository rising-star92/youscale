import React, { useEffect } from 'react'
import ModalWrapper from '../ModalWrapper'
import { useChangeSubscriptionMutation } from '../../../../services/api/ClientApi/ClientSubscriptionApi';
import { showToastError } from '../../../../services/toast/showToastError';
import { ErrorModel } from '../../../../models';

interface Props {
    showModal: boolean,
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
    id_subscription: number,
    id_pack: number,
    refetch: () => any
}
export default function ChangePackModal({ showModal, setShowModal, refetch, id_subscription, id_pack }: Props): JSX.Element {

    const [changeSubscription] = useChangeSubscriptionMutation()

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

            setShowModal(false)
        }
    }

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>): any => {
        e.preventDefault()

        changeSubscription({ id_pack, id: id_subscription }).unwrap()
            .then(() => {
                refetch()
                handleCloseModal()
            }).catch((err: {data: ErrorModel | {message : string}, status: number}) => {
                if (err.data) {
                    if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                    else if ('message' in err.data) showToastError(err.data.message);
                }
            })
    }

    return (
        <ModalWrapper title={'Changer abonnement'} showModal={showModal} setShowModal={setShowModal} id='EditOrderModal'>
            <FormBody onClick={handleSubmit} />
        </ModalWrapper>
    )
}

interface FormBodyProps {
    onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => any
}
const FormBody = ({ onClick }: FormBodyProps) => {

    return (
        <div className="card-body">
            <div className="basic-form">
                <div className="swal2-header">
                    <h2 className="swal2-title" id="swal2-title" style={{ display: "flex" }}>
                        Voulez vous vraiment changer de pack ?
                    </h2>
                    <button
                        onClick={onClick}
                        className="btn btn-danger btn sweet-wrong"
                    >Change</button>
                </div>
            </div>
        </div>
    )
}