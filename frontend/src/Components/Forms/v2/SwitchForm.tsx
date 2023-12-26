import { Switch } from '../../Switch'
import styles from './form.module.css'
import './form.style.css'

interface Props {
    label: string
    active: boolean
    SwitchHideProduct: () => void
}
export default function SwitchForm({ label, active, SwitchHideProduct }: Props): JSX.Element {

    return (
        <div className={styles.container}>
            <div className={styles.form}>
                <label className={styles.label}>{label}</label>
                <div style={{width: "50%"}}>
                    <Switch
                        active={active}
                        SwitchHideProduct={SwitchHideProduct}
                        size={{ width: '43.727px', height: '25.227px' }}
                    />
                </div>
            </div>
        </div>
    )
}
