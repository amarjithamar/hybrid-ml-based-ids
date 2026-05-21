# Hybrid ML-Based Intrusion Detection System (IDS)

A comprehensive machine learning-based intrusion detection system that combines supervised and unsupervised learning techniques to detect network anomalies and intrusions in real-time.

## 🚀 Features

- **Hybrid Detection Approach**: Combines Random Forest (supervised) and Isolation Forest (unsupervised) algorithms
- **Real-time Monitoring**: Stream synthetic network data for live intrusion detection
- **Web Dashboard**: Interactive Flask-based web interface for visualization and analysis
- **Feature Extraction**: Automated extraction of network flow features from raw traffic
- **SHAP Explainability**: Model interpretability through SHAP value analysis
- **Geolocation Support**: GeoIP integration for geographical network analysis
- **User Authentication**: Secure login and registration system
- **Admin Dashboard**: Comprehensive monitoring and analysis tools
- **Model Management**: Trained models and scalers for quick deployment

## 📋 Project Structure

```
.
├── app.py                          # Flask web application
├── train.py                        # Model training script
├── inference.py                    # Real-time inference module
├── feature_extraction.py           # Feature engineering pipeline
├── generator.py                    # Synthetic data generator
├── stream_synthetic_data.py        # Data streaming module
├── utils.py                        # Utility functions
├── seed.py                         # Random seed configuration
├── Intrusion_training_Code.ipynb   # Training notebook
│
├── models/                         # Pre-trained models
│   ├── supervised_rf.joblib       # Random Forest model
│   ├── unsupervised_iso.joblib    # Isolation Forest model
│   ├── scaler.joblib              # Feature scaler
│   ├── shap_explainer.joblib      # SHAP explainer
│   └── eval_summary.joblib        # Evaluation metrics
│
├── data/                           # Dataset
│   └── CICIDS2017_subset.csv      # Network traffic dataset
│
├── templates/                      # HTML templates
│   ├── base.html
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── admin.html
│   ├── analysis.html
│   ├── prediction.html
│   └── upload.html
│
├── static/                         # Static assets
│   ├── css/                       # Stylesheets
│   ├── js/                        # JavaScript files
│   ├── images/                    # Images
│   ├── fonts/                     # Font files
│   ├── data/                      # JSON data files
│   └── prediction.js              # Prediction interface
│
└── uploads/                        # User uploaded files
```

## 🛠️ Installation

### Prerequisites

- Python 3.8+
- pip (Python package manager)
- Git

### Clone the Repository

```bash
git clone https://github.com/amarjithamar/hybrid-ml-based-ids.git
cd hybrid-ml-based-ids
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Required Libraries

- Flask
- scikit-learn
- pandas
- numpy
- joblib
- SHAP
- geoip2
- matplotlib
- seaborn

## 🚀 Usage

### 1. Training the Model

```bash
python train.py
```

This will train both the Random Forest and Isolation Forest models on the CICIDS2017 dataset.

### 2. Running the Web Application

```bash
python app.py
```

The application will be available at `http://localhost:5000`

### 3. Real-time Intrusion Detection

```bash
python stream_synthetic_data.py
```

This streams synthetic network data through the trained models for real-time detection.

### 4. Feature Extraction

```bash
python feature_extraction.py
```

Extracts features from raw network flow data.

### 5. Inference on New Data

```python
from inference import predict
predictions = predict(new_data)
```

## 🧠 Machine Learning Models

### Supervised Learning: Random Forest
- **Purpose**: Classification-based detection
- **Training Data**: CICIDS2017 labeled dataset
- **Features**: 80+ network flow features
- **Performance**: High accuracy for known attack patterns

### Unsupervised Learning: Isolation Forest
- **Purpose**: Anomaly detection
- **Features**: Network flow statistics
- **Advantage**: Detects novel/unknown attacks
- **Method**: Isolates anomalies rather than profiling normal behavior

## 📊 Features Used

Network flow features include:
- Protocol information (TCP, UDP, ICMP)
- Packet statistics (count, size, duration)
- Flow duration and timing
- Port information
- Bi-directional flow metrics
- Entropy measurements
- Statistical properties

## 🔐 Security

- User authentication system with secure password handling
- Role-based access control (Admin/User)
- Input validation and sanitization
- Session management

## 📈 Dashboard Features

### Analysis Page
- Real-time traffic visualization
- Attack distribution analysis
- Time-series anomaly detection
- Network topology insights

### Prediction Page
- Upload network pcap files
- Get instant threat predictions
- SHAP value explanations
- Geolocation visualization

### Admin Dashboard
- User management
- System statistics
- Model performance metrics
- Alert and notification center

## 🔄 Data Flow

```
Raw Network Traffic
    ↓
Feature Extraction
    ↓
Feature Scaling
    ↓
Model Inference (RF + IF)
    ↓
Prediction & Confidence Score
    ↓
SHAP Explanation
    ↓
Alert/Dashboard
```

## 📦 Model Training Workflow

1. **Data Loading**: Load CICIDS2017 dataset
2. **Feature Engineering**: Extract network flow features
3. **Data Preprocessing**: Scaling and normalization
4. **Model Training**: Train RF and IF models
5. **Evaluation**: Metrics calculation (accuracy, precision, recall, F1)
6. **Model Persistence**: Save trained models and scalers

## 🔧 Configuration

### Database
- SQLite databases for users and logs
- `users.db`: User authentication
- `nids.db`: Network intrusion data
- `nids_logs.db`: Operational logs

### GeoIP Database
- Uses MaxMind GeoLite2 database
- Supports geographical location tracking
- File: `GeoLite2-City.mmdb`

## 📝 API Endpoints

- `POST /predict`: Make predictions on network data
- `POST /upload`: Upload network traffic files
- `GET /analysis`: Get system analysis data
- `GET /admin`: Admin dashboard
- `POST /login`: User authentication
- `POST /register`: User registration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Amar**
- GitHub: [@amarjithamar](https://github.com/amarjithamar)

## 🙏 Acknowledgments

- CICIDS2017 Dataset contributors
- scikit-learn and Machine Learning community
- Flask framework
- SHAP library for model explainability

## 📧 Contact & Support

For questions or support, please open an issue in the GitHub repository or contact the development team.

## 🔄 Future Enhancements

- [ ] Deep Learning models (LSTM, Autoencoder)
- [ ] Real-time network packet capture integration
- [ ] Distributed system support
- [ ] Advanced visualization dashboards
- [ ] API rate limiting and caching
- [ ] Multi-model ensemble techniques
- [ ] Mobile application
- [ ] Cloud deployment support

---

**Last Updated**: May 2026

**Status**: Active Development

**Stability**: Production Ready
