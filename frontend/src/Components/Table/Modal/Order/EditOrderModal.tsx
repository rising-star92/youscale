import React, { useEffect, useState } from 'react'
import { CustumInput, CustumTextArea, CustumSelectForm } from '../../../Forms'
import ModalWrapper from '../ModalWrapper'
import { ErrorModel, GetClientOrderModel, StatusModel } from '../../../../models'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useGetStatusQuery } from '../../../../services/api/ClientApi/ClientStatusApi';
import { usePatchClientOrderMutation } from '../../../../services/api/ClientApi/ClientOrderApi';
import { showToastError } from '../../../../services/toast/showToastError';
import * as yup from "yup";

type SelectType = {
  label: string,
  value: string | number
}

type Inputs = {
  nom: string,
  telephone: string,
  prix: string,
  adresse: string,
  message: string,
  status: string,
  source: string,
  updownsell: string,
  changer: string,
  ouvrir: string
};

const schema = yup.object().shape({
  nom: yup.string().notRequired(),
  telephone: yup.string().notRequired(),
  prix: yup.string().notRequired(),
  adresse: yup.string().notRequired(),
  message: yup.string().notRequired(),
  status: yup.string().notRequired(),
  source: yup.string().notRequired(),
  updownsell: yup.string().notRequired(),
  changer: yup.string().notRequired(),
  ouvrir: yup.string().notRequired(),
}).required();

interface Props {
  id_order: string,
  showModal: boolean,
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
  dataEdit: GetClientOrderModel,
  refetch: () => any
}
export default function EditOrderModal({ showModal, setShowModal, dataEdit, refetch, id_order }: Props): JSX.Element {

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
      <FormBody dataEdit={dataEdit} handleCloseModal={handleCloseModal} refetch={refetch} id_order={id_order} />
    </ModalWrapper>
  )
}

interface FormBodyProps {
  id_order: string,
  dataEdit: GetClientOrderModel,
  handleCloseModal: () => void,
  refetch: () => any
}

const FormBody = ({ dataEdit, handleCloseModal, refetch, id_order }: FormBodyProps) => {

  const [patchOrder] = usePatchClientOrderMutation()

  const { data: StatusData, refetch: RefetchStatus } = useGetStatusQuery({})

  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
    resolver: yupResolver(schema),
  });

  const FilterStatusData = (data: StatusModel[] | undefined): SelectType[] => {
    if (!data) return []

    var newArr: SelectType[] = []

    data.filter((dt: StatusModel) => {
      if (dt.checked === true) newArr.push({ label: dt.name, value: dt.name })
    })

    return newArr
  }

  const [sourceData] = useState<SelectType[]>([
    { label: 'none', value: 'none' },
    { label: 'Facebook', value: 'Facebook' },
    { label: 'WhatsApp', value: 'WhatsApp' },
    { label: 'YouTube', value: 'YouTube' },
    { label: 'TikTok', value: 'TikTok' },
    { label: 'Snapchat', value: 'Snapchat' },
    { label: 'Google', value: 'Google' }
  ])

  const [upDownData] = useState<SelectType[]>([
    { label: 'none', value: 'none' },
    { label: 'UpSell', value: 'UpSell' },
    { label: 'DownSell', value: 'UpSell' },
    { label: 'CrossSell', value: 'UpSell' }
  ])

  const changerOuvrirData: SelectType[] = [
    { label: 'none', value: 'none' },
    { label: 'Oui', value: 'Oui' },
    { label: 'Non', value: 'Non' }
  ]

  useEffect(() => {
    RefetchStatus()
  }, [])

  const onSubmit = (values: Inputs) => {
    
    const data = {
      ...values,
      id: Number(id_order)
    }
    
    patchOrder(data).unwrap()
      .then(res => {
        console.log(res)
        refetch()
        handleCloseModal()
      })
      .catch((err: {data: ErrorModel | {message : string}, status: number}) => {
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
          <div className="row">
            <CustumInput
              defaultValue={dataEdit.Destinataire}
              register={register}
              name={'nom'}
              error={errors.nom}
              type={'text'}
              label={"Destinataire"}
              placeholder={'Patrick Doe'}
            />

            <CustumInput
              defaultValue={dataEdit.Telephone}
              register={register}
              name={'telephone'}
              error={errors.telephone}
              type={'text'}
              label={"Telephone"}
              placeholder={'778143610'}
            />

            <CustumInput
              defaultValue={dataEdit.Prix}
              register={register}
              name={'prix'}
              error={errors.prix}
              type={'text'}
              label={"Prix"}
              placeholder={'36540'}
            />

            <CustumInput
              defaultValue={dataEdit.Adresse}
              register={register}
              name={'adresse'}
              error={errors.adresse}
              type={'text'}
              label={"Adresse"}
              placeholder={'Bl 4 st.Jean'}
            />

            <CustumTextArea
              defaultValue={dataEdit.Message}
              register={register}
              name={'message'}
              error={errors.message}
              label={"Commentaire"}
            />
          </div>

          <div className="row">
            <CustumSelectForm
              defaultSelected={dataEdit.Status}
              data={FilterStatusData(StatusData?.data)}
              register={register}
              error={errors.status}
              label={"Status"}
              name={'status'}
            />

            <CustumSelectForm
              defaultSelected={dataEdit.Source}
              data={sourceData}
              register={register}
              error={errors.source}
              label={"Source"}
              name={'source'}
            />

            <CustumSelectForm
              defaultSelected={dataEdit['Up/Downsell']}
              data={upDownData}
              register={register}
              error={errors.updownsell}
              label={"Up/Downsell"}
              name={'updownsell'}
            />

            <CustumSelectForm
              defaultSelected={dataEdit.Changer}
              data={changerOuvrirData}
              register={register}
              error={errors.changer}
              label={"Changer"}
              name={'changer'}
            />

            <CustumSelectForm
              defaultSelected={dataEdit.Ouvrir}
              data={changerOuvrirData}
              register={register}
              error={errors.ouvrir}
              label={"Ouvrir"}
              name={'ouvrir'}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Modifier
          </button>
        </form>
      </div>
    </div>
  )
}