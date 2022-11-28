const slotPriority = [ "Head", "Body", "Hands", "Legs", "Feet", "Earrings", "Necklace", "Bracelets", "LeftRing", "RightRing", "Primary", "Secondary" ]

function allocateDiscipleOfHandMateria(selectedGear, selectedJob, automationConfig, hasSoulCrystal, materiaList) {
    let materiaInfusedGear = JSON.parse(JSON.stringify(selectedGear));

    let calculatedStats = determineDiscipleOfHandTotalStats(materiaInfusedGear, selectedJob, hasSoulCrystal, true);

    // First, assign the highest value materia that will fit within the meld max for all of the normal meld slots
    for (let gearSlot of slotPriority) {
        let gearItem = materiaInfusedGear[gearSlot];
        for (let i = 0; i < gearItem.normalMeldSlots; i++) {
            let materiaForSlot = determineDiscipleOfHandMateria(gearItem, 10, automationConfig, calculatedStats, materiaList, false);
            if (materiaForSlot) {
                gearItem.materia[i] = materiaForSlot;
                calculatedStats = determineDiscipleOfHandTotalStats(materiaInfusedGear, selectedJob, hasSoulCrystal, false);
            }
        }
    }

    // Starting with the armor, go through the first overmeld slot and fill that in with the highest allowed materia
    for (let gearSlot of slotPriority) {
        let gearItem = materiaInfusedGear[gearSlot];
        let materiaForSlot = determineDiscipleOfHandMateria(gearItem, automationConfig.firstOvermeldRank, automationConfig, calculatedStats, materiaList, false);
        if (materiaForSlot) {
            gearItem.materia[gearItem.normalMeldSlots] = materiaForSlot; // array is zero based, meld slots value is 1 based
            calculatedStats = determineDiscipleOfHandTotalStats(materiaInfusedGear, selectedJob, hasSoulCrystal, false);
        }
    }

    // Finally, fill in the remainder of the overmeld slots
    for (let gearSlot of slotPriority) {
        let gearItem = materiaInfusedGear[gearSlot];
        for (let i = gearItem.normalMeldSlots + 1; i < gearItem.materiaSlots; i++) {
            let materiaForSlot = determineDiscipleOfHandMateria(gearItem, automationConfig.overmeldRank, automationConfig, calculatedStats, materiaList, true);
            if (materiaForSlot) {
                gearItem.materia[i] = materiaForSlot;
                calculatedStats = determineDiscipleOfHandTotalStats(materiaInfusedGear, selectedJob, hasSoulCrystal, false);
            }
        }
    }
    // Stats marked as "minimize" should try and get as close to the target as possible, so if the target can be reached with an overmeld slot, do that.
    // Stats not marked as "minimize" should be maximized with as many open stat values as possible.
    // Avoid exceeding the meld max by either melding a different stat or using a lower tier materia

    return materiaInfusedGear;
}

function determineDiscipleOfHandTotalStats(materiaInfusedGear, selectedJob, hasSoulCrystal, resetMateria) {
    let calculatedStats = {
        control: selectedJob && selectedJob.baseStats ? selectedJob.baseStats.control : 0,
        craftsmanship: selectedJob && selectedJob.baseStats ? selectedJob.baseStats.craftsmanship : 0,
        cp: selectedJob && selectedJob.baseStats ? selectedJob.baseStats.cp : 0
    };
    for (let slot of Object.keys(materiaInfusedGear)) {
        let gear = materiaInfusedGear[slot];
        if (resetMateria) {
            gear.materia = new Array(gear.materiaSlots);
        }
        if (!gear || !gear.name) {
            continue;
        }
        let stats = determineDiscipleOfHandGearStatValue(gear);
        calculatedStats.control += stats.control;
        calculatedStats.craftsmanship += stats.craftsmanship;
        calculatedStats.cp += stats.cp; 
    }
    if (hasSoulCrystal) {
        calculatedStats.control += 20;
        calculatedStats.craftsmanship += 20;
        calculatedStats.cp += 15;
    }
    return calculatedStats;
}

function determineDiscipleOfHandGearStatValue(slotItem) {
    let stats = { control: 0, craftsmanship: 0, cp: 0 };
    stats.control += slotItem.control.hq;
    stats.craftsmanship += slotItem.craftsmanship.hq;
    stats.cp = slotItem.cp.hq;
    if (slotItem.materia) {
        for (let materia of slotItem.materia) {
            if (materia && materia.value) {
                stats[materia.stat] = Math.min(slotItem[materia.stat].meldMax, stats[materia.stat] + materia.value);
            }
        }
    }
    return stats;
}

function determineDiscipleOfHandMateria(gearItem, maxMateriaRank, automationConfig, calculatedStats, materiaList, allowOvercap) {
    let isMinimizing = (automationConfig.control.target <= calculatedStats.control)
        || (automationConfig.craftsmanship.target <= calculatedStats.craftsmanship)
        || (automationConfig.cp.target <= calculatedStats.cp);
    let currentSlotStats = determineDiscipleOfHandGearStatValue(gearItem);
    if (isMinimizing && currentSlotStats.control < gearItem.control.meldMax && calculatedStats.control < automationConfig.control.target) {
        let materia = getMateriaForStatAndRank("control", maxMateriaRank, materiaList);
        if (materia.value + currentSlotStats.control <= gearItem.control.meldMax || allowOvercap) {
            return materia;
        }
    }
    if (isMinimizing && currentSlotStats.craftsmanship < gearItem.craftsmanship.meldMax && calculatedStats.craftsmanship < automationConfig.craftsmanship.target) {
        let materia = getMateriaForStatAndRank("craftsmanship", maxMateriaRank, materiaList);
        if (materia.value + currentSlotStats.craftsmanship <= gearItem.craftsmanship.meldMax || allowOvercap) {
            return materia;
        }
    }
    if (isMinimizing && currentSlotStats.cp < gearItem.cp.meldMax && calculatedStats.cp < automationConfig.cp.target) {
        let materia = getMateriaForStatAndRank("cp", maxMateriaRank, materiaList);
        if (materia.value + currentSlotStats.cp <= gearItem.cp.meldMax || allowOvercap) {
            return materia;
        }
    }
    
    if (!automationConfig.control.minimize && currentSlotStats.control < gearItem.control.meldMax) {
        let materia = getMateriaForStatAndRank("control", maxMateriaRank, materiaList);
        if (materia.value + currentSlotStats.control <= gearItem.control.meldMax || allowOvercap) {
            return materia;
        }
    }
    if (!automationConfig.craftsmanship.minimize && currentSlotStats.craftsmanship < gearItem.craftsmanship.meldMax) {
        let materia = getMateriaForStatAndRank("craftsmanship", maxMateriaRank, materiaList);
        if (materia.value + currentSlotStats.craftsmanship <= gearItem.craftsmanship.meldMax || allowOvercap) {
            return materia;
        }
    }
    if (!automationConfig.cp.minimize && currentSlotStats.cp < gearItem.cp.meldMax) {
        let materia = getMateriaForStatAndRank("cp", maxMateriaRank, materiaList);
        if (materia.value + currentSlotStats.cp <= gearItem.cp.meldMax || allowOvercap) {
            return materia;
        }
    }
    return null;
}

function getMateriaForStatAndRank(stat, rank, materiaList) {
    for (let materia of materiaList) {
        if (materia.stat === stat && materia.rank === rank) {
            return materia;
        }
    }
    return {};
}

export { allocateDiscipleOfHandMateria, determineDiscipleOfHandTotalStats };