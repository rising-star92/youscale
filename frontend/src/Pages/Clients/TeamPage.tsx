import React from 'react'
import Team from '../../Components/Clients/Team/Team'
import { useGetClientQuery } from '../../services/api/ClientApi/ClientApi'

export default function TeamPage() : JSX.Element {
  const { data: clientData } = useGetClientQuery()

  return <Team client={clientData?.data} />
}
