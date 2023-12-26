import React, { useEffect, useState } from 'react'
import ModalWrapper from '../ModalWrapper'
import { useDeleteCityMutation } from '../../../../services/api/ClientApi/ClientCityApi';
import { showToastError } from '../../../../services/toast/showToastError';
import { ErrorModel } from '../../../../models';

interface Props {
    showModal: boolean,
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
    refetch: () => void,
    id_city: string,
}
export default function DeleteCityModal({ showModal, setShowModal, refetch, id_city }: Props): JSX.Element {

    const [deleteCity] = useDeleteCityMutation()

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

        deleteCity(id_city).unwrap()
            .then(res => {
               handleCloseModal()
               refetch()
            })
            .catch((err: {data: ErrorModel | {message : string}, status: number}) => {
                if (err.data) {
                    if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                    else if ('message' in err.data) showToastError(err.data.message);
                }
            })
    }

    return (
        <ModalWrapper title={'Supprimer ville'} showModal={showModal} setShowModal={setShowModal} id='EditOrderModal'>
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
                        Voulez vous vraiment supprimer cette ville ?
                    </h2>
                    <button 
                        onClick={onClick}
                        className="btn btn-danger btn sweet-wrong"
                    >Supprimer</button>
                </div>
            </div>
        </div>
    )
}