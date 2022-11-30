const slotPriority = [ "Head", "Body", "Hands", "Legs", "Feet", "Earrings", "Necklace", "Bracelets", "LeftRing", "RightRing", "Primary", "Secondary" ]

function allocateMateria(selectedGear, selectedJob, automationConfig, hasSoulCrystal, materiaList) {
    let materiaInfusedGear = JSON.parse(JSON.stringify(selectedGear));

    let calculatedStats = determineTotalStats(materiaInfusedGear, selectedJob, hasSoulCrystal, true);

    // First, assign the highest value materia that will fit within the meld max for all of the normal meld slots
    for (let gearSlot of slotPriority) {
        let gearItem = materiaInfusedGear[gearSlot];
        for (let i = 0; i < gearItem.normalMeldSlots; i++) {
            let materiaForSlot = determineMateria(gearItem, 10, automationConfig, calculatedStats, materiaList, false);
            if (materiaForSlot) {
                gearItem.materia[i] = materiaForSlot;
                calculatedStats = determineTotalStats(materiaInfusedGear, selectedJob, hasSoulCrystal, false);
            }
        }
    }

    // Starting with the armor, go through the first overmeld slot and fill that in with the highest allowed materia
    for (let gearSlot of slotPriority) {
        if (!automationConfig.overmeldWeapon && (gearSlot === "Primary" || gearSlot === "Secondary")) {
            continue;
        }
        let gearItem = materiaInfusedGear[gearSlot];
        let materiaForSlot = determineMateria(gearItem, new Number(automationConfig.firstOvermeldRank), automationConfig, calculatedStats, materiaList, false);
        if (materiaForSlot) {
            gearItem.materia[gearItem.normalMeldSlots] = materiaForSlot; // array is zero based, meld slots value is 1 based
            calculatedStats = determineTotalStats(materiaInfusedGear, selectedJob, hasSoulCrystal, false);
        }
    }

    // Finally, fill in the remainder of the overmeld slots
    for (let gearSlot of slotPriority) {
        if (!automationConfig.overmeldWeapon && (gearSlot === "Primary" || gearSlot === "Secondary")) {
            continue;
        }
        let gearItem = materiaInfusedGear[gearSlot];
        for (let i = gearItem.normalMeldSlots + 1; i < gearItem.materiaSlots; i++) {
            let materiaForSlot = determineMateria(gearItem, new Number(automationConfig.overmeldRank), automationConfig, calculatedStats, materiaList, true);
            if (materiaForSlot) {
                gearItem.materia[i] = materiaForSlot;
                calculatedStats = determineTotalStats(materiaInfusedGear, selectedJob, hasSoulCrystal, false);
            }
        }
    }
    // Stats marked as "minimize" should try and get as close to the target as possible, so if the target can be reached with an overmeld slot, do that.
    // Stats not marked as "minimize" should be maximized with as many open stat values as possible.
    // Avoid exceeding the meld max by either melding a different stat or using a lower tier materia

    return materiaInfusedGear;
}

function determineTotalStats(materiaInfusedGear, selectedJob, hasSoulCrystal, resetMateria) {
    let calculatedStats = {};
    if (selectedJob && selectedJob.baseStats) {
        Object.keys(selectedJob.baseStats).forEach((value, index) => {
            calculatedStats[value] = selectedJob.baseStats[value];
        });
    }
    Object.keys(materiaInfusedGear).forEach((value, index) => {
        let gear = materiaInfusedGear[value];
        if (!gear || !gear.name) {
            return;
        }
        if (resetMateria) {
            gear.materia = new Array(gear.materiaSlots);
        }
        let stats = determineGearStatValue(gear);
        Object.keys(stats).forEach((statValue, statIndex) => {
            calculatedStats[statValue] += stats[statValue];

        });
    });
    if (hasSoulCrystal) {
        calculatedStats.control += 20;
        calculatedStats.craftsmanship += 20;
        calculatedStats.cp += 15;
    }
    return calculatedStats;
}

function determineGearStatValue(slotItem) {
    let stats = {};
    Object.keys(slotItem.stats).forEach((value, index) => {
        stats[value] = slotItem.stats[value].value;
    });
    if (slotItem.materia) {
        for (let materia of slotItem.materia) {
            if (materia && materia.value) {
                stats[materia.stat] = Math.min(slotItem.stats[materia.stat].meldMax, stats[materia.stat] + materia.value);
            }
        }
    }
    return stats;
}

function determineMateria(gearItem, maxMateriaRank, automationConfig, calculatedStats, materiaList, allowOvercap) {
    let gearItemStats = new Array((gearItem && gearItem.stats) ? Object.keys(gearItem.stats).length : 0);
    let isMinimizing = false;
    let currentSlotStats = determineGearStatValue(gearItem);
    if (gearItem && gearItem.stats) {
        Object.keys(gearItem.stats).forEach((value, index) => {
            gearItemStats[automationConfig[value].priority] = value;
            isMinimizing |= automationConfig[value].target <= calculatedStats[value];
        });
    }

    if (isMinimizing) {
        for (let stat of gearItemStats) {
            if (currentSlotStats[stat] < gearItem.stats[stat].meldMax && calculatedStats[stat] < automationConfig[stat].target) {
                let materia = getMateriaForStatAndRank(stat, maxMateriaRank, materiaList);
                if (materia.value + currentSlotStats[stat] <= gearItem.stats[stat].meldMax || allowOvercap) {
                    return materia;
                }
            }
        }
    }
    for (let stat of gearItemStats) {
        if (!automationConfig[stat].minimize && currentSlotStats[stat] < gearItem.stats[stat].meldMax) {
            let materia = getMateriaForStatAndRank(stat, maxMateriaRank, materiaList);
            if (materia.value + currentSlotStats[stat] <= gearItem.stats[stat].meldMax || allowOvercap) {
                return materia;
            }
        }
    }
    return null;
}

function getMateriaForStatAndRank(stat, rank, materiaList) {
    for (let materia of materiaList) {
        if (materia.stat === stat && materia.rank == rank) {
            return materia;
        }
    }
    return {};
}

export default function Automations( { automationConfig, setAutomationConfig, selectedGear, setSelectedGear, selectedJob, hasSoulCrystal, materiaList } ) {
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

    function setOvermeldWeapon(value) {
        let newAutomationConfig = JSON.parse(JSON.stringify(automationConfig));
        newAutomationConfig.overmeldWeapon = value;
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
                <label htmlFor="overmeldWeapon" className="text-start col-sm-3 col-form-label">Overmeld Weapons</label>
                <div className="col-sm-3">
                    <input id="overmeldWeapon" className="form-check-input" type="checkbox" checked={automationConfig.minimize} onChange={(e) => setOvermeldWeapon(e.target.checked)}></input>
                </div>
            </div>
            <div className="row pt-2">
                <button className="btn btn-sm btn-primary col-sm-4 m-1">Clear Materia</button>
                <button className="btn btn-sm btn-primary col-sm-4 m-1" onClick={allocateMateriaOnClick}>Maximize Materia</button>
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

export { determineTotalStats };