import { useState } from "react";
import NavBar from "./navBar";
import "./patient_table.css"

export default function FilterableTable() {
  // Sample JSON-like dictionary
  const initialData  = [
    { id: 1, name: "Item A", type: "Fruit", price: 2 },
    { id: 2, name: "Item B", type: "Vegetable", price: 4 },
    { id: 3, name: "Item C", type: "Fruit", price: 3 },
    { id: 4, name: "Item D", type: "Dairy", price: 5 },
    { id: 5, name: "Item E", type: "Vegetable", price: 6 },
  ];

  const [data, setData] = useState(initialData);
  const [filter, setFilter] = useState("All");
  const [editingCell, setEditingCell] = useState(null); // {rowId, field}
  const [editedData, setEditedData] = useState({});

  // Apply filter
  const types = [...new Set(data.map((item) => item.type))];
  const filteredData =
    filter === "All" ? data : data.filter((item) => item.type === filter);

  let person = {
        name:"امیر",
        number:"09338666836"
    }



  // Handle editing
  const handleDoubleClick = (rowId, field, value) => {
    setEditingCell({ rowId, field });
    setEditedData({ ...editedData, [rowId]: { ...editedData[rowId], [field]: value } });
  };

  const handleChange = (e, rowId, field) => {
    setEditedData({
      ...editedData,
      [rowId]: { ...editedData[rowId], [field]: e.target.value },
    });
  };

  const handleSave = () => {
    const updatedData = data.map((row) =>
      editedData[row.id] ? { ...row, ...editedData[row.id] } : row
    );
    setData(updatedData);
    setEditingCell(null);
    setEditedData({});
    console.log("Saving to DB:", updatedData); // simulate DB save
  };


  return (
    <>
    <NavBar account={person}></NavBar>
    <div className="total_patients_holder">
      {/* Filter Dropdown */}
      <div className="filter_holder">
        <div className="select_filter">
        <label className="label_title">فیلتر وضعیت</label>
        <select
          className="select_options"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        </div>
        <button
          onClick={handleSave}
          className="btn_question"
        >
          ذخیره تغییرات
        </button>
        <p>برای تغییر دادن هر فیلد دابل کلیک کنید . </p>
      </div>

      {/* Table */}
      <div className="table_holder lower_width">
      <table border="0.5" cellSpacing="0" cellPadding="8" dir="ltr">
        <thead className="sar_jadval">
          <tr>
            <th>وضعیت</th>
            <th>نام</th>
            <th>سن</th>
            <th>وزن</th>
          </tr>
        </thead>
        <tbody>
        {filteredData.map((row) => (
            <tr key={row.id}>
              {["id", "name", "type", "price"].map((field) => (
                <td
                  className="cell_choose"
                  key={field}
                  onDoubleClick={() => handleDoubleClick(row.id, field, row[field])}
                >
                  {editingCell?.rowId === row.id && editingCell?.field === field ? (
                    <input
                      type="text"
                      value={
                        editedData[row.id]?.[field] !== undefined
                          ? editedData[row.id][field]
                          : row[field]
                      }
                      onChange={(e) => handleChange(e, row.id, field)}
                      className="w-full border rounded p-1"
                      autoFocus
                    />
                  ) : (
                    row[field]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
    </>

  );
}
