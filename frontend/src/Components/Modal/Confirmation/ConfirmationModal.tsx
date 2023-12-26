import React, { useEffect, useState } from 'react';
import styles from './confirmation.module.css';
import { AiFillFilter } from 'react-icons/ai'
import { Filter } from '../../Filter';
import { useGetStatusQuery } from '../../../services/api/ClientApi/ClientStatusApi';
import { useGetClientOrderByIdQuery, usePatchClientOrderMutation } from '../../../services/api/ClientApi/ClientOrderApi';
import { CityModel, ErrorModel, GetClientOrderModel, GetProductModel, OrderOnlyModel, ProductOrder, StatusModel, countOrderByStatusModel } from '../../../models';
import { useGetProductQuery } from '../../../services/api/ClientApi/ClientProductApi';
import { showToastError } from '../../../services/toast/showToastError';
import { CustumDropdown, MultiSelectElement } from '../../Input/v2';
import { ProductOrderCard } from '../../Table/Modal/Order/Card';
import { useForm } from 'react-hook-form';
import { useGetSettingQuery } from '../../../services/api/ClientApi/ClientSettingApi';
import { useGetCityQuery } from '../../../services/api/ClientApi/ClientCityApi';
import { yupResolver } from '@hookform/resolvers/yup';
import { CustumInput, CustumSelectForm } from '../../Forms/v2';
import { IoLogoWhatsapp } from 'react-icons/io';
import { IoCallOutline } from 'react-icons/io5';
import { TbPointFilled } from 'react-icons/tb';
import { Spinner4Bar } from '../../Loader';
import * as yup from "yup";

type dataType = {
    label: string;
    value: string;
}

interface GetStatusModel {
    code: Number;
    data: StatusModel[];
    countOrderByStatus: countOrderByStatusModel[];
}

type Inputs = {
    nom: string,
    telephone: string,
    prix: string,
    adresse: string,
    message: string,
    status: string,
    source: string,
    updownsell: string,
    changer: string,
    ouvrir: string
};

const schema = yup.object().shape({
    nom: yup.string().notRequired(),
    telephone: yup.string().notRequired(),
    prix: yup.string().notRequired(),
    adresse: yup.string().notRequired(),
    message: yup.string().notRequired(),
    status: yup.string().notRequired(),
    source: yup.string().notRequired(),
    updownsell: yup.string().notRequired(),
    changer: yup.string().notRequired(),
    ouvrir: yup.string().notRequired(),
}).required();


const FilterStatusData = (data: StatusModel[] | undefined): dataType[] => {
    if (!data) return []

    var newArr: dataType[] = []

    data.filter((dt: StatusModel) => {
        if (dt.checked === true) newArr.push({ label: dt.name, value: dt.name })
    })

    return newArr
}

const FilterStatusWithOrder = (data: countOrderByStatusModel[] | undefined): dataType[] => {
    if (!data) return []

    var newArr: dataType[] = []

    data.filter((dt: countOrderByStatusModel) => {
        if (dt.count > 0) newArr.push({ label: dt.name, value: dt.name })
    })

    return newArr
}

interface ModalProps {
    id_orders: number[]
    isOpen: boolean
    setIsVisible: React.Dispatch<React.SetStateAction<boolean>>
    setStatus: React.Dispatch<React.SetStateAction<string | undefined>>
    statusConfirmation: string | undefined
    refetch: () => any
    driverObj: {
        moveNext: () => void
    }
}
const ConfirmationModal: React.FC<ModalProps> = ({ id_orders, isOpen, setIsVisible, setStatus, statusConfirmation, refetch, driverObj }): JSX.Element | null => {

    const { data: StatusData, refetch: RefetchStatus } = useGetStatusQuery({})

    const [index, setIndex] = useState<number>(0)
    const { data: currentOrder, isSuccess, refetch: refetchCurrentOrder, isFetching } = useGetClientOrderByIdQuery({ id: id_orders[index] })

    useEffect(() => {
        refetchCurrentOrder()
    }, [index])

    const OnChangeStatus = ({ label, value }: dataType) => {
        setStatus(value === "0" ? undefined : value)
    }

    const handleClose = () => {
        setIsVisible(false);
    };

    return (
        isOpen ? (
            (isSuccess && id_orders.length > 0) ?
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <button className={styles.closeButton} onClick={handleClose}>
                            &times;
                        </button>
                        <div className={styles.main}>
                            <p className={styles.title}>Confirmation des commandes</p>
                            <p className={styles.cmdRestante}>{id_orders.length - (index + 1)} commandes restantes</p>

                            <div className={styles.header}>
                                <div className={styles.dateId}>
                                    <div className={styles.dateId_desc}>
                                        <p>Date</p>
                                        <p>ID</p>
                                    </div>
                                    <div className={styles.dateId_value}>
                                        <p>{new Date(currentOrder.order[0].date).toISOString().split('T')[0]}</p>
                                        <p>{currentOrder.order[0].id}</p>
                                    </div>
                                </div>
                                <Filter Icons={AiFillFilter} data={FilterStatusWithOrder(StatusData?.countOrderByStatus)} onChange={OnChangeStatus} label={'Tous les status'} />
                            </div>

                            <ProductLayout refetch={refetch} id={id_orders[index]} editData={currentOrder.order[0].Product_Orders} />
                            {isFetching ? <p>Chargement</p> : <FormBody RefetchStatus={RefetchStatus} currentOrder={currentOrder} StatusData={StatusData} refetch={refetchCurrentOrder} setIndex={setIndex} id_orders={id_orders} index={index} />}
                        </div>
                    </div>
                </div> :
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.main}>
                            <p>Veuillez patienter vos informations se charge...</p>
                        </div>
                    </div>
                </div>
        ) : null
    );
};

