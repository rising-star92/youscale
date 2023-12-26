import React, { useState, useEffect } from 'react'
import Dashbord from '../../Components/Clients/Dashbord/Dashbord'
import { DashbordQueryModel } from '../../models'
import { useGetClientDashbordQuery } from '../../services/api/ClientApi/ClientDashbordApi'
import { RotatingLines } from 'react-loader-spinner'
import { useGetClientQuery } from '../../services/api/ClientApi/ClientApi'

const pageName = 'dashbord'
export default function DashbordPage(): JSX.Element {

  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [product, setProduct] = useState<string>('')
  const [date, setDate] = useState<string[]>([])
  const [idTeam, setIdTeam] = useState<number>(-1)
  const [usingDate, setUsingDate] = useState<boolean>(false)
  const [OrderQueryData, setOrderQueryData] = useState<DashbordQueryModel>({ usedate: Number(usingDate), datefrom: date?.[0], dateto: date?.[1] })
  const { data, refetch } = useGetClientDashbordQuery(OrderQueryData)
  const { data: clientData } = useGetClientQuery()

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem(`tutorial_${pageName}`);
    if (hasSeenTutorial) {
      setShowTutorial(!JSON.parse(hasSeenTutorial));
    } else {
      setShowTutorial(true);
    }
  }, []);

  const closeTutorial = () => {
    localStorage.setItem(`tutorial_${pageName}`, JSON.stringify(true));
    setShowTutorial(false);
  };

  useEffect(() => { refetch() }, [])

  useEffect(() => {
    setOrderQueryData({ usedate: Number(usingDate), datefrom: date?.[0], dateto: date?.[1] })
    refetch()
  }, [date, usingDate])

  useEffect(() => {
    setOrderQueryData({ usedate: Number(usingDate), datefrom: date?.[0], dateto: date?.[1], id_product_array: product })
    refetch()
  }, [product])

  useEffect(() => {
    setOrderQueryData({ usedate: Number(usingDate), datefrom: date?.[0], dateto: date?.[1], id_team: idTeam !== -1 ? idTeam : undefined })
    refetch()
  }, [idTeam])

  return !data ? <div className='global-loader'>
    <RotatingLines
      strokeColor="grey"
      strokeWidth="3"
      animationDuration="0.75"
      width="50"
      visible={true}
    />
  </div> :
    <React.Fragment>
      <Dashbord
        data={data?.data}
        showTeamFilter={true}
        setIdTeam={setIdTeam}
        setProduct={setProduct}
        usingDate={usingDate}
        setDate={setDate}
        setUsingDate={setUsingDate}
        showProductFilter={true}
        showDateFilter={true}
        showTutorial={showTutorial}
        closeTutorial={closeTutorial}
        client={clientData?.data}
      />
    </React.Fragment>
}
