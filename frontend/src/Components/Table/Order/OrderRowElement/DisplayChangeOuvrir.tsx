import React, { useState } from 'react'
import './style.css'
import { GetClientOrderModel } from '../../../../models'

interface Props {
  name: string,
  currentData: GetClientOrderModel,
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => any
}
export default function DisplayChangeOuvrir({ name, currentData, onChange }: Props): JSX.Element {
  const [Data] = useState<string[]>([
    'Non',
    'Oui',
  ])

  return (
    <select
      onChange={onChange}
      className="select-custum"
    >

      <option value={'Aucun'}>Aucun</option>
      { name == 'changer' && Data.map((dt) => (<option selected={dt === currentData.Changer} value={dt}>{dt}</option>)) }
      { name == 'ouvrir' && Data.map((dt) => (<option selected={dt === currentData.Ouvrir} value={dt}>{dt}</option>)) }
    </select>
  )
}
