import { determineTotalStats } from './Automations.js';

export default function Summary({ equippedGear, selectedJob, hasSoulCrystal }) {
    let calculatedStats = determineTotalStats(equippedGear, selectedJob, hasSoulCrystal);
    let statsDisplay = [];
    Object.keys(calculatedStats).forEach((value, index) => {
        statsDisplay.push(
            <div key={value} className="row">
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
