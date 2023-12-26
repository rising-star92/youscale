import React, { useEffect } from 'react'
import { CustumSelectForm } from '../../../Forms'
import ModalWrapper from '../ModalWrapper'
import { ErrorModel, GetTeamMemberModel } from '../../../../models'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useGetTeamMemberQuery } from '../../../../services/api/ClientApi/ClientTeamMemberApi';
import { useBulkEditClientOrderMutation } from '../../../../services/api/ClientApi/ClientOrderApi';
import { showToastError } from '../../../../services/toast/showToastError';
import * as yup from "yup";

type SelectType = {
    label: string,
    value: string | number
}

type Inputs = {
    id_orders: number[] | undefined
    id_agent: number
};

const schema = yup.object().shape({
    id_agent: yup.number().required('id_agent is necessary')
}).required();

interface Props {
    id_orders: number[] | undefined
    showModal: boolean
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>
    refetch: () => any
}
export default function BulkEditAgentModal({ showModal, setShowModal, refetch, id_orders }: Props): JSX.Element {

    useEffect(() => {
        var body = document.querySelector<HTMLBodyElement>('body');

        var modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop fade show';

        if (body) {
            body.classList.add('modal-open');
            body.style.overflow = 'hidden';
            body.style.paddingRight = '17px';

            body.appendChild(modalBackdrop);
        }
    }, [])

    const handleCloseModal = () => {
        var body = document.querySelector<HTMLBodyElement>('body');

        if (body) {
            body.classList.remove('modal-open');
            body.style.overflow = '';
            body.style.paddingRight = '';

            var existingBackdrop = document.querySelectorAll('.modal-backdrop.fade.show');

            if (existingBackdrop) existingBackdrop.forEach(it => it.remove());

            setShowModal(false)
        }
    }

    return (
        <ModalWrapper title={'Edit order'} showModal={showModal} setShowModal={setShowModal} id='EditOrderModal'>
            <FormBody handleCloseModal={handleCloseModal} refetch={refetch} id_orders={id_orders} />
        </ModalWrapper>
    )
}

interface FormBodyProps {
    id_orders: number[] | undefined
    handleCloseModal: () => void
    refetch: () => any
}

const FormBody = ({ handleCloseModal, refetch, id_orders }: FormBodyProps) => {

    const [edit] = useBulkEditClientOrderMutation()

    const { data: dataTeamMember } = useGetTeamMemberQuery({ isHidden: true })

    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
        resolver: yupResolver(schema),
    });

    const FilterStatusData = (data: GetTeamMemberModel[] | undefined): SelectType[] => {
        if (!data) return []

        var newArr: SelectType[] = []

        data.filter((dt: GetTeamMemberModel) => {
            newArr.push({ label: dt.name ?? '', value: dt.id })
        })

        return newArr
    }

    const onSubmit = (values: Inputs) => {

        const data = {
            new_id_team: values.id_agent,
            id_orders: id_orders ?? []
        }

        edit(data).unwrap()
            .then(res => {
                console.log(res)
                refetch()
                handleCloseModal()
            })
            .catch((err: { data: ErrorModel | { message: string }, status: number }) => {
                if (err.data) {
                    if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                    else if ('message' in err.data) showToastError(err.data.message);
                }
            })
    }

    return (
        <div className="card-body">
            <div className="basic-form">
                <form onSubmit={handleSubmit(onSubmit)}>

                    <CustumSelectForm
                        data={FilterStatusData(dataTeamMember?.data)}
                        register={register}
                        error={errors.id_agent}
                        label={"Select agent"}
                        name={'id_agent'}
                    />
                    <button type="submit" className="btn btn-primary">
                        Modifier
                    </button>
                </form>
            </div>
        </div>
    )
}