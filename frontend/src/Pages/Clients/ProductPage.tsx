import React from 'react'
import Product from '../../Components/Clients/Product/Product'
import { useGetClientQuery } from '../../services/api/ClientApi/ClientApi'

export default function ProductPage(): JSX.Element {
  const { data: clientData } = useGetClientQuery()

  return <Product client={clientData?.data} />
}
