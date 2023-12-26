import React, { useState, useEffect } from 'react'
import { BiMessageRoundedDetail } from 'react-icons/bi'
import { IoLogoWhatsapp } from 'react-icons/io5'
import { CiEdit } from 'react-icons/ci'
import { AiFillEye } from 'react-icons/ai'
import { BsTelephoneXFill } from 'react-icons/bs'
import { TbPointFilled } from 'react-icons/tb'
import { DisplayChangeOuvrir, DisplaySource, DisplayTeamMember, DisplayUpDown, DisplayStatus } from './OrderRowElement'
import { HistoryOrderModal, ReportOrderModal, CommentOrderModal } from '../Modal/Order'
import { CityModel, ColumnModel, GetClientOrderModel, ProductOrder, StatusModel, ErrorModel } from '../../../models'
import { CustumDropdown } from '../../Input'
import { useGetSettingQuery } from '../../../services/api/ClientApi/ClientSettingApi'
import { useGetCityQuery } from '../../../services/api/ClientApi/ClientCityApi'
import { useGetStatusQuery } from '../../../services/api/ClientApi/ClientStatusApi'
import { usePatchClientOrderMutation } from '../../../services/api/ClientApi/ClientOrderApi'
import { useGetTeamMemberQuery } from '../../../services/api/ClientApi/ClientTeamMemberApi'
import { showToastError } from '../../../services/toast/showToastError'
import './styles.css'

interface OrderModel { id: number, SheetId: string, checked?: boolean, id_city: number, id_team: number, Product_Orders: ProductOrder[], createdAt: Date, reportedDate: string, isSendLivo: string, telDuplicate: boolean }

