import React, { useState, useEffect } from 'react'
import Main from '../../Main'
import { DashbordModel, orderStatistic, OrderReport, CostReport, RateReport, reportEarningNet, BestSellingProduct, BestCity, Cient } from '../../../models'
import { BottomRightStaticBtn } from '../../Tutorial'
import { CustomPie, CustomLine } from '../../Chart'
import { useGetAdsQuery } from '../../../services/api/ClientApi/ClientAdsApi'
import { usePatchClientMutation } from '../../../services/api/ClientApi/ClientApi';
import { driver } from "driver.js";
import styles from './style.module.css'
import "driver.js/dist/driver.css";
import 'reactjs-popup/dist/index.css';
import './style.css'

interface Props {
    data: DashbordModel,
    setDate: React.Dispatch<React.SetStateAction<string[]>>
    setUsingDate: React.Dispatch<React.SetStateAction<boolean>>
    setIdTeam: React.Dispatch<React.SetStateAction<number>>
    setProduct: React.Dispatch<React.SetStateAction<string>>
    showDateFilter: boolean,
    showProductFilter: boolean,
    usingDate: boolean,
    showTeamFilter: boolean
    showTutorial: boolean
    closeTutorial: () => void
    client: Cient | undefined
}
export default function Dashbord({ data, setUsingDate, setDate, showDateFilter, setProduct, showProductFilter, showTeamFilter, setIdTeam, usingDate, showTutorial, closeTutorial, client }: Props): JSX.Element {
    const [showVideo, setShowVideo] = useState<boolean>(false)

    const [patchClient] = usePatchClientMutation()
    const driverObj = driver({
        onNextClick: () => {
            if (driverObj.getActiveIndex() === 0) {
                const response = confirm("En terminant vous confirmer ne plus recevoir le tutoriel sur les autres pages ?")
                if (response) {
                    patchClient({ isBeginner: false }).unwrap()
                        .then(res => {
                            console.log(res)
                            driverObj.destroy();
                            window.location.reload()
                        })
                        .catch(err => console.warn(err))
                } else {
                    //
                }
            }
        },
        nextBtnText: 'Suivant',
        prevBtnText: 'Retour',
        doneBtnText: 'Terminer le tutoriel',
        popoverClass: "driverjs-theme",
        stagePadding: 4,
        showProgress: true,
        allowClose: false,
        steps: [
            {
                element: '.menu-step:nth-child(8)',
                popover: {
                    title: 'Setting',
                    description: `<p class=${styles.stepDescription}>Cliquez sur l’icon</p>`,
                    side: "right",
                    align: 'start'
                }
            }
        ]
    });

    if (client?.isBeginner) {
        driverObj.highlight({
            popover: {
                description: `
                    <div class=${styles.welcomeBox}>
                        <div class=${styles.welcomeTitle}>Bienvenue sur Youscale </div>
                        <img class=${styles.welcomeImg} src='/images/logo.svg' alt='welcome-animation' />
                        <p class=${styles.welcomeDesc}>
                            Pour mieux comprendre notre système, veuillez suivre notre tutoriel, en cliquant dessous sur commencer. 
                        </p>
                        <div class=${styles.displayWelcomeBtn}>
                            <a class='${styles.welcomeStartBtn} start-tuto' href='#'>Commencer le tutoriel</a>
                            <a class='${styles.welcomeDoneBtn} done-tuto' href='#'>Terminer</a>
                        </div>
                    </div>
                `,
            }
        })
    }

    useEffect(() => {
        document.addEventListener('click', (event: Event) => {
            const target = event.target as HTMLElement;
            if (target && target.classList.contains('start-tuto')) {
                event.preventDefault();
                startTutorial();
            }
        });

        document.addEventListener('click', (event: Event) => {
            const target = event.target as HTMLElement;
            if (target && target.classList.contains('done-tuto')) {
                event.preventDefault();
                const response = confirm("En terminant vous confirmer ne plus recevoir le tutoriel sur les autres pages ?")
                if (response) {
                    patchClient({ isBeginner: false }).unwrap()
                        .then(res => {
                            console.log(res)
                            driverObj.destroy();
                            window.location.reload()
                        })
                        .catch(err => console.warn(err))
                }
            }
        });
    }, [])

    function startTutorial() {
        driverObj.drive();
    }

    return (
        <Main
            name={'Dashbord'}
            showTeamFilter={showTeamFilter}
            urlVideo={'https://www.youtube.com/watch?v=vKl4nbql6ao'}
            setIdTeam={setIdTeam}
            setProduct={setProduct}
            usingDate={usingDate}
            setDate={setDate}
            setUsingDate={setUsingDate}
            showProductFilter={showProductFilter}
            showDateFilter={showDateFilter}
            closeTutorial={closeTutorial}
            showVideo={showVideo}
            setShowVideo={setShowVideo}
        >
            <div className="content-body">
                <div className="container-fluid">
                    <DisplayCard costPerLead={data.costPerLead} orderInProgress={data.orderInProgress}
                        costPerDelivred={data.costPerDelivred} rateOfConfirmed={data.rateOfConfirmed}
                        rateOfDelivred={data.rateOfDelivred} earningNet={data.earningNet} stock={data.stock}
                        totalOrder={data.totalOrder} upsellRate={data.upsellRate} crosssellRate={data.crosssellRate}
                    />
                    <div>
                        <div className="row">
                            <OrderStatisticCard data={data.orderStatistic} />
                            <Report dataOrder={data.orderReport} dataEarningNet={data.reportEarningNet} dataCost={data.costReport} dataRate={data.rateReport} />
                        </div>
                        <div className="row">
                            <BestSellingProductCard data={data.bestSellingProduct} />
                            <BestCityCardComponent data={data.bestCity} />
                            <Ads />
                        </div>
                    </div>
                </div>
            </div>

            <BottomRightStaticBtn setShowVideo={setShowVideo} />
        </Main>
    )
}