interface selectedProductModel {
    label: string;
    value: number | undefined | string;
    quantity: number;
    variant: string[];
    allVariant: string[] | undefined;
}

interface ProductLayoutProps {
    id: number
    refetch: () => any
    editData?: ProductOrder[] | undefined
}
const ProductLayout = ({ editData, refetch, id }: ProductLayoutProps): JSX.Element => {
    const [patchOrder] = usePatchClientOrderMutation()
    const { data: ProductData, isSuccess } = useGetProductQuery({ isHidden: false })

    const FormatDataOption = (data: GetProductModel[]) => {
        var objArr: { label: string, value: string, allVariant: string[], variant: [] }[] = []

        for (let i = 0; i < data.length; i++) {
            if (!data[i].isDeleted)
                objArr.push({ label: data[i].name, value: String(data[i].id), allVariant: data[i].variant, variant: [] })
        }

        return objArr
    }

    const FormatAccessArray = (data: any) => {
        var objArr: { id: number, quantity: number, variant: [] }[] = []


        for (let i = 0; i < data.length; i++) {
            objArr.push({ id: data[i].value, quantity: data[i].quantity || 1, variant: data[i].variant })
        }

        return objArr
    }

    const [selectedProduct, setSelectedProduct] = useState<selectedProductModel[]>([]);

    useEffect(() => {
        setSelectedProduct((editData) ? editData?.map((dt) => {
            return { label: dt.Product.name, value: dt.Product.id ? String(dt.Product.id) : '', quantity: dt.quantity, variant: dt.variant, allVariant: dt.Product.variant }
        }) : [])
    }, [])


    const onSubmit = () => {
        if (selectedProduct.length === 0) {
            showToastError('Please select at least one product')
            return
        }

        const data = {
            id_product_array: FormatAccessArray(selectedProduct)
        }

        patchOrder({ ...data, id }).unwrap()
            .then(res => {
                refetch()
            })
            .catch((err: { data: ErrorModel | { message: string }, status: number }) => {
                if (err.data) {
                    if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                    else if ('message' in err.data) showToastError(err.data.message);
                }
            })
    }

    return (
        <div className={styles.productLayout}>
            {isSuccess ? <MultiSelectElement options={FormatDataOption(ProductData?.data)} selected={selectedProduct} onChange={setSelectedProduct} /> : <></>}

            {selectedProduct.map((dt, index) =>
                <ProductOrderCard
                    key={index}
                    dt={dt}
                    index={index}
                    selectedProduct={selectedProduct}
                    setSelectedProduct={setSelectedProduct}
                    title={dt.label}
                />
            )}

            <div className={styles.centerBtn}>
                <SaveBtn value='Sauvegarder' onClick={onSubmit} />
            </div>
        </div>
    )
}

export default ConfirmationModal;

interface SaveBtnProps {
    onClick: () => any,
    value: string
}
const SaveBtn = ({ onClick, value }: SaveBtnProps) => {
    return (
        <button onClick={onClick} className={styles.saveBtn}>
            {value}
        </button>
    )
}

type SelectType = {
    label: string,
    value: string | number
}

interface FormBodyProps {
    StatusData: GetStatusModel | undefined
    RefetchStatus: () => void
    id_orders: number[]
    index: number
    setIndex: React.Dispatch<React.SetStateAction<number>>
    refetch: () => any
    currentOrder: {
        code: Number;
        data: GetClientOrderModel
        order: OrderOnlyModel[]
    }
}

