import styles from './images.module.css'

interface Props{
    attachement?: string
    setShowImage: React.Dispatch<React.SetStateAction<boolean>>
    showImage: boolean
}
export default function PreviewImagesModal({ attachement, setShowImage, showImage }: Props) {

    const onClose =(e: React.MouseEvent<HTMLSpanElement, MouseEvent>)=>{
        e.preventDefault()
        setShowImage(false)
    }

    return (
        <div style={{ display: showImage ? 'block' : 'none' }} className={styles.modal}>
            <span onClick={onClose} className={styles.close}>&times;</span>
            <img className={styles.modalContent} src={attachement} id="img01" />
            <div className={styles.caption}></div>
        </div>
    )
}