interface DisplayCardProps {
    costPerLead: number;
    orderInProgress: number;
    costPerDelivred: number;
    rateOfConfirmed: number;
    rateOfDelivred: number;
    earningNet: number;
    stock: number;
    totalOrder: number;
    upsellRate: number;
    crosssellRate: number;
}
const DisplayCard = ({ costPerLead, orderInProgress, costPerDelivred, rateOfConfirmed, rateOfDelivred, earningNet, stock, totalOrder, upsellRate, crosssellRate }: DisplayCardProps): JSX.Element => {
    return (
        <div className={styles.displayCard}>

            <Card
                bg={'green'}
                value={[
                    { desc: 'Revenu Net', value: earningNet }
                ]}
                orderInProgress={orderInProgress}
                icon={'dollard.svg'}
            />

            <Card
                bg={'orange'}
                value={[
                    { desc: 'Confirmé', value: rateOfConfirmed },
                    { desc: 'Livré', value: rateOfDelivred }
                ]}
                icon={'percent.svg'}
            />

            <Card
                bg={'blue'}
                value={[
                    { desc: 'Lead', value: costPerLead },
                    { desc: 'Livré', value: costPerDelivred }
                ]}
                icon={'facebook.svg'}
            />

            <Card
                bg={'violet'}
                value={[
                    { desc: 'Chiffre d’affaire', value: 0 },
                    { desc: 'Dépense', value: 0 }
                ]}
                icon={'pie.svg'}
            />

            {/* 
            <Card bg={'secondary'} value={rateOfDelivred} title={'taux de livraison'} icon={<TbTruckDelivery size={35} color={'white'} />} />

            <Card bg={'success'} value={stock} title={'Stock'} icon={<FiShoppingCart size={35} color={'white'} />} />

            <Card bg={'info'} value={totalOrder} title={'Total order'} icon={<AiFillThunderbolt size={35} color={'white'} />} />

            <Card bg={'info'} value={upsellRate + crosssellRate} title={'taux de upsell/crosssell'} icon={<FaTruckMoving size={35} color={'white'} />} /> */}

            {/* <Card bg={'secondary'} value={crosssellRate} title={'taux de crosssell'} icon={<BsFillPatchCheckFill size={35} color={'white'} />} /> */}
        </div>
    )
}

