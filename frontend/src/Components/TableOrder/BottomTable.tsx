import { ElementRef, useRef } from 'react';
import { OrderQueryModel, StatusModel, countOrderByStatusModel } from '../../models';
import style from './table.module.css'

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
export default function BottomTable({ setStatus, dataStatus, setOrderQueryData, refetch }: Props) {
    const displayElemRef = useRef<ElementRef<"div">>(null)

    return (
        <div className={style.bottomTable}>
            <div ref={displayElemRef} className={style.displayStatus}>
                {dataStatus?.data.map((dt, index) => dt.checked && <StatusItems key={index} name={dt.name} setOrderQueryData={setOrderQueryData} refetch={refetch} setStatus={setStatus} borderColor={dt.color || 'transparent'} />)}
            </div>
            <div className={style.statusControls}>
                <img src="/svg/order/prev_table.svg" alt="prev_table" />
                <img src="/svg/order/next_table.svg" alt="next_table" />
            </div>
        </div>
    )
}

interface StatusProps {
    setStatus: React.Dispatch<React.SetStateAction<string | undefined>>
    name: string
    borderColor: string
    setOrderQueryData: React.Dispatch<React.SetStateAction<OrderQueryModel>>
    refetch: () => any
}
const StatusItems = ({ name, setStatus, setOrderQueryData, refetch }: StatusProps): JSX.Element => {

    const onClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        setStatus(name)
        setOrderQueryData({ status: name, search: '', _skip: 0, _limit: 20 })
        refetch()
    }

    return (
        <div onClick={onClick} className={style.status}><p>{truncateString(name, 10)}</p></div>
    )
}