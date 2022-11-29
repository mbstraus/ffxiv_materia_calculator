export default function AutomationStat( { stat, automationConfig, setAutomationValue } ) {
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
