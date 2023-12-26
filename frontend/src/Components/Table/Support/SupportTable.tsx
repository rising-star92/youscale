import React, { useState } from 'react'
import SupportRow from './SupportRow'
import TableWrapper from './TableWrapper'
import { Support } from '../../../models'
import { MessageSupportModal } from '../Modal/Support'
import { useGetSupportQuery } from '../../../services/api/ClientApi/ClientSupportApi'
import styles from './support.module.css'

export default function SupportTable(): JSX.Element {

    const [query, setQuery] = useState<{ status?: string }>({ status: undefined })
    const [showCreateSupportModal, setShowCreateSupportModal] = useState<boolean>(false)
    const [showMessage, setShowMessage] = useState<boolean>(false)
    const [item, setItem] = useState<Support>()

    const { data, isSuccess, refetch } = useGetSupportQuery(query)

    return (
        <TableWrapper
            setQuery={setQuery}
            item={item}
            title='Support'
            column={['Date', 'Object', 'Description', 'Statut', 'Discussion']}
            refetch={refetch}
            AddBtn={<CreateIssueBtn setShowModal={setShowCreateSupportModal} />}
            showAddSupportModal={showCreateSupportModal}
            setShowCreateSupportModal={setShowCreateSupportModal}
        >
            {showMessage && <MessageSupportModal item={item} setIsVisible={setShowMessage} />}
            {isSuccess && data.data.map((dt, key) => <SupportRow data={dt} key={key} setItem={setItem} setShowMessage={setShowMessage} />)}
        </TableWrapper>
    )
}


interface AddProductBtnProps {
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>
}
const CreateIssueBtn = ({ setShowModal }: AddProductBtnProps): JSX.Element => {
    return (
        <a
            onClick={() => setShowModal(true)}
            type="button"
            className={styles.createTicketBtn}
        >
            <img src="/svg/support/add.svg" alt="add" />
            Create Issues
        </a>
    )
}