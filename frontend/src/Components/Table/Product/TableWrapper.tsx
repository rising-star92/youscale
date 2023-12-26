import React from 'react'
import AddProductModal from '../../Modal/Product/AddProductModal'
import EditProductModal from '../../Modal/Product/EditProductModal'
import { GetProductModel } from '../../../models'
import styles from './product.module.css'

interface Props {
    title: string,
    children: JSX.Element | JSX.Element[] | any,
    column: string[],
    AddBtn: JSX.Element
    setShowHidden?: React.Dispatch<React.SetStateAction<boolean>>
    refetch?: () => any
    item?: GetProductModel | undefined
    showAddProductModal?: boolean
    showEditProductModal?: boolean
    showDeleteProductModal?: boolean
    setShowAddProductModal?: React.Dispatch<React.SetStateAction<boolean>>
    setShowEditProductModal?: React.Dispatch<React.SetStateAction<boolean>>
    setShowDeleteProductModal?: React.Dispatch<React.SetStateAction<boolean>>
    driverObj: {
        moveNext: () => void
    }
}
export default function TableWrapper({ children, title, column, item, AddBtn, setShowHidden, refetch, showAddProductModal, showEditProductModal, showDeleteProductModal, setShowAddProductModal, setShowEditProductModal, setShowDeleteProductModal, driverObj }: Props): JSX.Element {

    const never = (): any => { }
    return (
        <div className="col-lg-12 product-table">
            {showAddProductModal ? <AddProductModal refetch={refetch ?? never()} driverObj={driverObj} setIsVisible={setShowAddProductModal ?? never()} /> : <></>}
            {showEditProductModal ? <EditProductModal refetch={refetch ?? never()} setIsVisible={setShowEditProductModal ?? never()} item={item} /> : <></>}

            <div className="card">
                <div className="card-header">
                    <h4 className={styles.title}>{title}</h4>
                    {
                        setShowHidden &&
                        <div className="card-tabs mt-3 mt-sm-0">
                            <ul className="nav nav-tabs" role="tablist">
                                <li className="nav-item">
                                    <a
                                        onClick={() => setShowHidden(false)}
                                        className="nav-link active"
                                        data-bs-toggle="tab"
                                        href="#Order"
                                        role="tab"
                                    >
                                        All
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a onClick={() => setShowHidden(true)} className="nav-link" data-bs-toggle="tab" href="#Rate" role="tab">
                                        Hidden
                                    </a>
                                </li>
                            </ul>
                        </div>
                    }

                    {AddBtn}
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    {column.map((col: string, key: number) => <th key={key}>{col}</th>)}
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {children}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
