import React from 'react'
import Order from '../../Components/Clients/Order/Order'
import { useGetClientQuery } from '../../services/api/ClientApi/ClientApi'

export default function OrderPage(): JSX.Element {
  const { data: clientData } = useGetClientQuery()
  return <Order client={clientData?.data} />
}
