import React, { useState, useEffect } from 'react'
import Main from '../../Main'
import { Table } from '../../TableOrder'
import { ClientOrderApi, useGetClientOrderQuery, useGetSheetOrderQuery } from '../../../services/api/ClientApi/ClientOrderApi'
import { Cient, OrderQueryModel } from '../../../models'
import { useDispatch } from 'react-redux'
import { GetRole } from '../../../services/storageFunc'
import { CLIENT_URL } from '../../../services/url/API_URL'
import { usePatchClientMutation } from '../../../services/api/ClientApi/ClientApi'
import { driver } from "driver.js";
import axios from 'axios'
import "driver.js/dist/driver.css";
import { BottomRightStaticBtn } from '../../Tutorial'

interface Props {
  client: Cient | undefined
}
const pageName = 'order'
const token = localStorage.getItem('token')
export default function Order({ client }: Props): JSX.Element {

  const userData = localStorage.getItem('userData')
  const [patchClient] = usePatchClientMutation()

  const [showVideo, setShowVideo] = useState<boolean>(false)
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [statusConfirmation, setStatusConfirmation] = useState<string>()
  const [id_orders, setIdOrders] = useState<number[]>([])
  const [_skip, _setSkip] = useState<number>(10);

  const { data: sheetData } = useGetSheetOrderQuery()

  const [status, setStatus] = useState<string | undefined>(undefined)
  const [date, setDate] = useState<string[]>([])
  const [product, setProduct] = useState<string>('')
  const [idTeam, setIdTeam] = useState<number>(GetRole() === 'TEAM' ? JSON.parse(userData || '{id: -1}').id : -1)
  const [usingDate, setUsingDate] = useState<boolean>(false)
  const [OrderQueryData, setOrderQueryData] = useState<OrderQueryModel>({ search: '', status: '', _skip: 0, _limit: _skip })

  const { data: OrderClient, refetch: RefetchOrderClient, isLoading } = useGetClientOrderQuery(OrderQueryData) // client data

  const driverObj = driver({
    onNextClick: () => {
      if (driverObj.getActiveIndex() === 3) {
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
        element: '.add-order', popover: {
          title: 'Add Order', description: 'Add your order here', side: "bottom", align: 'start',
          onNextClick: (drvHks) => {
            driverObj.moveTo(3)
          }
        }
      },
      {
        element: '.modal-content', popover: {
          title: 'Add Perte', description: 'Add your perte here', side: "bottom", align: 'start',
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
        element: '.start-confirmation', popover: {
          title: 'Start Confirmation', description: 'Start your Confirmation here', side: "bottom", align: 'start', onPrevClick: (drvHks) => {
            driverObj.moveTo(0)
          },
        }
      }
    ]
  });

  useEffect(() => {
    client?.isBeginner && driverObj.drive()
  }, [client]);

  const closeTutorial = () => {
    localStorage.setItem(`tutorial_${pageName}`, JSON.stringify(true));
    setShowTutorial(false);
  };

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(ClientOrderApi.util.resetApiState())
    RefetchOrderClient()
  }, [])

  let config = {
    headers: {
      'Authorization': 'Bear ' + token
    }
  }

  useEffect(() => {
    axios.get(`${CLIENT_URL}/getallid/${statusConfirmation ? `?status=${statusConfirmation}` : ``}`, config).then((response) => {
      setIdOrders(response.data.data)
    })
      .catch()
  }, [statusConfirmation])


  useEffect(() => {
    setOrderQueryData({ usedate: Number(usingDate), datefrom: date?.[0], dateto: date?.[1], search: undefined, status: status, id_product_array: product ?? undefined, id_team: idTeam !== -1 ? idTeam : undefined, _skip: 0, _limit: _skip })
    RefetchOrderClient()
  }, [date, usingDate])

  useEffect(() => {
    setOrderQueryData({ usedate: Number(usingDate), datefrom: date?.[0], dateto: date?.[1], status: status, id_product_array: product !== '0' ? product : undefined, id_team: idTeam !== -1 ? idTeam : undefined, _skip: 0, _limit: _skip })
    RefetchOrderClient()
  }, [product])

  useEffect(() => {
    setOrderQueryData({ usedate: Number(usingDate), datefrom: date?.[0], dateto: date?.[1], status: status, id_team: idTeam !== -1 ? idTeam : undefined, id_product_array: product ?? undefined, _skip: 0, _limit: _skip })
    RefetchOrderClient()
  }, [idTeam])

  useEffect(() => {
    setOrderQueryData({ usedate: Number(usingDate), datefrom: date?.[0], dateto: date?.[1], status: status, id_team: idTeam !== -1 ? idTeam : undefined, id_product_array: product ?? undefined, _skip: 0, _limit: _skip })
    RefetchOrderClient()
  }, [_skip])

  return (
    <Main
      name={'Order'}
      urlVideo={'https://www.youtube.com/watch?v=t_d1cKerFUc'}
      showTeamFilter={true}
      setIdTeam={setIdTeam}
      setProduct={setProduct}
      usingDate={usingDate}
      showProductFilter={true}
      setDate={setDate}
      setUsingDate={setUsingDate}
      showDateFilter={true}
      showVideo={showVideo}
      setShowVideo={setShowVideo}
      closeTutorial={closeTutorial}
    >
      <div className="content-body">
        <div className="container-fluid">
          <Table
            _skip={_skip}
            _setSkip={_setSkip}
            orders_id={id_orders}
            setStatus={setStatus}
            driverObj={driverObj}
            setStatusConfirmation={setStatusConfirmation}
            statusConfirmation={statusConfirmation}
            data={OrderClient}
            refetch={RefetchOrderClient}
            OrderQueryData={OrderQueryData}
            setOrderQueryData={setOrderQueryData}
          />
        </div>
      </div>

      <BottomRightStaticBtn setShowVideo={setShowVideo} />
    </Main>
  )
}
