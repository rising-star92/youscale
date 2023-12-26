import React, { useState, useEffect } from 'react'
import Main from '../../Main'
import { Tarif } from './Tarif'
import { Account } from './Account'
import { Transaction } from './Transaction'
import { PaymentMethod } from './PaymentMethod'
import { useGetClientPaymentMethodQuery } from '../../../services/api/ClientApi/ClientPaymentMethodApi'
import { useGetClientPackQuery } from '../../../services/api/ClientApi/ClientPackApi'
import { useGetSettingQuery } from '../../../services/api/ClientApi/ClientSettingApi'
import './pack.style.css'
import { useGetClientQuery } from '../../../services/api/ClientApi/ClientApi'

interface Bank {
    id: number;
    name: string;
    bank: string;
    rib: string;
}
const pageName = 'pack'
export default function PackContainer() {

    const [showVideo, setShowVideo] = useState<boolean>(false)
    const [showTutorial, setShowTutorial] = useState<boolean>(false);
    const { data: client } = useGetClientQuery()
    const { data: dataPack, isLoading, refetch } = useGetClientPackQuery()
    const { data: dataSetting } = useGetSettingQuery()

    const { data } = useGetClientPaymentMethodQuery()
    const [currentBank, setCurrentBank] = useState<Bank | undefined>()

    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem(`tutorial_${pageName}`);
        if (hasSeenTutorial) {
            setShowTutorial(!JSON.parse(hasSeenTutorial));
        } else {
            setShowTutorial(true);
        }
    }, []);

    const closeTutorial = () => {
        localStorage.setItem(`tutorial_${pageName}`, JSON.stringify(true));
        setShowTutorial(false);
    };

    useEffect(() => {
        setCurrentBank(data?.data[0] ? data?.data[0].Bank_Information : undefined)
    }, [data])

    function computeDateDifference(startDate: Date, endDate: Date): number {
        const millisecondsPerDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day

        // Convert both dates to UTC to avoid issues with daylight saving time
        const startUtc = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const endUtc = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

        // Calculate the difference in days
        const diffInDays = Math.floor((endUtc - startUtc) / millisecondsPerDay);

        return (dataSetting?.data.trial_period || 0) - diffInDays;
    }

    function addDaysToDate({ date, days }: { date: Date, days: number }) : Date {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + days);
        return newDate;
    }

    return (
        <Main
            urlVideo={'https://www.youtube.com/watch?v=Y2eNJGFfhVY'}
            name='Pack'
            showVideo={showVideo}
            setShowVideo={setShowVideo}
            closeTutorial={closeTutorial}
        >
            <div className="content-body">
                <div className="container-fluid">
                    {
                        dataPack?.data &&
                        computeDateDifference(new Date(dataPack.data.Subscription.date_subscription), new Date()) > 0 &&
                        <PackTitlte title={`Pack <p class='expire-txt'>your pack will expire in ${computeDateDifference(new Date(dataPack.data.Subscription.date_subscription), new Date())} days</p>`} />
                    }
                    { client?.data.isTrial &&  <PackTitlte title={`Pack <p class='expire-txt'>your pack will expire in ${addDaysToDate({ date: client.data.trialAt || new Date(), days: client.data.trialPeriod || 0 }).toString().slice(0,15)}</p>`} /> }
                    <Tarif data={dataPack} isLoading={isLoading} refetch={refetch} />
                    <PackTitlte title='Payment methods' />
                    <Account />
                    <PaymentMethod data={data?.data} setCurrentBank={setCurrentBank} />
                    <Transaction data={currentBank} />
                </div>
            </div>
        </Main>
    )
}

interface PackTitlteProps {
    title: string
}
const PackTitlte = ({ title }: PackTitlteProps): JSX.Element => {
    return (
        <div className="row page-titles">
            <ol className="breadcrumb">
                <li className="breadcrumb-item active">
                    <a dangerouslySetInnerHTML={{ __html: title }} href="javascript:void(0)"></a>
                </li>
            </ol>
        </div>
    )
}