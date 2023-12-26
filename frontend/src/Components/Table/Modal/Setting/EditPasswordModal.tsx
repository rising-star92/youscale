import React, { useEffect } from 'react'
import { CustumInput } from '../../../Forms'
import ModalWrapper from '../ModalWrapper'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { showToastError } from '../../../../services/toast/showToastError';
import { ErrorModel } from '../../../../models';
import { useResetClientPasswordMutation } from '../../../../services/api/ClientApi/ClientPasswordApi';
import { showToastSucces } from '../../../../services/toast/showToastSucces';


type Inputs = {
    prevPassword: string,
    newPassword: string
};

const schema = yup.object().shape({
    prevPassword: yup.string().min(8, 'Minimum 8 caractères').required('Ce champ est obligatoire'),
    newPassword: yup.string().min(8, 'Minimum 8 caractères').required('Ce champ est obligatoire')
}).required();

interface Props {
    showModal: boolean,
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>
}
export default function EditPasswordModal({ showModal, setShowModal }: Props): JSX.Element {

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
        <ModalWrapper showModal={showModal} title={'Modifier le mot de passe'} setShowModal={setShowModal} id='AddOrderModal'>
            <FormBody handleCloseModal={handleCloseModal} />
        </ModalWrapper>
    )
}

interface FormBodyProps {
    handleCloseModal: () => void
}
const FormBody = ({ handleCloseModal }: FormBodyProps) => {
    const [resetClientPassword, { data, isLoading, error, isSuccess }] = useResetClientPasswordMutation();

    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
        resolver: yupResolver(schema),
    });

    const onSubmit = (values: Inputs) => {

        resetClientPassword(values).unwrap()
            .then(res => {
                showToastSucces('Le mot de passe a été modifié')
                handleCloseModal()
            })
            .catch((err: {data: ErrorModel | {message : string}, status: number}) => {
                if (err.data) {
                    if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                    else if ('message' in err.data) showToastError(err.data.message);
                }
            })
    }

    return (
        <div className="card-body">
            <div className="basic-form">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                        <CustumInput
                            register={register}
                            name={'prevPassword'}
                            error={errors.prevPassword}
                            type={'password'}
                            label={"Mot de passe actuel"}
                            placeholder={'actuel'}
                        />

                        <CustumInput
                            register={register}
                            name={'newPassword'}
                            error={errors.newPassword}
                            type={'password'}
                            label={"Nouveau mot de passe"}
                            placeholder={'nouveau'}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary">
                        Modifier
                    </button>
                </form>
            </div>
        </div>
    )
}