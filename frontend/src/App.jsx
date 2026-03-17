import React, { useState } from 'react';

function App() {
  const [formData, setFormData] = useState({
    gender: '0',
    ssc_p: '',
    ssc_b: '0',
    hsc_p: '',
    hsc_b: '0',
    hsc_s: '0',
    degree_p: '',
    degree_t: '0',
    workex: '0',
    etest_p: '',
    specialisation: '-1', // -1 for Unspecified
    mba_p: ''
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Map string values to numbers where appropriate
      const payload = {
        ...formData,
        gender: parseInt(formData.gender),
        ssc_b: parseInt(formData.ssc_b),
        hsc_b: parseInt(formData.hsc_b),
        hsc_s: parseInt(formData.hsc_s),
        degree_t: parseInt(formData.degree_t),
        workex: parseInt(formData.workex),
        specialisation: parseInt(formData.specialisation),
      };

      const response = await fetch('https://campus-placement-prediction-56et.onrender.com/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to connect to the prediction server.');
      }

      const data = await response.json();
      
      if (data.error) {
         throw new Error(data.error);
      }
      
      setResult(data);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Campus Placement Predictor</h1>
        <p className="app-subtitle">Machine Learning Powered Analysis</p>
      </header>

      <form onSubmit={handleSubmit}>
        {/* Section 1: Academic Background */}
        <div className="form-card">
          <h2 className="section-title">01 &nbsp; Academic Background</h2>
          <div className="form-grid">
            <div className="field-group">
              <label className="field-label">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="form-control">
                <option value="0">Female</option>
                <option value="1">Male</option>
              </select>
            </div>
            
            <div className="field-group">
              <label className="field-label">10th Grade % (SSC)</label>
              <input type="number" step="0.01" min="0" max="100" name="ssc_p" value={formData.ssc_p} onChange={handleChange} className="form-control" required placeholder="e.g. 85.5" />
            </div>

            <div className="field-group">
              <label className="field-label">10th Board</label>
              <select name="ssc_b" value={formData.ssc_b} onChange={handleChange} className="form-control">
                <option value="0">Others</option>
                <option value="1">Central</option>
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">12th Grade % (HSC)</label>
              <input type="number" step="0.01" min="0" max="100" name="hsc_p" value={formData.hsc_p} onChange={handleChange} className="form-control" required placeholder="e.g. 78.2" />
            </div>

            <div className="field-group">
              <label className="field-label">12th Board</label>
              <select name="hsc_b" value={formData.hsc_b} onChange={handleChange} className="form-control">
                <option value="0">Others</option>
                <option value="1">Central</option>
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">12th Specialisation</label>
              <select name="hsc_s" value={formData.hsc_s} onChange={handleChange} className="form-control">
                <option value="0">Arts</option>
                <option value="1">Commerce</option>
                <option value="2">Science</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Degree & Work Profile */}
        <div className="form-card">
          <h2 className="section-title">02 &nbsp; Degree & Work Profile</h2>
          <div className="form-grid">
            <div className="field-group">
              <label className="field-label">Degree %</label>
              <input type="number" step="0.01" min="0" max="100" name="degree_p" value={formData.degree_p} onChange={handleChange} className="form-control" required placeholder="e.g. 72.4" />
            </div>

            <div className="field-group">
              <label className="field-label">Degree Type</label>
              <select name="degree_t" value={formData.degree_t} onChange={handleChange} className="form-control">
                <option value="0">Others</option>
                <option value="1">Comm&Mgmt</option>
                <option value="2">Sci&Tech</option>
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">Work Experience</label>
              <select name="workex" value={formData.workex} onChange={handleChange} className="form-control">
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">Employability Test %</label>
              <input type="number" step="0.01" min="0" max="100" name="etest_p" value={formData.etest_p} onChange={handleChange} className="form-control" required placeholder="e.g. 88.0" />
            </div>
          </div>
        </div>

        {/* Section 3: MBA Details */}
        <div className="form-card">
          <h2 className="section-title">03 &nbsp; MBA Details<span className="optional-badge">Optional</span></h2>
          <div className="optional-hint">
            💡 MBA fields are optional — leave blank or select "Unspecified" to use average dataset metrics.
          </div>
          <div className="form-grid">
            <div className="field-group">
              <label className="field-label">MBA Specialisation</label>
              <select name="specialisation" value={formData.specialisation} onChange={handleChange} className="form-control">
                <option value="-1">Unspecified</option>
                <option value="0">Mkt&Fin</option>
                <option value="1">Mkt&HR</option>
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">MBA %</label>
              <input type="number" step="0.01" min="0" max="100" name="mba_p" value={formData.mba_p} onChange={handleChange} className="form-control" placeholder="Leave blank for mean" />
            </div>
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? <span className="spinner"></span> : 'Predict Placement'}
        </button>
      </form>

      {/* Results Section */}
      {error && (
        <div className="error-card">
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="result-container">
          <div className={`result-card ${result.placed ? 'result-placed' : 'result-not-placed'}`}>
            <div className="result-icon">{result.placed ? '🎓' : '📋'}</div>
            <div className="result-label">Prediction Result</div>
            <div className={`result-verdict ${result.placed ? 'verdict-placed' : 'verdict-not-placed'}`}>
              {result.placed ? 'Likely to be Placed' : 'Not Likely to be Placed'}
            </div>
            
            {!result.placed && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Consider strengthening your profile and re-evaluating key metrics.
                </p>
            )}

            <div className="prob-container">
              <div className="prob-label">
                <span>Placement Probability</span>
                <span>{result.probability}%</span>
              </div>
              <div className="prob-bar-bg">
                <div className="prob-bar-fill" style={{ width: `${result.probability}%` }}></div>
              </div>
            </div>

            {result.notes && result.notes.length > 0 && (
              <div className="notes-container">
                {result.notes.map((note, index) => (
                  <div key={index} className="note-item">ℹ️ {note}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
