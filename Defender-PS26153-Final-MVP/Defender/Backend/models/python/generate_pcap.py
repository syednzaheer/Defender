import random
import time
from scapy.all import IP, TCP, Raw, wrpcap

packets = []
src_ip = "192.168.1.105"  # Simulated Attacker
dst_ip = "10.0.4.15"       # Target Host (Subnet VLAN 104)

base_time = time.time()

# -------------------------------------------------------------------
# Phase 1: Reconnaissance (Port Scan)
# Target Features: High SYN ratio, Destination Port Entropy, TTL variance
# -------------------------------------------------------------------
for port in range(20, 45):
    # Simulating multi-hop routing variance via fluctuating TTL (52-64)
    ttl_val = random.choice([52, 58, 64])
    
    pkt = IP(src=src_ip, dst=dst_ip, ttl=ttl_val) / \
          TCP(sport=random.randint(49152, 65535), dport=port, flags="S", window=1024)
    
    # Inter-Arrival Time (IAT) simulation
    base_time += random.uniform(0.01, 0.08)
    pkt.time = base_time
    packets.append(pkt)

# -------------------------------------------------------------------
# Phase 2: Initial Access & Exploitation Attempt
# Target Features: Payload Size Distribution, Clustered IAT Variance
# -------------------------------------------------------------------
for i in range(10):
    sport = 54321
    dport = 80
    
    # TCP SYN
    syn_pkt = IP(src=src_ip, dst=dst_ip, ttl=64) / TCP(sport=sport, dport=dport, flags="S", window=65535)
    
    # TCP ACK
    ack_pkt = IP(src=src_ip, dst=dst_ip, ttl=64) / TCP(sport=sport, dport=dport, flags="A", window=65535)
    
    # TCP PSH-ACK with variable payload (Anomalous Payload Distribution)
    payload_size = random.randint(256, 1460)
    data_pkt = IP(src=src_ip, dst=dst_ip, ttl=64) / \
               TCP(sport=sport, dport=dport, flags="PA", window=29200) / \
               Raw(b"A" * payload_size)
    
    base_time += random.uniform(0.001, 0.005)  # Rapid burst
    syn_pkt.time = base_time
    ack_pkt.time = base_time + 0.001
    data_pkt.time = base_time + 0.002
    
    packets.extend([syn_pkt, ack_pkt, data_pkt])

# Save generated stream to standard PCAP format
output_filename = "test_attack_telemetry.pcap"
wrpcap(output_filename, packets)
print(f"Successfully generated '{output_filename}' containing {len(packets)} packets!")