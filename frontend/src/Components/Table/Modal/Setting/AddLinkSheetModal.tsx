import React, { useEffect, useState } from 'react'
import { CustumInput } from '../../../Forms'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDeleteSheetMutation, useGetLinkSheetQuery, useIntegrateSheetMutation, usePatchSheetMutation } from '../../../../services/api/ClientApi/ClientIntegrateSheetApi';
import { showToastError } from '../../../../services/toast/showToastError';
import { ErrorModel, GetSheetIntegrationModel } from '../../../../models';
import { useGetColumnQuery, usePatchColumnMutation } from '../../../../services/api/ClientApi/ClientColumnApi';
import ModalWrapper from '../ModalWrapper'
import { showToastSucces } from '../../../../services/toast/showToastSucces';
import * as yup from "yup";
import './styles.css'

type Inputs = {
    spreadsheetId: string
    range: string
    name: string
};

const schema = yup.object().shape({
    spreadsheetId: yup.string().required('Ce champ est obligatoire'),
    range: yup.string().required('Ce champ est obligatoire'),
    name: yup
    .string()
    .required('Ce champ est obligatoire')
    .test('no-spaces', 'Le champ ne doit pas contenir d\'espace', value => {
        return !/\s/.test(value);
    })
}).required();

interface Props {
    showModal: boolean,
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>
    driverObj: {
        moveNext: () => void
    }
}
export default function AddLinkSheetModal({ showModal, setShowModal, driverObj }: Props): JSX.Element {

    const { data, refetch } = useGetLinkSheetQuery();
    const [row, setRow] = useState<GetSheetIntegrationModel[]>([])

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

    useEffect(() => {
        data && setRow(data?.data)
    }, [data])

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
        <ModalWrapper showModal={showModal} title={'API integration'} closeModal={handleCloseModal} setShowModal={setShowModal} id='AddLinkSheetModal'>
            <ChangeColumn handleCloseModal={handleCloseModal} />
            <p style={{ display: 'grid' }}>
                You need to share your spread sheet with this address:
                <code>appsheet@fluent-edition-339019.iam.gserviceaccount.com</code>
            </p>
            <a href="javascript:void(0)" onClick={() => setRow(prev => [...prev, { SheetID: '', range_: '' } as GetSheetIntegrationModel])} className="badge badge-outline-light">Nouveau sheet +</a>
            {row.map(dt => <FormBody handleCloseModal={handleCloseModal} data={dt} refetch={refetch} />)}

            <br />
            <a href='/cus_img/model_ys.jpg' target='_blank' className="btn btn-outline-primary btn-xs export-btn">Voir le model</a>
        </ModalWrapper>
    )
}

interface FormBodyProps {
    handleCloseModal: () => any
    refetch: () => any
    data: GetSheetIntegrationModel | undefined
}
const FormBody = ({ handleCloseModal, data, refetch }: FormBodyProps) => {

    const [integrateSheet] = useIntegrateSheetMutation();
    const [patchSheet] = usePatchSheetMutation();
    const [deleteSheet] = useDeleteSheetMutation();

    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
        resolver: yupResolver(schema),
    });

    const onSubmit = (values: Inputs) => {
        if (!data?.id) {
            integrateSheet(values).unwrap().then((result: any) => {
                handleCloseModal()
                refetch()
            }).catch((err: { data: ErrorModel | { message: string }, status: number }) => {
                if (err.data) {
                    if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                    else if ('message' in err.data) showToastError(err.data.message);
                }
            })
        } else {
            patchSheet({
                id: data.id,
                ...values
            }).unwrap().then((result: any) => {
                handleCloseModal()
                refetch()
            }).catch((err: { data: ErrorModel | { message: string }, status: number }) => {
                if (err.data) {
                    if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                    else if ('message' in err.data) showToastError(err.data.message);
                }
            })
        }
        handleCloseModal()
    }

    const onDeleteSheet = () =>{
        deleteSheet({id: data?.id || 0}).unwrap().then((result: any) => {
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
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                        <CustumInput
                            defaultValue={data?.SheetID ?? ''}
                            register={register}
                            name={'spreadsheetId'}
                            error={errors.spreadsheetId}
                            type={'text'}
                            label={"SheetID"}
                            placeholder={'SheetID'}
                        />

                        <CustumInput
                            defaultValue={data?.range_ ?? ''}
                            register={register}
                            name={'range'}
                            error={errors.range}
                            type={'text'}
                            label={"range_"}
                            placeholder={'range_'}
                        />
                    </div>

                    <CustumInput
                        className={'lg-input-cus'}
                        defaultValue={data?.name ?? ''}
                        register={register}
                        name={'name'}
                        error={errors.name}
                        type={'text'}
                        label={"name"}
                        placeholder={'Stock Janvier'}
                    />

                    <button type="submit" className="badge badge-md badge-success">Ajouter</button>
                    <a href='#' onClick={()=> onDeleteSheet()} className="badge badge-md badge-danger">Supprimer</a>
                </form>
            </div>
        </div>
    )
}

interface ChangeColumnProps{
    handleCloseModal: () => any
}
const ChangeColumn = ({ handleCloseModal }: ChangeColumnProps): JSX.Element => {

    const { data, refetch } = useGetColumnQuery()
    const [alias, setAlias] = useState<string>()
    const [id, setId] = useState<number>()
    const [patchColumn] = usePatchColumnMutation()

    useEffect(() => {
        setId(data?.data[0].id ?? 0)
        setAlias(data?.data[0].alias ?? 'no alias')
    }, [data])

    const handleChangeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        //refetch()
        const { value } = e.target

        setId(JSON.parse(value).id)
        setAlias(JSON.parse(value).alias ?? 'no alias')
    }

    const handleChangeAlias = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target

        console.log(value)
        setAlias(value)
    }

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        patchColumn({ id, alias }).unwrap().then(() => {
            showToastSucces('Your alias is added')
            handleCloseModal()
            refetch()
        }).catch((err) => {
            console.log(err)
        })
    }

    return (
        <div className="col-xl-6 col-lg-6 alias-lg-100">
            <div className="card">
                <div className="card-body">
                    <div className="basic-form">
                        <form>
                            <div className="mb-3">
                                <label className="form-label">changer la nomination de la colonne</label>
                                <select
                                    name={'alias'}
                                    onChange={handleChangeSelect}
                                    className="form-control"
                                >
                                    {data && data.data.map((dt: any) => (<option value={JSON.stringify(dt)}>{dt.name}</option>))}
                                </select>

                            </div>
                            <div className="col mt-2 mt-sm-0">
                                <input
                                    onChange={handleChangeAlias}
                                    type="text"
                                    className="form-control"
                                    placeholder="alias"
                                    value={alias}
                                />
                            </div>

                            {
                                alias &&
                                <button
                                    onClick={handleSubmit}
                                    type="button"
                                    className="btn btn-outline-primary btn-xs"
                                >
                                    Change
                                </button>
                            }
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}