import React, { useEffect, useState, useRef, ElementRef } from 'react'
import { PreviewImagesModal } from '../Images';
import { ChatMessage, Cient, Support } from '../../../../models';
import { useGetClientQuery } from '../../../../services/api/ClientApi/ClientApi';
import { useGetSupportMessageQuery } from '../../../../services/api/ClientApi/ClientSupportApi';
import { BASE_URL } from '../../../../services/url/API_URL';
import { BsFillSendFill } from 'react-icons/bs'
import ModalWrapper from '../ModalWrapper'
import io from 'socket.io-client'
import "./chat.css"


const socket = io(BASE_URL, { transports: ['websocket'] })
interface Props {
    item: Support | undefined
    showModal: boolean,
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>
}
export default function MessageSupportModal({ showModal, setShowModal, item }: Props): JSX.Element {

    const { data: client } = useGetClientQuery()
    const { data: message, refetch: refetchMessage } = useGetSupportMessageQuery({ id: item?.id ?? 0 })

    useEffect(() => {
        var body = document.querySelector<HTMLBodyElement>('body');

        var modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop fade show';

        if (body) {
            body.classList.add('modal-open');
            body.style.overflow = 'hidden';
            body.style.paddingRight = '17px';

            body.appendChild(modalBackdrop);
        }
    }, [])

    return (
        <ModalWrapper title={'Chat'} showModal={showModal} setShowModal={setShowModal} id='HistoryOrderModal'>
            <FormBody data={item ?? {} as Support} client={client?.data} messageList={message?.data} refetchMessage={refetchMessage} />
        </ModalWrapper>
    )
}

interface FormBodyProps {
    data: Support
    client: Cient | undefined
    messageList: ChatMessage[] | undefined
    refetchMessage: () => any
}
const FormBody = ({ data, client, messageList, refetchMessage }: FormBodyProps) => {
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
        <div>
            <PreviewImagesModal attachement={data.attachment} setShowImage={setShowImage} showImage={showImage} />
            <div className="container-msg">
                <div className="chat-page">
                    <div className="msg-inbox">
                        <div className="chats">
                            <div className="msg-page">
                                <OutgoingMsg description={data.description} attachement={data.attachment} setShowImage={setShowImage} idUser={data.id_user ?? 0} date={data.createdAt ?? ''} />
                                {messageList && messageList.map((msg, index) => msg.id_user ?
                                    <OutgoingMsg key={index} idUser={msg.id_user ?? 0} description={msg.message} date={msg.createdAt ?? ''} /> :
                                    <ReceivedMsg key={index} idUser={msg.id_user ?? 0} description={msg.message} date={msg.createdAt ?? ''} />
                                )}
                            </div>
                        </div>
                        <div className="msg-bottom">
                            <div className="input-group-msg">
                                <input
                                    onChange={onWrite}
                                    value={message}
                                    onKeyDown={onKeyPress}
                                    type="text"
                                    className="form-control-msg chat-input"
                                    placeholder="Ecrivez votre message..."
                                />
                                <a onClick={sendMessage} ref={sendBtnRef} className="input-group-text-msg send-icon">
                                    <BsFillSendFill className="bi bi-send" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface EventProps {
    description: string
    attachement?: string
    setShowImage?: React.Dispatch<React.SetStateAction<boolean>>
    idUser: number
    date: string
}
const ReceivedMsg = ({ description, date, attachement, idUser }: EventProps): JSX.Element => {
    return (
        <div className="received-chats">
            <div className="received-msg">
                <div className="received-msg-inbox">
                    {attachement && <img src={attachement} alt="attachement" className='chat-attachement' />}
                    <p>
                        {description}
                    </p>
                    <span className="time">Admin | {date.toString().slice(0, 10)}</span>
                </div>
            </div>
        </div>
    )
}

const OutgoingMsg = ({ description, date, attachement, idUser, setShowImage }: EventProps): JSX.Element => {
    return (
        <div className="outgoing-chats">
            <div className="outgoing-msg">
                <div className="outgoing-chats-msg">
                    <p>
                        {attachement && <img src={attachement} onClick={() => setShowImage && setShowImage(true)} alt="attachement" className='chat-attachement' />}
                        {description}
                    </p>
                    <span className="time">You | {date.toString().slice(0, 10)}</span>
                </div>
            </div>
        </div>
    )
}