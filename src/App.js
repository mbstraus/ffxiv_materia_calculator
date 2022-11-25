import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css'
import React, { useEffect, useState } from 'react';
import * as AWS from 'aws-sdk';

const configuration = {
    region: "us-west-2",
    secretAccessKey: "fgcWpnewBlLNRp+e18ZgoPfjWQ4rZdbN8PNoGjoY",
    accessKeyId: "AKIAUNIJCUO76TGRMIZ3"
};

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
    RightRing: { name: "" },
    Food: { name: "" }
};

const defaultAutomationConfiguration = {
    control: { target: "3280", minimize: false, priority: 0 },
    craftsmanship: { target: "3700", minimize: true, priority: 1 },
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
                                <CrafterAutomations automationConfig={automationConfig} setAutomationConfig={setAutomationConfig} />
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
                    <div className="row pt-2 pb-2">
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

function CrafterAutomations( { automationConfig, setAutomationConfig } ) {
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

    return (
        <div>
            <AutomationStat stat="control" automationConfig={automationConfig.control} setAutomationValue={setAutomationValue} />
            <AutomationStat stat="craftsmanship" automationConfig={automationConfig.craftsmanship} setAutomationValue={setAutomationValue} />
            <AutomationStat stat="cp" automationConfig={automationConfig.cp} setAutomationValue={setAutomationValue} />
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
                <button className="btn btn-sm btn-primary col-sm-4 m-1">Maximize Materia</button>
            </div>
        </div>
    )
}

function AutomationStat( { stat, automationConfig, setAutomationValue } ) {
    return (
        <div className="row pt-2">
            <div className="col-sm-1">
                <i className="bi bi-chevron-expand"></i>
            </div>
            <label htmlFor={"target_" + stat} className="text-start col-sm-2 col-form-label">{stat}</label>
            <div className="col-sm-3">
                <input id={"target_" + stat} type="number" className="form-control" value={automationConfig.target} onChange={(e) => setAutomationValue(e.target.value, stat, "target")} />
            </div>
            <label htmlFor={"minimize_" + stat} className="text-start col-sm-2">Minimize?</label>
            <div className="col-sm-1">
                <input id={"minimize_" + stat} className="form-check-input" type="checkbox" checked={automationConfig.minimize} onChange={(e) => setAutomationValue(e.target.checked, stat, "minimize")}></input>
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
                <label className="col text-start">Control</label>
                <div className="col text-start">{control}</div>
            </div>
            <div className="row">
                <label className="col text-start">Craftsmanship</label>
                <div className="col text-start">{craftsmanship}</div>
            </div>
            <div className="row">
                <label className="col text-start">CP</label>
                <div className="col text-start">{cp}</div>
            </div>
        </div>
    );
}

function CharacterInfo({ jobs, selectedJob, setSelectedJob, selectPatchItems, hasSoulCrystal, setHasSoulCrystal }) {

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
                <label htmlFor="characterJob" className="text-start col-sm-2">Job</label>
                <div className="col-sm-4">
                    <select id="characterJob" className="form-select" value={selectedJob.code} onChange={selectJob}>
                        <option>Select a job</option>
                        {jobOptions}
                    </select>
                </div>
            </div>
            {selectedJob.name && (
                <div className="row">
                    <label htmlFor="patch" className="text-start col-sm-2">Patch</label>
                    <div className="col-sm-4">
                        <select id="patch" className="form-select" onChange={selectPatchItems}>
                            <option>Select a patch</option>
                            <option>6.0</option>
                            <option>6.3</option>
                        </select>
                    </div>
                </div>
            )}
            {selectedJob.category === "DoH" && (
                <div className="row">
                    <label htmlFor="soulCrystal" className="col text-start col-sm-2">Has Soul Crystal</label>
                    <div className="col-sm-4">
                        <input id="soulCrystal" className="form-check-input" type="checkbox" checked={hasSoulCrystal} onChange={(e) => setHasSoulCrystal(e.target.checked)}></input>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
