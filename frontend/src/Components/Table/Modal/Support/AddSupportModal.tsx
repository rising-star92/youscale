import React, { useEffect, useState } from 'react'
import { CustumInput } from '../../../Forms'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorModel } from '../../../../models';
import { showToastError } from '../../../../services/toast/showToastError';
import { useCreateSupportMutation } from '../../../../services/api/ClientApi/ClientSupportApi';
import ModalWrapper from '../ModalWrapper'
import * as yup from "yup";
import './product.style.css'


type Inputs = {
    subject: string,
    description: string
    attachment: string
};

const schema = yup.object().shape({
    subject: yup.string().required('Ce champ est obligatoire'),
    description: yup.string().required('Ce champ est obligatoire'),
    attachment: yup.string().notRequired()
}).required();

interface Props {
    showModal: boolean,
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
    refetch: () => any
}
export default function AddSupportModal({ showModal, setShowModal, refetch }: Props): JSX.Element {

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
        <ModalWrapper title={'Create Issue'} showModal={showModal} setShowModal={setShowModal} id='AddProductModal'>
            <FormBody handleCloseModal={handleCloseModal} refetch={refetch} setShowModal={setShowModal} />
        </ModalWrapper>
    )
}

interface FormBodyProps {
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
    refetch: () => any,
    handleCloseModal: () => any
}
const FormBody = ({ setShowModal, refetch, handleCloseModal }: FormBodyProps) => {

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<Inputs>({
        resolver: yupResolver(schema),
    });

    const [selectedFile, setSelectedFile] = useState()
    const [preview, setPreview] = useState<string>()

    useEffect(() => {
        if (!selectedFile) {
            setPreview(undefined)
            return
        }

        const objectUrl = URL.createObjectURL(selectedFile)
        setPreview(objectUrl)

        return () => URL.revokeObjectURL(objectUrl)
    }, [selectedFile])

    const getBase64 = (file: any) => new Promise(function (resolve, reject) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result)
    })

    const onSelectFile = (e: any) => {
        if (!e.target.files || e.target.files.length === 0) {
            setSelectedFile(undefined)
            return
        }

        setSelectedFile(e.target.files[0])
        getBase64(e.target.files[0]).then((data: any) => {
            setValue('attachment', data)
        })
    }

    const [createIssue] = useCreateSupportMutation()

    const onSubmit = (values: Inputs) => {
        const data = {
            ...values
        }

        createIssue(data).unwrap()
            .then(res => {
                console.log(res)
                refetch()
                handleCloseModal()
            })
            .catch((err: { data: ErrorModel, status: number }) => showToastError(err.data.errors[0].msg))
    }

    return (
        <div className="card-body">
            <div className="basic-form">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                        <CustumInput
                            register={register}
                            name={'subject'}
                            error={errors.subject}
                            type={'text'}
                            label={"Subject"}
                            placeholder={'Lorem pissu'}
                            className='lg-input-cus'
                        />
                    </div>

                    <div className="row">
                        <CustumInput
                            register={register}
                            name={'description'}
                            error={errors.description}
                            type={'text'}
                            label={"Description"}
                            placeholder={'your description'}
                            className='lg-input-cus'
                        />
                    </div>

                    <div className="row">
                        {selectedFile && <img src={preview} className='payment-image' />}
                        <input type="file" className="form-file-input form-control" onChange={onSelectFile} name="attachement" accept="image/png, image/jpeg" />
                        {errors.attachment && <p className='error'>{errors.attachment.message}</p>}
                    </div>

                    <button type="submit" className="btn btn-primary add-btn">
                        Créer
                    </button>
                </form>
            </div>
        </div>
    )
}