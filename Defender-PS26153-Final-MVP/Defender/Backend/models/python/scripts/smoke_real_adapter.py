from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

SCRIPT_ROOT = Path(__file__).resolve().parent
PYTHON_ROOT = SCRIPT_ROOT.parent
sys.path.insert(0, str(PYTHON_ROOT))

from defender.traffic import demo_frame
from defender.world_model_adapter import forecast_with_trained_artifact


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the bundled world-model artifact smoke test.")
    parser.add_argument("--steps", type=int, default=5)
    parser.add_argument("--model-path", default="../../artifacts/cross_day_benchmark/cross_day_world_model_state_dict.pt")
    parser.add_argument("--config-path", default="../../artifacts/cross_day_benchmark/cross_day_model_config.json")
    args = parser.parse_args()

    model_path = (SCRIPT_ROOT / args.model_path).resolve()
    config_path = (SCRIPT_ROOT / args.config_path).resolve()
    result = forecast_with_trained_artifact(demo_frame(), model_path, config_path, steps=args.steps)
    print(json.dumps({
        "stage": result.stage,
        "stage_trajectory": result.stage_trajectory,
        "source": result.model_source,
        "timeline_rows": len(result.timeline),
        "flagged_rows": len(result.flagged_flows),
        "max_probability": float(result.timeline.infiltration_probability.max()),
    }, indent=2))


if __name__ == "__main__":
    main()
