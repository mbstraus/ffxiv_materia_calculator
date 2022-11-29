import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css'
import React, { useEffect, useState } from 'react';
import * as AWS from 'aws-sdk';
import configuration from './aws_config.js';
import { allocateMateria, determineTotalStats } from './MateriaCalculator.js';
import MateriaSlot from './components/MateriaSlot.js';
import AutomationStat from './components/AutomationStat.js';
import CharacterInfo from './components/CharacterInfo.js';

AWS.config.update(configuration);
const docClient = new AWS.DynamoDB.DocumentClient();

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

const defaultAutomationConfiguration = {
    control: { target: "3280", minimize: false, priority: 0 },
    craftsmanship: { target: "3700", minimize: false, priority: 1 },
    cp: { target: "564", minimize: true, priority: 2 },
    firstOvermeldRank: 10,
    overmeldRank: 9
}

function GetSortOrder(prop) {
    return function(a, b) {
        if (a[prop] > b[prop]) {
            return 1;
        } else if (a[prop] < b[prop]) {
            return -1;
        }
        return 0;
    }
}

function App() {
    const [ selectedJob, setSelectedJob ] = useState({});
    const [ hasSoulCrystal, setHasSoulCrystal ] = useState(false);
    const [ selectedGear, setSelectedGear ] = useState(defaultGear);
    const [ automationConfig, setAutomationConfig ] = useState(defaultAutomationConfiguration);
    const [ itemData, setItemData ] = useState([]);
    const [ materia, setMateria ] = useState([]);
    const [ jobs, setJobs ] = useState([]);
    useEffect(() => {
        docClient.scan({ TableName: "FFXIV_Items"}, function(err, data) {
            if (!err) {
                setItemData(data.Items.sort(GetSortOrder("name")));
            } else {
                console.log(err);
                return [];
            }
        });
    }, []);
    useEffect(() => {
        docClient.scan({ TableName: "FFXIV_Materia"}, function(err, data) {
            if (!err) {
                setMateria(data.Items.sort(GetSortOrder("name")));
            } else {
                console.log(err);
                return [];
            }
        });
    }, []);
    useEffect(() => {
        docClient.scan({ TableName: "FFXIV_Jobs"}, function(err, data) {
            if (!err) {
                setJobs(data.Items.sort(GetSortOrder("name")));
            } else {
                console.log(err);
                return [];
            }
        });
    }, []);

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
        <div className="App bg-secondary">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-6">
                        <div className="card text-bg-dark m-5">
                            <h5 className="card-header text-bg-primary">Character Info</h5>
                            <div className="card-body">
                                <CharacterInfo jobs={jobs} selectedJob={selectedJob} setSelectedJob={setSelectedJob} selectPatchItems={selectPatchItems} hasSoulCrystal={hasSoulCrystal} setHasSoulCrystal={setHasSoulCrystal} />
                            </div>
                        </div>
                        <div className="card text-bg-dark m-5">
                            <h5 className="card-header text-bg-primary">Gear</h5>
                            <div className="card-body">
                                <GearSelect gearList={itemData} materia={materia} equippedGear={selectedGear} setEquippedGear={setSelectedGear} selectedJob={selectedJob} />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card text-bg-dark m-5">
                            <h5 className="card-header text-bg-primary">Automations</h5>
                            <div className="card-body">
                                <CrafterAutomations automationConfig={automationConfig} setAutomationConfig={setAutomationConfig} selectedGear={selectedGear} setSelectedGear={setSelectedGear} selectedJob={selectedJob} hasSoulCrystal={hasSoulCrystal} materiaList={materia} />
                            </div>
                        </div>
                        <div className="card text-bg-dark m-5">
                            <h5 className="card-header text-bg-primary">Summary</h5>
                            <div className="card-body">
                                <CrafterSummary equippedGear={selectedGear} selectedJob={selectedJob} hasSoulCrystal={hasSoulCrystal} />
                            </div>
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

function CrafterAutomations( { automationConfig, setAutomationConfig, selectedGear, setSelectedGear, selectedJob, hasSoulCrystal, materiaList } ) {
    function setAutomationValue(value, stat, property) {
        let newAutomationConfig = JSON.parse(JSON.stringify(automationConfig));
        newAutomationConfig[stat][property] = value;
        setAutomationConfig(newAutomationConfig);
    }

    function setFirstOvermeldRank(value) {
        let newAutomationConfig = JSON.parse(JSON.stringify(automationConfig));
        newAutomationConfig.firstOvermeldRank = value;
        setAutomationConfig(newAutomationConfig);
    }

    function setOvermeldRank(value) {
        let newAutomationConfig = JSON.parse(JSON.stringify(automationConfig));
        newAutomationConfig.overmeldRank = value;
        setAutomationConfig(newAutomationConfig);
    }

    function allocateMateriaOnClick(e) {
        const materiaInfusedGear = allocateMateria(selectedGear, selectedJob, automationConfig, hasSoulCrystal, materiaList);
        setSelectedGear(materiaInfusedGear);
    }
    let automationStats = new Array((selectedJob && selectedJob.baseStats) ? Object.keys(selectedJob.baseStats).length : 0);
    if (selectedJob && selectedJob.baseStats) {
        Object.keys(selectedJob.baseStats).forEach((value, index) => {
            automationStats[automationConfig[value].priority] = (
                <AutomationStat key={"automation_stat_" + value} stat={value} automationConfig={automationConfig[value]} setAutomationValue={setAutomationValue} />
            );
        });
    }

    return (
        <div>
            {automationStats}
            <div className="row pt-2">
                <label htmlFor="firstOvermeldMateriaRank" className="text-start col-sm-3 col-form-label">First Overmeld Rank</label>
                <div className="col-sm-3">
                    <select id="firstOvermeldMateriaRank" className="form-select" onChange={(e) => setFirstOvermeldRank(e.target.value)} value={automationConfig.firstOvermeldRank}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
                </div>
            </div>
            <div className="row pt-2">
                <label htmlFor="overmeldMateriaRank" className="text-start col-sm-3 col-form-label">Overmeld Rank</label>
                <div className="col-sm-3">
                    <select id="overmeldMateriaRank" className="form-select" onChange={(e) => setOvermeldRank(e.target.value)} value={automationConfig.overmeldRank}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="7">7</option>
                        <option value="9">9</option>
                    </select>
                </div>
            </div>
            <div className="row pt-2">
                <button className="btn btn-sm btn-primary col-sm-4 m-1">Clear Materia</button>
                <button className="btn btn-sm btn-primary col-sm-4 m-1" onClick={allocateMateriaOnClick}>Maximize Materia</button>
            </div>
        </div>
    )
}

function CrafterSummary({ equippedGear, selectedJob, hasSoulCrystal }) {
    let calculatedStats = determineTotalStats(equippedGear, selectedJob, hasSoulCrystal);
    let statsDisplay = [];
    Object.keys(calculatedStats).forEach((value, index) => {
        statsDisplay.push(
            <div className="row">
                <label className="col text-start">{value}</label>
                <div className="col text-start">{calculatedStats[value]}</div>
            </div>
        );
    })
    return (
        <div>
            {statsDisplay}
        </div>
    );
}

export default App;
