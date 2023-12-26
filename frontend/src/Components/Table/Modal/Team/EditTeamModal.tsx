import React, { useEffect, useState } from 'react'
import { CustumInput } from '../../../Forms'
import { MultiSelectElement } from '../../../Input'
import ModalWrapper from '../ModalWrapper'
import { CityAccessModel, ColumnAccessModel, ErrorModel, GetTeamMemberModel, PageAccessModel, ProductAccessModel } from '../../../../models'
import { UseFormRegister, UseFormSetValue } from 'react-hook-form/dist/types/form'
import { FieldError } from 'react-hook-form/dist/types/errors'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useGetColumnQuery } from '../../../../services/api/ClientApi/ClientColumnApi'
import { useGetCityQuery } from '../../../../services/api/ClientApi/ClientCityApi'
import { useGetProductQuery } from '../../../../services/api/ClientApi/ClientProductApi'
import { useGetPageQuery } from '../../../../services/api/ClientApi/ClientPageApi'
import { usePatchTeamMemberMutation } from '../../../../services/api/ClientApi/ClientTeamMemberApi'
import { showToastError } from '../../../../services/toast/showToastError'
import * as yup from "yup";
import './team.style.css'

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
    name: yup.string().notRequired(),
    email: yup.string().notRequired(),
    livoToken: yup.string().notRequired(),
    password: yup.string().min(8, 'Le mot de passe doit contenir au minimum 8 caractères').notRequired(),
    salaire: yup.string().notRequired(),
    commission: yup.string().notRequired(),
    upsell: yup.string().notRequired(),
    downsell: yup.string().notRequired(),
    crosssell: yup.string().notRequired(),
    max_order: yup.string().notRequired(),

    can_delete_order: yup.boolean().notRequired(),
    can_edit_order: yup.boolean().notRequired(),
    all_column_access: yup.boolean().notRequired(),
    all_cities_access: yup.boolean().notRequired(),
    all_product_access: yup.boolean().notRequired(),
    all_page_access: yup.boolean().notRequired(),

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

type MSEAccessType = {
    label: string,
    value: number
}

const getPageAccess = (data: PageAccessModel[] | undefined): MSEAccessType[] => {
    if (data) {
        var arr: { label: string, value: number }[] = []
        for (let i = 0; i < data.length; i++) {
            arr.push({ label: data[i].Client_Page.name, value: data[i].Client_Page.id })
        }

        return arr
    }

    return []
}

const getColumnAccess = (data: ColumnAccessModel[] | undefined): MSEAccessType[] => {
    if (data) {
        var arr: { label: string, value: number }[] = []
        for (let i = 0; i < data.length; i++) {
            arr.push({ label: data[i].Column_Of_Order.name, value: data[i].Column_Of_Order.id })
        }

        return arr
    }

    return []
}

const getProductAccess = (data: ProductAccessModel[] | undefined): MSEAccessType[] => {
    if (data) {
        var arr: { label: string, value: number }[] = []
        for (let i = 0; i < data.length; i++) {
            arr.push({ label: data[i].Product.name, value: data[i].Product.id })
        }

        return arr
    }

    return []
}

const getCityAccess = (data: CityAccessModel[] | undefined): MSEAccessType[] => {
    if (data) {
        var arr: { label: string, value: number }[] = []
        for (let i = 0; i < data.length; i++) {
            arr.push({ label: data[i].City_User.name, value: data[i].City_User.id })
        }

        return arr
    }

    return []
}

const getProductAccessEdit = (data: ProductAccessModel[] | undefined): string[] => {
    if (!data) return []
    var outs: string[] = []

    data.map((dt, i) => outs.push(String(dt.Product.id)))

    return outs
}

const getCityAccessEdit = (data: CityAccessModel[] | undefined): string[] => {
    if (!data) return []
    var outs: string[] = []

    data.map((dt, i) => outs.push(String(dt.City_User.id)))

    return outs
}

const getPageAccessEdit = (data: PageAccessModel[] | undefined): string[] => {
    if (!data) return []
    var outs: string[] = []

    data.map((dt, i) => outs.push(String(dt.Client_Page.id)))

    return outs
}

const getColumnAccessEdit = (data: ColumnAccessModel[] | undefined): string[] => {
    if (!data) return []
    var outs: string[] = []

    data.map((dt, i) => outs.push(String(dt.Column_Of_Order.id)))

    return outs
}

interface Props {
    showModal: boolean,
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
    refetch: () => any,
    dataEdit: GetTeamMemberModel | undefined
}
export default function EditTeamModal({ showModal, setShowModal, refetch, dataEdit }: Props): JSX.Element {

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
        <ModalWrapper title={'Edit team'} showModal={showModal} setShowModal={setShowModal} id='AddOrderModal'>
            <FormBody refetch={refetch} dataEdit={dataEdit} handleCloseModal={handleCloseModal} />
        </ModalWrapper>
    )
}

