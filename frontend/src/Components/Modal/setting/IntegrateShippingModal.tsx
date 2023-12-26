import React, { useState } from 'react'
import { ColumnModel, ErrorModel, ShippingModel } from '../../../models';
import { useGetColumnQuery, usePatchColumnMutation } from '../../../services/api/ClientApi/ClientColumnApi';
import { showToastError } from '../../../services/toast/showToastError';
import { useGetShippingQuery } from '../../../services/api/ClientApi/ClientShippingApi';
import { useGetClientQuery, usePatchClientMutation } from '../../../services/api/ClientApi/ClientApi';
import { showToastSucces } from '../../../services/toast/showToastSucces';
import styles from './setting.module.css'

interface Props {
    setIsVisible: React.Dispatch<React.SetStateAction<boolean>>
    driverObj: {
        moveNext: () => void
    }
}
export default function IntegrateShippingModal({ setIsVisible, driverObj }: Props): JSX.Element {

    const { data: user, refetch: refetchUser } = useGetClientQuery();
    const { data: dataColumn, refetch: refetchColumn } = useGetColumnQuery()

    const [patchClient] = usePatchClientMutation();
    const [mode, setMode] = useState<'societe' | 'colonne'>('colonne')
    const [livoToken, setLivoToken] = useState<string>()

    const handleClose = () => {
        setIsVisible(false);
        driverObj.moveNext()
    };

    const handleSaveChanges = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

        if (livoToken) {
            patchClient({ livoToken }).unwrap().then((result: any) => {
                showToastSucces('Token ajouté')
                refetchUser()
                handleClose()
            }).catch((err: { data: ErrorModel | { message: string }, status: number }) => {
                if (err.data) {
                    if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                    else if ('message' in err.data) showToastError(err.data.message);
                }
            })
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent_Shipping}>
                <button className={styles.closeButton} onClick={handleClose}>
                    &times;
                </button>
                <div className={styles.main_Shipping}>
                    <p className={styles.title}>Intégration de sociétés de livraison</p>

                    <div className={styles.switchContainer}>
                        <div onClick={() => setMode('colonne')} className={`${styles.switchItems} ${mode === 'colonne' && styles.itemsActive}`}>Colonnes</div>
                        <div onClick={() => setMode('societe')} className={`${styles.switchItems} ${mode === 'societe' && styles.itemsActive} `}>Sociétés</div>
                    </div>

                    {mode === 'colonne' ? <ColonneContainer refetchColumn={refetchColumn} statusData={dataColumn?.data} /> : <SocieteContainer livoToken={user?.data.livoToken} setLivoToken={setLivoToken} />}

                    <div className={styles.bottomBtn}>
                        {
                            mode === 'societe' &&
                            <button onClick={handleSaveChanges} className={styles.saveBtn}>
                                Enregistrer
                            </button>
                        }

                        <button onClick={() => handleClose()} className={styles.closeBtn}>
                            Fermer
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}

interface ColumnContainerProps {
    statusData: ColumnModel[] | undefined
    refetchColumn: () => any
}
const ColonneContainer = ({ statusData, refetchColumn }: ColumnContainerProps): JSX.Element => {
    return (
        <div className={styles.ColonneContainer}>
            <p className={styles.ColonneDescTxt}>Sélectionner les colonnes que vous allez importer aux sociétés de livraison</p>

            <div className={styles.displayColonneArea}>
                {statusData && statusData.map(dt => <StatusItem refetchColumn={refetchColumn} dt={dt} />)}
            </div>
        </div>
    )
}

interface SocieteContainerProps {
    setLivoToken: React.Dispatch<React.SetStateAction<string | undefined>>
    livoToken: string | undefined
}
const SocieteContainer = ({ setLivoToken, livoToken }: SocieteContainerProps): JSX.Element => {
    const { data, isSuccess } = useGetShippingQuery()
   

    return (
        <div className={styles.SocieteContainer}>
            <div className={styles.searchSociete}>
                <img src="/svg/setting/search.svg" alt="search" />
                <input placeholder={'Recherche'} type="text" />
            </div>

            <div className={styles.displaySociete}>
                {isSuccess && data?.data.map((dt: ShippingModel) => dt.isShow &&
                    <SocieteItem
                        livoToken={livoToken}
                        setLivoToken={setLivoToken}
                        item={dt}
                    />
                )}
            </div>
        </div>
    )
}

interface StatusItemProps {
    dt: ColumnModel
    refetchColumn: () => any
}
const StatusItem = ({ dt, refetchColumn }: StatusItemProps): JSX.Element => {

    const [patchColumn] = usePatchColumnMutation()

    const handleStatusCheckbox = (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {

        const data = { id: dt.id ?? 0, isExported: !dt.isExported }

        patchColumn(data).unwrap()
            .then((res: any) => {
                console.log(res)
                refetchColumn()
            })
            .catch((err: { data: ErrorModel | { message: string }, status: number }) => {
                if (err.data) {
                    if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                    else if ('message' in err.data) showToastError(err.data.message);
                }
            })
    }

    return (
        <div className={styles.StatusItem}>
            <input
                onClick={handleStatusCheckbox}
                defaultChecked={dt.isExported}
                type="checkbox"
                name="customCheckBox1"
            />
            <label htmlFor="customCheckBox1">
                {dt.alias ?? dt.name}
            </label>
        </div>
    )
}

interface SocieteItemProps {
    item: ShippingModel
    livoToken: string | undefined
    setLivoToken: React.Dispatch<React.SetStateAction<string | undefined>>
}
const SocieteItem = ({ item, setLivoToken, livoToken }: SocieteItemProps): JSX.Element => {

    const defaultValue = item.name.toUpperCase() === 'LIVO' ? livoToken : ''
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (item.name.toUpperCase() === 'LIVO') setLivoToken(e.target.value)
    }

    return (
        <div className={styles.SocieteItem}>
            <img src={`data:image/jpeg;base64,${item.image}`} alt="societe" />
            <p>{item.name}</p>
            <input
                defaultValue={defaultValue}
                onChange={handleChange}
                placeholder={'Saisir API'}
                type="text"
            />
        </div>
    )
}