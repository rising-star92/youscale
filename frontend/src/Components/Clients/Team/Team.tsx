import React, { useState, useEffect } from 'react'
import Main from '../../Main'
import PerformanceCard from './PerformanceCard'
import EarningCard from './EarningCard'
import AddTeamModal from '../../Modal/Team/AddTeamModal'
import EditTeamModal from '../../Modal/Team/EditTeamModal'
import { CustomHist } from '../../Chart'
import { Cient, EarningTable, GetTeamMemberModel, Performance, TeamDashbordQueryModel } from '../../../models'
import { useGetTeamMemberQuery, usePatchTeamMemberMutation } from '../../../services/api/ClientApi/ClientTeamMemberApi'
import { useGetTeamDashbordQuery } from '../../../services/api/ClientApi/ClientTeamDashbordApi'
import { GetRole, SetRole } from '../../../services/storageFunc'
import { useLoginAsTeamMutation, usePatchClientMutation } from '../../../services/api/ClientApi/ClientApi'
import { setToken } from '../../../services/auth/setToken'
import { setUserData } from '../../../services/auth/setUserData'
import { showToastError } from '../../../services/toast/showToastError'
import { driver } from "driver.js";
import { Switch } from '../../Switch'
import { showToastSucces } from '../../../services/toast/showToastSucces'
import { Spinner4Bar } from '../../Loader'
import { BottomRightStaticBtn } from '../../Tutorial'
import './team.style.css'
import "driver.js/dist/driver.css";
import styles from './team.module.css'

