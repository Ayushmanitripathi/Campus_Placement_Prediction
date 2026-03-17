from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

app = Flask(__name__)
# Enable CORS for the frontend origin
CORS(app, resources={r"/predict": {"origins": "*"}})

# Load the model and calculate fallback values
model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'model_campus_placement.bin')
csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'Placement.csv')

# Load the trained model
try:
    model = joblib.load(model_path)
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Calculate the mean values from the dataset for missing optional values (MBA %)
try:
    data = pd.read_csv(csv_path)
    MBA_P_MEAN = round(data['mba_p'].mean(), 2)
    SPEC_DEFAULT = round(data['specialisation'].map({'Mkt&HR': 1, 'Mkt&Fin': 0}).mean())
except Exception as e:
    print(f"Error calculating means from CSV: {e}")
    MBA_P_MEAN = 62.28  # Fallback
    SPEC_DEFAULT = 0

@app.route('/predict', methods=['POST'])
def predict():
    if not model:
        return jsonify({'error': 'Machine learning model not loaded properly.'}), 500

    try:
        # Get data from frontend POST request
        req_data = request.json
        print(f"Received data: {req_data}")

        # Parse required inputs, apply defaulting logic based on the notebook
        p1 = req_data.get('gender', 0)
        p2 = float(req_data.get('ssc_p', 0))
        p3 = req_data.get('ssc_b', 0)
        p4 = float(req_data.get('hsc_p', 0))
        p5 = req_data.get('hsc_b', 0)
        p6 = req_data.get('hsc_s', 0)
        p7 = float(req_data.get('degree_p', 0))
        p8 = req_data.get('degree_t', 0)
        p9 = req_data.get('workex', 0)
        p10 = float(req_data.get('etest_p', 0))

        # Handle optional MBA fields
        spec_raw = req_data.get('specialisation')
        if spec_raw is None or spec_raw == -1: # -1 indicates Unspecified in the front end
            p11 = SPEC_DEFAULT
        else:
            p11 = spec_raw
            
        mba_raw = req_data.get('mba_p')
        if mba_raw is None or mba_raw == "":
            p12 = MBA_P_MEAN
        else:
            p12 = float(mba_raw)

        # Create DataFrame for prediction (Matching the column names the model expects)
        features = pd.DataFrame({
            'gender': p1,
            'ssc_p': p2,
            'ssc_b': p3,
            'hsc_p': p4,
            'hsc_b': p5,
            'hsc_s': p6,
            'degree_p': p7,
            'degree_t': p8,
            'workex': p9,
            'etest_p': p10,
            'specialisation': p11,
            'mba_p': p12
        }, index=[0])

        # Predict status and get probability
        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0]

        # Structure response
        response = {
            'placed': bool(prediction == 1),
            'probability': round(probability[1] * 100, 2),
            'notes': []
        }
        
        # Add feedback on defaults if used
        if spec_raw is None or spec_raw == -1:
            response['notes'].append('MBA Specialisation unspecified - using dataset default.')
        if mba_raw is None or mba_raw == "":
            response['notes'].append(f'MBA % unspecified - using dataset mean: {MBA_P_MEAN}')

        return jsonify(response)
        
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
