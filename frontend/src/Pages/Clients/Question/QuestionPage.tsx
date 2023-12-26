import React, { useState } from 'react'
import style from './styles.module.css'
import { logOut } from '../../../services/auth/logout'
import { useSaveResponseMutation } from '../../../services/api/ClientApi/ClientApi'

interface QuestionCardModel {
    value: string
    order: number
}

export default function QuestionPage() {
    const [currAnswer, setCurrAnswer] = useState<number>(1)
    const [progress, setProgress] = useState<number>(25)

    const [q1] = useState<QuestionCardModel[]>([{
        order: 1,
        value: 'Je viens de commencer le e-commerce'
    },
    {
        order: 2,
        value: 'Je vends déjà sur internet'
    }
    ])

    const [q2] = useState<QuestionCardModel[]>([{
        order: 1,
        value: 'Shopify'
    },
    {
        order: 2,
        value: 'Youcan'
    },
    {
        order: 3,
        value: 'Woocommerce'
    },
    {
        order: 4,
        value: 'Wordpress'
    },
    {
        order: 5,
        value: 'Autre'
    }
    ])

    const [q3] = useState<QuestionCardModel[]>([{
        order: 1,
        value: 'Youtube ads'
    },
    {
        order: 2,
        value: 'Facebook ads'
    },
    {
        order: 3,
        value: 'Instagram vidéo'
    },
    {
        order: 4,
        value: 'Groupe facebook'
    },
    {
        order: 5,
        value: 'Recommandé par un ami'
    },
    {
        order: 6,
        value: 'De l\'un de nos agents'
    }

    ])

    const [q4] = useState<QuestionCardModel[]>([{
        order: 1,
        value: 'Comparer les gains entre produits'
    },
    {
        order: 2,
        value: 'Comparer entre les gens de confirmation'
    },
    {
        order: 3,
        value: 'Automatiser l’exportation  des commandes dans la société de livraison'
    },
    {
        order: 4,
        value: 'Savoir mon gain net en e-commerce'
    },
    {
        order: 5,
        value: 'Maitriser le cout par commande des Ads'
    }
    ])

    return (
        <div className={style.container}>
            <div onClick={() => logOut()} className={style.logout}>
                <p>Se déconnecter</p>
            </div>
            <div className={style.card}>
                <div className={style.progressbarWrapper}>
                    <div style={{width: `${progress}%`}} className={style.progressbar}></div>
                </div>

                {currAnswer === 1 && <Question value={1} title={'Quelle est votre situation ?'} data={q1} setCurrAnswer={setCurrAnswer} setProgress={setProgress} />}
                {currAnswer === 2 && <Question value={2} title={'Quel site utilisez-vous ?'} data={q2} setCurrAnswer={setCurrAnswer} setProgress={setProgress} />}
                {currAnswer === 3 && <Question value={3} title={'Comment avez-vous entendu parler de nous ?'} data={q3} setCurrAnswer={setCurrAnswer} setProgress={setProgress} />}
                {currAnswer === 4 && <QuestionMultiple value={4} title={'Quel est votre  but principal de l\'utilisation de notre système ?'} data={q4} setCurrAnswer={setCurrAnswer} setProgress={setProgress} />}
            </div>
        </div>
    )
}

interface QuestionProps {
    title: string
    value: number
    data: QuestionCardModel[]
    setCurrAnswer: React.Dispatch<React.SetStateAction<number>>
    setProgress: React.Dispatch<React.SetStateAction<number>>
}
const Question = ({ title, data, value, setCurrAnswer, setProgress }: QuestionProps) => {
    const [select, setSelect] = useState<number>(0)

    const onSave = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()

        const currentValue = localStorage.getItem('questionTopics')
        if (currentValue) {
            const data = JSON.parse(currentValue)
            data[String(value)] = select

            localStorage.setItem('questionTopics', JSON.stringify(data))
        } else {
            const data: any = {}
            data[String(value)] = select

            localStorage.setItem('questionTopics', JSON.stringify(data))
        }

        value === 1 && setProgress(50)
        value === 2 && setProgress(75)
        value === 3 && setProgress(100)

        if (value === 4) return
        setCurrAnswer(value + 1)
    }

    const onBack = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()

        if (value === 1) return
        setCurrAnswer(value - 1)
    }

    return (
        <React.Fragment>
            <div className={style.title}>{title}</div>

            <div className={style.questionContainer}>
                {data.map(qs => <QuestionCard quest={value} order={qs.order} value={qs.value} select={select} setSelect={setSelect} />)}
            </div>

            <button
                onClick={onSave}
                disabled={Boolean(!select)}
                className={style.button}
            >
                <p>{value === 4 ? 'Soummettre' : 'Continuer'}</p>
            </button>
        </React.Fragment>
    )
}

interface QuestionCardProps {
    value: string
    order: number
    quest: number
    select: number
    setSelect: React.Dispatch<React.SetStateAction<number>>
}
const QuestionCard = ({ value, order, setSelect, select, quest }: QuestionCardProps): JSX.Element => {

    const onSelect = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        setSelect(order)
    }

    return (
        <div
            onClick={onSelect}
            className={`${quest > 1 ? style.questionSmall : style.question} ${select === order && style.active}`}>
            <div>{value}</div>
        </div>
    )
}

const QuestionMultiple = ({ title, data, value, setCurrAnswer }: QuestionProps) => {
    const [select, setSelect] = useState<number[]>([])
    const [saveResponse] = useSaveResponseMutation()

    const onSave = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()

        const currentValue = localStorage.getItem('questionTopics')
        if (currentValue) {
            const data = JSON.parse(currentValue)
            data[String(value)] = select

            localStorage.setItem('questionTopics', JSON.stringify(data))
        } else {
            const data: any = {}
            data[String(value)] = select

            localStorage.setItem('questionTopics', JSON.stringify(data))
        }

        // send data to api and redirect to choose pack
        if (currentValue) {
            const data = JSON.parse(currentValue)

            saveResponse({ response: data }).unwrap()
                .then(res => {
                    window.location.href = '/choose_pack'
                    localStorage.setItem('STEP', JSON.stringify('pack'))
                })
                .catch(err => console.log(err))
        }
    }

    const onBack = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()

        if (value === 1) return
        setCurrAnswer(value - 1)
    }

    return (
        <React.Fragment>
            <div className={style.title}>{title}</div>

            <div className={style.questionContainer}>
                {data.map(qs => <QuestionMultipleCard order={qs.order} value={qs.value} select={select} setSelect={setSelect} />)}
            </div>

            <button
                onClick={onSave}
                disabled={Boolean(!select)}
                className={style.button}
            >
                <p>{value === 4 ? 'Soummettre' : 'Continuer'}</p>
            </button>
        </React.Fragment>
    )
}

interface QuestionnMultipleCardProps {
    value: string
    order: number
    select: number[]
    setSelect: React.Dispatch<React.SetStateAction<number[]>>
}
const QuestionMultipleCard = ({ value, order, setSelect, select }: QuestionnMultipleCardProps): JSX.Element => {

    const onSelect = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        setSelect((prevSate) => [...prevSate, order])
    }

    return (
        <div onClick={onSelect} className={`${style.questionSmall} ${select.includes(order) && style.active}`}>
            <div>{value}</div>
        </div>
    )
}