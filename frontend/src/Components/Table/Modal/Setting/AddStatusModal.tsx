import React, { useEffect, useState } from 'react'
import { CustumInput } from '../../../Forms'
import ModalWrapper from '../ModalWrapper'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { useAddColumnMutation } from '../../../../services/api/ClientApi/ClientColumnApi';
import { showToastError } from '../../../../services/toast/showToastError';
import { useAddStatusMutation } from '../../../../services/api/ClientApi/ClientStatusApi';
import { ErrorModel } from '../../../../models';

type Inputs = {
    name: '',
    checked: true
};

const schema = yup.object().shape({
    name: yup.string().required('Ce champ est obligatoire'),
    checked: yup.boolean().required('Ce champ est obligatoire')
}).required();

interface Props {
    showModal: boolean,
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
    refetch: () => any
}
export default function AddStatusModal({ showModal, setShowModal, refetch }: Props): JSX.Element {

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

    return (
        <ModalWrapper showModal={showModal} title={'Add status'} setShowModal={setShowModal} id='AddOrderModal'>
            <FormBody handleCloseModal={handleCloseModal} refetch={refetch} />
        </ModalWrapper>
    )
}

interface FormBodyProps {
    handleCloseModal: () => any,
    refetch: () => any
}
const FormBody = ({ handleCloseModal, refetch }: FormBodyProps) => {
    const [addStatus] = useAddStatusMutation()

    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
        resolver: yupResolver(schema)
    });

    const onSubmit = (values: Inputs) => {
      
    }

    return (
        <div className="card-body">
            <div className="basic-form">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                        <CustumInput
                            register={register}
                            name={'name'}
                            error={errors.name}
                            type={'text'}
                            label={"Name"}
                            placeholder={'Nom'}
                        />
                    </div>

                    <div className="row">
                        <div className="form-check custom-checkbox mb-3 checkbox-info">
                            <input
                                {...register('checked')}
                                type="checkbox"
                                className="form-check-input"
                                defaultChecked={true}
                                id="customCheckBox2"
                            />
                            <label className="form-check-label" htmlFor="customCheckBox2">
                                Active
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary">
                        Ajouter
                    </button>
                </form>
            </div>
        </div>
    )
}