interface RowProps {
    row: GetClientOrderModel,
    order: OrderModel | undefined
    refetch: () => void,
    column: ColumnModel[] | undefined,
    setIdOrders: React.Dispatch<React.SetStateAction<number[] | undefined>>
    setOrder: React.Dispatch<React.SetStateAction<OrderModel | undefined>>
    setEditData: React.Dispatch<React.SetStateAction<GetClientOrderModel>>
    setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>
    handleCheckRow: (id: number) => void
    setShowOrderModal: React.Dispatch<React.SetStateAction<boolean>>
}
export default function Row({ row, order, refetch, column, handleCheckRow, setOrder, setEditData, setShowEditModal, setShowOrderModal }: RowProps): JSX.Element {

    const [patchOrder] = usePatchClientOrderMutation()

    const { data: dataSetting } = useGetSettingQuery()
    const { data: dataCity } = useGetCityQuery()
    const { data: dataStatus, refetch: RefetchStatus } = useGetStatusQuery({})
    const { data: dataTeamMember } = useGetTeamMemberQuery({ isHidden: true })

    useEffect(() => {
        RefetchStatus()
    }, [])

    const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false)
    const [showCommentModal, setShowCommentModal] = useState<boolean>(false)
    const [showReportModal, setShowReportModal] = useState<boolean>(false)

    const handleChangeStatus = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { value } = e.target

        patchOrder({ id: order?.id, status: value }).unwrap().then((res) => refetch())
            .catch((err: { data: ErrorModel | { message: string }, status: number }) => {
                if (err.data) {
                    if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                    else if ('message' in err.data) showToastError(err.data.message);
                }
            })

        if (value === 'Reporte') setShowReportModal(true)
    }

    const handleChangeSource = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { value } = e.target

        patchOrder({ id: order?.id, source: value }).then(() => refetch())
            .catch((err: { data: ErrorModel | { message: string }, status: number }) => {
                if (err.data) {
                    if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                    else if ('message' in err.data) showToastError(err.data.message);
                }
            })
    }

    const handleChangeTeam = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { value } = e.target

        patchOrder({ id: order?.id, id_team: Number(value), prev_id_team: order ? order.id_team : 0 }).unwrap().then(() => refetch && refetch())
            .catch((err: { data: ErrorModel | { message: string }, status: number }) => {
                if (err.data) {
                    if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                    else if ('message' in err.data) showToastError(err.data.message);
                }
            })
    }

    const handleChangeOuvrir = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { value } = e.target

        patchOrder({ id: order?.id, ouvrir: value }).unwrap().then(() => refetch && refetch())
            .catch((err: { data: ErrorModel | { message: string }, status: number }) => {
                if (err.data) {
                    if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                    else if ('message' in err.data) showToastError(err.data.message);
                }
            })
    }

    const handleChangeChanger = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { value } = e.target

        patchOrder({ id: order?.id, changer: value }).unwrap().then(() => refetch && refetch())
            .catch((err: { data: ErrorModel | { message: string }, status: number }) => {
                if (err.data) {
                    if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                    else if ('message' in err.data) showToastError(err.data.message);
                }
            })
    }

    const handleChangeUpDown = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { value } = e.target

        patchOrder({ id: order?.id, updownsell: value }).unwrap().then(() => refetch && refetch())
            .catch((err: { data: ErrorModel | { message: string }, status: number }) => {
                if (err.data) {
                    if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                    else if ('message' in err.data) showToastError(err.data.message);
                }
            })
    }

    const FilterStatusData = (data: StatusModel[] | undefined) => {
        if (!data) return []
        var newArr = data.filter((dt: StatusModel) => dt.checked === true)
        return newArr
    }

    const GetCityWhosFromSheet = (data: CityModel[] | undefined): CityModel[] => {
        if (!data) return []

        var newArr: CityModel[] = []

        for (let i = 0; i < data.length; i++) {
            if (data[i].isFromSheet === true || order?.id_city === data[i].id) {
                newArr.push(data[i])
            }
        }

        return newArr
    }

    const getRowColor = (currentData: GetClientOrderModel): string | undefined => {
        const statusData = FilterStatusData(dataStatus?.data)


        const color = statusData.filter(
            (dt) => {
                if (dt.name.toUpperCase().replace(' ', '') == currentData.Status.toUpperCase().replace(' ', '')) {
                    return dt.color
                }
            })

        return color[0]?.color
    }

    const handleClick = (phone_number: string) => {
        window.open(`https://wa.me/${phone_number}?text=${encodeURI(dataSetting?.data.automated_msg || '')}`, "_blank");
    };

    const FormatCity = (data: CityModel[]) => {
        var options: { label: string, value: string | number }[] = []

        data.map((dt) => {
            if (order?.id_city === dt.id) options.push({ label: dt.name, value: dt.id || 0 })
            if (!dt.isDeleted && !dt.isFromSheet) {
                if (order?.id_city !== dt.id) options.push({ label: dt.name, value: dt.id || 0 })
            }
        })

        return options
    }
    
    const onEdit = () =>{
        setOrder(order)
        setEditData(row)
        setShowEditModal(true)
    }
        
    const onShowProductEdit = () =>{
        setOrder(order)
        setShowOrderModal(true)
    }

    return (
        <tr className='tr-custum' style={{ backgroundColor: getRowColor(row) ?? 'transparent' }}>
            {showHistoryModal && <HistoryOrderModal showModal={showHistoryModal} setShowModal={setShowHistoryModal} id_order={String(order?.id ?? 0)} />}
            {showReportModal && <ReportOrderModal showModal={showReportModal} setShowModal={setShowReportModal} refetch={refetch} id_order={String(order?.id ?? 0)} />}
            {showCommentModal && <CommentOrderModal showModal={showCommentModal} setShowModal={setShowCommentModal} id_order={String(order?.id ?? 0)} />}

            <td style={{ width: '90px', color: 'black' }}>
                <input
                    onChange={() => handleCheckRow(order?.id || 0)}
                    checked={order?.checked}
                    className='case'
                    type="checkbox"
                />
                {
                    order?.isSendLivo === 'not_send' ?
                        <TbPointFilled size={40} color={'gray'} />
                        : order?.isSendLivo === 'error_send' ?
                            <TbPointFilled size={40} color={'red'} />
                            :
                            <TbPointFilled size={40} color={'green'} />
                }
            </td>

            {
                column && column.map(dt => {
                    if (dt.active) {
                        var formatDtName = dt.name.replace(' ', '_').split(' ').join('')

                        if (formatDtName === 'Order_id') {
                            return (
                                <td style={{ width: '130px', color: 'black' }}>
                                    {order?.SheetId ?? row[formatDtName]}
                                    <AiFillEye
                                        onClick={() => setShowHistoryModal(true)}
                                        size={25}
                                    />
                                </td>
                            )
                        }

                        if (formatDtName === 'Telephone') {
                            return (
                                <td style={{ width: '130px', color: 'black' }}>
                                    <IoLogoWhatsapp className='io-logo' onClick={() => handleClick('+212' + row[formatDtName])} size={25} color={'green'} />
                                    {order?.telDuplicate && <BsTelephoneXFill size={11} color={'red'} />}
                                    <a href={`tel:+212${row[formatDtName]}`}>
                                        <strong style={{ color: 'black' }}>{row[formatDtName]}</strong>
                                    </a>
                                    <CiEdit onClick={() => onEdit()} color={'black'} size={18} />
                                </td>
                            )
                        }

                        if (formatDtName === 'Agent') {
                            return (
                                <td style={{ width: '130px', color: 'black' }}>
                                    <DisplayTeamMember
                                        onChange={handleChangeTeam}
                                        data={dataTeamMember?.data}
                                        order={order}
                                    />
                                </td>
                            )
                        }

                        if (formatDtName === 'Up/Downsell') {
                            return (
                                <td style={{ width: '80px',color: 'black' }}>
                                    <DisplayUpDown
                                        onChange={handleChangeUpDown}
                                        currentData={row}
                                    />
                                </td>
                            )
                        }

                        if (formatDtName === 'Source') {
                            return (
                                <td style={{ width: '130px',color: 'black' }}>
                                    <DisplaySource
                                        onChange={handleChangeSource}
                                        currentData={row}
                                    />
                                </td>
                            )
                        }

                        if (formatDtName === 'Changer') {
                            return (
                                <td style={{ width: '130px',color: 'black' }}>
                                    <DisplayChangeOuvrir
                                        name='changer'
                                        onChange={handleChangeChanger}
                                        currentData={row}
                                    />
                                </td>
                            )
                        }

                        if (formatDtName === 'Ouvrir') {
                            return (
                                <td style={{ width: '130px',color: 'black' }}>
                                    <DisplayChangeOuvrir
                                        name='ouvrir'
                                        onChange={handleChangeOuvrir}
                                        currentData={row}
                                    />
                                </td>
                            )
                        }

                        if (formatDtName === 'Ville') {
                            return (
                                <td style={{ width: '130px', color: 'black' }}>
                                    <CustumDropdown refetch={refetch} options={FormatCity(dataCity ? dataCity.data : [])} name='id_city' data={dataCity ? dataCity.data : []} order={order && order} />
                                </td>
                            )
                        }

                        if (formatDtName === 'Status') {
                            return (
                                <td style={{ width: '130px', color: 'black' }}>
                                    <div className="tooltip-order">
                                        <DisplayStatus
                                            currentData={row}
                                            statusData={FilterStatusData(dataStatus?.data)}
                                            onChange={handleChangeStatus}
                                            name='Status'
                                        />
                                        {order?.reportedDate && <span className="tooltiptext">{order?.reportedDate.slice(0, 10)}</span>}
                                    </div>
                                </td>
                            )
                        }

                        if (formatDtName === 'Commentaire') {
                            return (
                                <td style={{ width: '130px', color: 'black' }}>
                                    <div onClick={() => setShowCommentModal(true)} className="tooltip-order"><BiMessageRoundedDetail
                                        size={30}
                                        data-bs-container="body"
                                        data-bs-toggle="popover"
                                        data-bs-placement="top"
                                        data-bs-content={row[formatDtName]}
                                        title={row[formatDtName]}
                                        aria-describedby="popover437986"
                                    />
                                        <span className="tooltiptext">{row[formatDtName]}</span>
                                    </div>

                                </td>
                            )
                        }

                        if (formatDtName === 'Produit') {
                            return (
                                <td style={{ width: '130px', color: 'black' }}>
                                    <a
                                        style={{ color: 'black' }}
                                        onClick={() => onShowProductEdit()}
                                        href="#addProductToOrder"
                                        className="badge badge-outline-dark"
                                    >
                                        {`
                                        ${order?.Product_Orders[0]?.quantity}*
                                        ${order?.Product_Orders[0]?.Product?.name}
                                        ${order?.Product_Orders.length === 1 ? '' : `+ ${order?.Product_Orders.length && order.Product_Orders.length - 1} Autres`}
                                    `}
                                    </a>
                                </td>
                            )
                        }

                        if (formatDtName === 'Date') return <td style={{ width: '130px', color: 'black' }}>{row['Date']}</td>

                        return <td onClick={() => onEdit()} style={{ width: '130px', color: 'black' }}>
                            {row[formatDtName]}
                            <CiEdit color={'black'} size={18} />
                        </td>
                    }
                })
            }
        </tr>
    )
}
