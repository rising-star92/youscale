import { useEffect, useState } from 'react'
import { setToken } from '../../../services/auth/setToken';
import { setUserData } from '../../../services/auth/setUserData';
import style from './styles.module.css'

export default function SuccessPage() {

    const [showBackBtn, setShowBackBtn] = useState<boolean>(false)

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);

        const token = urlParams.get('token');
        const client = urlParams.get('client');

        if (token && client) {
            const user = JSON.parse(client)

            const verified = user.active
            const step = user.step

            setTimeout(() => {
                localStorage.setItem('STEP', !verified ? JSON.stringify('NOT_VERIFIED') : step ? JSON.stringify(step) : JSON.stringify('completed'))
                setToken(token)
                setUserData(user)
                setShowBackBtn(true)
            }, 3000);
        }
    }, []);

    return (
        <div className={style.container}>
            <div className={style.box}>
                <div className={style.gif}></div>
                {
                    showBackBtn && <a href="/" className={style.button}>
                        <p>Revenir sur Youscale</p>
                    </a>
                }
            </div>
        </div>
    )
}
