import React, { useState, useEffect } from 'react'
import { RiFileDownloadFill } from 'react-icons/ri'
import AddCityModal from '../../Modal/setting/AddCityModal';
import EditCityModal from '../../Modal/setting/EditCityModal';
import { AddStatusModal, DeleteCityModal, EditPasswordModal } from '../../Table/Modal/Setting';
import { useGetStatusQuery, usePatchStatusMutation } from '../../../services/api/ClientApi/ClientStatusApi';
import { CityModel, ColumnModel, ColumnPatchModel, ErrorModel, StatusModel } from '../../../models';
import { useGetColumnQuery, usePatchColumnMutation } from '../../../services/api/ClientApi/ClientColumnApi';
import { useGetCityQuery } from '../../../services/api/ClientApi/ClientCityApi';
import { CLIENT_STATUS_URL, CLIENT_UPLOAD_CITY_URL } from '../../../services/url/API_URL';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useGetSettingQuery, usePatchSettingMutation } from '../../../services/api/ClientApi/ClientSettingApi';
import { showToastError } from '../../../services/toast/showToastError';
import { showToastSucces } from '../../../services/toast/showToastSucces';
import { Switch } from '../../Switch';
import { RotatingLines } from 'react-loader-spinner'
import { ColorPicker } from '../../Input';
import * as yup from "yup";
import axios from 'axios';
import 'react-nestable/dist/styles/index.css';
import styles from './setting.module.css'

type Inputs = {
    default_conf_pricing: string,
    delfault_del_pricing: string,
    default_time: string,
    automated_msg: string
    startWrldOrder: string
};

const schema = yup.object().shape({
    default_conf_pricing: yup.string().notRequired(),
    delfault_del_pricing: yup.string().notRequired(),
    default_time: yup.string().notRequired(),
    automated_msg: yup.string().notRequired(),
    startWrldOrder: yup.string().notRequired()
}).required();

const SplitActiveInnactive = (data: ColumnModel[] | undefined) => {

    const active = data && data.filter(dt => dt.active && dt)
    const innactive = data && data.filter(dt => !dt.active && dt)

    var obj = {
        'active': active,
        'innactive': innactive
    }

    return obj
}
interface Props {
    driverObj: {
        moveNext: () => void
    }
}
export default function OrderSetting({ driverObj }: Props) {
    const [showAddStatusModal, setShowAddStatusModal] = useState<boolean>(false)
    const [showAddCityModal, setShowAddCityModal] = useState<boolean>(false)
    const [showEditCityModal, setShowEditCityModal] = useState<boolean>(false)

    const [showDeleteCityModal, setShowDeleteCityModal] = useState<boolean>(false)

    const [showEditPasswordModal, setShowEditPasswordModal] = useState<boolean>(false)

    const { data: statusData, refetch: refetchStatus } = useGetStatusQuery({})
    const { data, refetch } = useGetColumnQuery()

    const [item, setItem] = useState<CityModel>()
    const { data: cityData, refetch: refetchData } = useGetCityQuery()

    const objData = SplitActiveInnactive(data?.data)

    return (
        <div className="row">
            {showAddStatusModal && <AddStatusModal setShowModal={setShowAddStatusModal} showModal={showAddStatusModal} refetch={refetchStatus} />}

            {showAddCityModal && <AddCityModal setIsVisible={setShowAddCityModal} refetch={refetchData} driverObj={driverObj} />}
            {showEditCityModal && <EditCityModal item={item} setIsVisible={setShowEditCityModal} refetch={refetchData} />}
            {showDeleteCityModal && <DeleteCityModal id_city={item?.id ? String(item?.id) : ''} setShowModal={setShowDeleteCityModal} refetch={refetchData} showModal={showDeleteCityModal} />}
            {showEditPasswordModal && <EditPasswordModal setShowModal={setShowEditPasswordModal} showModal={showEditPasswordModal} />}

            <h3 className="mt-4 mb-3">Order Settings</h3>
            <Status setShowAddStatusModal={setShowAddStatusModal} statusData={statusData?.data} refetchStatus={refetchStatus} />
            <ColumnOfOrder objData={objData} refetch={refetch} />
            <City setShowAddCityModal={setShowAddCityModal} refetch={refetchData} setShowDeleteCityModal={setShowDeleteCityModal} setShowEditCityModal={setShowEditCityModal} data={cityData?.data} setItem={setItem} driverObj={driverObj} />
            <ConfSetting setShowEditPasswordModal={setShowEditPasswordModal} />
        </div>
    )
}

