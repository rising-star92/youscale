export const ORDER_STATS_DATA = {
    labels: [
        "Delivred",
        "Pending",
        "Cancelled"
    ],
    datasets: [
        {
            label: "Local",
            data: [164, 85, 91],
            fill: true,
            backgroundColor: ["#43A047", "#F68407", "#E53935"],
        }
    ],
};

export const PERFORMANCE_STATS_DATA = {
    "labels": [
        "deleted",
        "Errone",
        "Nouveau",
        "delete",
        "Confirme",
        "Expedie",
        "Injoignable",
        "Reporte",
        "Livre",
        "zakaria214",
        "zakaria",
        "zakaria56",
        "oumar13",
        "Zakariaoio",
        "zakari56",
        "R->nouveau",
        "hors zone"
    ],
    "datasets": [
        {
            "label": "Performance",
            "data": [
                1,
                1,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
            ],
            "fill": true,
            "backgroundColor": [
                "rgb(91,155,213)"
            ]
        }
    ]
}

export const EARNING_STATS_DATA = {
    "labels": [
        "2023-01-01",
        "2023-02-01",
        "2023-03-01",
        "2023-04-01",
        "2023-05-01",
        "2023-06-01",
        "2023-07-01",
        "2023-08-01",
        "2023-09-01",
        "2023-10-01",
        "2023-11-01",
        "2023-12-01"
    ],
    "datasets": [
        {
            "label": "Earning",
            "data": [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
            ],
            "fill": false,
            "borderColor": "rgb(75, 192, 192)",
            "tension": 0.1
        }
    ]
}

export const DATA_LINE = {
    labels: ["03/01", "04/01", "05/01", "06/01", "07/01", "08/01", "09/01", "10/01", "11/01", "12/01"],
    datasets: [{
        label: 'Delivred',
        data: [65, 59, 80, 81, 56, 55, 40, 10, 23, 34],
        fill: false,
        borderColor: '#43A047',
        tension: 0.3
    },
    {
        label: 'Pending',
        data: [10, 32, 45, 53, 64, 6, 23, 43, 36, 21],
        fill: false,
        borderColor: 'rgba(250, 182, 35, 0.5)',
        tension: 0.3
    },
    {
        label: 'Canceled',
        data: [80, 75, 78, 20, 15, 35, 66, 9, 56, 48],
        fill: false,
        borderColor: '#E53935',
        tension: 0.3
    },
    ]
}

export const INCOMES_EXPENSES_DATA = {
    labels: ["03/01", "04/01", "05/01", "06/01", "07/01", "08/01", "09/01"],
    datasets: [{
        label: 'Incomes',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        backgroundColor: '#3A974C',
        tension: 0.3
    },
    {
        label: 'Expenses',
        data: [10, 32, 45, 53, 64, 6, 23],
        fill: false,
        backgroundColor: '#E53935',
        tension: 0.3
    }
    ]
}