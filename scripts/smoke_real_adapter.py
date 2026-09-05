from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from train_real_world_model import load_flow_csv, merge_packet_windows
from defender.world_model_adapter import forecast_with_jahangir_artifact

frame = merge_packet_windows(load_flow_csv('/home/ubuntu/cse_cic_ids2018/Thursday-01-03-2018_TrafficForML_CICFlowMeter.csv', 5000), '/home/ubuntu/cse_cic_ids2018/UCAP172.31.69.28_packet_features.json')
result = forecast_with_jahangir_artifact(frame, 'artifacts/cross_day_benchmark/cross_day_world_model_state_dict.pt', 'artifacts/cross_day_benchmark/cross_day_model_config.json', steps=5)
print({'stage': result.stage, 'source': result.model_source, 'timeline_rows': len(result.timeline), 'flagged_rows': len(result.flagged_flows), 'max_probability': float(result.timeline.infiltration_probability.max())})
