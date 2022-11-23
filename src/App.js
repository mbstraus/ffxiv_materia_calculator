// To start client: npm start
// To start server: mvnw spring-boot:run


import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css'
import './App.css';
import { itemData } from './data/ItemData.js';
import { materia } from './data/Materia.js';
import { jobs } from './data/Jobs.js';
import React, { useState } from 'react';

const defaultGear = {
    Primary: { name: "" },
    Secondary: { name: "" },
    Head: { name: "" },
    Body: { name: "" },
    Hands: { name: "" },
    Legs: { name: "" },
    Feet: { name: "" },
    Earrings: { name: "" },
    Necklace: { name: "" },
    Bracelets: { name: "" },
    LeftRing: { name: "" },
    RightRing: { name: "" }
};

function App() {
    const [ selectedJob, setSelectedJob ] = useState({});
    const [ hasSoulCrystal, setHasSoulCrystal ] = useState(false);
    const [ selectedGear, setSelectedGear ] = useState(defaultGear);

    function selectPatchItems(e) {
        const patchNumber = e.target.value;
        if (!patchNumber) {
            setSelectedGear(defaultGear);
            return;
        }
        let newGear = JSON.parse(JSON.stringify(defaultGear));
        for (let slot of Object.keys(selectedGear)) {
            let filteredItems = itemData.filter((item) => item.patch === patchNumber && (item.slot === slot || (item.slot === "Ring" && (slot === "LeftRing" || slot === "RightRing"))));
            let itemToSelect = filteredItems.find((item) => item.jobs.includes(selectedJob.code));
            if (itemToSelect) {
                newGear[slot] = JSON.parse(JSON.stringify(itemToSelect));
            }
        }
        setSelectedGear(newGear);
    }

    return (
        <div className="App">
            <div className="row">
                <div className="col-md-6">
                    <div className="card m-5">
                        <div className="card-header">Character Info</div>
                        <div className="card-body">
                            <CharacterInfo selectedJob={selectedJob} setSelectedJob={setSelectedJob} selectPatchItems={selectPatchItems} hasSoulCrystal={hasSoulCrystal} setHasSoulCrystal={setHasSoulCrystal} />
                        </div>
                    </div>
                    <div className="card m-5">
                        <div className="card-header">Gear</div>
                        <div className="card-body">
                            <GearSelect gearList={itemData} materia={materia} equippedGear={selectedGear} setEquippedGear={setSelectedGear} selectedJob={selectedJob} />
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card m-5">
                        <div className="card-header">Automations</div>
                        <div className="card-body">
                            <CrafterAutomations />
                        </div>
                    </div>
                    <div className="card m-5">
                        <div className="card-header">Summary</div>
                        <div className="card-body">
                            <CrafterSummary equippedGear={selectedGear} selectedJob={selectedJob} hasSoulCrystal={hasSoulCrystal} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GearSelect({ gearList, materia, equippedGear, setEquippedGear, selectedJob }) {

    function selectGearForSlot(item, slot) {
        let modifiedEquippedGear = JSON.parse(JSON.stringify(equippedGear));
        modifiedEquippedGear[slot] = item;
        setEquippedGear(modifiedEquippedGear);
    }

    function selectMateriaForSlot(item, materiaIndex, slot) {
        let modifiedEquippedGear = JSON.parse(JSON.stringify(equippedGear));
        let slotItem = modifiedEquippedGear[slot];
        if (!slotItem.materia) {
            slotItem.materia = new Array(5);
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

    let calculatedStats = { control: 0, craftsmanship: 0, cp: 0 };
    let statMaximums = { control: 0, craftsmanship: 0, cp: 0 };
    if (equippedItem && equippedItem.name) {
        statMaximums.control = equippedItem.control.meldMax;
        statMaximums.craftsmanship = equippedItem.craftsmanship.meldMax;
        statMaximums.cp = equippedItem.cp.meldMax;
        calculatedStats.control = equippedItem.control.hq;
        calculatedStats.craftsmanship = equippedItem.craftsmanship.hq;
        calculatedStats.cp = equippedItem.cp.hq;
        if (equippedItem.materia) {
            for (let m of equippedItem.materia) {
                if (m && m.value) {
                    calculatedStats[m.stat] = Math.min(statMaximums[m.stat], calculatedStats[m.stat] + m.value);
                }
            }
        }
    }

    let restrictedMateriaStartIndex = equippedItem.normalMeldSlots + 1;
    let materiaSlots = [];
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

    return (
        <div className="row border">
            <label className="col-md-2 col-form-label">{slot}</label>
            <div className="col-md-7">
                <div className="container-fluid">
                    <div className="row">
                        <label className="col-md-2 col-form-label text-end">Item</label>
                        <div className="col-md-10">
                            <select value={equippedItem.name} className="w-100 form-control" onChange={setSelectedItem}>
                                <option value="">Select an item</option>
                                {slotOptions}
                            </select>
                        </div>
                    </div>
                    {materiaSlots}
                </div>
            </div>
            <div className="col-md-3">
                <div className="row">
                    <label className="col text-start">Control</label>
                    <div className="col text-end">{calculatedStats.control} / {statMaximums.control}</div>
                </div>
                <div className="row">
                    <label className="col text-start">Craftsmanship</label>
                    <div className="col text-end">{calculatedStats.craftsmanship} / {statMaximums.craftsmanship}</div>
                </div>
                <div className="row">
                    <label className="col text-start">CP</label>
                    <div className="col text-end">{calculatedStats.cp} / {statMaximums.cp}</div>
                </div>
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
        <div className="row">
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

function CrafterAutomations() {
    return (
        <div>
            <div className="row">
                <label htmlFor="targetControl" className="col-sm-1 col-form-label">Control</label>
                <div className="col-sm-3">
                    <input type="text" className="form-control" id="targetControl" placeholder="9999" />
                </div>
                <label htmlFor="targetCraftsmanship" className="col-sm-2 col-form-label">Craftsmanship</label>
                <div className="col-sm-2">
                    <input type="text" className="form-control" id="targetControl" placeholder="9999" />
                </div>
                <label htmlFor="targetCraftsmanship" className="col-sm-1 col-form-label">CP</label>
                <div className="col-sm-3">
                    <input type="text" className="form-control" id="targetControl" placeholder="9999" />
                </div>
            </div>
            <div className="row">
                <button className="btn btn-sm btn-primary col-sm-4 m-1">Clear Materia</button>
                <button className="btn btn-sm btn-primary col-sm-4 m-1">Maximize Materia</button>
            </div>
        </div>
    )
}

function CrafterSummary({ equippedGear, selectedJob, hasSoulCrystal }) {
    let control = selectedJob && selectedJob.baseStats ? selectedJob.baseStats.control : 0;
    let craftsmanship = selectedJob && selectedJob.baseStats ? selectedJob.baseStats.craftsmanship : 0;
    let cp = selectedJob && selectedJob.baseStats ? selectedJob.baseStats.cp : 0;
    for (let slot of Object.keys(equippedGear)) {
        let gear = equippedGear[slot];
        if (gear && gear.name) {
            control += gear.control.hq;
            craftsmanship += gear.craftsmanship.hq;
            cp += gear.cp.hq;
        }
    }
    if (hasSoulCrystal) {
        control += 20;
        craftsmanship += 20;
        cp += 15;
    }


    return (
        <div>
            <div className="row">
                <label className="col text-start col-sm-2">Control</label>
                <div className="col text-start">{control}</div>
            </div>
            <div className="row">
                <label className="col text-start col-sm-2">Craftsmanship</label>
                <div className="col text-start">{craftsmanship}</div>
            </div>
            <div className="row">
                <label className="col text-start col-sm-2">CP</label>
                <div className="col text-start">{cp}</div>
            </div>
        </div>
    );
}

function CharacterInfo({ selectedJob, setSelectedJob, selectPatchItems, hasSoulCrystal, setHasSoulCrystal }) {

    const jobOptions = jobs.map((item, index) => {
        return <option value={item.code} key={item.code}>{item.name} ({item.code})</option>
    });

    function selectJob(e) {
        let job = jobs.find((entry) => entry.code === e.target.value);
        setSelectedJob(job);
    }

    return (
        <div>
            <div className="row">
                <label className="col text-start col-sm-2">Job</label>
                <select className="col text-start col-sm-4" value={selectedJob.code} onChange={selectJob}>
                    <option>Select a job</option>
                    {jobOptions}
                </select>
            </div>
            {selectedJob.name && (
                <div className="row">
                    <label className="col text-start col-sm-2">Patch</label>
                    <select className="col text-start col-sm-4" onChange={selectPatchItems}>
                        <option>Select a patch</option>
                        <option>6.0</option>
                        <option>6.3</option>
                    </select>
                </div>
            )}
            {selectedJob.category === "DoH" && (
                <div className="row">
                    <label className="col text-start col-sm-2">Has Soul Crystal</label>
                    <input className="col col-sm-4 form-check-input" type="checkbox" value={hasSoulCrystal} onChange={(e) => setHasSoulCrystal(e.target.checked)}></input>
                </div>
            )}
        </div>
    );
}

export default App;
