import React from 'react'
import { GetProductModel } from '../../../models'
import { usePatchProductMutation } from '../../../services/api/ClientApi/ClientProductApi'
import { showToastSucces } from '../../../services/toast/showToastSucces'
import { showToastError } from '../../../services/toast/showToastError'
import { Switch } from '../../Switch'
import styles from './product.module.css'

interface Props {
    setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>,
    setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>,
    data: GetProductModel | undefined,
    setItem: React.Dispatch<React.SetStateAction<GetProductModel | undefined>>
    isFetching: boolean
    refetch: () => any
}
export default function ProductRow({ setShowEditModal, setShowDeleteModal, data, setItem, refetch, isFetching }: Props): JSX.Element {

    const [patchProd] = usePatchProductMutation()

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

    const SwitchHideProduct = () => {

        patchProd({
            id: data?.id || 0,
            isHidden: !data?.isHidden || false,
            name: data?.name ?? '',
            price_selling: String(data?.price_selling) ?? ''
        }).unwrap().then((res) => {
            showToastSucces(data?.isHidden ? 'Your product has ben showed' : 'Your product has ben hidden')
            refetch()
        }).catch(err => {
            console.log(err)
            showToastError('Ooops, something happen try again')
        })
    }

    return (
        isFetching ?
            <>Loading ...</> :
            <tr>
                <td>{data?.name}</td>
                <td>{data?.variant.map(it => it + '-')}-</td>
                <td>{data?.price_selling} dhs</td>
                <td>
                    <div className="d-flex">
                        <Switch
                            active={!data?.isHidden || false}
                            size={{ width: '43.727px', height: '25.227px' }}
                            SwitchHideProduct={SwitchHideProduct}
                        />
                        <a
                            onClick={handleEditRow}
                            className={styles.editIcon}
                            href="#"
                        >
                            <img src="/svg/product/edit.svg" alt="edit" />
                        </a>
                        {/* {data?.isHidden ? <AiOutlineEyeInvisible onClick={SwitchHideProduct} size={25} /> : <AiOutlineEye onClick={SwitchHideProduct} size={25} />} */}
                    </div>
                </td>
            </tr>
    )
}
