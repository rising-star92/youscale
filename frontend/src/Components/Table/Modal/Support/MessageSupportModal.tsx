import React, { useEffect, useState, useRef, ElementRef } from 'react'
import { PreviewImagesModal } from '../Images';
import { ChatMessage, Cient, Support } from '../../../../models';
import { useGetClientQuery } from '../../../../services/api/ClientApi/ClientApi';
import { useGetSupportMessageQuery } from '../../../../services/api/ClientApi/ClientSupportApi';
import { BASE_URL } from '../../../../services/url/API_URL';
import { BsFillSendFill } from 'react-icons/bs'
import io from 'socket.io-client'
import styles from './support.module.css'


const socket = io(BASE_URL, { transports: ['websocket'] })
interface Props {
    item: Support | undefined
    setIsVisible: React.Dispatch<React.SetStateAction<boolean>>
}
const MessageSupportModal: React.FC<Props> = ({ setIsVisible, item }): JSX.Element | null => {

    const { data: client } = useGetClientQuery()
    const { data: message, refetch: refetchMessage } = useGetSupportMessageQuery({ id: item?.id ?? 0 })

    const handleClose = () => {
        setIsVisible(false)
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={handleClose}>
                    &times;
                </button>
                <div className={styles.main}>
                    <p className={styles.title}>Discussion</p>

                    <FormBody data={item ?? {} as Support} client={client?.data} messageList={message?.data} refetchMessage={refetchMessage} />
                </div>
            </div>
        </div>
    );
}

interface FormBodyProps {
    data: Support
    client: Cient | undefined
    messageList: ChatMessage[] | undefined
    refetchMessage: () => any
}

const FormBody = ({ data, client, messageList, refetchMessage }: FormBodyProps) => {

    const getBadge = (status: string | undefined): string => {
        if (status === 'pending') return styles.enattende_span
        if (status === 'open') return styles.ouvert_span
        if (status === 'in_progress') return styles.encour_span
        if (status === 'done') return styles.resolu_span

        return ''
    }

    const [showImage, setShowImage] = useState<boolean>(false)
    const [message, setMessage] = useState<string>('')
    const sendBtnRef = useRef<ElementRef<"a">>(null)

    const onWrite = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()

        const { value } = e.target
        setMessage(value)
    }

    useEffect(() => {
        socket.on(String(data?.id) ?? '', (orderOption: {}) => {
            refetchMessage()
        })
    }, [])

    const sendMessage = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault()
        if (message === '') return
        socket.emit('message', { 'text': message, 'chatId': data.id, 'ClientId': client?.id ?? 0 })
        setMessage('')
    }

    const onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            sendBtnRef.current?.click()
        }
    }

    return (
        <div className="card-body">
            <PreviewImagesModal attachement={data.attachment} setShowImage={setShowImage} showImage={showImage} />

            <div className={styles.header}>
                <div className={styles.id}>
                    <p>ID</p>
                    <p>#{data.id}</p>
                </div>

                <div className={styles.subject}>
                    <p>Sujet</p>
                    <p>{data.subject}</p>
                </div>
            </div>


            <div className={styles.status}>
                <p>Statut</p>
                <span className={getBadge(data?.status)}>{data.status}</span>
            </div>

            <div className={styles.msgContainer}>

                <OutgoingMsg description={data.description} attachement={data.attachment} setShowImage={setShowImage} date={data.createdAt ?? ''} />
                {messageList && messageList.map((msg, index) => msg.id_user ?
                    <OutgoingMsg key={index} description={msg.message} date={msg.createdAt ?? ''} /> :
                    <ReceivedMsg key={index} description={msg.message} date={msg.createdAt ?? ''} />
                )}
            </div>

            <div className={styles.sendInput}>
                <input
                    onChange={onWrite}
                    value={message}
                    onKeyDown={onKeyPress}
                    type="text"
                    placeholder={'Votre message'}
                />

                <a onClick={sendMessage} ref={sendBtnRef} href="#">
                    <img src="/svg/support/send.svg" alt="svg" />
                </a>
            </div>
        </div>

    )
}

interface EventProps {
    description: string
    attachement?: string
    setShowImage?: React.Dispatch<React.SetStateAction<boolean>>
    date: string
}
const ReceivedMsg = ({ description, date, attachement }: EventProps): JSX.Element => {
    return (
        <div className={styles.recipied_msg}>
            {attachement && <img src={attachement} alt="attachement" className={styles.attachement} />}
            <p>
                {description}
            </p>
            <span className={styles.time}>{date.toString().slice(0, 10)}</span>
        </div>
    )
}

const OutgoingMsg = ({ description, date, attachement, setShowImage }: EventProps): JSX.Element => {
    return (
        <div className={styles.sender_msg}>
             {attachement && <img src={attachement} onClick={() => setShowImage && setShowImage(true)} alt="attachement" className={styles.attachement} />}
            <p>
                {description}
            </p>
            <span className={styles.time}>{date.toString().slice(0, 10)}</span>
        </div>
    )
}

export default MessageSupportModal;