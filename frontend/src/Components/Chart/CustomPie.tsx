import React from "react";
import { Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface ChartProps {
    data : any,
    options : any
}

export default function CustomPie(props: ChartProps): JSX.Element {
    const { data, options } = props
    return (
        <Pie data={data} options={options} />
    );
}