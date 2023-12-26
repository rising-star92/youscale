import React from "react";
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface CustomLineProps{
    data: any,
    options: any
}

export default function CustomLine({ data, options }: CustomLineProps): JSX.Element {
    return (
        <Line style={{width:'80px',height:'80px'}} data={data} options={options} />
    );
}