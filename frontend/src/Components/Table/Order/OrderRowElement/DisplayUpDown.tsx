import React, { useState } from 'react'
import { GetClientOrderModel, ProductOrder } from '../../../../models'

interface Props {
  currentData: GetClientOrderModel,
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => any
}
export default function DisplayUpDown({ onChange, currentData }: Props): JSX.Element {

  const [Data] = useState<string[]>([
    'UpSell',
    'DownSell',
    'CrossSell',
  ])

  return (
    <select
      value={currentData['Up/Downsell']}
      onChange={onChange}
      className="select-custum"
    >

      <option value={'Aucun'}>Aucun</option>
      {Data.map((dt, index) => (<option key={index} value={dt}>{dt}</option>))}
    </select>
  )
}
