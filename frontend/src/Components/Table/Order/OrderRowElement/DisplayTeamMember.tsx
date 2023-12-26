import React from 'react'
import { GetTeamMemberModel } from '../../../../models'

interface Props {
  data?: GetTeamMemberModel[],
  order: { id: number, id_city: number, id_team: number, createdAt: Date } | undefined,
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => any
}
export default function DisplayTeamMember({ data, order, onChange }: Props): JSX.Element {
  return (
    <select
      value={order?.id_team}
      onChange={onChange}
      className="select-custum"
    >
      <option value={0}>Aucun</option>
      {
        (data && order) &&
        data.map(
          (dt: any, index) => {
            if (!dt.active && order.createdAt > dt.updatedAt) return
            return <option key={index} className='form-select-option' value={dt.id}>{dt.name}</option>
          }
        )
      }
    </select>
  )
}
