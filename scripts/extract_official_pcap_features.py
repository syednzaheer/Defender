from __future__ import annotations

from collections import defaultdict, deque
from pathlib import Path
import json
import math
import statistics
import sys

from scapy.all import IP, TCP, UDP, PcapReader

pcap_path = Path(sys.argv[1])
out_path = Path(sys.argv[2])
window_seconds = int(sys.argv[3]) if len(sys.argv) > 3 else 60

records = defaultdict(lambda: {
    'timestamps': [], 'ttls': [], 'windows': [], 'payloads': [], 'fragments': 0,
    'tcp_packets': 0, 'retransmissions': 0, 'ports': [], 'seq_seen': set(), 'first_ts': None
})
packet_count = 0
first_ts = None
last_ts = None

with PcapReader(str(pcap_path)) as reader:
    for packet in reader:
        if IP not in packet:
            continue
        packet_count += 1
        ts = float(packet.time)
        first_ts = ts if first_ts is None else min(first_ts, ts)
        last_ts = ts if last_ts is None else max(last_ts, ts)
        ip = packet[IP]
        if first_ts is None:
            continue
        bucket = int((ts - first_ts) // window_seconds)
        key = (bucket, ip.src, ip.dst, getattr(ip, 'proto', 0))
        r = records[key]
        r['timestamps'].append(ts)
        r['ttls'].append(float(ip.ttl))
        r['payloads'].append(float(len(bytes(packet.payload))))
        if int(getattr(ip, 'flags', 0)) & 0x1 or int(getattr(ip, 'frag', 0)) > 0:
            r['fragments'] += 1
        if TCP in packet:
            r['tcp_packets'] += 1
            tcp = packet[TCP]
            r['windows'].append(float(tcp.window))
            port = int(tcp.dport)
            r['ports'].append(port)
            seq_key = (ip.src, ip.dst, int(tcp.sport), port, int(tcp.seq))
            if seq_key in r['seq_seen']:
                r['retransmissions'] += 1
            else:
                r['seq_seen'].add(seq_key)
        elif UDP in packet:
            r['ports'].append(int(packet[UDP].dport))

def mean(values):
    return float(statistics.fmean(values)) if values else 0.0

def variance(values):
    return float(statistics.pvariance(values)) if len(values) > 1 else 0.0

def port_scan_score(ports):
    unique = sorted(set(ports))
    if len(unique) < 3:
        return 0.0
    sequential = sum(1 for a, b in zip(unique, unique[1:]) if b - a == 1)
    return float(sequential / max(1, len(unique) - 1))

rows = []
for (bucket, src, dst, proto), r in sorted(records.items()):
    duration = max(r['timestamps']) - min(r['timestamps']) if len(r['timestamps']) > 1 else 0.0
    rows.append({
        'window_index': bucket,
        'window_start_epoch': float(first_ts + bucket * window_seconds),
        'window_end_epoch': float(first_ts + (bucket + 1) * window_seconds),
        'source_ip': src,
        'destination_ip': dst,
        'protocol_number': int(proto),
        'packet_count': len(r['timestamps']),
        'ttl_mean': mean(r['ttls']),
        'ttl_variance': variance(r['ttls']),
        'tcp_window_mean': mean(r['windows']),
        'ip_fragment_count': int(r['fragments']),
        'payload_size_mean': mean(r['payloads']),
        'payload_size_variance': variance(r['payloads']),
        'payload_size_p90': float(sorted(r['payloads'])[max(0, math.ceil(len(r['payloads']) * 0.9) - 1)]) if r['payloads'] else 0.0,
        'port_scan_sequential_score': port_scan_score(r['ports']),
        'unique_destination_ports': len(set(r['ports'])),
        'retransmission_count': int(r['retransmissions']),
        'flow_duration_ms_from_packets': float(duration * 1000.0),
    })

out_path.write_text(json.dumps({'metadata': {'pcap': str(pcap_path), 'packet_count': packet_count, 'first_ts': first_ts, 'last_ts': last_ts, 'window_seconds': window_seconds}, 'rows': rows}, indent=2), encoding='utf-8')
print(json.dumps({'packet_count': packet_count, 'windows': len(rows), 'first_ts': first_ts, 'last_ts': last_ts, 'output': str(out_path)}, indent=2))
