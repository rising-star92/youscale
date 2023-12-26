import { Support } from '../../../models'
import styles from './support.module.css'

interface Props{
    data: Support | undefined
    setItem: React.Dispatch<React.SetStateAction<Support | undefined>>
    setShowMessage: React.Dispatch<React.SetStateAction<boolean>>
}
export default function SupportRow({ data, setItem, setShowMessage }:Props): JSX.Element {


    const getBadge = (status: string | undefined) : string =>{
        if(status === 'pending') return styles.enattende_span
        if(status === 'open') return styles.ouvert_span
        if(status === 'in_progress') return styles.encour_span
        if(status === 'done') return styles.resolu_span

        return ''
    }

    const onShowChat = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) =>{
        e.preventDefault()

        setItem(data)
        setShowMessage(true)
    }

    return (
        <tr style={{height: '20px'}}>
            <td>{data?.id}</td>
            <td>{data?.createdAt ? data.createdAt.toString().slice(0, 10) : '00:00:00'}</td>
            <td>{data?.subject}</td>
            <td>{data?.description}</td>
            <td>
                <span className={getBadge(data?.status)}>{data?.status}</span>
            </td>
            <td>
                <div className="d-flex">
                    <a
                        href="#"
                        onClick={onShowChat}
                    >
                        <img src="/svg/support/chat.svg" alt="chat" />
                    </a>
                </div>
            </td>
        </tr>
    )
}
