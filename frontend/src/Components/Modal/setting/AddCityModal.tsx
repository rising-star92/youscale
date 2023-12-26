import React from 'react'
import { FieldError, UseFormRegister } from 'react-hook-form'
import { ErrorModel, ShippingModel } from '../../../models';
import { useGetShippingQuery } from '../../../services/api/ClientApi/ClientShippingApi';
import { useAddCityMutation } from '../../../services/api/ClientApi/ClientCityApi';
import { showToastError } from '../../../services/toast/showToastError';
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import styles from './setting.module.css'

type Inputs = {
    name: string,
    price: string
    id_shipping: number
};

type SelectType = {
    label: string,
    value: string | number
}

const GetShippingCompanies = (data: ShippingModel[] | undefined): SelectType[] => {
    if (!data) return []

    var newArr: SelectType[] = [{ label: 'none', value: 0 }]

    for (let i = 0; i < data.length; i++) {
        newArr.push({
            value: data[i].id ?? 0,
            label: data[i].name
        })
    }

    return newArr
}

const schema = yup.object().shape({
    name: yup.string().required('Ce champ est obligatoire'),
    price: yup.string().required('Ce champ est obligatoire')
}).required();

interface Props {
    setIsVisible: React.Dispatch<React.SetStateAction<boolean>>
    driverObj: {
        moveNext: () => void
    }
    refetch: () => any
}
export default function AddCityModal({ setIsVisible, driverObj, refetch }: Props): JSX.Element {

    const handleClose = () => {
        setIsVisible(false);
        driverObj.moveNext()
    };

    const { data: shippingData } = useGetShippingQuery()
    const [addCity] = useAddCityMutation()

    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
        resolver: yupResolver(schema),
    });

    const onSubmit = (values: Inputs) => {

        const data = {
            ...values,
            id_shipping: String(values.id_shipping) === "" ? null : values.id_shipping
        }

        addCity(data).unwrap()
            .then(res => {
                refetch()
                handleClose()
            })
            .catch((err: { data: ErrorModel | { message: string }, status: number }) => {
                if (err.data) {
                    if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                    else if ('message' in err.data) showToastError(err.data.message);
                }
            })
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent_City}>
                <button className={styles.closeButton} onClick={handleClose}>
                    &times;
                </button>
                <div className={styles.main_Whatsapp}>
                    <p className={styles.title}>Ajouter une ville</p>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className={styles.whtContent}>
                            <Field
                                register={register}
                                name={'name'}
                                error={errors.name}
                                type={'text'}
                                label={"Name"}
                                placeholder={'Nom'}
                            />

                            <Field
                                register={register}
                                name={'price'}
                                error={errors.price}
                                type={'text'}
                                label={"Price"}
                                placeholder={'Prix'}
                            />

                            <Select
                                defaultSelected={null}
                                data={GetShippingCompanies(shippingData?.data)}
                                register={register}
                                error={errors.id_shipping}
                                label={"Shipping companies"}
                                name={'id_shipping'}
                            />

                        </div>

                        <div className={styles.bottomBtn}>
                            <button className={styles.saveBtn}>
                                Ajouter
                            </button>

                            <a href='#' onClick={handleClose} className={styles.closeBtn}>
                                Fermer
                            </a>
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
    type: 'text' | 'number'
    defaultValue?: string | number
    register: UseFormRegister<any> | any
    name: string
    error: FieldError | undefined
}
const Field = ({ label, placeholder, type, defaultValue, register, name, error }: FieldProps): JSX.Element => {
    return (
        <div className={styles.whtField}>
            <p>
                {label}
            </p>

            <input
                {...register(name)}
                type={type}
                name={name}
                placeholder={placeholder}
                value={defaultValue}
            />

            {error && <p className={styles.errorTxt}>{error.message}</p>}
        </div>
    )
}

interface SelectProps {
    label: string
    name: string
    register: UseFormRegister<any>
    error: FieldError | undefined
    data: { label: string, value: string | number }[]
    defaultSelected?: string | number | null
}
const Select = ({ label, name, register, error, data, defaultSelected }: SelectProps): JSX.Element => {
    return (
        <div className={styles.whtField}>
            <p>
                {label}
            </p>

            <select
                {...register(name)}
                name={name}
            >
                {data.map((dt, index) => <option key={index} selected={String(defaultSelected) === String(dt.value)} value={dt.value}>{dt.label}</option>)}
            </select>
            {error && <p className={styles.errorTxt}>{error.message}</p>}
        </div>
    )
}