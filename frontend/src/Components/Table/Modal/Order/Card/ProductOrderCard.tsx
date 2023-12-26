import React from 'react'
import { MultiSelectElement } from '../../../../Input'
import styles from './product.module.css'

interface Props {
    title: string,
    index: number,
    setSelectedProduct:

    React.Dispatch<React.SetStateAction<{
        label: string;
        value: number | undefined | string;
        quantity: number;
        variant: string[];
        allVariant: string[] | undefined;
    }[]>>
    ,
    selectedProduct: {
        label: string;
        value: number | undefined | string;
        quantity: number;
        variant: string[];
        allVariant: string[] | undefined;
    }[],
    dt: {
        label: string;
        value: number | undefined | string;
        quantity: number;
        variant: string[];
        allVariant: string[] | undefined;
    }
}
export default function ProductOrderCard({ title, index, setSelectedProduct, selectedProduct, dt }: Props): JSX.Element {

    const handleChangeQuantity = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSelectedProduct = [...selectedProduct]
        newSelectedProduct[index].quantity = parseInt(e.target.value)
        setSelectedProduct(newSelectedProduct)
    }

    const FormatVariantOnOnceArray = (data: any) => {
        var once_array = []

        for (let i = 0; i < data.length; i++) {
            once_array.push(data[i].value)
        }

        return once_array
    }

    const handleChangeVariant = (value: any) => {
        const newSelectedProduct = [...selectedProduct]
        newSelectedProduct[index].variant = FormatVariantOnOnceArray(value)
        setSelectedProduct(newSelectedProduct)
    }

    const FormatVariantOption = (data: any) => {

        var objArr: { label: string, value: string }[] = []

        for (let i = 0; i < data.length; i++) {
            objArr.push({ label: data[i], value: data[i] })
        }

        return objArr
    }

    return (
        <div className={styles.productContainer}>
            <h5 className={styles.title}>{title}</h5>
            <div>
                <div className={styles.quantity}>
                    <span>Quantité</span>
                    <input
                        min={1}
                        onChange={handleChangeQuantity}
                        defaultValue={dt.quantity || 1}
                        type="number"
                    />
                </div>
                <div className={styles.variant}>
                    <span>Variant</span>
                    <MultiSelectElement
                        style={'confirmation'}
                        options={dt.variant ? FormatVariantOption(dt.allVariant) : []}
                        selected={FormatVariantOption(dt.variant)}
                        onChange={handleChangeVariant}
                    />
                </div>
            </div>
        </div>
    )
}
