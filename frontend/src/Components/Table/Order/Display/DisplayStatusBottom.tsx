import React, { ElementRef, useRef } from 'react'
import { FaCaretDown } from 'react-icons/fa'
import { HiOutlineArrowSmLeft, HiOutlineArrowSmRight } from 'react-icons/hi'
import styles from './styles.module.css'
import { OrderQueryModel, StatusModel, countOrderByStatusModel } from '../../../../models'

function truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) {
        return str;
    } else {
        const truncated: string = str.substr(0, maxLength);
        const lastSpaceIndex: number = truncated.lastIndexOf(' ');

        if (lastSpaceIndex !== -1) {
            return truncated.substr(0, lastSpaceIndex) + '...';
        } else {
            return truncated + '...';
        }
    }
}

interface Props {
    setStatus: React.Dispatch<React.SetStateAction<string | undefined>>
    dataStatus: {
        code: Number;
        data: StatusModel[];
        countOrderByStatus: countOrderByStatusModel[];
    } | undefined
    setOrderQueryData: React.Dispatch<React.SetStateAction<OrderQueryModel>>
    refetch: () => any
}
export default function DisplayStatusBottom({ setStatus, dataStatus, setOrderQueryData, refetch }:Props) {
    const displayElemRef = useRef<ElementRef<"div">>(null)

    return (
        <div className={styles.displayStatusBottomContainer}>
            <div ref={displayElemRef} className={styles.displayStatusBottom}>
                { dataStatus?.data.map(dt => dt.checked && <ItemsStatus name={dt.name} setOrderQueryData={setOrderQueryData} refetch={refetch} setStatus={setStatus} borderColor={dt.color || 'transparent'} />) }
            </div>
            <SwithButton displayElemRef={displayElemRef} />
        </div>
    )
}

interface ItemsStatusProps {
    setStatus: React.Dispatch<React.SetStateAction<string | undefined>>
    name: string
    borderColor: string
    setOrderQueryData: React.Dispatch<React.SetStateAction<OrderQueryModel>>
    refetch: () => any
}
const ItemsStatus = ({ name, borderColor, setStatus, setOrderQueryData, refetch }: ItemsStatusProps): JSX.Element => {

    const onClick=(e: React.MouseEvent<HTMLDivElement, MouseEvent>)=>{
        e.preventDefault()
        setStatus(name)
        setOrderQueryData({ status: name, search: '', _skip: 0, _limit: 20 })
        refetch()
    }

    return (
        <div onClick={onClick} style={{ borderBottom: `1px solid ${borderColor}` }} className={styles.ItemsStatus}>
            <p>{truncateString(name, 10)}</p>
            <FaCaretDown className={styles.ItemsStatusIcon} size={13} />
        </div>
    )
}

interface SwithProps {
    displayElemRef: React.RefObject<HTMLDivElement>
}
const SwithButton = ({ displayElemRef }: SwithProps): JSX.Element => {

    const onLeft = (e: React.MouseEvent<SVGElement, MouseEvent>) => {
        e.preventDefault()

        if (displayElemRef.current) {
            displayElemRef.current.scrollLeft -= 80
        }
    }

    const onRight = (e: React.MouseEvent<SVGElement, MouseEvent>) => {
        e.preventDefault()

        if (displayElemRef.current) {
            displayElemRef.current.scrollLeft += 80
        }
    }

    return (
        <div className={styles.SwithButton}>
            <HiOutlineArrowSmLeft onClick={onLeft} className={styles.SwithButtonArrow} />
            <HiOutlineArrowSmRight onClick={onRight} className={styles.SwithButtonArrow} />
        </div>
    )
}