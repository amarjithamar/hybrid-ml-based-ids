import numpy as np

# -------------------------------------------------------------------
# FEATURE EXTRACTION MODULE
# -------------------------------------------------------------------
# Converts a raw flow dictionary (from dataset or live packet data)
# into a numerical feature vector ready for the trained ML model.
# -------------------------------------------------------------------

# FIX 1: Feature order MUST match train.py exactly.
# In train.py, 'Protocol' is FIRST in FEATURE_KEYS.
# The scaler.joblib was fitted on data in this exact order.
# Putting Protocol last (as before) caused every feature to be
# passed to the wrong scaler column, scrambling all predictions.
FEATURE_KEYS = [
    'Protocol',  # <-- MUST be first to match train.py and the saved scaler
    'Flow Duration',
    'Total Fwd Packets',
    'Total Backward Packets',
    'Total Length of Fwd Packets',
    'Total Length of Bwd Packets',
    'Fwd Packet Length Mean',
    'Bwd Packet Length Mean',
    'Flow IAT Mean',
    'Fwd IAT Mean',
    'Bwd IAT Mean',
    'Fwd PSH Flags',
    'Bwd PSH Flags',
    'Fwd URG Flags',
    'Bwd URG Flags'
]

# FIX 2: Dual-path protocol encoding matching train.py exactly.
# train.py handles both string ('tcp') and numeric (6, 17, 1) protocols.
# String names -> PROTO_MAP_STR; raw integers -> PROTO_MAP_INT
PROTO_MAP_STR = {'tcp': 0, 'udp': 1, 'icmp': 2, 'others': 3}
PROTO_MAP_INT = {6: 0, 17: 1, 1: 2}   # raw kernel protocol numbers


def encode_protocol(proto_val) -> float:
    """
    Encode protocol to the same numeric used during training.
    Handles strings ('TCP', 'tcp'), integers (6, 17, 1), and unknowns.
    """
    # Try integer path first (e.g. CSV contains 6 for TCP)
    try:
        int_val = int(float(proto_val))
        return float(PROTO_MAP_INT.get(int_val, 3))  # 3 = 'others'
    except (ValueError, TypeError):
        pass
    # String path (e.g. 'TCP', 'udp')
    str_val = str(proto_val).strip().lower()
    return float(PROTO_MAP_STR.get(str_val, 3))


def row_to_vector(row: dict):
    """
    Convert a flow dictionary to a scaled-ready numpy vector.
    Feature order and encoding MUST match preprocess_dataframe() in train.py.

    Args:
        row (dict): Flow data dict from CSV replay or live capture
    Returns:
        np.ndarray: Feature vector of shape (1, n_features)
    """
    vec = []
    for key in FEATURE_KEYS:
        if key == 'Protocol':
            # FIX 2 applied: use unified encoder for string+integer protocols
            vec.append(encode_protocol(row.get('Protocol', 'tcp')))
        else:
            try:
                val = float(row.get(key, 0.0))
                # FIX 3: Replace inf/-inf with 0.0 (train.py does the same)
                if val != val or val == float('inf') or val == float('-inf'):
                    val = 0.0
                vec.append(val)
            except Exception:
                vec.append(0.0)
    return np.array(vec, dtype=np.float64).reshape(1, -1)
