import React from "react";
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface CustomHistProps{
    data : any,
    options:any
}

function CustomHist({ data, options }: CustomHistProps) {

  return (
    <React.Fragment>
        <Bar data={data} options={options} />
    </React.Fragment>
  )
}


export default CustomHist;