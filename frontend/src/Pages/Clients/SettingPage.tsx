import React from 'react'
import Setting from '../../Components/Clients/Settings/Setting'
import { useGetClientQuery } from '../../services/api/ClientApi/ClientApi'

export default function SettingPage() {
  const { data: clientData } = useGetClientQuery()

  return <Setting client={clientData?.data} />
}
