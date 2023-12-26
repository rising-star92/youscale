import React from 'react';
import { ErrorModel, GetProductModel } from '../../../models';
import { useGetProductQuery } from '../../../services/api/ClientApi/ClientProductApi';
import { showToastError } from '../../../services/toast/showToastError';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CustumInput, CustumSelectForm } from '../../Forms/v2';
import { Spinner4Bar } from '../../Loader';
import styles from './product.module.css';
import * as yup from "yup";
import { useAddStockMutation } from '../../../services/api/ClientApi/ClientStockApi';

type Inputs = {
    quantity: string,
    id_product: string
};

type SelectType = {
    label: string,
    value: string | number
}

const FormatProductSelect = (data: GetProductModel[] | undefined): SelectType[] => {
    if (!data) return []

    var newArr: SelectType[] = [{ label: 'none', value: 'none' }]

    for (let i = 0; i < data.length; i++) {
        newArr.push({
            value: data[i].id ?? 0,
            label: data[i].name
        })
    }

    return newArr
}

const schema = yup.object().shape({
    quantity: yup.string().required('Ce champ est obligatoire'),
    id_product: yup.string().required('Ce champ est obligatoire'),
}).required();

interface Props {
    setIsVisible: React.Dispatch<React.SetStateAction<boolean>>
    refetch: () => any
    driverObj: {
        moveNext: () => void
    }
}
const AddSotckModal: React.FC<Props> = ({ setIsVisible, refetch, driverObj }): JSX.Element | null => {

    const handleClose = () => {
        setIsVisible(false);
        driverObj.moveNext()
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={handleClose}>
                    &times;
                </button>
                <div className={styles.main}>
                    <p className={styles.title}>Ajouter un stock</p>

                    <FormBody refetch={refetch} handleClose={handleClose} />
                </div>
            </div>
        </div>
    );
}

interface FormBodyProps {
    refetch: () => any
    handleClose: () => void
}

const FormBody = ({ refetch, handleClose }: FormBodyProps) => {

    const [adderStock, { isLoading }] = useAddStockMutation()

    const { data: productData } = useGetProductQuery({ isHidden: false })

    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
        resolver: yupResolver(schema),
    });

    const onSubmit = (values: Inputs) => {

        adderStock(values).unwrap()
            .then(res => {
                console.log(res)
                refetch()
                handleClose()
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
                            name={'quantity'}
                            error={errors.quantity}
                            type={'text'}
                            label={"Quantité"}
                            placeholder={'12'}
                        />

                        <CustumSelectForm
                            data={FormatProductSelect(productData?.data)}
                            register={register}
                            error={errors.id_product}
                            label={"Produit"}
                            name={'id_product'}
                        />
                    </div>

                    {
                        isLoading ? <Spinner4Bar /> :
                            <div className={styles.bottomAction}>
                                <button type="submit" className={styles.saveBtn}>
                                    Enregistrer
                                </button>
                                <a href="#" onClick={handleClose} className={styles.NextBtn}>
                                    Fermer
                                </a>
                            </div>
                    }
                </form>
            </div>
        </div>

    )
}

export default AddSotckModal;
