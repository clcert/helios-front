import { useEffect, useState } from "react";
import ColumnPsifosTable from "./ColumnPsifosTable";

function StyledCell({
  column, 
  content
}) {
  content = column == "column0" ? content.split(",")[0] : content
  var percentageBackground = "";
  if (content.toString().includes("%")) {
    let color = "#a5a5ffc4";
    let amount = content.replace(",", ".").split("%")[0]
    percentageBackground = "linear-gradient(90deg," + color + " " + amount + "%, white 0%)";
  }
  return (
    <td
      style={{
        width: "180px", wordBreak: "break-word", background: percentageBackground
      }}
      className={
        typeof content === 'number' || !isNaN(parseInt(content))
        ? "has-text-right"
        : "has-text-centered"
      }
    >
      {content}
    </td>
  )
}

function PsifosTable({ data, election }) {
  const [tableData, setTableData] = useState(data);
  const [ordenamiento, setOrdenamiento] = useState({
    column: null,
    ascendente: true,
  });

  const arbitraryEl = tableData[0];
  const dataKeys = Object.keys(arbitraryEl);
  const intDataKeys = dataKeys.filter(
    (item) => typeof arbitraryEl[item] === "number"
  );

  useEffect(() => {
    setTableData(data);
  }, [data])
  return (
    <table className="pretty table is-hoverable voters-table">
      <thead>
        <tr>
          {dataKeys.map((row, index) => (
            <ColumnPsifosTable
              key={index}
              index={index}
              nameRow={row}
              data={data}
              hideZeros={intDataKeys.includes(row)}
              setFilteredData={(d) => setTableData(d)}
              ordenamiento={ordenamiento}
              setOrdenamiento={(newOrdenamiento) =>
                setOrdenamiento(newOrdenamiento)
              }
            />
          ))}
        </tr>
      </thead>
      <tbody>
        {tableData.map((fila, index) => {
          return (
            <tr key={index}>
              {dataKeys.map((row, indexRow) => (
                <StyledCell
                  column={`column${indexRow}`}
                  content={election.normalized && indexRow === 1
                    ? parseFloat((fila[row] / election.max_weight)).toString().replace(".", ",")
                    : (indexRow === 2 ? fila[row].replace(".", ",") : fila[row])}
                />
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default PsifosTable;
