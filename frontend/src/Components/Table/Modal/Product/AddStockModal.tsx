import React, { useEffect } from 'react'
import { CustumInput, CustumSelectForm } from '../../../Forms'
import ModalWrapper from '../ModalWrapper'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { CityModel, ErrorModel, GetProductModel } from '../../../../models';
import { useGetProductQuery } from '../../../../services/api/ClientApi/ClientProductApi';
import { useAddStockMutation } from '../../../../services/api/ClientApi/ClientStockApi';
import { showToastError } from '../../../../services/toast/showToastError';

type Inputs = {
  quantity: string,
  id_product: string
};

type SelectType = {
  label: string,
  value: string | number
}

const schema = yup.object().shape({
  quantity: yup.string().required('Ce champ est obligatoire'),
  id_product: yup.string().required('Ce champ est obligatoire'),
}).required();

const GetCityWhosNotFromSheet = (data: CityModel[] | undefined): SelectType[] => {
  if (!data) return []

  var newArr: SelectType[] = [{ label: 'none', value: 'none' }]

  for (let i = 0; i < data.length; i++) {
    if (data[i].isFromSheet === false) {
      newArr.push({
        value: data[i].id ?? 0,
        label: data[i].name
      })
    }
  }

  return newArr
}

const FormatProductSelect = (data: GetProductModel[] | undefined): SelectType[] => {
  if (!data) return []

  var newArr: SelectType[] = [{ label: 'none', value: 'none' }]

  for (let i = 0; i < data.length; i++) {
    newArr.push({
      value: data[i].id ?? 0,
      label: data[i].name
    })
  }

  return newArr
}

interface Props {
  showModal: boolean,
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
  refetch: () => any
  driverObj: {
    moveNext: () => void
  }
}
export default function AddStockModal({ showModal, setShowModal, refetch, driverObj }: Props): JSX.Element {

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
      driverObj.moveNext()
    }
  }

  return (
    <ModalWrapper title={'ajout de stock'} showModal={showModal} closeModal={handleCloseModal} setShowModal={setShowModal} id='AddOrderModal'>
      <FormBody handleCloseModal={handleCloseModal} refetch={refetch} />
    </ModalWrapper>
  )
}

interface FormBodyProps {
  handleCloseModal: () => void,
  refetch: () => any
}
const FormBody = ({ handleCloseModal, refetch }: FormBodyProps) => {

  const [adderStock] = useAddStockMutation()

  const { data: productData } = useGetProductQuery({ isHidden: false })

  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (values: Inputs) => {
    adderStock(values).unwrap()
      .then(res => {
        refetch()
        handleCloseModal()
      })
      .catch((err: { data: ErrorModel | { message: string }, status: number }) => {
        if (err.data) {
          if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
          else if ('message' in err.data) showToastError(err.data.message);
        }
      })
      handleCloseModal()
  }

  return (
    <div className="card-body">
      <div className="basic-form">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <CustumInput
              register={register}
              name={'quantity'}
              error={errors.quantity}
              type={'text'}
              label={"Quantité"}
              placeholder={'12'}
            />

            <CustumSelectForm
              data={FormatProductSelect(productData?.data)}
              register={register}
              error={errors.id_product}
              label={"Produit"}
              name={'id_product'}
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Ajouter
          </button>
        </form>
      </div>
    </div>
  )
}