import { MultiSelect } from "react-multi-select-component";
import styles from './input.module.css'

type OptionsType = {
    label: string;
    value: string | number | undefined;
    quantity?: number;
    variant?: string[];
    allVariant?: string[] | undefined;
}[]
interface MultiSelectElementProps {
    options: { label: string, value: string, allVariant?: string[] }[],
    selected: OptionsType,
    onChange: any,
    className?: string
    style?: 'confirmation' | 'default'
}
export default function MultiSelectElement({ options, selected, onChange, className, style }: MultiSelectElementProps): JSX.Element {

    return (
        <MultiSelect
            className={`${className} ${style === 'confirmation' ? styles.confirmation_multiSelect : ''}`}
            options={options}
            value={selected}
            onChange={onChange}
            labelledBy="Sélectionner"
        />
    )
}
