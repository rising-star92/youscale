import React from 'react'
import { useGetClientAccountQuery } from '../../../services/api/ClientApi/ClientAccountApi'

export const Account = (): JSX.Element => {

    const { data } = useGetClientAccountQuery()

    return (
        <div className="row">
            <div className="col-xl-3 col-xxl-6 col-lg-6 col-sm-6">
                <div className="widget-stat card">
                    <div className="card-body  p-4">
                        <div className="media ai-icon">
                            <span className="me-3 bgl-danger text-danger">
                                <svg
                                    id="icon-revenue"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width={30}
                                    height={30}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="feather feather-dollar-sign"
                                >
                                    <line x1={12} y1={1} x2={12} y2={23} />
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                            </span>
                            <div className="media-body">
                                <p className="mb-1">Solde</p>
                                <h4 className="mb-0">{data?.data.solde || 0} dhs</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-xl-3 col-xxl-6 col-lg-6 col-sm-6">
                <div className="widget-stat card bg-danger">
                    <div className="card-body  p-4">
                        <div className="media">
                            <span className="me-3">
                                <i className="flaticon-381-calendar-1" />
                            </span>
                            <div className="media-body text-white text-end">
                                <p className="mb-1">Montant du</p>
                                <h3 className="text-white">{data?.data.montant_du || 0} dhs</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}