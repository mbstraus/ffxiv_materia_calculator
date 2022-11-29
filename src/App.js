import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css'
import React, { useEffect, useState } from 'react';
import * as AWS from 'aws-sdk';
import configuration from './aws_config.js';
import CharacterInfo from './components/CharacterInfo.js';
import GearSelect from './components/GearSelect.js';
import Summary from './components/Summary.js';
import Automations from './components/Automations.js';

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
                                <Automations automationConfig={automationConfig} setAutomationConfig={setAutomationConfig} selectedGear={selectedGear} setSelectedGear={setSelectedGear} selectedJob={selectedJob} hasSoulCrystal={hasSoulCrystal} materiaList={materia} />
                            </div>
                        </div>
                        <div className="card text-bg-dark m-5">
                            <h5 className="card-header text-bg-primary">Summary</h5>
                            <div className="card-body">
                                <Summary equippedGear={selectedGear} selectedJob={selectedJob} hasSoulCrystal={hasSoulCrystal} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
