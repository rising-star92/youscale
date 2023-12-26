import React, { useState } from 'react';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import 'react-calendar/dist/Calendar.css';
import './DateStyle.css'

interface CustomDateRangePickerProps {
    setDate?: React.Dispatch<React.SetStateAction<string[]>>,
    setUsingDate?: React.Dispatch<React.SetStateAction<boolean>>
}
export default function CustumDateRangePicker({ setDate, setUsingDate }: CustomDateRangePickerProps) {
    const [value, setValue] = useState<any>([new Date(), new Date()]);

    return (
        <DateRangePicker
            closeCalendar={true}
            format={'dd-MM-y'}
            className={'calendar-custom'}
            onChange={(val: any) => {
                if (val === null) window.location.reload()

                var dateFrom = val[0].toISOString().slice(0, 10)
                var dateTo = val[1].toISOString().slice(0, 10)
                
                setDate && setDate([dateFrom, dateTo])
                setValue(val)
                setUsingDate && setUsingDate(true)
            }}
            value={value}
        />
    )
}
