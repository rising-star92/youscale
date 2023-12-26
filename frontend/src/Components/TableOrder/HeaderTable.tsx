import { useEffect, useState } from 'react'
import { OrderQueryModel, StatusModel, countOrderByStatusModel } from '../../models'
import { GetCurrTeamMember } from '../../services/auth/GetCurrTeamMember'
import { useGetClientOrderExportModelQuery } from '../../services/api/ClientApi/ClientOrderApi'
import { CSVLink } from 'react-csv'
import { BulkEditAgentModal } from '../Table/Modal/Order'
import { GetRole } from '../../services/storageFunc'
import style from './table.module.css'
import { OrderFilter } from '../Filter/OrderFilter'
import { AiFillFilter } from 'react-icons/ai'

var currentTeam = GetCurrTeamMember()

type dataType = {
    label: string;
    value: string;
}

interface Props {
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>
    setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>
    setShowConfirmationModal: React.Dispatch<React.SetStateAction<boolean>>
    setOrderQueryData: React.Dispatch<React.SetStateAction<OrderQueryModel>>
    setStatus: React.Dispatch<React.SetStateAction<string | undefined>>
    _skip: number,
    refetch: () => any,
    id_orders: number[] | undefined
    driverObj: {
        moveNext: () => void
    }
    dataStatus: {
        code: Number;
        data: StatusModel[];
        countOrderByStatus: countOrderByStatusModel[];
    } | undefined
}
export default function HeaderTable({ setShowModal, refetch, id_orders, setOrderQueryData, _skip, setStatus, setShowConfirmationModal, setShowDeleteModal, driverObj, dataStatus }: Props) {
    return (
        <div className={style.headerTable}>
            <div className={style.leftTools}>
                <StartConfirmationBtn setShowModal={setShowConfirmationModal} driverObj={driverObj} />
                <AddOrderBtn setShowModal={setShowModal} driverObj={driverObj} />
            </div>
            <div className={style.middleTools}>
                <InputSearch _skip={_skip} setOrderQueryData={setOrderQueryData} refetch={refetch} />
                <StatusDropdown _skip={_skip} setOrderQueryData={setOrderQueryData} setStatus={setStatus} refetch={refetch} dataStatus={dataStatus} />
            </div>
            <div className={style.rightTools}>
                {
                    GetRole() === "TEAM" ?
                        currentTeam.can_delete_order ? <DeleteBulkOrder id_orders={id_orders} refetch={refetch} setShowDeleteModal={setShowDeleteModal} /> : <></>
                        : <DeleteBulkOrder id_orders={id_orders} refetch={refetch} setShowDeleteModal={setShowDeleteModal} />
                }
                {
                    GetRole() === "TEAM" ?
                        currentTeam.can_edit_order ? <EditBulkOrder id_orders={id_orders} refetch={refetch} /> : <></>
                        : <EditBulkOrder id_orders={id_orders} refetch={refetch} />
                }
                <ImportBtn id_orders={id_orders} />
            </div>
        </div>
    )
}

interface SearchBarProps {
    setOrderQueryData: React.Dispatch<React.SetStateAction<OrderQueryModel>>,
    _skip: number,
    refetch: any

}
const InputSearch = ({ setOrderQueryData, refetch, _skip }: SearchBarProps): JSX.Element => {
    return (
        <div className={style.searchContainer}>

            <div className={style.searchIcon}>
                <img src="/svg/order/search.svg" alt="searcg" />
            </div>

            <input
                onChange={(e) => {
                    setOrderQueryData({ search: e.target.value, status: '', _skip: 0, _limit: _skip })
                    refetch()
                }}
                type="text"
                className={style.searchInput}
                placeholder="Recherche"
            />
        </div>
    )
}

interface DeleteBulkOrderProps {
    id_orders: number[] | undefined
    setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>
    refetch: () => any
}
const DeleteBulkOrder = ({ id_orders, setShowDeleteModal }: DeleteBulkOrderProps): JSX.Element => {

    const handleDestroyOrder = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
        e.preventDefault()
        setShowDeleteModal(true)
    }

    return (
        <img
            src="/svg/order/delete.svg"
            alt="delete"
            className={id_orders && id_orders?.length > 0 ? 'del-order-hov' : ''}
            color={id_orders && id_orders?.length > 0 ? 'red' : 'gray'}
            onClick={handleDestroyOrder}
        />
    )
}

