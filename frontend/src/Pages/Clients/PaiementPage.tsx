import React from 'react'
import Paiement from '../../Components/Clients/Paiement/Paiement'
import { useGetClientQuery } from '../../services/api/ClientApi/ClientApi'

export default function PaiementPage() {
  const { data: clientData } = useGetClientQuery()

  return <Paiement client={clientData?.data} />
}
