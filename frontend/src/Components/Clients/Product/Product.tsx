import React, { useState, useEffect } from 'react'
import { ProductTable, StockTable } from '../../Table/Product'
import Main from '../../Main'
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import './product.style.css'
import { Cient } from '../../../models';
import { usePatchClientMutation } from '../../../services/api/ClientApi/ClientApi';
import { BottomRightStaticBtn } from '../../Tutorial';

interface Props {
    client: Cient | undefined
}
const pageName = 'product'
export default function Product({ client }: Props): JSX.Element {
    const [showVideo, setShowVideo] = useState<boolean>(false)
    const [showTutorial, setShowTutorial] = useState<boolean>(false);
    const [patchClient] = usePatchClientMutation()

    const driverObj = driver({
        onNextClick: () => {
            if (driverObj.getActiveIndex() === 6) {
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
                element: '.add-product', popover: {
                    title: 'Add product', description: 'Add your product here.', side: "bottom", align: 'start',
                    onNextClick: (drvHks) => {
                        driverObj.moveTo(3)
                    }
                }
            },
            {
                element: '.modal-content', popover: {
                    title: 'Add product', description: 'Add your product here.', side: "bottom", align: 'start',
                    onNextClick: (drvHks) => {
                        driverObj.moveTo(2)
                    }, onPrevClick: (drvHks) => {
                        alert('Close your modal before')
                    },
                }
            },
            {
                element: '.fermer-btn', popover: {
                    title: 'Close modal', description: 'close', side: "bottom", align: 'start',
                    onNextClick: (drvHks) => {
                        alert('Close your modal before')
                    }, onPrevClick: (drvHks) => {
                        alert('Close your modal before')
                    },
                }
            },
            {
                element: '.add-stock', popover: {
                    title: 'Add product', description: 'Add your product here.', side: "bottom", align: 'start',
                    onNextClick: (drvHks) => {
                        driverObj.moveTo(6)
                    },
                    onPrevClick: (drvHks) => {
                        driverObj.moveTo(0)
                    },
                }
            },
            {
                element: '.modal-content', popover: {
                    title: 'Add your team', description: 'Add your team here', side: "bottom", align: 'start',
                    onNextClick: (drvHks) => {
                        driverObj.moveTo(5)
                    }, onPrevClick: (drvHks) => {
                        alert('Close your modal before')
                    },
                }
            },
            {
                element: '.fermer-btn', popover: {
                    title: 'Close modal', description: 'close', side: "bottom", align: 'start',
                    onNextClick: (drvHks) => {
                        alert('Close your modal before')
                    }, onPrevClick: (drvHks) => {
                        alert('Close your modal before')
                    },
                }
            },
            {
                element: '.menu-step:nth-child(7)', popover: {
                    title: 'Add your team', description: 'Add your team here', side: "right", align: 'start', onPrevClick: (drvHks) => {
                        driverObj.moveTo(3)
                    },
                }
            }
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
            urlVideo={'https://www.youtube.com/watch?v=EkhWLahQ8ww'}
            name={'Product'}
            showDateFilter={false}
            showProductFilter={false}
            showTeamFilter={false}
            closeTutorial={closeTutorial}
            showVideo={showVideo}
            setShowVideo={setShowVideo}
        >
            <div className="content-body">
                <div className="container-fluid">
                    <div className="display-product-content">
                        <ProductTable driverObj={driverObj} />
                        <StockTable driverObj={driverObj} />
                    </div>
                </div>
            </div>
            <BottomRightStaticBtn setShowVideo={setShowVideo} />
        </Main>
    )
}