const FormBody = ({ refetch, id_orders, setIndex, index, currentOrder, StatusData, RefetchStatus }: FormBodyProps) => {

    const { data: dataSetting } = useGetSettingQuery()
    const { data: dataCity } = useGetCityQuery()
    const [patchOrder, { isLoading }] = usePatchClientOrderMutation()

    const { register, handleSubmit, formState: { errors }, reset } = useForm<Inputs>({
        resolver: yupResolver(schema),
    });

    const [upDownData] = useState<SelectType[]>([
        { label: 'none', value: 'none' },
        { label: 'UpSell', value: 'UpSell' },
        { label: 'DownSell', value: 'UpSell' },
        { label: 'CrossSell', value: 'UpSell' }
    ])

    const FormatCity = (data: CityModel[]) => {
        var options: { label: string, value: string | number }[] = []

        data.map((dt) => {
            if (currentOrder.order[0].id_city === dt.id) options.push({ label: dt.name, value: dt.id || 0 })
            if (!dt.isDeleted && !dt.isFromSheet) {
                if (currentOrder.order[0].id_city !== dt.id) options.push({ label: dt.name, value: dt.id || 0 })
            }
        })

        return options
    }

    const onSubmit = (values: Inputs) => {

        const data = {
            ...values,
            id: Number(id_orders[index])
        }

        patchOrder(data).unwrap()
            .then(res => {
                refetch()
                if (id_orders.length === (index + 1)) return
            })
            .catch((err: { data: ErrorModel | { message: string }, status: number }) => {
                if (err.data) {
                    if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                    else if ('message' in err.data) showToastError(err.data.message);
                }
            })
    }

    const onNext = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()

        if (id_orders.length === (index + 1)) return
        setIndex(prevIndex => prevIndex + 1)
    }

    const handleClick = (phone_number: string) => {
        window.open(`https://wa.me/${phone_number}?text=${encodeURI(dataSetting?.data.automated_msg || '')}`, "_blank");
    };

    return (
        <div className="card-body">
            <div className="basic-form">
                <form onSubmit={handleSubmit(onSubmit)}>

                    <div className="row">
                        <CustumInput
                            defaultValue={currentOrder.order[0].nom}
                            register={register}
                            name={'nom'}
                            error={errors.nom}
                            type={'text'}
                            label={"Destinataire"}
                            placeholder={'Patrick Doe'}
                        />
                    </div>

                    <div className="row">
                        <CustumInput
                            defaultValue={currentOrder.order[0].telephone}
                            register={register}
                            name={'telephone'}
                            error={errors.telephone}
                            type={'text'}
                            label={"Telephone"}
                            placeholder={'778143610'}
                        >
                            <div className="call-ws-media">
                                <IoLogoWhatsapp className='io-logo' onClick={() => handleClick('+212' + currentOrder.order[0].telephone)} size={25} color={'green'} />
                                <a href={`tel:+212${currentOrder.order[0].telephone}`}>
                                    <IoCallOutline className='io-logo' size={25} color={'green'} />
                                </a>
                            </div>
                        </CustumInput>
                    </div>

                    <div className={'row'}>
                        <div className={styles.rowCity}>
                            <label className={styles.labelCity}>Ville</label>
                            <CustumDropdown
                                refetch={refetch}
                                options={FormatCity(dataCity ? dataCity.data : [])}
                                name='id_city'
                                data={dataCity ? dataCity.data : []}
                                order={{
                                    id: currentOrder.order[0].id,
                                    id_city: currentOrder.order[0].id_city,
                                    id_team: currentOrder.order[0].id_team,
                                    createdAt: currentOrder.order[0].createdAt
                                }}
                            />
                        </div>


                        <CustumInput
                            defaultValue={currentOrder.order[0].prix}
                            register={register}
                            name={'prix'}
                            error={errors.prix}
                            type={'text'}
                            label={"Prix"}
                            placeholder={'36540'}
                        />

                        <CustumInput
                            defaultValue={currentOrder.order[0].adresse}
                            register={register}
                            name={'adresse'}
                            error={errors.adresse}
                            type={'text'}
                            label={"Adresse"}
                            placeholder={'Bl 4 st.Jean'}
                        />
                    </div>

                    <div className={styles.rowCity}>
                        <CustumSelectForm
                            className={'lg-input-cus'}
                            defaultSelected={currentOrder.order[0].status}
                            data={FilterStatusData(StatusData?.data)}
                            register={register}
                            error={errors.status}
                            label={"Status"}
                            name={'status'}
                        />
                        {
                            currentOrder.order[0].isSendLivo === 'not_send' ?
                                <TbPointFilled size={40} color={'gray'} />
                                : currentOrder.order[0].isSendLivo === 'error_send' ?
                                    <TbPointFilled size={40} color={'red'} />
                                    :
                                    <TbPointFilled size={40} color={'green'} />
                        }
                    </div>
                    {
                        isLoading ? <Spinner4Bar /> :
                            <div className={styles.bottomAction}>
                                <button type="submit" className={styles.saveBtn}>
                                    Enregistrer
                                </button>
                                <button type="submit" onClick={onNext} className={styles.NextBtn}>
                                    Suivant
                                </button>
                            </div>
                    }
                </form>
            </div>
        </div>

    )
}