import React from 'react';
import ReactPlayer from 'react-player/youtube'
import styles from './Modal.module.css';
import { usePatchClientMutation } from '../../services/api/ClientApi/ClientApi';

interface ModalProps {
    isOpen: boolean
    setIsVisible: React.Dispatch<React.SetStateAction<boolean>>
    urlVideo: string
}

const TutorialModal: React.FC<ModalProps> = ({ isOpen, setIsVisible, urlVideo }): JSX.Element | null => {

    const [patchClient] = usePatchClientMutation()

    const handleClose = () => {
        setIsVisible(false);
    };

    const RenitilizeStep = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        patchClient({ isBeginner: true }).unwrap()
            .then(res => {
                console.log(res)
                window.location.reload()
            })
            .catch(err => console.warn(err))
    }

    return (
        isOpen ? (
            <div className={styles.modalOverlay}>
                <div className={styles.modalContent}>
                    <button className={styles.closeButton} onClick={handleClose}>
                        &times;
                    </button>
                    <div className={styles.main}>
                        <div className={styles.leftBox}>
                            <div className={styles.leftBoxTitle}>Tutoriel</div>
                            <div className={styles.tutorialButtom}>
                                <img className={styles.tutorialImg} src="/public/cus_img/tutorial.png" alt="tutorial.png" />

                                <div onClick={RenitilizeStep} className={styles.restartTutorialBtn}>Reprendre le tutoriel</div>
                            </div>
                        </div>
                        <div className={styles.rightBox}>
                            <div className={styles.rightBoxTitle}>Explication de la page Dashboard</div>
                            <ReactPlayer width={440} height={310} controls={true} url={urlVideo} />
                            <div className={styles.rightBoxDesc}>
                                Pour mieux comprendre, veuillez voir la video en dessus.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ) : null
    );
};

export default TutorialModal;
