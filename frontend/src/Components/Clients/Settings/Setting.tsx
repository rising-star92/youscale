import { useState, useEffect } from 'react'
import { usePatchClientMutation } from '../../../services/api/ClientApi/ClientApi';
import { BottomRightStaticBtn } from '../../Tutorial';
import { driver } from "driver.js";
import { Cient } from '../../../models';
import Main from '../../Main'
import API from './API'
import styles from './setting.module.css'
import modalStyles from '../../Modal/setting/setting.module.css'
import OrderSetting from './OrderSetting'

import "driver.js/dist/driver.css";
import './setting.style.css'

interface Props {
    client: Cient | undefined
}
const pageName = 'setting'
export default function Setting({ client }: Props) {

    const [showVideo, setShowVideo] = useState<boolean>(false)
    const [showTutorial, setShowTutorial] = useState<boolean>(client?.isBeginner ?? false);
    const [patchClient] = usePatchClientMutation()

    const driverObj = driver({
        onNextClick: () => {
            if (driverObj.getActiveIndex() === 13) {
                const response = confirm("En terminant vous confirmer ne plus recevoir le tutoriel sur les autres pages ?")
                if (response) {
                    patchClient({ isBeginner: false }).unwrap()
                        .then(res => console.log(res))
                        .catch(err => console.warn(err))
                    driverObj.destroy();
                }
            } else {
                driverObj.moveNext()
            }
        },
        nextBtnText: 'Suivant',
        prevBtnText: 'Retour',
        doneBtnText: 'Terminer le tutoriel',
        showProgress: true,
        allowClose: false,

        steps: [
            {
                element: `.row .${styles.apiCard}:nth-child(1)`, popover: {
                    title: 'Google Sheet', description: 'Integrate google sheet.', side: "bottom", align: 'start',
                    onNextClick: (drvHks) => {
                        driverObj.moveTo(3)
                    }
                }
            },
            {
                element: `.${modalStyles.modalContent}`, popover: {
                    title: 'Google Sheet', description: 'Integrate google sheet.', side: "bottom", align: 'start',
                    onNextClick: (drvHks) => {
                        driverObj.moveTo(2)
                    }, onPrevClick: (drvHks) => {
                        alert('Close your modal before')
                    },
                }
            },
            {
                element: `.${modalStyles.closeButton}`, popover: {
                    title: 'Close modal', description: 'close', side: "bottom", align: 'start',
                    onNextClick: (drvHks) => {
                        alert('Close your modal before')
                    }, onPrevClick: (drvHks) => {
                        alert('Close your modal before')
                    },
                }
            },
            {
                element: `.row .${styles.apiCard}:nth-child(3)`, popover: {
                    title: 'Shipping Company', description: 'Add your shipping company here', side: "right", align: 'start', onPrevClick: (drvHks) => {
                        driverObj.moveTo(0)
                    },
                    onNextClick: (drvHks) => {
                        driverObj.moveTo(6)
                    }
                }
            },
            {
                element: `.${modalStyles.modalContent_Shipping}`, popover: {
                    title: 'Shipping Company', description: 'Add your shipping company here', side: "bottom", align: 'start',
                    onNextClick: (drvHks) => {
                        driverObj.moveTo(6)
                    }, onPrevClick: (drvHks) => {
                        alert('Close your modal before')
                    },
                }
            },
            {
                element: `.${modalStyles.closeButton}`, popover: {
                    title: 'Close modal', description: 'close', side: "bottom", align: 'start',
                    onNextClick: (drvHks) => {
                        alert('Close your modal before')
                    }, onPrevClick: (drvHks) => {
                        alert('Close your modal before')
                    },
                }
            },
            {
                element: `.${styles.statusContainer}`, popover: {
                    title: 'Status', description: 'You can manage your status here', side: "right", align: 'start', onPrevClick: (drvHks) => {
                        driverObj.moveTo(3)
                    },
                }
            },
            { element: `.${styles.columnContainer}`, popover: { title: 'Column', description: 'You can manage your column here', side: "top", align: 'start' } },
            {
                element: `.${styles.addCityBtn}`, popover: {
                    title: 'Add City', description: 'You can add your city here', side: "right", align: 'end',
                    onNextClick: (drvHks) => {
                        driverObj.moveTo(11)
                    }
                }
            },
            {
                element: `.${modalStyles.modalContent_City}`, popover: {
                    title: 'Add City', description: 'You can add your city here', side: "bottom", align: 'start',
                    onNextClick: (drvHks) => {
                        driverObj.moveTo(10)
                    }, onPrevClick: (drvHks) => {
                        alert('Close your modal before')
                    },
                }
            },
            {
                element: `.${modalStyles.closeButton}`, popover: {
                    title: 'Close modal', description: 'close', side: "bottom", align: 'start',
                    onNextClick: (drvHks) => {
                        alert('Close your modal before')
                    }, onPrevClick: (drvHks) => {
                        alert('Close your modal before')
                    },
                }
            },
            {
                element: `.${styles.downloadModelBtn}`, popover: {
                    title: 'Copy Model', description: 'You can copy the model for import your city', side: "right", align: 'end', onPrevClick: (drvHks) => {
                        driverObj.moveTo(7)
                    },
                }
            },
            { element: '.configuration', popover: { title: 'Configuration', description: 'You can make your configuration', side: "right", align: 'end' } },
            { element: '.menu-step:nth-child(5)', popover: { title: 'Team', description: 'Description for team page', side: "right", align: 'start' } }
        ]
    });

    useEffect(() => {
        client?.isBeginner && driverObj.drive();
    }, [client]);

    const closeTutorial = () => {
        localStorage.setItem(`tutorial_${pageName}`, JSON.stringify(true));
        setShowTutorial(false);
    };

    return (
        <Main
            urlVideo={'https://www.youtube.com/watch?v=UtNXAwrUFok'}
            name='Setting'
            showDateFilter={false}
            showProductFilter={false}
            showTeamFilter={false}
            showVideo={showVideo}
            setShowVideo={setShowVideo}
            closeTutorial={closeTutorial}
        >
            <div className="content-body">
                <div className="container-fluid">
                    <API driverObj={driverObj} />
                    <OrderSetting driverObj={driverObj} />
                </div>
            </div>

            <BottomRightStaticBtn setShowVideo={setShowVideo} />
        </Main>
    )
}