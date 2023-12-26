import React from 'react'
import { GetStockModel } from '../../../models'
import styles from './product.module.css'

interface Props {
    setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>,
    setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>,
    data: GetStockModel | undefined,
    setItem: React.Dispatch<React.SetStateAction<GetStockModel | undefined>>
}
export default function StockRow({ setShowEditModal, setShowDeleteModal, data, setItem }: Props): JSX.Element {

    const handleEditRow = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault()

        setShowEditModal(true)
        setItem(data)
    }

    const handleDeleteRow = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault()

        setShowDeleteModal(true)
        setItem(data)
    }

    return (
        <tr>
            <td>{data?.Product.name}</td>
            <td>{data?.quantity}</td>
            <td>
                <div className="d-flex">
                    <a
                        onClick={handleEditRow}
                        className={styles.editIcon}
                        href="#"
                    >
                        <img src="/svg/product/edit.svg" alt="edit" />
                    </a>

                    <a
                        onClick={handleDeleteRow}
                        className={styles.editIcon}
                        href="#"
                    >
                        <img src="/svg/product/delete.svg" alt="edit" />
                    </a>
                </div>
            </td>
        </tr>
    )
}
