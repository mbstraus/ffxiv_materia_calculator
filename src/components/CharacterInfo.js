export default function CharacterInfo({ jobs, selectedJob, setSelectedJob, selectPatchItems, hasSoulCrystal, setHasSoulCrystal }) {

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
