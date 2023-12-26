import React, { useEffect, useState } from 'react'
import ModalWrapper from '../ModalWrapper'
import { CustumInput } from '../../../Forms'
import { MultiSelectElement } from '../../../Input'
import { UseFormRegister, UseFormSetValue } from 'react-hook-form/dist/types/form'
import { FieldError } from 'react-hook-form/dist/types/errors'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useGetColumnQuery } from '../../../../services/api/ClientApi/ClientColumnApi'
import { useGetCityQuery } from '../../../../services/api/ClientApi/ClientCityApi'
import { useGetProductQuery } from '../../../../services/api/ClientApi/ClientProductApi'
import { useGetPageQuery } from '../../../../services/api/ClientApi/ClientPageApi'
import { useAddTeamMemberMutation } from '../../../../services/api/ClientApi/ClientTeamMemberApi'
import { showToastError } from '../../../../services/toast/showToastError'
import { ErrorModel } from '../../../../models'
import './team.style.css'
import * as yup from "yup";

type Inputs = {
    name: string,
    email: string,
    livoToken: string,
    password: string,
    salaire: string,
    commission: string,
    upsell: string,
    downsell: string,
    crosssell: string,
    max_order: string,
    can_delete_order: boolean,
    can_edit_order: boolean,
    all_column_access: boolean,
    all_cities_access: boolean,
    all_product_access: boolean,
    all_page_access: boolean,
    column_access: string[],
    cities_access: string[],
    product_access: string[],
    page_access: string[]
}

const schema = yup.object().shape({
    name: yup.string().required('Ce champ est obligatoire'),
    email: yup.string().required('Ce champ est obligatoire'),
    livoToken: yup.string().notRequired(),
    password: yup.string().min(8, 'Le mot de passe doit contenir au minimum 8 caractères').required('Ce champ est obligatoire'),
    salaire: yup.string().required('Ce champ est obligatoire'),
    commission: yup.string().required('Ce champ est obligatoire'),
    upsell: yup.string().required('Ce champ est obligatoire'),
    downsell: yup.string().required('Ce champ est obligatoire'),
    crosssell: yup.string().required('Ce champ est obligatoire'),
    max_order: yup.string().required('Ce champ est obligatoire'),

    can_delete_order: yup.boolean().required('Ce champ est obligatoire'),
    can_edit_order: yup.boolean().required('Ce champ est obligatoire'),

    all_column_access: yup.boolean().required('Ce champ est obligatoire'),
    all_cities_access: yup.boolean().required('Ce champ est obligatoire'),
    all_product_access: yup.boolean().required('Ce champ est obligatoire'),
    all_page_access: yup.boolean().required('Ce champ est obligatoire'),

    column_access: yup.array().notRequired(),
    cities_access: yup.array().notRequired(),
    product_access: yup.array().notRequired(),
    page_access: yup.array().notRequired()

}).required();

const FormatDataOption = (data: any) => {
    var objArr: { label: string, value: string }[] = []

    if (!data) return []

    for (let i = 0; i < data.length; i++) {
        objArr.push({ label: data[i].name, value: data[i].id })
    }

    return objArr
}

interface Props {
    showModal: boolean,
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
    refetch: () => any
    driverObj: {
        moveNext: () => void
    }
}
export default function AddTeamModal({ showModal, setShowModal, refetch, driverObj }: Props): JSX.Element {

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
            driverObj.moveNext()
        }
    }

    return (
        <ModalWrapper showModal={showModal} title={'Add team'} closeModal={handleCloseModal} setShowModal={setShowModal} id='AddOrderModal'>
            <FormBody refetch={refetch} handleCloseModal={handleCloseModal} />
        </ModalWrapper>
    )
}

