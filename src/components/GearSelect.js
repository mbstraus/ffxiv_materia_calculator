export default function GearSelect({ gearList, materia, equippedGear, setEquippedGear, selectedJob }) {

    function selectGearForSlot(item, slot) {
        let modifiedEquippedGear = JSON.parse(JSON.stringify(equippedGear));
        modifiedEquippedGear[slot] = item;
        setEquippedGear(modifiedEquippedGear);
    }

    function selectMateriaForSlot(item, materiaIndex, slot) {
        let modifiedEquippedGear = JSON.parse(JSON.stringify(equippedGear));
        let slotItem = modifiedEquippedGear[slot];
        if (!slotItem.materia) {
            slotItem.materia = new Array(slotItem.materiaSlots);
        }
        slotItem.materia[materiaIndex] = item;
        setEquippedGear(modifiedEquippedGear);
    }

    return (
        <div className="container-fluid">
            <GearSlot slot="Primary" gearList={gearList} materia={materia} equippedItem={equippedGear.Primary} selectedJob={selectedJob} selectGearForSlot={selectGearForSlot} setEquippedGearMateria={selectMateriaForSlot} />
            <GearSlot slot="Secondary" gearList={gearList} materia={materia} equippedItem={equippedGear.Secondary} selectedJob={selectedJob} selectGearForSlot={selectGearForSlot} setEquippedGearMateria={selectMateriaForSlot} />
            <GearSlot slot="Head" gearList={gearList} materia={materia} equippedItem={equippedGear.Head} selectedJob={selectedJob} selectGearForSlot={selectGearForSlot} setEquippedGearMateria={selectMateriaForSlot} />
            <GearSlot slot="Body" gearList={gearList} materia={materia} equippedItem={equippedGear.Body} selectedJob={selectedJob} selectGearForSlot={selectGearForSlot} setEquippedGearMateria={selectMateriaForSlot} />
            <GearSlot slot="Hands" gearList={gearList} materia={materia} equippedItem={equippedGear.Hands} selectedJob={selectedJob} selectGearForSlot={selectGearForSlot} setEquippedGearMateria={selectMateriaForSlot} />
            <GearSlot slot="Legs" gearList={gearList} materia={materia} equippedItem={equippedGear.Legs} selectedJob={selectedJob} selectGearForSlot={selectGearForSlot} setEquippedGearMateria={selectMateriaForSlot} />
            <GearSlot slot="Feet" gearList={gearList} materia={materia} equippedItem={equippedGear.Feet} selectedJob={selectedJob} selectGearForSlot={selectGearForSlot} setEquippedGearMateria={selectMateriaForSlot} />
            <GearSlot slot="Earrings" gearList={gearList} materia={materia} equippedItem={equippedGear.Earrings} selectedJob={selectedJob} selectGearForSlot={selectGearForSlot} setEquippedGearMateria={selectMateriaForSlot} />
            <GearSlot slot="Necklace" gearList={gearList} materia={materia} equippedItem={equippedGear.Necklace} selectedJob={selectedJob} selectGearForSlot={selectGearForSlot} setEquippedGearMateria={selectMateriaForSlot} />
            <GearSlot slot="Bracelets" gearList={gearList} materia={materia} equippedItem={equippedGear.Bracelets} selectedJob={selectedJob} selectGearForSlot={selectGearForSlot} setEquippedGearMateria={selectMateriaForSlot} />
            <GearSlot slot="LeftRing" gearList={gearList} materia={materia} equippedItem={equippedGear.LeftRing} selectedJob={selectedJob} selectGearForSlot={selectGearForSlot} setEquippedGearMateria={selectMateriaForSlot} />
            <GearSlot slot="RightRing" gearList={gearList} materia={materia} equippedItem={equippedGear.RightRing} selectedJob={selectedJob} selectGearForSlot={selectGearForSlot} setEquippedGearMateria={selectMateriaForSlot} />
        </div>
    )
}

function GearSlot({ slot, gearList, materia, equippedItem, selectedJob, selectGearForSlot, setEquippedGearMateria }) {
    if (!gearList || !gearList.map || gearList.length === 0) {
        return "";
    }
    let slotOptions = gearList.map((item, index) => {
        if ((item.slot === slot || (item.slot === "Ring" && (slot === "LeftRing" || slot === "RightRing"))) && item.jobs.includes(selectedJob.code)) {
            return <option key={item.name} value={item.name}>{item.name}</option>
        }
        return "";
    });

    function setSelectedItem(e) {
        let item = gearList.find((i) => i.name === e.target.value);
        selectGearForSlot(item, slot);
    }

    function setMateriaOnItem(e, materiaIndex) {
        let selectedMateria = materia.find((i) => i.name === e.target.value);
        setEquippedGearMateria(selectedMateria, materiaIndex, slot);
    }

    let calculatedStats = {};
    let statMaximums = {};
    let statDisplay = [];
    if (equippedItem && equippedItem.name) {
        Object.keys(equippedItem.stats).forEach((value, index) => {
            statMaximums[value] = equippedItem.stats[value].meldMax;
            calculatedStats[value] = equippedItem.stats[value].value;
            if (equippedItem.materia) {
                for (let m of equippedItem.materia) {
                    if (m && m.value && m.stat === value) {
                        calculatedStats[value] = Math.min(statMaximums[value], calculatedStats[value] + m.value);
                    }
                }
            }
            statDisplay.push(
                <div className="row" key={value}>
                    <label className="col text-start">{value}</label>
                    <div className="col text-end">{calculatedStats[value]} / {statMaximums[value]}</div>
                </div>
            );
        });
    }
    
    let materiaSlots = [];
    if (equippedItem && equippedItem.normalMeldSlots) {
        let restrictedMateriaStartIndex = equippedItem.normalMeldSlots + 1;
        if (equippedItem && equippedItem.name) {
            for (let i = 0; i < equippedItem.materiaSlots; i++) {
                materiaSlots.push(
                    <MateriaSlot key={i}
                        slotIndex={i + 1}
                        materia={materia}
                        selectedMateria={(equippedItem && equippedItem.materia) ? equippedItem.materia[i] : {}}
                        setMateriaOnItem={setMateriaOnItem}
                        restrictMateria={restrictedMateriaStartIndex < (i + 1)} />
                )
            }
        }
    }

    return (
        <div className="row border">
            <label className="col-md-2 col-form-label">{slot}</label>
            <div className="col-md-7">
                <div className="container-fluid">
                    <div className="row pt-2 pb-2">
                        <label className="col-md-2 col-form-label text-end">Item</label>
                        <div className="col-md-10">
                            <select value={equippedItem ? equippedItem.name : ""} className="w-100 form-control" onChange={setSelectedItem}>
                                <option value="">Select an item</option>
                                {slotOptions}
                            </select>
                        </div>
                    </div>
                    {materiaSlots}
                </div>
            </div>
            <div className="col-md-3">
                {statDisplay}
            </div>
        </div>
    );
}

function MateriaSlot({ slotIndex, materia, selectedMateria, setMateriaOnItem, restrictMateria }) {
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