import React from 'react'
import { useGetSettingQuery, usePatchSettingMutation } from '../../../services/api/ClientApi/ClientSettingApi';
import { UseFormRegister, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { showToastSucces } from '../../../services/toast/showToastSucces';
import { ErrorModel } from '../../../models';
import { showToastError } from '../../../services/toast/showToastError';
import styles from './setting.module.css'
import * as yup from "yup";

type Inputs = {
    automated_msg: string
    startWrldOrder: string
};

const schema = yup.object().shape({
    automated_msg: yup.string().notRequired(),
    startWrldOrder: yup.string().notRequired()
}).required();


interface Props {
    setIsVisible: React.Dispatch<React.SetStateAction<boolean>>
    driverObj: {
        moveNext: () => void
    }
}
export default function IntegrateWhatsappModal({ setIsVisible, driverObj }: Props): JSX.Element {

    const { data, refetch } = useGetSettingQuery()
    const [patchSetting] = usePatchSettingMutation()

    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
        resolver: yupResolver(schema),
    });


    const handleClose = () => {
        setIsVisible(false);
        driverObj.moveNext()
    };

    const onSubmit = (values: Inputs) => {

        const datas = {
            ...values,
            id: data?.data.id ?? 0,
            startWrldOrder: values.startWrldOrder || String(data?.data.startWrldOrder) || 'none',
            automated_msg: values.automated_msg || String(data?.data.automated_msg) || 'nones'
        }

        patchSetting(datas).unwrap()
            .then(res => {
                console.log(res)
                showToastSucces('La configuration a été modifié')
                refetch()
                handleClose()
            })
            .catch((err: { data: ErrorModel | { message: string }, status: number }) => {
                if (err.data) {
                    if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                    else if ('message' in err.data) showToastError(err.data.message);
                }
            })
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent_Whatsapp}>
                <button className={styles.closeButton} onClick={handleClose}>
                    &times;
                </button>
                <div className={styles.main_Whatsapp}>
                    <p className={styles.title}>Intégration de Whatsapp</p>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className={styles.whtContent}>
                            <Field
                                register={register}
                                name={'startWrldOrder'}
                                defaultValue={data?.data.startWrldOrder}
                                label={'Commande ID prefix'}
                                placeholder={'#1020'}
                            />

                            <TextArea
                                register={register}
                                name={'automated_msg'}
                                defaultValue={data?.data.automated_msg}
                                label={'Message automatisé'}
                                placeholder={'msg'}
                            />
                        </div>

                        <div className={styles.bottomBtn}>
                            <button className={styles.saveBtn}>
                                Enregistrer
                            </button>

                            <button onClick={() => handleClose()} className={styles.closeBtn}>
                                Fermer
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    )
}

interface FieldProps {
    label: string
    placeholder: string
    defaultValue?: string
    register: UseFormRegister<Inputs>
    name: 'automated_msg' | 'startWrldOrder'
}
const Field = ({ label, placeholder, defaultValue, register, name }: FieldProps): JSX.Element => {
    return (
        <div className={styles.whtField}>
            <p>
                {label}
                <img src="/svg/setting/info.svg" alt="info" />
            </p>

            <input
                {...register(name)}
                type="text"
                placeholder={placeholder}
                defaultValue={defaultValue}
            />
        </div>
    )
}

interface FieldProps {
    label: string
    placeholder: string
    value?: string
}
const TextArea = ({ label, placeholder, defaultValue, register, name }: FieldProps): JSX.Element => {
    return (
        <div className={styles.whtField}>
            <p>
                {label}
                <img src="/svg/setting/info.svg" alt="info" />
            </p>

            <textarea
                {...register(name)}
                placeholder={placeholder}
                defaultValue={defaultValue}
                cols={30}
                rows={10}
            >
            </textarea>
        </div>
    )
}