interface Props {
    client: Cient | undefined
}
const pageName = 'team'
export default function Team({ client }: Props): JSX.Element {
    const userData = localStorage.getItem('userData')
    const [patchClient] = usePatchClientMutation()

    const [showVideo, setShowVideo] = useState<boolean>(false)
    const [showHidden, setShowHidden] = useState<boolean>(true)
    const [showTutorial, setShowTutorial] = useState<boolean>(false);
    const { data, refetch, isLoading, isFetching } = useGetTeamMemberQuery({ isHidden: showHidden })
    const [date, setDate] = useState<string[]>([])
    const [idTeam, setIdTeam] = useState<number>(GetRole() === 'TEAM' ? JSON.parse(userData || '{id: 0}').id : 0)
    const [usingDate, setUsingDate] = useState<boolean>(false)
    const [OrderQueryData, setOrderQueryData] = useState<TeamDashbordQueryModel>({ usedate: Number(usingDate), datefrom: date?.[0], dateto: date?.[1] })
    const { data: teamData, refetch: refetchTeamData } = useGetTeamDashbordQuery(OrderQueryData)
    const [performance, setPerformance] = useState<Performance | undefined>(teamData?.data.performance)

    useEffect(() => {
        refetch()
    }, [showHidden])

    const driverObj = driver({
        onNextClick: () => {
            if (driverObj.getActiveIndex() === 2) {
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
                element: '.add-team', popover: {
                    title: 'Add your team', description: 'Add your team here', side: "right", align: 'start',
                    onNextClick: (drvHks) => {
                        driverObj.moveTo(3)
                    }
                }
            },
            {
                element: '.modal-content', popover: {
                    title: 'Add your team', description: 'Add your team here', side: "bottom", align: 'start',
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
                element: '.menu-step:nth-child(4)', popover: {
                    title: 'Product', description: 'Description for your product page', side: "right", align: 'start', onPrevClick: (drvHks) => {
                        driverObj.moveTo(0)
                    },
                }
            }
        ]
    });

    useEffect(() => {
        setPerformance(teamData?.data.performance)
    }, [])

    useEffect(() => {
        client?.isBeginner && driverObj.drive();
    }, [client]);

    const closeTutorial = () => {
        localStorage.setItem(`tutorial_${pageName}`, JSON.stringify(true));
        setShowTutorial(false);
    };

    useEffect(() => {
        setOrderQueryData({ usedate: Number(usingDate), datefrom: date?.[0], dateto: date?.[1], id_team: idTeam ?? undefined })
        refetchTeamData()
    }, [date, usingDate])

    useEffect(() => {
        setOrderQueryData({ usedate: Number(usingDate), datefrom: date?.[0], dateto: date?.[1], id_team: idTeam ?? undefined })
        refetchTeamData()
    }, [idTeam])

    const [showAddTeamModal, setShowAddTeamModal] = useState<boolean>(false)
    const [showEditTeamModal, setShowEditTeamModal] = useState<boolean>(false)

    const [item, setItem] = useState<GetTeamMemberModel>()

    let option = {
        responsive: true,
        plugins: {
            legend: { position: "bottom" },
            title: {
                display: false,
            }
        }
    }

    return (
        <Main
            name={'Team'}
            urlVideo={'https://www.youtube.com/watch?v=Y2eNJGFfhVY'}
            showTeamFilter={GetRole() === 'TEAM' ? false : true}
            setIdTeam={setIdTeam}
            showDateFilter={true}
            usingDate={usingDate}
            setDate={setDate}
            setUsingDate={setUsingDate}
            closeTutorial={closeTutorial}
            showVideo={showVideo}
            setShowVideo={setShowVideo}
        >
            {showAddTeamModal && <AddTeamModal refetch={refetch} setIsVisible={setShowAddTeamModal} driverObj={driverObj} />}
            {showEditTeamModal && <EditTeamModal setIsVisible={setShowEditTeamModal} dataEdit={item} refetch={refetch} />}
            <div className="content-body">
                <div className="container-fluid">
                    <div className="team-header">
                        <TeamCard data={data?.data} setItem={setItem} setShowAddTeamModal={setShowAddTeamModal} setShowHidden={setShowHidden} isLoading={isFetching} setShowEditTeamModal={setShowEditTeamModal} refetch={refetch} driverObj={driverObj} />
                        {
                            teamData?.data.performance &&
                            <PerformanceCard setPerformance={setPerformance} perf={teamData?.data.performance} perf_rate={teamData?.data.performance_rate}>
                                <CustomHist data={performance ?? teamData?.data.performance} options={option} />
                            </PerformanceCard>
                        }
                    </div>
                    <div className="row">
                        <EarningTale earningTable={teamData?.data.earning_table} />
                        <EarningCard>
                            {teamData && <CustomHist data={teamData.data.earning} options={option} />}
                        </EarningCard>
                    </div>
                </div>
            </div>
            <BottomRightStaticBtn setShowVideo={setShowVideo} />
        </Main>
    )
}

interface PropsTeamCard {
    setShowAddTeamModal: React.Dispatch<React.SetStateAction<boolean>>,
    setShowEditTeamModal: React.Dispatch<React.SetStateAction<boolean>>,
    data: GetTeamMemberModel[] | undefined;
    setItem: React.Dispatch<React.SetStateAction<GetTeamMemberModel | undefined>>
    setShowHidden: React.Dispatch<React.SetStateAction<boolean>>
    isLoading: boolean
    refetch: () => any
    driverObj: {
        moveNext: () => void
    }
}
const TeamCard = ({ setShowAddTeamModal, setShowEditTeamModal, data, refetch, setItem, driverObj, setShowHidden, isLoading }: PropsTeamCard): JSX.Element => {

    const handleShowTeamModal = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault()
        setShowAddTeamModal(true)
        setTimeout(() => {
            driverObj.moveNext()
        }, 1000);
    }

    return (
        <div className="col-xl-3 col-xxl-6 col-xl-custum">
            <div className="card">
                <div className="card-header border-0 pb-0">
                    <div>
                        <h4 className={styles.teamTitle}>Team</h4>
                    </div>
                    {
                        <div className="card-tabs mt-3 mt-sm-0">
                            <ul className="nav nav-tabs" role="tablist">
                                <li className="nav-item">
                                    <a
                                        onClick={() => setShowHidden(true)}
                                        className="nav-link active"
                                        data-bs-toggle="tab"
                                        href="#Order"
                                        role="tab"
                                    >
                                        All
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a onClick={() => setShowHidden(false)} className="nav-link" data-bs-toggle="tab" href="#Rate" role="tab">
                                        Hidden
                                    </a>
                                </li>
                            </ul>
                        </div>
                    }
                    <a
                        onClick={handleShowTeamModal}
                        type="button"
                        className={styles.addMemberBtn}>
                        <img src="/svg/team/add.svg" alt="add" />
                        Ajouter un membre
                    </a>
                </div>
                <div className="table-responsive" style={{margin:'30px'}}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Taux d’Up/Crosssell</th>
                                <th>Activité</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                isLoading ? <tr><td><Spinner4Bar /></td></tr> : data && data.map((dt, index) => <TeamRow key={index} refetch={refetch} item={dt} setShowEditTeamModal={setShowEditTeamModal} setItem={setItem} />)
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

interface PropsTeamRow {
    setShowEditTeamModal: React.Dispatch<React.SetStateAction<boolean>>,
    item: GetTeamMemberModel,
    setItem: React.Dispatch<React.SetStateAction<GetTeamMemberModel | undefined>>
    refetch: () => any
}
const TeamRow = ({ setShowEditTeamModal, item, refetch, setItem }: PropsTeamRow): JSX.Element => {

    const [loginAsTeam] = useLoginAsTeamMutation()

    const [patchTeamMember, { error, isError }] = usePatchTeamMemberMutation()

    const handleEditSatus = () => {

        patchTeamMember({ id: item.id, active: !item.active }).unwrap()
            .then((res: any) => {
                showToastSucces(item?.active ? 'Your team has ben hidden' : 'Your team has ben showed')
                refetch()
            })
            .catch((err: any) => showToastError(err.data.message))
    }

    const handleShowEdit = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault()

        setItem(item)
        setShowEditTeamModal(true)
    }

    const handleLoginAsTeam = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault()

        loginAsTeam({ email: item.email ?? '' }).unwrap()
            .then((res: any) => {
                localStorage.removeItem('STEP')

                setToken(res.token)
                setUserData(res.team)
                SetRole('TEAM')

                window.location.href = '/order'
            })
            .catch(err => console.error(err))
    }

    return (
        <tr>
            <td>{item.name}</td>
            <td>{item.crosssell}</td>
            <td>
                <div className="d-flex">
                    <Switch
                        active={item.active || false}
                        size={{ width: '43.727px', height: '25.227px' }}
                        SwitchHideProduct={handleEditSatus}
                    />
                </div>
            </td>
            <td>
                <a onClick={handleLoginAsTeam} className={styles.actionIcons} href="#">
                    <img src="/svg/team/rmConnect.svg" alt="rmConnect" />
                </a>
                <a onClick={handleShowEdit} className={styles.actionIcons} href="#">
                    <img src="/svg/team/edit.svg" alt="edit" />
                </a>
            </td>
        </tr>
    )
}

