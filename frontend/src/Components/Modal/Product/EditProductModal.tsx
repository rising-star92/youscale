import React, { useState } from 'react';
import { ErrorModel, GetProductModel } from '../../../models';
import { useAddProductMutation, usePatchProductMutation } from '../../../services/api/ClientApi/ClientProductApi';
import { showToastError } from '../../../services/toast/showToastError';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CustumInput, SwitchForm } from '../../Forms/v2';
import { Spinner4Bar } from '../../Loader';
import styles from './product.module.css';
import * as yup from "yup";

type SelectType = {
    label: string,
    value: string | number
}
type Inputs = {
    name: string,
    price_selling: string
};

const schema = yup.object().shape({
    name: yup.string().max(14, 'Maximum 14 caractères').required('Ce champ est obligatoire'),
    price_selling: yup.string().required('Ce champ est obligatoire')
}).required();

interface Props {
    setIsVisible: React.Dispatch<React.SetStateAction<boolean>>
    item: GetProductModel | undefined
    refetch: () => any
}
const EditProductModal: React.FC<Props> = ({ setIsVisible, refetch, item }): JSX.Element | null => {

    const handleClose = () => {
        setIsVisible(false);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={handleClose}>
                    &times;
                </button>
                <div className={styles.main}>
                    <p className={styles.title}>Modifier un produit</p>

                    <FormBody refetch={refetch} item={item} handleClose={handleClose} />
                </div>
            </div>
        </div>
    );
}

interface FormBodyProps {
    refetch: () => any
    item: GetProductModel | undefined
    handleClose: () => void
}

const FormBody = ({ refetch, item, handleClose }: FormBodyProps) => {

    const [showVariant, setShowVariant] = useState<boolean>(false)
    const [selected, setSelected] = useState<string[]>(item?.variant || []);

    const [patchProd, { isLoading }] = usePatchProductMutation()

    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
        resolver: yupResolver(schema),
    });

    const onSubmit = (values: Inputs) => {
        const data = {
            id: item ? item.id : 0,
            variant: selected,
            ...values,
        }

        patchProd(data).unwrap()
            .then(res => {
                console.log(res)
                refetch()
                handleClose()
            })
            .catch((err: { data: ErrorModel, status: number }) => showToastError(err.data.errors[0].msg))
    }

    const switchShowVariant = () => {
        setShowVariant(!showVariant)
    }

    return (
        <div className="card-body">
            <div className="basic-form">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                        <CustumInput
                            defaultValue={item?.name}
                            register={register}
                            name={'name'}
                            error={errors.name}
                            type={'text'}
                            label={"Nom"}
                            placeholder={'Nivea'}
                        />

                        <CustumInput
                            defaultValue={item?.price_selling}
                            register={register}
                            name={'price_selling'}
                            error={errors.price_selling}
                            type={'text'}
                            label={"Prix d'achat"}
                            placeholder={'12.55'}
                        />
                    </div>
                    <div className="row">
                        <SwitchForm label={'Variant'} active={showVariant} SwitchHideProduct={switchShowVariant} />
                        {showVariant && <AddVariant setSelected={setSelected} />}
                    </div>

                    {
                        isLoading ? <Spinner4Bar /> :
                            <div className={styles.bottomAction}>
                                <button type="submit" className={styles.saveBtn}>
                                    Modifier
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

interface AddVariantProps {
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
}
const AddVariant = ({ setSelected }: AddVariantProps): JSX.Element => {

    const [variant, setVariant] = useState<string>('')

    const handleChangeVariant = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target
        setVariant(value)
    }

    const handleAddVariant = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        setSelected((prev) => [...prev, variant])
    }

    return (
        <div className={styles.variantBox}>
            <CustumInput
                onChange={handleChangeVariant}
                name={'variant'}
                error={undefined}
                register={() => console.log('nothing')}
                type={'text'}
                label={"Variant"}
                placeholder={'Mountain'}
            />
            <div className={styles.bottomAction}>
                <button type="submit" onClick={handleAddVariant} className={styles.saveBtn}>
                    Enregistrer
                </button>
            </div>
        </div>
    )
}

export default EditProductModal;