interface EditBulkOrderProps {
    id_orders: number[] | undefined
    refetch: () => any
}
const EditBulkOrder = ({ id_orders, refetch }: EditBulkOrderProps): JSX.Element => {

    const [showModal, setShowModal] = useState<boolean>(false)

    const handleDestroyOrder = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
        e.preventDefault()
        if (!id_orders || id_orders?.length <= 0) return

        setShowModal(true)
    }

    return (
        <>
            {showModal && <BulkEditAgentModal id_orders={id_orders} showModal={showModal} setShowModal={setShowModal} refetch={refetch} />}
            <img
                src="/svg/order/pencil.svg"
                alt="pencil"
                className={id_orders && id_orders?.length > 0 ? 'del-order-hov' : ''}
                color={id_orders && id_orders?.length > 0 ? 'black' : 'gray'}
                onClick={handleDestroyOrder}
            />
        </>
    )
}

interface AddOrderBtnProps {
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>
    driverObj: {
        moveNext: () => void
    }
}

const AddOrderBtn = ({ setShowModal, driverObj }: AddOrderBtnProps): JSX.Element => {

    const handleShowTeamModal = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
        e.preventDefault()
        setShowModal(true)
        setTimeout(() => {
            driverObj.moveNext()
        }, 1000);
    }

    return (

        <img
            src="/svg/order/add.svg"
            alt="add"
            onClick={handleShowTeamModal}
        />
    )
}

const StartConfirmationBtn = ({ setShowModal, driverObj }: AddOrderBtnProps): JSX.Element => {

    const handleShowTeamModal = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
        e.preventDefault()
        setShowModal(true)
        setTimeout(() => {
            driverObj.moveNext()
        }, 1000);
    }

    return (
        <img
            src="/svg/order/call.svg"
            onClick={handleShowTeamModal}
            alt="add"
        />
    )
}

interface ImportBtnProps {
    id_orders: number[] | undefined
}
const ImportBtn = ({ id_orders }: ImportBtnProps): JSX.Element => {

    const { data: exportData, refetch } = useGetClientOrderExportModelQuery({
        id_orders: JSON.stringify(id_orders)
    })

    useEffect(() => {
        refetch()
    }, [id_orders])

    const headers: { label: string, key: string }[] = []

    return <CSVLink
        separator={';'}
        filename={'youscale_order.csv'}
        className="all-status-txt"
        data={exportData ? exportData?.data : []}
        headers={exportData ? exportData?.header : headers}>
        <img src="/svg/order/xsls.svg" alt="xsls" />
    </CSVLink>
}

interface PropsStatus {
    setOrderQueryData: React.Dispatch<React.SetStateAction<OrderQueryModel>>
    setStatus: React.Dispatch<React.SetStateAction<string | undefined>>
    _skip: number
    refetch: any
    dataStatus: {
        code: Number;
        data: StatusModel[];
        countOrderByStatus: countOrderByStatusModel[];
    } | undefined
}
const StatusDropdown = ({ setOrderQueryData, refetch, _skip, setStatus, dataStatus }: PropsStatus): JSX.Element => {

    const handleChangeStatus = ({ label, value }: dataType) => {
        var search = value === 'Status' ? undefined : value
        setStatus(search)
        setOrderQueryData(prevState => ({
            ...prevState,
            status: search,
            _skip: 0,
            _limit: prevState._skip
        }));
        refetch()
    }

    const convertProduct = (data: countOrderByStatusModel[] | undefined): dataType[] => {
        if (!data) return []

        var out: dataType[] = []

        data.map(dt => {
            if (dt.checked) {
                out.push({ label: `${dt.name} + (${dt.count})`, value: String(dt.name) })
            }
        })

        return out
    }

    const getTotalStatus = (): number => {
        var sum: number = 0

        {
            dataStatus && dataStatus.countOrderByStatus.map((status, index) => {
                if (status.checked) {
                    sum += status.count
                }
            })
        }

        return sum
    }

    return (
        <div className="col-auto my-1">
            {
                dataStatus && <OrderFilter Icons={AiFillFilter} label={`Tous les status (${getTotalStatus()})`} data={convertProduct(dataStatus?.countOrderByStatus)} onChange={handleChangeStatus} />
            }
        </div>
    )
}