interface FormBodyProps {
    refetch: () => any,
    handleCloseModal: () => void,
    dataEdit: GetTeamMemberModel | undefined
}
const FormBody = ({ refetch, handleCloseModal, dataEdit }: FormBodyProps) => {
    const [patchTeam, { isLoading } ] = usePatchTeamMemberMutation()

    const { data: ColumnData } = useGetColumnQuery()
    const { data: CityData } = useGetCityQuery()
    const { data: ProductData } = useGetProductQuery({ isHidden: false })
    const { data: PageData } = useGetPageQuery()

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<Inputs>({
        resolver: yupResolver(schema),
    });

    const onSubmit = (values: Inputs) => {

        const data: GetTeamMemberModel = {
            ...values,
            id: dataEdit?.id || 0,
            day_payment: '1',
            column_access: values.column_access ? values.column_access : getColumnAccessEdit(dataEdit?.Team_Client_Column_Acces),
            cities_access: values.cities_access ? values.cities_access : getCityAccessEdit(dataEdit?.Team_Client_City_Acces),
            product_access: values.product_access ? values.product_access : getProductAccessEdit(dataEdit?.Team_Client_Product_Acces),
            page_access: values.page_access ? values.page_access : getPageAccessEdit(dataEdit?.Team_Client_Page_Acces)
        }

        patchTeam(data).unwrap()
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
            handleCloseModal()
    }

    return (
        <div className="card-body">
            <div className="basic-form">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                        <CustumInput
                            defaultValue={dataEdit?.name}
                            register={register}
                            name={'name'}
                            error={errors.name}
                            type={'text'}
                            label={"Nom"}
                            placeholder={'Patrick Doe'}
                        />

                        <CustumInput
                            defaultValue={dataEdit?.email}
                            register={register}
                            name={'email'}
                            error={errors.email}
                            type={'email'}
                            label={"Email"}
                            placeholder={'her@mail.com'}
                        />

                        <CustumInput
                            defaultValue={'yourpassword'}
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
                            defaultValue={dataEdit?.livoToken}
                            register={register}
                            name={'livoToken'}
                            error={errors.livoToken}
                            type={'text'}
                            label={"Token"}
                            placeholder={'your_token_here'}
                            className={'lg-input-cus'}
                        />
                    </div>

                    <div className="row">
                        <CustumInput
                            defaultValue={dataEdit?.salaire}
                            register={register}
                            name={'salaire'}
                            error={errors.salaire}
                            type={'number'}
                            label={"Salaire"}
                            placeholder={'1455.25'}
                        />

                        <CustumInput
                            defaultValue={dataEdit?.commission}
                            register={register}
                            name={'commission'}
                            error={errors.commission}
                            type={'number'}
                            label={"Comission"}
                            placeholder={'12.6'}
                        />

                        <CustumInput
                            defaultValue={dataEdit?.upsell}
                            register={register}
                            name={'upsell'}
                            error={errors.upsell}
                            type={'number'}
                            label={"Upsell"}
                            placeholder={'36.4'}
                        />

                        <CustumInput
                            defaultValue={dataEdit?.downsell}
                            register={register}
                            name={'downsell'}
                            error={errors.downsell}
                            type={'number'}
                            label={"Downsell"}
                            placeholder={'14.2'}
                        />

                        <CustumInput
                            defaultValue={dataEdit?.crosssell}
                            register={register}
                            name={'crosssell'}
                            error={errors.crosssell}
                            type={'number'}
                            label={"CrossSell"}
                            placeholder={'8'}
                        />

                        <CustumInput
                            defaultValue={dataEdit?.max_order}
                            register={register}
                            name={'max_order'}
                            error={errors.max_order}
                            type={'number'}
                            label={"commande max en attente"}
                            placeholder={'2'}
                        />
                    </div>


                    <div className="row">
                        <div className="form-check custom-checkbox mb-3 checkbox-info">
                            <input
                                {...register('can_delete_order')}
                                type="checkbox"
                                className="form-check-input"
                                defaultChecked={dataEdit?.can_delete_order}
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
                                defaultChecked={dataEdit?.can_edit_order}
                                id="customCheckBox2"
                            />
                            <label className="form-check-label" htmlFor="customCheckBox2">
                                {'peut modifier commande'}
                            </label>
                        </div>

                    </div>

                    <div className="row">
                        <AllAccess
                            checked={dataEdit?.all_column_access}
                            selectedValues={getColumnAccess(dataEdit?.Team_Client_Column_Acces)}
                            options={FormatDataOption(ColumnData?.data)}
                            setValue={setValue}
                            register={register}
                            name={'all_column_access'}
                            column={'column_access'}
                            error={errors.all_column_access}
                            label={'toutes les collones'}
                        />

                        <AllAccess
                            checked={dataEdit?.all_cities_access}
                            selectedValues={getCityAccess(dataEdit?.Team_Client_City_Acces)}
                            options={FormatDataOption(CityData?.data)}
                            setValue={setValue}
                            register={register}
                            name={'all_cities_access'}
                            error={errors.all_cities_access}
                            column={'cities_access'}
                            label={'toutes les villes'}
                        />

                        <AllAccess
                            checked={dataEdit?.all_product_access}
                            selectedValues={getProductAccess(dataEdit?.Team_Client_Product_Acces)}
                            options={FormatDataOption(ProductData?.data)}
                            setValue={setValue}
                            register={register}
                            name={'all_product_access'}
                            column={'product_access'}
                            error={errors.all_product_access}
                            label={'tout les produits'}
                        />

                        <AllAccess
                            checked={dataEdit?.all_page_access}
                            selectedValues={getPageAccess(dataEdit?.Team_Client_Page_Acces)}
                            options={FormatDataOption(PageData?.data)}
                            setValue={setValue}
                            register={register}
                            name={'all_page_access'}
                            error={errors.all_page_access}
                            column={'page_access'}
                            label={'toutes les pages'}
                        />
                    </div>

                    <button disabled={isLoading} type="submit" className="btn btn-primary">
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
    setValue: UseFormSetValue<Inputs>,
    selectedValues: MSEAccessType[],
    checked: boolean | undefined
}
const AllAccess = ({ label, register, name, error, setValue, options, column, selectedValues, checked }: ColumnAccessProps): JSX.Element => {

    const [isAll, setIsAll] = useState<boolean | undefined>(checked)

    const [selected, setSelected] = useState<MSEAccessType[]>(selectedValues);

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
                    defaultChecked={checked}
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