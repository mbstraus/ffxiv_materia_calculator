export default function MateriaSlot({ slotIndex, materia, selectedMateria, setMateriaOnItem, restrictMateria }) {
    let materiaList = materia.map((item, index) => {
        if (restrictMateria && item.restricted) {
            return "";
        }
        return <option key={item.name} value={item.name}>{item.name} ({item.stat} + {item.value})</option>
    });
    return (
        <div className="row pb-2">
            <label className="col-sm-2 col-form-label text-end">Materia {slotIndex}</label>
            <div className="col-sm-6">
                <select className="form-control" onChange={(e) => setMateriaOnItem(e, slotIndex - 1)} value={selectedMateria ? selectedMateria.name : ""}>
                    <option>No materia selected</option>
                    {materiaList}
                </select>
            </div>
            <div className="col-sm-4 text-start">
                {(selectedMateria && selectedMateria.name) ? selectedMateria.stat + " + " + selectedMateria.value : "N/A"}
            </div>
        </div>
    )
}
