from io import BytesIO

import pandas as pd
import pytest

from zaheer_sih26153.forecasting import STAGES, score_traffic
from zaheer_sih26153.traffic import CANONICAL_FEATURES, MAX_UPLOAD_BYTES, demo_frame, read_uploaded_csv


def test_demo_produces_complete_canonical_contract():
    frame = demo_frame()
    assert list(frame.columns) == CANONICAL_FEATURES
    assert frame.shape[0] == 48
    assert frame.isna().sum().sum() == 0


def test_loader_never_executes_formula_like_cells():
    uploaded = BytesIO(b"source_port,destination_port,tcp_flags,bytes_per_flow\n'=1+1,443,SA,42\n")
    frame = read_uploaded_csv(uploaded)
    assert frame.loc[0, "source_port"] == 0
    assert frame.loc[0, "tcp_syn"] == 1
    assert frame.loc[0, "tcp_ack"] == 1


def test_loader_rejects_oversized_upload():
    with pytest.raises(ValueError, match="50 MB"):
        read_uploaded_csv(BytesIO(b"x" * (MAX_UPLOAD_BYTES + 1)))


def test_forecast_is_bounded_and_explainable():
    result = score_traffic(demo_frame(), steps=5)
    assert len(result.timeline) == 5
    assert result.timeline.infiltration_probability.between(0, 1).all()
    assert result.stage in STAGES
    assert {"feature", "contribution", "stage"}.issubset(result.explanations.columns)
    assert {"flow_index", "infiltration_probability", "predicted_stage"}.issubset(result.flagged_flows.columns)


def test_non_numeric_and_infinite_values_are_sanitised():
    frame = pd.DataFrame({"source_port": ["bad", float("inf")], "destination_port": [443, 22]})
    uploaded = BytesIO(frame.to_csv(index=False).encode())
    cleaned = read_uploaded_csv(uploaded)
    assert cleaned.isna().sum().sum() == 0
    assert cleaned.isin([float("inf"), float("-inf")]).sum().sum() == 0
