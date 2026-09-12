"""Command-line entry point for offline smoke testing and CSV scoring."""
from __future__ import annotations

import argparse
from pathlib import Path
import sys

from .forecasting import score_traffic
from .traffic import read_uploaded_csv


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Offline SIH26153 network attack forecast console")
    parser.add_argument("csv", nargs="?", help="CSV flow file; omit to score the bundled demo")
    parser.add_argument("--steps", type=int, default=5, choices=range(1, 21), help="Forward forecast horizon")
    args = parser.parse_args(argv)
    try:
        if args.csv:
            path = Path(args.csv)
            if path.suffix.lower() != ".csv" or not path.is_file():
                raise ValueError("Input must be an existing .csv file.")
            with path.open("rb") as handle:
                frame = read_uploaded_csv(handle)
        else:
            from .traffic import demo_frame
            frame = demo_frame()
        result = score_traffic(frame, args.steps)
        print(f"Model: {result.model_source}")
        print(f"Predicted MITRE stage: {result.stage}")
        print("Forward infiltration probabilities:")
        print(result.timeline.to_string(index=False))
        print("\nTop driving features:")
        print(result.explanations.head(8).to_string(index=False))
        print(f"\nFlagged flows: {len(result.flagged_flows)}")
        return 0
    except (OSError, ValueError) as exc:
        print(f"Input error: {exc}", file=sys.stderr)
        return 2

if __name__ == "__main__":
    raise SystemExit(main())
