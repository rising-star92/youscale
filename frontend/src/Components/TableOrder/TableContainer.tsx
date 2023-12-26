import style from './table.module.css'
import InfiniteScroll from 'react-infinite-scroll-component';

function truncateString(str: string, maxLength: number) {
    if (str.length > maxLength) {
        return str.slice(0, maxLength - 3) + '...';
    } else {
        return str;
    }
}

interface Props {
    column: string[]
    handleCheckAll: () => void
    children: JSX.Element | JSX.Element[]
    dataLength: number
    fetchData: () => Promise<void>
}
export default function TableContainer({ column, handleCheckAll, children, dataLength, fetchData }: Props) {
    return (
        <div>
            <InfiniteScroll
                className={style.tableContainer}
                dataLength={dataLength}
                next={fetchData}
                hasMore={true} // Replace with a condition based on your data source
                loader
                height={450}
                endMessage={
                  <p style={{ textAlign: "center" }}>
                    <b>Yay! You have seen it all</b>
                  </p>
                }
            >
                <table className={style.table}>
                    <thead>
                        <Column column={column} handleCheckAll={handleCheckAll} />
                    </thead>
                    <tbody>
                        {children}
                    </tbody>
                </table>
            </InfiniteScroll>
        </div>
    )
}

interface ColumnProps {
    column: string[]
    handleCheckAll: () => void
}
const Column = ({ column, handleCheckAll }: ColumnProps): JSX.Element => {
    return (
        <tr>
            <th>
                <input
                    type="checkbox"
                    className={style.checkbox}
                    onChange={handleCheckAll}
                />
            </th>
            {column.map((col: string, key: number) => <th key={key}>{truncateString(col, 15)}</th>)}
        </tr>
    )
}