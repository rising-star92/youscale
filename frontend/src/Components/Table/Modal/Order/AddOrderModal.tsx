import React, { useEffect, useState } from 'react'
import { CustumInput, CustumTextArea, CustumSelectForm, CityDropDown } from '../../../Forms'
import { ProductOrderCard } from './Card'
import ModalWrapper from '../ModalWrapper'
import { CityModel, ErrorModel, GetProductModel, StatusModel } from '../../../../models'
import { useAddClientOrderMutation } from '../../../../services/api/ClientApi/ClientOrderApi'
import { useGetCityQuery } from '../../../../services/api/ClientApi/ClientCityApi'
import { useGetProductQuery } from '../../../../services/api/ClientApi/ClientProductApi'
import { useGetStatusQuery } from '../../../../services/api/ClientApi/ClientStatusApi'
import { MultiSelectElement } from '../../../Input'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { showToastError } from '../../../../services/toast/showToastError'
import * as yup from "yup";

type SelectType = {
  label: string,
  value: string | number
}

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

const getMinDate = (): string => {
  const today = new Date();

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day}`;

  return formattedDate
}

type Inputs = {
  nom: string,
  telephone: string,
  prix: string,
  adresse: string,
  reportedDate: string,
  message: string,
  id_city: string,
  status: string,
  source: string,
  updownsell: string,
  changer: string,
  ouvrir: string
};

const schema = yup.object().shape({
  nom: yup.string().required('Ce champ est obligatoire'),
  telephone: yup.string().required('Ce champ est obligatoire'),
  prix: yup.string().required('Ce champ est obligatoire'),
  adresse: yup.string().notRequired(),
  reportedDate: yup.string().notRequired(),
  message: yup.string().notRequired(),
  id_city: yup.string().required('Ce champ est obligatoire'),
  status: yup.string().required('Ce champ est obligatoire'),
  source: yup.string().required('Ce champ est obligatoire'),
  updownsell: yup.string().required('Ce champ est obligatoire'),
  changer: yup.string().required('Ce champ est obligatoire'),
  ouvrir: yup.string().required('Ce champ est obligatoire'),
}).required();

interface Props {
  showModal: boolean,
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
  refetch: () => any
  driverObj: {
    moveNext: () => void
  }
}
export default function AddOrderModal({ showModal, setShowModal, refetch, driverObj }: Props): JSX.Element {

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
    <ModalWrapper showModal={showModal} title={'ajouter commande'} closeModal={handleCloseModal} setShowModal={setShowModal} id='AddOrderModal'>
      <FormBody refetch={refetch} handleCloseModal={handleCloseModal} />
    </ModalWrapper>
  )
}

interface FormBodyProps {
  refetch: () => any,
  handleCloseModal: () => void
}
const FormBody = ({ refetch, handleCloseModal }: FormBodyProps) => {
  const [addOrder, { isLoading }] = useAddClientOrderMutation()

  const [selectedProduct, setSelectedProduct] = useState<{ label: string, value: number | undefined | string, quantity: number, variant: string[], allVariant: string[] | undefined }[]>([]);
  const [showReporte, setShowReporte] = useState<boolean>(false)

  const { data: CityData } = useGetCityQuery()
  const { data: ProductData, isSuccess: ProductSuccess } = useGetProductQuery({ isHidden: false })
  const { data: StatusData, refetch: RefetchStatus } = useGetStatusQuery({})

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<Inputs>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    RefetchStatus()
  }, [])

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

  const FormatDataOption = (data: GetProductModel[]) => {
    var objArr: { label: string, value: string, allVariant: string[], variant: [] }[] = []

    for (let i = 0; i < data.length; i++) {
      if (!data[i].isDeleted)
        objArr.push({ label: data[i].name, value: String(data[i].id), allVariant: data[i].variant, variant: [] })
    }

    return objArr
  }

  const FormatAccessArray = (data: any) => {
    var objArr: { id: number, quantity: number, variant: [] }[] = []


    for (let i = 0; i < data.length; i++) {
      objArr.push({ id: data[i].value, quantity: data[i].quantity, variant: data[i].variant })
    }

    return objArr
  }

  const handleChangeStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target

    if (value === 'Reporte')
      setShowReporte(true)
    else
      setShowReporte(false)
  }

  const FilterStatusData = (data: StatusModel[] | undefined): SelectType[] => {
    if (!data) return []

    var newArr: SelectType[] = []

    data.filter((dt: StatusModel) => {
      if (dt.checked === true) newArr.push({ label: dt.name, value: dt.name })
    })

    return newArr
  }

  const onSubmit = (values: Inputs) => {

    if (selectedProduct.length === 0) {
      showToastError('Please select at least one product')
      return
    }

    const data = {
      ...values,
      id_product_array: FormatAccessArray(selectedProduct)
    }

    addOrder(data).unwrap()
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
        <form onSubmit={handleSubmit(onSubmit)} autoComplete='false'>
          <div className="row">
            <CustumInput
              register={register}
              name={'nom'}
              error={errors.nom}
              type={'text'}
              label={"Destinataire"}
              placeholder={'Patrick Doe'}
            />

            <CustumInput
              register={register}
              name={'telephone'}
              error={errors.telephone}
              type={'text'}
              label={"Telephone"}
              placeholder={'778143610'}
            />

            <CustumInput
              register={register}
              name={'prix'}
              error={errors.prix}
              type={'text'}
              label={"Prix"}
              placeholder={'36540'}
            />

            <CustumInput
              register={register}
              name={'adresse'}
              error={errors.adresse}
              type={'text'}
              label={"Adresse"}
              placeholder={'Bl 4 st.Jean'}
            />

            <CustumTextArea
              register={register}
              name={'message'}
              error={errors.message}
              label={"Commentaire"}
            />

            {
              showReporte &&
              <CustumInput
                register={register}
                min={getMinDate()}
                name={'reportedDate'}
                error={errors.reportedDate}
                type={'date'}
                label={"Date de report"}
                placeholder={'jj/mm/aaaa'}
              />
            }

          </div>
          <div className="row">
            <CityDropDown
              setValue={setValue}
              data={GetCityWhosNotFromSheet(CityData?.data)}
              error={errors.id_city}
              label={"Ville"}
            />
          </div>
          <div className="row">


            <CustumSelectForm
              data={FilterStatusData(StatusData?.data)}
              Onchange={handleChangeStatus}
              defaultSelected={'Nouveau'}
              register={register}
              error={errors.status}
              label={"Status"}
              name={'status'}
            />

            <CustumSelectForm
              data={sourceData}
              register={register}
              error={errors.source}
              label={"Source"}
              name={'source'}
            />

            <CustumSelectForm
              data={upDownData}
              register={register}
              error={errors.updownsell}
              label={"Up/Downsell"}
              name={'updownsell'}
            />

            <CustumSelectForm
              data={changerOuvrirData}
              register={register}
              error={errors.changer}
              label={"Changer"}
              name={'changer'}
            />

            <CustumSelectForm
              data={changerOuvrirData}
              register={register}
              error={errors.ouvrir}
              label={"Ouvrir"}
              name={'ouvrir'}
            />

          </div>

          <div className="row">
            <label className="form-label">{'Produit'}</label>
            {ProductSuccess ? <MultiSelectElement options={FormatDataOption(ProductData?.data)} selected={selectedProduct} onChange={setSelectedProduct} /> : <></>}

            {selectedProduct.map((dt, index) =>
              <ProductOrderCard
                key={index}
                dt={dt}
                index={index}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                title={dt.label}
              />
            )}
          </div>

          <button disabled={isLoading} type="submit" className="btn btn-primary">
            Ajouter
          </button>
        </form>
      </div>
    </div>
  )
}