import React, { useEffect } from 'react'
import { CustumInput } from '../../../Forms'
import ModalWrapper from '../ModalWrapper'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { showToastError } from '../../../../services/toast/showToastError';
import { ColumnModel, ErrorModel, ShippingModel } from '../../../../models';
import { useGetClientQuery, usePatchClientMutation } from '../../../../services/api/ClientApi/ClientApi';
import { useGetShippingQuery } from '../../../../services/api/ClientApi/ClientShippingApi';
import { useGetColumnQuery, usePatchColumnMutation } from '../../../../services/api/ClientApi/ClientColumnApi';

type Inputs = {
    livoToken: string
};

const schema = yup.object().shape({
    livoToken: yup.string().required('Ce champ est obligatoire').optional()
}).required();

interface Props {
    showModal: boolean,
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>
    driverObj: {
        moveNext: () => void
    }
}
export default function ShippingModal({ showModal, setShowModal, driverObj }: Props): JSX.Element {

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
        <ModalWrapper showModal={showModal} title={'Shipping companies'} closeModal={handleCloseModal} setShowModal={setShowModal} id='ShippingModal'>
            <FormBody handleCloseModal={handleCloseModal} />
        </ModalWrapper>
    )
}

interface FormBodyProps {
    handleCloseModal: () => any
}
const FormBody = ({ handleCloseModal }: FormBodyProps) => {

    const [patchClient] = usePatchClientMutation();
    const { data, refetch } = useGetClientQuery();
    const { data: dataColumn, refetch: refetchColumn } = useGetColumnQuery()

    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
        resolver: yupResolver(schema),
    });

    const onSubmit = (values: Inputs) => {
        patchClient(values).unwrap().then((result: any) => {
            handleCloseModal()
            refetch()
        }).catch((err: { data: ErrorModel | { message: string }, status: number }) => {
            if (err.data) {
                if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                else if ('message' in err.data) showToastError(err.data.message);
            }
        })
    }

    return (
        <div className="card-body">
            <div className="basic-form">
                <CSVExport statusData={dataColumn?.data} refetchStatus={refetchColumn} />
                <Shipping />
                <p style={{ display: 'grid' }}>
                    <code>Vous devez vous rendre dans votre societe de livraison et copier votre token</code>
                </p>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <CustumInput
                        defaultValue={data?.data?.livoToken || ''}
                        register={register}
                        name={'livoToken'}
                        className={'lg-input-cus'}
                        error={errors.livoToken}
                        type={'text'}
                        label={"societe de livraison token"}
                        placeholder={'HDHGDHGDV54EZ44DFZ4X44545D45SD'}
                    />

                    <button type="submit" className="btn btn-primary">
                        Modifier
                    </button>
                </form>
            </div>
        </div>
    )
}

const Shipping = () => {
    const { data, isSuccess } = useGetShippingQuery()

    return (
        <div className="row">
            {isSuccess && data?.data.map((dt: ShippingModel) => dt.isShow && <ShippingCard item={dt} />)}
        </div>
    )
}

interface ShippingCardProps {
    item: ShippingModel
}
const ShippingCard = ({ item }: ShippingCardProps) => {
    return (
        <div style={{ width: '33%' }} className="col-xl-3 col-lg-6 col-sm-6">
            <div className="card">
                <div className="card-body">
                    <div className="new-arrival-product">
                        <div className="new-arrivals-img-contnent" >
                            <img src={`data:image/jpeg;base64,${item.image}`} className='img-fluid' alt="" />
                        </div>
                        <div className="new-arrival-content text-center mt-3">
                            <h4>
                                <a href="#">{item.name}</a>
                            </h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface CSVExportProps {
    statusData: ColumnModel[] | undefined,
    refetchStatus: () => any
}
const CSVExport = ({ statusData, refetchStatus }: CSVExportProps): JSX.Element => {
    return (
        <div className="col-xl-6 col-lg-6 alias-lg-100">
            <div className="card">
                <div className="card-header">
                    <h4 className="card-title">selectionner les colonnes</h4>
                </div>
                <div className="card-body">
                    <div className="row">
                        {statusData && statusData.map(dt => <CSVStatusCheckbox dt={dt} refetch={refetchStatus} />)}
                    </div>
                </div>
            </div>
        </div>
    )
}

interface CSVStatusCheckboxProps {
    dt: ColumnModel
    refetch: () => any
}
const CSVStatusCheckbox = ({ dt }: CSVStatusCheckboxProps): JSX.Element => {

    const [patchColumn] = usePatchColumnMutation()

    const handleStatusCheckbox = (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {

        const data = { id: dt.id ?? 0, isExported: !dt.isExported }

        patchColumn(data).unwrap()
            .then((res: any) => {
                console.log(res)
            })
            .catch((err: { data: ErrorModel | { message: string }, status: number }) => {
                if (err.data) {
                    if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                    else if ('message' in err.data) showToastError(err.data.message);
                }
            })
    }

    return (
        <div className="col-xl-4 col-xxl-6 col-6">
            <div className="form-check custom-checkbox mb-3">
                <input
                    onClick={handleStatusCheckbox}
                    defaultChecked={dt.isExported}
                    type="checkbox"
                    className="form-check-input"
                    id="customCheckBox1"
                />
                <label className="form-check-label" htmlFor="customCheckBox1">
                    {dt.alias ?? dt.name}
                </label>
            </div>
        </div>
    )
}