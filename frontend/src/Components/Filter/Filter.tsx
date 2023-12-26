import { useState, useRef, useEffect } from 'react'
import style from './Filter.module.css'
import { IconType } from 'react-icons/lib';

type dataType = {
  label: string;
  value: string;
}

const DEFAULT_VALUE: dataType[] = [
  { label: 'One', value: '1' },
  { label: 'Two', value: '2' },
  { label: 'Three', value: '3' }
]

interface Props {
  Icons: IconType
  label: string
  data?: dataType[]
  onChange: ({ label, value }: dataType) => void
}
export const Filter = ({ Icons, label, onChange, data = DEFAULT_VALUE }: Props): JSX.Element => {
  const [title, setTitle] = useState<string>(label)
  const [display, setIsDisplay] = useState<boolean>(false)

  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (elementRef.current && !elementRef.current.contains(event.target as Node)) {
        setIsDisplay(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div>
      <div className={style.filterContainer}>
        <div onClick={e => setIsDisplay(!display)} className={style.filter}>
          <Icons size={20} className={style.logo} />
          <p>{title}</p>
        </div>
        {display &&
          <Display
            onChange={onChange}
            elementRef={elementRef}
            setTitle={setTitle}
            data={data}
            label={title}
          />}
      </div>
    </div>
  )
}

interface DisplayProps {
  elementRef: React.RefObject<HTMLDivElement>
  setTitle: React.Dispatch<React.SetStateAction<string>>
  data: dataType[]
  onChange: ({ label, value }: dataType) => void
  label: string
}
const Display = ({ elementRef, setTitle, data, onChange, label }: DisplayProps): JSX.Element => {

  return (
    <div ref={elementRef} className={style.display}>
      <Items
        label={'Tout'}
        isChecked={label=='Produit'}
        setTitle={setTitle}
        value='' />
      {data.map((dt, index) =>
        <Items
          key={index}
          label={dt.label}
          isChecked={label==dt.label || label=='Produit'}
          setTitle={setTitle}
          value={dt.value}
          onChange={onChange}
        />)}
    </div>
  )
}

interface ItemsProps {
  isChecked?: boolean
  setTitle?: React.Dispatch<React.SetStateAction<string>>
  onChange?: ({ label, value }: dataType) => void
  label: string
  value: string
}
const Items = ({ isChecked, label, setTitle, onChange, value }: ItemsProps): JSX.Element => {

  const onCheck = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault()
    const element = document.querySelectorAll(`.${style.items}`)

    // for (const elem of element) elem.classList.remove(style.checked)

    e.currentTarget.classList.add(style.checked)
    if (label == "Tout") {
      setTitle && setTitle("Produit")
    } else {
      setTitle && setTitle(label)
    }
    
    onChange && onChange({ label, value })
  }

  return (
    <div onClick={onCheck} className={`${style.items} ${isChecked ? style.checked : ''}`}>
      <div className={style.itemLabel}>{label}</div>
      <div className={style.itemCheckbox} />
    </div>
  )
}