interface FormBodyProps {
    refetch: () => any,
    handleCloseModal: () => void
}
const FormBody = ({ refetch, handleCloseModal }: FormBodyProps) => {
    const [addTeam] = useAddTeamMemberMutation()

    const { data: ColumnData } = useGetColumnQuery()
    const { data: CityData } = useGetCityQuery()
    const { data: ProductData } = useGetProductQuery({ isHidden: false })
    const { data: PageData } = useGetPageQuery()

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<Inputs>({
        resolver: yupResolver(schema),
    });

    const onSubmit = (values: Inputs) => {
        const data = {
            ...values,
            day_payment: '1',
            column_access: values.column_access ?? [],
            cities_access: values.cities_access ?? [],
            product_access: values.product_access ?? [],
            page_access: values.page_access ?? []
        }

        addTeam(data).unwrap()
            .then(res => {
                refetch()
                handleCloseModal()
            })
            .catch((err: { data: ErrorModel | { message: string }, status: number }) => {
                if (err.data) {
                    if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                    else if ('message' in err.data) showToastError(err.data.message);
                }
            })
    }

    return (
        <div className="card-body">
            <div className="basic-form">
                <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
                    <div className="row">
                        <CustumInput
                            register={register}
                            name={'name'}
                            error={errors.name}
                            type={'text'}
                            label={"Nom"}
                            placeholder={'Patrick Doe'}
                        />

                        <CustumInput
                            register={register}
                            name={'email'}
                            error={errors.email}
                            type={'email'}
                            label={"Email"}
                            placeholder={'her@mail.com'}
                        />

                        <CustumInput
                            register={register}
                            name={'password'}
                            error={errors.password}
                            showEye={true}
                            type={'password'}
                            label={"Password"}
                            placeholder={'*****'}
                            className={'lg-input-cus'}
                        />

                        <CustumInput
                            register={register}
                            name={'livoToken'}
                            error={errors.livoToken}
                            type={'text'}
                            label={"token"}
                            placeholder={'your_token_here'}
                            className={'lg-input-cus'}
                        />
                    </div>

                    <div className="row">
                        <CustumInput
                            register={register}
                            name={'salaire'}
                            error={errors.salaire}
                            type={'number'}
                            label={"Salaire"}
                            placeholder={'1455.25'}
                            defaultValue={0}
                        />

                        <CustumInput
                            register={register}
                            name={'commission'}
                            error={errors.commission}
                            type={'number'}
                            label={"Comission"}
                            placeholder={'12.6'}
                            defaultValue={0}
                        />

                        <CustumInput
                            register={register}
                            name={'upsell'}
                            error={errors.upsell}
                            type={'number'}
                            label={"Upsell"}
                            placeholder={'36.4'}
                            defaultValue={0}
                        />

                        <CustumInput
                            register={register}
                            name={'downsell'}
                            error={errors.downsell}
                            type={'number'}
                            label={"Downsell"}
                            placeholder={'14.2'}
                            defaultValue={0}
                        />

                        <CustumInput
                            register={register}
                            name={'crosssell'}
                            error={errors.crosssell}
                            type={'number'}
                            label={"CrossSell"}
                            placeholder={'8'}
                            defaultValue={0}
                        />

                        <CustumInput
                            register={register}
                            name={'max_order'}
                            error={errors.max_order}
                            type={'number'}
                            label={"commande max en attente"}
                            placeholder={'2'}
                            defaultValue={0}
                        />
                    </div>

                    <div className="row">
                        <div className="form-check custom-checkbox mb-3 checkbox-info">
                            <input
                                {...register('can_delete_order')}
                                type="checkbox"
                                className="form-check-input"
                                defaultChecked={true}
                                id="customCheckBox2"
                            />
                            <label className="form-check-label" htmlFor="customCheckBox2">
                                {'peut supprimer commande'}
                            </label>
                        </div>

                        <div className="form-check custom-checkbox mb-3 checkbox-info">
                            <input
                                {...register('can_edit_order')}
                                type="checkbox"
                                className="form-check-input"
                                defaultChecked={true}
                                id="customCheckBox2"
                            />
                            <label className="form-check-label" htmlFor="customCheckBox2">
                                {'peut modifier commande'}
                            </label>
                        </div>
                    </div>

                    <div className="row">
                        <AllAccess
                            options={FormatDataOption(ColumnData?.data)}
                            setValue={setValue}
                            register={register}
                            name={'all_column_access'}
                            column={'column_access'}
                            error={errors.all_column_access}
                            label={'toutes les collones'}
                        />

                        <AllAccess
                            options={FormatDataOption(CityData?.data)}
                            setValue={setValue}
                            register={register}
                            name={'all_cities_access'}
                            error={errors.all_cities_access}
                            column={'cities_access'}
                            label={'toutes les villes'}
                        />

                        <AllAccess
                            options={FormatDataOption(ProductData?.data)}
                            setValue={setValue}
                            register={register}
                            name={'all_product_access'}
                            column={'product_access'}
                            error={errors.all_product_access}
                            label={'tout les produits'}
                        />

                        <AllAccess
                            options={FormatDataOption(PageData?.data)}
                            setValue={setValue}
                            register={register}
                            name={'all_page_access'}
                            error={errors.all_page_access}
                            column={'page_access'}
                            label={'toutes les pages'}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary">
                        Ajouter
                    </button>
                </form>
            </div>
        </div>
    )
}

interface ColumnAccessProps {
    label: string,
    options: { label: string, value: string, disabled?: boolean }[],
    register: UseFormRegister<any> | any,
    name: string,
    column: 'column_access' | 'cities_access' | 'product_access' | 'page_access',
    error: FieldError | undefined,
    setValue: UseFormSetValue<Inputs>
}
const AllAccess = ({ label, register, name, error, setValue, options, column }: ColumnAccessProps): JSX.Element => {
    const [isAll, setIsAll] = useState<boolean>(true)
    const [selected, setSelected] = useState<[]>([]);

    const getArrayFromSelected = (data: []): string[] => {
        var new_arr = data.map((dt: { value: string | number }) => String(dt.value))

        return new_arr
    }

    const handleMultiSelect = (value: any) => {
        setSelected(value)
        setValue(column, getArrayFromSelected(value))
    }

    return (
        <div className='column-access-row'>
            <div className="form-check custom-checkbox mb-3 checkbox-info">
                <input
                    {...register(name)}
                    onClick={() => setIsAll(!isAll)}
                    type="checkbox"
                    className="form-check-input"
                    defaultChecked={true}
                    id="customCheckBox2"
                />
                <label className="form-check-label" htmlFor="customCheckBox2">
                    {label}
                </label>
            </div>

            {!isAll && <MultiSelectElement
                options={options}
                selected={selected}
                onChange={handleMultiSelect}
                className={'lg-mse'}
            />}
        </div>
    )
}