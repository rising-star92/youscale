import React, { ElementRef, useEffect, useRef, useState } from 'react'
import { useGetOrderCommentQuery, useMakeOrderCommentMutation } from '../../../../services/api/ClientApi/ClientOrderApi'
import { BsFillSendFill } from 'react-icons/bs'
import ModalWrapper from '../ModalWrapper'
import './modal.style.css'

type HistoryType = {
    message: string;
    createdAt: string;
}[];

interface Props {
    id_order: string,
    showModal: boolean,
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>
}
export default function CommentOrderModal({ showModal, setShowModal, id_order }: Props): JSX.Element {

    const { data, refetch } = useGetOrderCommentQuery({ id_order })

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
        <ModalWrapper title={'Commentaire'} showModal={showModal} setShowModal={setShowModal} id='HistoryOrderModal'>
            <FormBody data={data?.data} id_order={id_order} refetch={refetch} />
        </ModalWrapper>
    )
}

interface FormBodyProps {
    data: HistoryType | undefined
    id_order: string
    refetch: () => any
}
const FormBody = ({ data, id_order, refetch }: FormBodyProps) => {
    const [comment, { isLoading }] = useMakeOrderCommentMutation()
    const [message, setMessage] = useState<string>('')
    const sendBtnRef = useRef<ElementRef<"a">>(null)

    const onWrite = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()

        const { value } = e.target
        setMessage(value)
    }

    const MakeComment = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault()

        const data = { message, id_order: Number(id_order) }

        comment(data).unwrap()
            .then(res => {
                refetch()
            })
            .catch(err => console.error(err))

        setMessage('')
    }

    const onKeyPress=(event: React.KeyboardEvent<HTMLInputElement>)=>{
        if (event.key === "Enter") {
            event.preventDefault();
            sendBtnRef.current?.click()
          }
    }

    return (
        <div>
            <div className="container-msg">
                <div className="chat-page">
                    <div className="msg-inbox">
                        <div className="chats">
                            <div className="msg-page">
                                {data && data.map(dt => <OutgoingMsg description={dt.message} date={dt.createdAt} />)}
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
                                <a onClick={MakeComment} ref={sendBtnRef} className="input-group-text-msg send-icon">
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
    description: string,
    date: string
}
const OutgoingMsg = ({ description, date }: EventProps): JSX.Element => {
    return (
        <div className="outgoing-chats">
            <div className="outgoing-msg">
                <div className="outgoing-chats-msg">
                    <p>
                        {description}
                    </p>
                    <span className="time">You | {date.toString().slice(0, 10)}</span>
                </div>
            </div>
        </div>
    )
}