import React, { useState } from 'react'
import { AddLinkSheetModal, ShippingModal } from '../../Table/Modal/Setting'
import IntegrateSheetModal from '../../Modal/setting/IntegrateSheetModal'
import IntegrateShippingModal from '../../Modal/setting/IntegrateShippingModal'
import IntegrateWhatsappModal from '../../Modal/setting/IntegrateWhatsappModal'
import styles from './setting.module.css'

interface Props {
    driverObj: {
        moveNext: () => void
    }
}
export default function API({ driverObj }: Props): JSX.Element {

    const [showAddLinkSheetModal, setShowAddLinkSheetModal] = useState<boolean>(false)
    const [showShippingModal, setShowShippingModal] = useState<boolean>(false)
    const [showWhatsappModal, setShowWhatsappModal] = useState<boolean>(false)

    const handleShowSheetModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        setShowAddLinkSheetModal(true)
        setTimeout(() => {
            driverObj.moveNext()
        }, 1000);
    }

    const handleShowShippingModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        setShowShippingModal(true)
        setTimeout(() => {
            driverObj.moveNext()
        }, 1000);
    }

    const handleShowWhatsappModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        setShowWhatsappModal(true)
    }

    return (
        <div className="row">
            {showAddLinkSheetModal && <IntegrateSheetModal driverObj={driverObj} setIsVisible={setShowAddLinkSheetModal} />}
            {showShippingModal && <IntegrateShippingModal driverObj={driverObj} setIsVisible={setShowShippingModal} />}
            {showWhatsappModal && <IntegrateWhatsappModal driverObj={driverObj} setIsVisible={setShowWhatsappModal} />}

            <h3 className="mt-4 mb-3">API</h3>
            <div className="row" style={{justifyContent: 'space-evenly'}}>
                <APICard img={'/svg/setting/sheets.png'} title={'Google Sheets'} onClick={handleShowSheetModal} />
                <APICard img={'/svg/setting/shopify.png'} title={'Shopify'} />
                <APICard img={'/svg/setting/shipping.svg'} title={'Sociétés de livraison'} onClick={handleShowShippingModal} />
                <APICard img={'/svg/setting/whatsapp.svg'} title={'Whatsapp'} onClick={handleShowWhatsappModal} />
            </div>
        </div>
    )
}

interface APICardProps {
    title: string,
    img: string,
    onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => any
}
const APICard = ({ title, img, onClick }: APICardProps): JSX.Element => {
    return (
        <div className={styles.apiCard}>
            <img src={img} className={styles.apiLogo} alt="apiLogo" />
            <p className={styles.apiTitle}>{title}</p>
            <button
                onClick={onClick}
                type="button"
                className={styles.apiBtn}
            >
                Intégrer
            </button>
        </div>
    )
}