import React, { useState } from 'react';
import styles from './Switch.module.css';

interface SwitchProps {
    size: {
        width: string;
        height: string;
    }
    active: boolean
    SwitchHideProduct: () => void
}

const Switch: React.FC<SwitchProps> = ({ size, SwitchHideProduct, active }) => {
    const [isEnabled, setIsEnabled] = useState<boolean>(active);

    const toggleSwitch = () => {
        setIsEnabled(!active);
        SwitchHideProduct()
    }

    const switchStyle = {
        width: size.width,
        height: size.height,
        backgroundColor: isEnabled ? '#7720E1' : 'gray',
    }

    const circleStyle = {
        backgroundColor: 'white',
        transform: isEnabled ? 'translateX(100%)' : 'translateX(20%)',
    }

    return (
        <div className={styles.switch} style={switchStyle} onClick={toggleSwitch}>
            <div className={styles.circle} style={circleStyle}></div>
        </div>
    );
};

export default Switch;
