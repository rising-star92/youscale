import React, { useState, useEffect } from 'react'
import ProductRow from './ProductRow'
import TableWrapper from './TableWrapper'
import { useGetProductQuery } from '../../../services/api/ClientApi/ClientProductApi'
import { GetProductModel } from '../../../models'
import styles from './product.module.css'

interface Props {
    driverObj: {
        moveNext: () => void
    }
}
export default function ProductTable({ driverObj }:Props): JSX.Element {

    const [showHidden, setShowHidden] = useState<boolean>(false)
    const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false)
    const [showEditProductModal, setShowEditProductModal] = useState<boolean>(false)
    const [showDeleteProductModal, setShowDeleteProductModal] = useState<boolean>(false)

    const { data, isFetching, refetch } = useGetProductQuery({ isHidden: showHidden })
    const [item, setItem] = useState<GetProductModel>()

    useEffect(() => {
        refetch()
    }, [showHidden])
    
    return (
        <TableWrapper
            item={item}
            title='Product'
            column={['Nom', 'Variant', 'Prix d\'achat', 'Action']}
            refetch={refetch}
            AddBtn={<AddProductBtn setShowModal={setShowAddProductModal} driverObj={driverObj} />}
            driverObj={driverObj}
            setShowHidden={setShowHidden}
            showAddProductModal={showAddProductModal}
            showEditProductModal={showEditProductModal}
            showDeleteProductModal={showDeleteProductModal}
            setShowAddProductModal={setShowAddProductModal}
            setShowEditProductModal={setShowEditProductModal}
            setShowDeleteProductModal={setShowDeleteProductModal}
        >
            {data?.data.map((dt, key) => !dt.isDeleted && <ProductRow isFetching={isFetching} data={dt} key={key} refetch={refetch} setShowDeleteModal={setShowDeleteProductModal} setShowEditModal={setShowEditProductModal} setItem={setItem} />)}
        </TableWrapper>
    )
}


interface AddProductBtnProps {
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>
    driverObj: {
        moveNext: () => void
    }
}
const AddProductBtn = ({ setShowModal, driverObj }: AddProductBtnProps): JSX.Element => {

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
            <p>Ajouter un produit</p>
        </button>
    )
}