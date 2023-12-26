import React from 'react'
import { Performance } from '../../../models'
import styles from './team.module.css'

interface Props {
    children: JSX.Element
    setPerformance: React.Dispatch<React.SetStateAction<Performance | undefined>>
    perf: Performance | undefined
    perf_rate: Performance | undefined
}
export default function PerformanceCard({ children, setPerformance, perf, perf_rate }: Props) {
    return (
        <div className="col-xl-5 col-lg-6">
            <div className="card">
                <div className="card-header">
                    <h4 className={styles.teamTitle}>Performance</h4>
                    <div className="card-tabs mt-3 mt-sm-0">
                        <ul className="nav nav-tabs" role="tablist">
                            <li className="nav-item">
                                <a
                                    className="nav-link active"
                                    data-bs-toggle="tab"
                                    href="#Order"
                                    role="tab"
                                    onClick={() => setPerformance(perf)}
                                >
                                    Performance
                                </a>
                            </li>
                            <li className="nav-item">
                                <a
                                    className="nav-link"
                                    data-bs-toggle="tab"
                                    href="#Rate"
                                    role="tab"
                                    onClick={()=> setPerformance(perf_rate)}
                                >
                                    Rate
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="card-body">
                    {children}
                </div>
            </div>
        </div>
    )
}