interface CardProps {
    bg: 'green' | 'orange' | 'blue' | 'violet'
    value: { desc: string, value: string | number }[]
    icon: string
    orderInProgress?: number
}
const Card = ({ bg, value, icon, orderInProgress }: CardProps): JSX.Element => {

    const [showTooltip, setShowTooltip] = useState(false);

    const toggleTooltip = () => {
        setShowTooltip(!showTooltip);
    };

    return (
        <div className={styles.cardContainer}>
            <div className={`${styles.card} ${styles[bg]}`}>
                <div className={styles.content}>
                    <img src={`/cus_img/svg/${icon}`} alt="dollard" />
                    <div className={styles.values}>
                        {
                            value.map((vlu, index) => {
                                return (
                                    <div key={index} className={styles.items}>
                                        <div className={styles.desc}>{vlu.desc}</div>
                                        <div className={styles.value}>{vlu.value}</div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                {
                    orderInProgress ?
                        <p className={styles.progressOrderTxt}>Commande en cours <span>{orderInProgress}</span></p>
                        : <></>
                }
                {/* Point d'exclamation pour afficher le tooltip */}
                <div
                    className={styles.exclamation}
                    onMouseEnter={toggleTooltip}
                    onMouseLeave={toggleTooltip}
                >
                    <span>!</span>
                </div>
            </div>
            {showTooltip && (
                <div className={styles.tooltip}>
                    {/* Contenu du tooltip */}
                    <p>Ceci est le tooltip.</p>
                </div>
            )}
        </div>
    )
}

const Ads = (): JSX.Element => {

    const { data: AdsData, isSuccess } = useGetAdsQuery()

    return (
        <div className="col-xl-3 col-xxl-4">
            <div className="card">
                <div className="card-body">
                    <div className="row align-items-center">
                        <p>Ads</p>
                        <div className="col-xl-6 ads-wh">
                            <div className="card-bx bg-blue ads-card">
                                {(isSuccess && AdsData.data) && <img className="pattern-img" src={`data:image/jpeg;base64,${AdsData.data.image}`} alt="ads" />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface OrderStatisticCardProps {
    data: orderStatistic
}
const OrderStatisticCard = ({ data }: OrderStatisticCardProps): JSX.Element => {
    const [mode, setMode] = useState<'commande' | 'percent'>('commande')

    let option = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: {
                display: false
            }
        },
    }

    return (
        <div className="col-xl-6 col-xxl-5">
            <div className="card">
                <div className="card-header border-0 pb-0">
                    <div>
                        <h4 className={styles.reportTitle}>Commandes</h4>
                    </div>

                    <div className="card-tabs mt-3 mt-sm-0">
                        <ul className="nav nav-tabs" role="tablist">
                            <li onClick={()=> setMode('commande')} className="nav-item">
                                <a className={`nav-link active ${styles.statisticSwthLabel}`} data-bs-toggle="tab" href="#Commande" role="tab">
                                    Commande
                                </a>
                            </li>
                            <li onClick={()=> setMode('percent')} className="nav-item">
                                <a className={`nav-link ${styles.statisticSwthLabel}`} data-bs-toggle="tab" href="#Pourcentage" role="tab">
                                    Pourcentage
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="card-body">
                    <div className={styles.statisticContainer}>
                        <div className={`col-md-6 ${styles.pieChart}`}>
                            <CustomPie data={data.data} options={option} />
                        </div>

                        <div className="col-md-6">
                            <ul className="card-list mt-4">
                                <li className={styles.cmdLabel}>
                                    <span className={`bg-delivered circle`} />
                                    livré ({ mode === 'commande' ? data.data.datasets[0].data[0] : ((data.data.datasets[0].data[0]*100)/data.total).toFixed(2) + '%' })
                                </li>
                                <li className={styles.cmdLabel}>
                                    <span className={`bg-pending-1 circle`} />
                                    en attente ({ mode === 'commande' ? data.data.datasets[0].data[1] : ((data.data.datasets[0].data[1]*100)/data.total).toFixed(2) + '%' })
                                </li>

                                <li className={styles.cmdLabel}>
                                    <span className={`bg-pending-2 circle`} />
                                    Injoignable ({ mode === 'commande' ? data.data.datasets[0].data[2] : ((data.data.datasets[0].data[2]*100)/data.total).toFixed(2) + '%' })
                                </li>

                                <li className={styles.cmdLabel}>
                                    <span className={`bg-cancelled circle`} />
                                    annulé ({ mode === 'commande' ? data.data.datasets[0].data[3] : ((data.data.datasets[0].data[3]*100)/data.total).toFixed(2) + '%' })
                                </li>

                                <li className={styles.cmdLabel}>
                                    <span className={`bg-deleted circle`} />
                                    Deleted ({ mode === 'commande' ? data.data.datasets[0].data[4] : ((data.data.datasets[0].data[4]*100)/data.total).toFixed(2) + '%' })
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className={styles.totalContainer}>
                        <div>Commandes totales</div>
                        <div>{data.total}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface ReportProps {
    dataOrder: OrderReport,
    dataCost: CostReport,
    dataRate: RateReport,
    dataEarningNet: reportEarningNet
}
const Report = ({ dataOrder, dataCost, dataRate, dataEarningNet }: ReportProps): JSX.Element => {

    const [showTooltip, setShowTooltip] = useState(false);

    const toggleTooltip = () => {
        setShowTooltip(!showTooltip);
    };

    let option = {
        responsive: true,
        plugins: {
            legend: { position: "bottom" },
            title: {
                display: false,
            }
        }
    }

    const [dataChart, setDataChart] = useState<any>(dataOrder)
    const [modeChart, setModeChart] = useState<string>('order')

    useEffect(() => {
        if (modeChart === 'order') setDataChart(dataOrder)
        else if (modeChart === 'cost') setDataChart(dataCost)
        else if (modeChart === 'earning') setDataChart(dataEarningNet)
        else setDataChart(dataRate)
    })

    return (
        <div className={`col-xl-6 col-xxl-7 ${styles.reportCard}`}>
            <div className="card">
                <div className="card-header d-block d-sm-flex border-0">
                    <div className={styles.titleContain}>
                        <div className={styles.reportTitle}>Statistiques</div>
                        <div
                            className={styles.exclamationReport}
                            onMouseEnter={toggleTooltip}
                            onMouseLeave={toggleTooltip}
                        >
                            <span>!</span>
                        </div>
                    </div>
                    <div className="card-tabs mt-3 mt-sm-0">
                        <ul className="nav nav-tabs" role="tablist">
                            <li className="nav-item">
                                <a
                                    onClick={() => {
                                        setModeChart('order')
                                        setDataChart(dataOrder)
                                    }}
                                    className="nav-link active"
                                    data-bs-toggle="tab"
                                    href="#Order"
                                    role="tab"
                                >
                                    commande
                                </a>
                            </li>
                            <li className="nav-item">
                                <a
                                    onClick={() => {
                                        setModeChart('earning')
                                        setDataChart(dataEarningNet)
                                    }}
                                    className="nav-link"
                                    data-bs-toggle="tab"
                                    href="#Earning"
                                    role="tab"
                                >
                                    profit
                                </a>
                            </li>
                            <li className="nav-item">
                                <a
                                    onClick={() => {
                                        setModeChart('rate')
                                        setDataChart(dataRate)
                                    }}
                                    className="nav-link"
                                    data-bs-toggle="tab"
                                    href="#Rate"
                                    role="tab"
                                >
                                    taux
                                </a>
                            </li>
                            <li className="nav-item">
                                <a
                                    onClick={() => {
                                        setModeChart('cost')
                                        setDataChart(dataCost)
                                    }}
                                    className="nav-link"
                                    data-bs-toggle="tab"
                                    href="#Cost"
                                    role="tab"
                                >
                                    prix
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="card-body tab-content">
                    <CustomLine data={dataChart} options={option} />
                </div>
            </div>
            {showTooltip && (
                <div className={styles.tooltip}>
                    {/* Contenu du tooltip */}
                    <p>Ceci est le tooltip.</p>
                </div>
            )}
        </div>

    )
}

interface BestSellingProductProps {
    data: BestSellingProduct[]
}
const BestSellingProductCard = ({ data }: BestSellingProductProps): JSX.Element => {
    return (
        <div className="col-xl-3 col-xxl-4">
            <div className="card">
                <div className="card-header border-0 pb-0">
                    <div>
                        <h4 className="card-title mb-2">meilleur produit vendu</h4>
                    </div>
                </div>
                <div className="card-body">
                    {data && data.map((product, index) => <BestSellingCard key={index} price={product.price} count={product.count} price_product={product.price_product} name={product.name} />)}
                </div>
            </div>
        </div>
    )
}

interface BestSellingCardProps {
    name: string,
    price: number,
    count: number,
    price_product: number
}
const BestSellingCard = ({ name, price, count, price_product }: BestSellingCardProps): JSX.Element => {
    return (
        <div className="d-flex align-items-end mt-2 pb-3 justify-content-between">
            <span>{name}</span>
            <span className="fs-18">
                <span className="text-black pe-2">{price_product}dhs/order </span>- {count} orders
            </span>
        </div>
    )
}

interface BestCityCardProps {
    data: BestCity[]
}
const BestCityCardComponent = ({ data }: BestCityCardProps): JSX.Element => {
    return (
        <div className="col-xl-3 col-xxl-4">
            <div className="card">
                <div className="card-header border-0 pb-0">
                    <div>
                        <h4 className="card-title mb-2">meilleur ville</h4>
                    </div>
                </div>
                <div className="card-body">
                    {data && data.map((city, index) => <BestCityCard key={index} city={city.City_User.name} order={city.count} />)}
                </div>
            </div>
        </div>
    )
}

interface BestCitiesProps {
    city: string,
    order: number
}
const BestCityCard = ({ city, order }: BestCitiesProps): JSX.Element => {
    return (
        <div className="d-flex align-items-end mt-2 pb-3 justify-content-between">
            <span>{city}</span>
            <span className="fs-18">
                <span className="text-black pe-2">{order} order</span>
            </span>
        </div>
    )
}