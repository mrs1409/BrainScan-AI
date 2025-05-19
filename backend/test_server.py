from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': True
    })

@app.route('/api/analyze', methods=['POST'])
def analyze():
    # This is a mock response for testing
    return jsonify({
        'hasTumor': False,
        'confidence': 0.95
    })

if __name__ == '__main__':
    print("Starting test server on http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=True)
