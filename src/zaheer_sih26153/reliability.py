"""Offline input-reliability checks for model-assisted security decisions."""
from __future__ import annotations

import numpy as np
import pandas as pd

from .integration_contract import MODEL_FEATURES, canonicalise_abdul_frame


def assess_input(frame: pd.DataFrame, scaler_mean=None, scaler_scale=None) -> dict:
    """Return transparent missingness and out-of-range indicators.

    This is a triage signal, not a calibrated probability. A high novelty score
    should cause analyst review or model deferral rather than automatic action.
    """
    canonical, metadata = canonicalise_abdul_frame(frame)
    values = canonical.loc[:, list(MODEL_FEATURES)].to_numpy(dtype=float)
    result = {
        "rows": int(len(canonical)),
        "packet_features_available": [name for name in metadata.feature_names if name not in metadata.unavailable_features],
        "packet_features_missing": list(metadata.unavailable_features),
        "novelty_fraction": 0.0,
        "defer_recommended": bool(metadata.unavailable_features),
    }
    if scaler_mean is not None and scaler_scale is not None and len(values):
        mean = np.asarray(scaler_mean, dtype=float)
        scale = np.maximum(np.asarray(scaler_scale, dtype=float), 1e-12)
        z = np.abs((values - mean) / scale)
        result["novelty_fraction"] = float(np.mean(np.any(z > 5.0, axis=1)))
        result["defer_recommended"] = result["defer_recommended"] or result["novelty_fraction"] > 0.25
    return result
