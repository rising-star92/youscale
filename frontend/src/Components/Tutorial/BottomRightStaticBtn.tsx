import React, { useState } from 'react'
import { AiOutlineClose } from 'react-icons/ai'
import { FaPlayCircle } from 'react-icons/fa'
import style from './tutorial.module.css'

interface Props {
  setShowVideo: React.Dispatch<React.SetStateAction<boolean>>
}
export default function BottomRightStaticBtn({ setShowVideo }: Props) {

  const [isClose, setIsClose] = useState<boolean>(false)

  const onClose = (e: React.MouseEvent<SVGElement, MouseEvent>) => {
    e.preventDefault()
    setIsClose(true)
  }

  const custumStyle = { display: isClose ? 'none' : 'block' }

  return (
    <div style={custumStyle} className={style.BottomRightStaticBtn}>
      <div className={style.header}>
        <AiOutlineClose  onClick={onClose} size={20} />
      </div>
      <div className={style.main}>
        <FaPlayCircle onClick={(e) => setShowVideo(true)} size={80} className={style.playIcon} />
      </div>
      <div className={style.welcomeTxt}>
        Bonjour ! Explorons Youscale avec une vidéo d'une minute.
      </div>
    </div>
  )
}