interface StatusProps {
    setShowAddStatusModal: React.Dispatch<React.SetStateAction<boolean>>,
    statusData: StatusModel[] | undefined,
    refetchStatus: () => any
}
const Status = ({ setShowAddStatusModal, statusData, refetchStatus }: StatusProps): JSX.Element => {

    const handleSubmit = () => {
        const token = localStorage.getItem('token')

        axios.patch(CLIENT_STATUS_URL, {statusData}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => {
                console.log(res)
                refetchStatus()
            })
            .catch((err: { data: ErrorModel | { message: string }, status: number }) => {
                if (err.data) {
                    if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                    else if ('message' in err.data) showToastError(err.data.message);
                }
            })
    }

    return (
        <div className={styles.statusContainer}>
            <p className={styles.statusTitle}>Status</p>
            <div className="row" style={{paddingLeft: "20px", paddingRight: "20px"}}>
                {statusData && statusData.map(dt => <StatusRow key={dt.id} dt={dt} refetch={refetchStatus} />)}
            </div>

            <div className={styles.saveStatusBottom}>
                <button
                    type="button"
                    className={styles.apiBtn}
                    onClick={handleSubmit}
                >
                    Enregistrer
                </button>
            </div>
        </div>
    )
}

interface StatusRowProps {
    dt: StatusModel,
    refetch: () => any
}
const StatusRow = ({ dt, refetch }: StatusRowProps): JSX.Element => {
    const [patchStatus] = usePatchStatusMutation()

    const handleStatusCheckbox = () => {

        const data = { id: dt.id ?? 0, checked: !dt.checked }

        patchStatus(data).unwrap()
            .then(res => {
                console.log(res)
                refetch()
            })
            .catch((err: { data: ErrorModel | { message: string }, status: number }) => {
                if (err.data) {
                    if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                    else if ('message' in err.data) showToastError(err.data.message);
                }
            })
    }

    const handleChangeColor = (color: string) => {

        const data = { id: dt.id ?? 0, color: color }

        patchStatus(data).unwrap()
            .then(res => {
                console.log(res)
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
        <div className={styles.StatusRow}>
            <span className={styles.StatusRowTxt}>{dt.name}</span>
            <ColorPicker color={dt.color} handleChangeColor={handleChangeColor} />

            <Switch
                active={dt.checked}
                SwitchHideProduct={handleStatusCheckbox}
                size={{ width: '43.727px', height: '25.227px' }}
            />
        </div>
    )
}

interface ColumnOfOrderCardProps {
    refetch: () => any,
    objData: { active: ColumnModel[] | undefined, innactive: ColumnModel[] | undefined }
}
const ColumnOfOrder = ({ refetch, objData }: ColumnOfOrderCardProps): JSX.Element => {

    const [updated, setUpdated] = useState<boolean>(false)
    const [dataUpdated, setDataUpdated] = useState<ColumnPatchModel>()

    const [patchColumn] = usePatchColumnMutation()

    useEffect(() => {
        if (dataUpdated) {
            patchColumn(dataUpdated).unwrap()
                .then(res => console.log(res))
                .catch((err: { data: ErrorModel | { message: string }, status: number }) => {
                    if (err.data) {
                        if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                        else if ('message' in err.data) showToastError(err.data.message);
                    }
                })
        }
    }, [updated])

    useEffect(() => {
        setTimeout(() => {
            const draggables = document.querySelectorAll('.col-order')

            const activeContainer = document.querySelector('.active-column')
            const innactiveContainer = document.querySelector('.inactive-column')

            draggables.forEach(draggable => {
                draggable.addEventListener('dragstart', () => {
                    draggable.classList.add('dragging')
                })

                draggable.addEventListener('dragend', () => {
                    draggable.classList.remove('dragging')
                })
            })

            activeContainer?.addEventListener('dragover', e => {

                e.preventDefault()
                const draggable = document.querySelector('.dragging')

                const patchData: ColumnPatchModel = { id: draggable?.id, active: true }

                setDataUpdated(patchData)
                setUpdated(true)

                draggable && activeContainer.appendChild(draggable)
            })

            innactiveContainer?.addEventListener('dragover', e => {
                e.preventDefault()
                const draggable = document.querySelector('.dragging')

                const patchData: ColumnPatchModel = { id: draggable?.id, active: false }

                setDataUpdated(patchData)
                setUpdated(false)

                draggable && innactiveContainer.appendChild(draggable)
            })

        }, 2000);
    })

    return (
        <div className={styles.columnContainer} style={{width: '-webkit-fill-available'}}>
            <p className={styles.columnTitle}>Colonnes de commandes</p>
            <div className="row">
                <Column data={objData.active} className={'active-column'} title='Colonnes actives' />
                <Column data={objData.innactive} className={'inactive-column'} title='Colonnes inactives' />
            </div>
            <p className={styles.columnWarning}>* : Toutes cases ayant ce symbole ne peuvent pas être inactives </p>
        </div>
    )
}

interface ColumnProps {
    title: string
    className: 'active-column' | 'inactive-column'
    data: ColumnModel[] | undefined
}
const Column = ({ title, className, data }: ColumnProps): JSX.Element => {
    return (
        <div className="col-md-6">
            <div className="card-content">
                <div className="nestable">
                    <div className="dd" id="nestable">
                        <h3 className={`${styles.nestableTitle} ${className == "active-column" ? styles.activeTitle : styles.inactiveTitle} `}>{title}</h3>
                        <ol className={`${styles.nestableContainer} ${className}`}>
                            {
                                data?.map((dt, index) =>
                                    <li id={`${dt.id}`} key={index} draggable={true} className={`${styles.nestableItems} col-order`} data-id={index}>
                                        <div className="dd-handle">{dt.alias ?? dt.name}</div>
                                    </li>
                                )
                            }
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface CityProps {
    setShowAddCityModal: React.Dispatch<React.SetStateAction<boolean>>,
    setShowEditCityModal: React.Dispatch<React.SetStateAction<boolean>>,
    setShowDeleteCityModal: React.Dispatch<React.SetStateAction<boolean>>
    setItem: React.Dispatch<React.SetStateAction<CityModel | undefined>>,
    refetch: () => any
    data: CityModel[] | undefined
    driverObj: {
        moveNext: () => void
    }
}

interface CityRowProps {
    setShowEditCityModal: React.Dispatch<React.SetStateAction<boolean>>,
    setItem: React.Dispatch<React.SetStateAction<CityModel | undefined>>,
    setShowDeleteCityModal: React.Dispatch<React.SetStateAction<boolean>>,
    item: CityModel
}

interface DragAndDropFileProps {
    refetch: () => any
}
function DragAndDropFile({ refetch }: DragAndDropFileProps) {
    const [dragging, setDragging] = useState(false);
    const [file, setFile] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false)

    const handleDragOver = (event: any) => {
        event.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const sendData = (data: File) => {

        const formData = new FormData();
        formData.append('file', data)

        const token = localStorage.getItem('token')

        var myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);

        setLoading(true)

        axios.post(CLIENT_UPLOAD_CITY_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => {
                console.log(res)
                setLoading(false)
                refetch()
            })
            .catch((err: { data: ErrorModel | { message: string }, status: number }) => {
                setLoading(false)
                if (err.data) {
                    if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                    else if ('message' in err.data) showToastError(err.data.message);
                }
            })
    }

    const handleDrop = (event: any) => {
        event.preventDefault();
        const selectedFile = event.dataTransfer.files[0];
        const allowedTypes = ["text/csv"]; // Define allowed MIME types here

        // Validate file type
        if (selectedFile && allowedTypes.includes(selectedFile.type)) {
            setFile(selectedFile);
        } else {
            console.log("Invalid file type. Only CSV files are allowed.");
        }

        setDragging(false);
    }

    function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
        if (!event.target.files || event.target.files.length === 0) {
            setFile(undefined)
            return
        }
        const file = event.target.files[0];

        setFile(file)
    }

    return (
        loading ?
            <RotatingLines
                strokeColor="grey"
                strokeWidth="5"
                animationDuration="0.75"
                width="96"
                visible={true}
            />
            :
            <div
                className="drag-and-drop-file"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {dragging ? (
                    <>
                        <RiFileDownloadFill />
                        <div className='drag-txt'>Déposer le fichier ici</div>

                    </>
                ) : (
                    <>
                        <img src="/svg/setting/upload.svg" alt="upload" />
                        <label htmlFor="payment_image" className='drag-txt'>Glissez et deposez un fichier excel</label>
                        <input type="file" id="payment_image" onChange={handleFileSelect} className={styles.importFileBtn} name="payment_image" accept="text/csv" />
                    </>
                )}
                {file && <p className='drag-txt'> : {file.name}</p>}
                {file && <button onClick={() => sendData(file)}>Envoyer</button>}
            </div>
    );
}

interface ConfSettingProps {
    setShowEditPasswordModal: React.Dispatch<React.SetStateAction<boolean>>
}
const ConfSetting = ({ setShowEditPasswordModal }: ConfSettingProps): JSX.Element => {

    const { data, refetch } = useGetSettingQuery()
    const [patchSetting] = usePatchSettingMutation()

    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
        resolver: yupResolver(schema),
    });

    const onSubmit = (values: Inputs) => {
        const datas = {
            ...values,
            id: data?.data.id ?? 0,
            default_conf_pricing: values.default_conf_pricing || String(data?.data.default_cof_ricing) || '0.0',
            delfault_del_pricing: values.delfault_del_pricing || String(data?.data.delfaulnpt_del_pricing) || '0.0',
            default_time: values.default_time || String(data?.data.default_time) || '0.0',
            startWrldOrder: values.startWrldOrder || String(data?.data.startWrldOrder) || 'none',
            automated_msg: values.automated_msg || String(data?.data.automated_msg) || 'nones'
        }

        patchSetting(datas).unwrap()
            .then(res => {
                console.log(res)
                showToastSucces('La configuration a été modifié')
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
        <div className="col-12 configuration">
            <div className="card">
                <div className="card-header">
                    <h4 className="card-title">Configuration</h4>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="row">
                            <div className="mb-3 row">
                                <label className="col-sm-2 col-form-label col-form-label-sm">Default confirmation pricing</label>
                                <div className="col-sm-10">
                                    <input
                                        {...register('default_conf_pricing')}
                                        defaultValue={data?.data.default_cof_ricing || ''}
                                        type="number"
                                        min={0}
                                        max={1000}
                                        step={0.1}
                                        placeholder="10"
                                        className="form-control form-control-sm"
                                    />
                                    {errors && <p className='error'>{errors.default_conf_pricing?.message}</p>}
                                </div>
                            </div>
                            <div className="mb-3 row">
                                <label className="col-sm-2 col-form-label col-form-label-sm">Default delivery pricing</label>
                                <div className="col-sm-10">
                                    <input
                                        {...register('delfault_del_pricing')}
                                        defaultValue={data?.data.delfaulnpt_del_pricing || ''}
                                        min={0}
                                        max={1000}
                                        step={0.1}
                                        type="number"
                                        placeholder="10"
                                        className="form-control form-control-sm"
                                    />
                                    {errors && <p className='error'>{errors.delfault_del_pricing?.message}</p>}
                                </div>
                            </div>
                            <div className="mb-3 row">
                                <label className="col-sm-2 col-form-label col-form-label-sm">Default time between each action</label>
                                <div className="col-sm-10">
                                    <input
                                        {...register('default_time')}
                                        defaultValue={data?.data.default_time || ''}
                                        min={0}
                                        max={1000}
                                        step={0.1}
                                        type="number"
                                        placeholder="10"
                                        className="form-control form-control-sm"
                                    />
                                    {errors && <p className='error'>{errors.default_time?.message}</p>}
                                </div>
                            </div>
                            <div className="mb-3 row">
                                <label className="col-sm-2 col-form-label col-form-label-sm">Start world order</label>
                                <div className="col-sm-10">
                                    <input
                                        {...register('startWrldOrder')}
                                        defaultValue={data?.data.startWrldOrder}
                                        type="text"
                                        placeholder="salam"
                                        className="form-control form-control-sm"
                                    />
                                    {errors && <p className='error'>{errors.startWrldOrder?.message}</p>}
                                </div>
                            </div>
                            <div className="mb-3 row">
                                <label className="col-sm-2 col-form-label col-form-label-sm">Automated message</label>
                                <textarea
                                    {...register('automated_msg')}
                                    defaultValue={data?.data.automated_msg}
                                    className="form-control"
                                    rows={4} id="comment"
                                />
                                {errors && <p className='error'>{errors.automated_msg?.message}</p>}
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-sm">
                            Enregistrer
                        </button>
                    </form>

                    <br /><br />
                    <button
                        onClick={() => setShowEditPasswordModal(true)}
                        type="button"
                        className="btn btn-outline-info btn-xxs">
                        Modifier le mot de passe
                    </button>
                </div>
            </div>
        </div>
    )
}

const City = ({ setShowAddCityModal, setShowEditCityModal, setShowDeleteCityModal, setItem, data, refetch, driverObj }: CityProps): JSX.Element => {

    const handleShowCityModal = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault()

        setShowAddCityModal(true)
        setTimeout(() => {
            driverObj.moveNext()
        }, 1000);
    }

    return (
        <div className={styles.cityContainer}>
            <div className={styles.cityHeader}>
                <p className={styles.cityHeaderTitle}>Villes</p>
                <div className={styles.citySearchContainer}>
                    <img src="/svg/setting/search.svg" alt="search" />
                    <input type="text" placeholder='Recherche' />
                </div>
            </div>

            <div className={styles.mainCity}>
                <div className={styles.leftCity}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Ville</th>
                                <th>Prix</th>
                                <th>Société de livraison</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {data && data.map((dt, index) => !dt.isFromSheet && <CityRow key={index} item={dt} setItem={setItem} setShowDeleteCityModal={setShowDeleteCityModal} setShowEditCityModal={setShowEditCityModal} />)}
                        </tbody>
                    </table>
                </div>

                <div className={styles.rightCity}>
                    <a
                        onClick={handleShowCityModal}
                        type="button"
                        className={styles.addCityBtn}
                    >
                        <img src="/svg/setting/add.svg" alt="add" />
                        Ajouter une ville
                    </a>

                    <p className={styles.cityDesc}>
                        Si vous voulez ajouter plusieurs villes en vrac, téléchargez le modèle, et déposez le en appuyant sur le bouton ci-dessous.
                    </p>

                    <a href='/load/model.csv' className={styles.downloadModelBtn}>
                        <img src="/svg/setting/download.svg" alt="download" />
                        Copier le model
                    </a>

                    <DragAndDropFile refetch={refetch} />
                </div>

            </div>
        </div>
    )
}

const CityRow = ({ setShowEditCityModal, setShowDeleteCityModal, setItem, item }: CityRowProps): JSX.Element => {

    const handleEdit = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        setItem(item)
        setShowEditCityModal(true)
    }

    const handleDelete = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        setItem(item)
        setShowDeleteCityModal(true)
    }

    return (
        <tr>
            <td>{item.name}</td>
            <td>{item.price}dhs</td>
            <td>{item.id_shipping}</td>
            <td>
                <div className="d-flex">
                    <a onClick={handleEdit} href="#">
                        <img src="/svg/setting/edit.svg" alt="edit" />
                    </a>
                    <a onClick={handleDelete} href="#">
                        <img src="/svg/setting/delete.svg" alt="delete" />
                    </a>
                </div>
            </td>
        </tr>
    )
}