interface EarningTaleProps {
    earningTable: EarningTable | undefined
}
const EarningTale = ({ earningTable }: EarningTaleProps) => {

    function sumNbCommande(earningTable: EarningTable | undefined) {
        if (!earningTable) return 0

        var sum = earningTable.upsell.nb_commande + earningTable.livre.nb_commande + earningTable.downsell.nb_commande + earningTable.crosssell.nb_commande
        return sum
    }

    function sumHerEarning(earningTable: EarningTable | undefined) {
        if (!earningTable) return 0

        var sum = earningTable.upsell.her_earning + earningTable.livre.her_earning + earningTable.downsell.her_earning + earningTable.crosssell.her_earning + earningTable.crosssell.salaire
        return sum
    }

    function sumSalaire(earningTable: EarningTable | undefined) {
        if (!earningTable) return 0

        var sum = earningTable.upsell.salaire + earningTable.livre.salaire + earningTable.downsell.salaire + earningTable.crosssell.salaire
        return sum
    }

    return (
        <div className="col-lg-7">
            <div className="card">
                <div className="card-header">
                    <div>
                        <h4 className={styles.teamTitle}>Salaire</h4>
                    </div>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Commande</th>
                                    <th>Bénéfice</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Salaire</td>
                                    <td>0</td>
                                    <td>{earningTable?.crosssell.salaire}</td>
                                </tr>
                                <tr>
                                    <td>Livre</td>
                                    <td>{earningTable?.livre.nb_commande}</td>
                                    <td>{earningTable?.livre.her_earning}</td>
                                </tr>
                                <tr>
                                    <td>Upsell</td>
                                    <td>{earningTable?.upsell.nb_commande}</td>
                                    <td>{earningTable?.upsell.her_earning}</td>
                                </tr>
                                <tr>
                                    <td>Downsell</td>
                                    <td>{earningTable?.downsell.nb_commande}</td>
                                    <td>{earningTable?.downsell.her_earning}</td>
                                </tr>
                                <tr>
                                    <td>CrossSell</td>
                                    <td>{earningTable?.crosssell.nb_commande}</td>
                                    <td>{earningTable?.crosssell.her_earning}</td>
                                </tr>

                                <tr className={styles.totalRow}>
                                    <td>Total</td>
                                    <td>{sumNbCommande(earningTable)}</td>
                                    <td>{sumHerEarning(earningTable)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* /# card */}
        </div>
    )
}