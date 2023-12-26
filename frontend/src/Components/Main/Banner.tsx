import { useState, useEffect } from 'react';
import { FaArrowLeft, FaArrowRight, FaTimes } from 'react-icons/fa';
import { useGetAnnoucementQuery } from '../../services/api/ClientApi/ClientAnnoucementApi';
import { AdminAnnoucementModel } from '../../models';
import styles from './HeaderBanner.module.css';

const getAnnoucement = (data: AdminAnnoucementModel[] | undefined): AdminAnnoucementModel[] => data ? data : [{ text: 'Aucune annonce', clt_categorie: []}]

const HeaderBanner = () => {
    const { data } = useGetAnnoucementQuery()

    const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState<number>(0);
    const [isVisible, setIsVisible] = useState(true);

    const goToPreviousAnnouncement = () => {
        setCurrentAnnouncementIndex((prevIndex) =>
            prevIndex === 0 ? getAnnoucement(data?.data).length - 1 : prevIndex - 1
        );
    };

    const goToNextAnnouncement = () => {
        setCurrentAnnouncementIndex((prevIndex) =>
            prevIndex === getAnnoucement(data?.data).length - 1 ? 0 : prevIndex + 1
        );
    };

    const handleCloseClick = () => {
        setIsVisible(false);
    };

    useEffect(() => {
        const interval = setInterval(goToNextAnnouncement, 15000);
        return () => clearInterval(interval);
    }, []);

    if (!isVisible) {
        return null; // Ne rend rien si le composant n'est pas visible
    }

    return (
        <div className={styles.headerBanner}>
            <div className={styles.leftArrow} onClick={goToPreviousAnnouncement}>
                <FaArrowLeft />
            </div>
            <div className={styles.announcement}>
                {getAnnoucement(data?.data)[currentAnnouncementIndex].text}
            </div>
            <div className={styles.rightArrow} onClick={goToNextAnnouncement}>
                <FaArrowRight />
            </div>
            <div className={styles.closeButton} onClick={handleCloseClick}>
                <FaTimes />
            </div>
        </div>
    );
};

export default HeaderBanner;
