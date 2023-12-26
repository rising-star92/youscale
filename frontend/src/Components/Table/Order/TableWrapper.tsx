import { OrderQueryModel, StatusModel, countOrderByStatusModel } from '../../../models';
import { DisplayStatusBottom } from './Display';

function truncateString(str: string, maxLength: number) {
    if (str.length > maxLength) {
        return str.slice(0, maxLength - 3) + '...';
    } else {
        return str;
    }
}

interface Props {
    children: JSX.Element | JSX.Element[]
    column: string[]
    setStatus: React.Dispatch<React.SetStateAction<string | undefined>>
    handleCheckAll: () => void
    dataStatus: {
        code: Number;
        data: StatusModel[];
        countOrderByStatus: countOrderByStatusModel[];
    } | undefined
    setOrderQueryData: React.Dispatch<React.SetStateAction<OrderQueryModel>>
    refetch: () => any
}
export default function TableWrapper({ children, column, handleCheckAll, dataStatus, setStatus, setOrderQueryData, refetch }: Props): JSX.Element {
    var scl = document.getElementsByClassName('table-responsive')[0]

    document.onkeydown = checkKey;

    function checkKey(e: any) {

        e = e || window.event;

        if (e.keyCode == '38') {
            // up arrow
        }
        else if (e.keyCode == '40') {
            // down arrow
        }
        else if (e.keyCode == '37') {
            scl.scrollLeft -= 200
        }
        else if (e.keyCode == '39') {
            scl.scrollLeft += 200
        }

    }

    return (
        <div className="card-body">
            <div className="table-responsive responsive-cus">

                <table id="example3" className="table table-responsive-sm display table-custum">
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    className="check_all"
                                    onChange={handleCheckAll}
                                />
                            </th>
                            {column.map((col: string, key: number) => <th key={key}>{truncateString(col, 15)}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {children}
                    </tbody>
                </table>
                <DisplayStatusBottom 
                    dataStatus={dataStatus} 
                    setStatus={setStatus} 
                    setOrderQueryData={setOrderQueryData}
                    refetch={refetch}
                />
            </div>
        </div>
    )
}
