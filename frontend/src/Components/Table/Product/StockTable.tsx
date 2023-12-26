import React, { useState } from 'react'
import StockRow from './StockRow'
import TableWrapper from './TableWrapper'
import AddSotckModal from '../../Modal/Product/AddSotckModal'
import EditSotckModal from '../../Modal/Product/EditSotckModal'
import { DeleteStockModal } from '../Modal/Product'
import { useGetStockQuery } from '../../../services/api/ClientApi/ClientStockApi'
import { GetStockModel } from '../../../models'
import styles from './product.module.css'

interface Props {
    driverObj: {
        moveNext: () => void
    }
}
export default function StockTable({ driverObj }:Props): JSX.Element {
    const [showAddStockModal, setShowAddStockModal] = useState<boolean>(false)
    const [showEditStockModal, setShowEditStockModal] = useState<boolean>(false)
    const [showDeleteStockModal, setShowDeleteStockModal] = useState<boolean>(false)

    const [ item, setItem ] = useState<GetStockModel>()
    const { data, refetch } = useGetStockQuery()

    return (
        <TableWrapper title='Stock' column={['Produit', 'Quantite', 'Action']} driverObj={driverObj} AddBtn={<AddStockBtn setShowModal={setShowAddStockModal} driverObj={driverObj} />}>
            { showAddStockModal ? <AddSotckModal setIsVisible={setShowAddStockModal} refetch={refetch} driverObj={driverObj} /> : <></> }
            { showEditStockModal ? <EditSotckModal item={item} setIsVisible={setShowEditStockModal} refetch={refetch}  /> : <></> }
            { showDeleteStockModal ? <DeleteStockModal showModal={showDeleteStockModal} item={item} setShowModal={setShowDeleteStockModal} refetch={refetch}  /> : <></> }

            { data?.data.map((dt, index)=> <StockRow 
                key={index}
                data={dt}
                setItem={setItem}
                setShowDeleteModal={setShowDeleteStockModal}
                setShowEditModal={setShowEditStockModal} 
            />) }

        </TableWrapper>
    )
}

interface AddStockBtnProps {
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>
    driverObj: {
        moveNext: () => void
    }
}
const AddStockBtn = ( { setShowModal, driverObj }: AddStockBtnProps ): JSX.Element => {
   
    const handleShowProductModal=(e: React.MouseEvent<HTMLButtonElement, MouseEvent>)=>{
        e.preventDefault()
        
        setShowModal(true)
        setTimeout(() => {
            driverObj.moveNext()
        }, 1000);
    }

    return (
        <button
            onClick={handleShowProductModal}
            type="button"
            className={styles.AddBtn}
        >
            <img src="/svg/product/plus.svg" alt="plus" />
            <p>Ajouter un stock</p>
        </button>
    )
}