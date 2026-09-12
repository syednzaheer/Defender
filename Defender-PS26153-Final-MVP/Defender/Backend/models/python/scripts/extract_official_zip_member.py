from pathlib import Path
import sys
import struct
import zlib
import requests

url, local_offset, compressed_size, output_path = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), Path(sys.argv[4])
header_response = requests.get(url, headers={'Range': f'bytes={local_offset}-{local_offset+4095}'}, timeout=120)
header_response.raise_for_status()
header = header_response.content
if header[:4] != bytes((80, 75, 3, 4)):
    raise SystemExit(f'local ZIP header not found at {local_offset}: {header[:8].hex()}')
_, ver, flags, method, mtime, mdate, crc, csize32, usize32, name_len, extra_len = struct.unpack_from('<4s5H3I2H', header, 0)
data_start = local_offset + 30 + name_len + extra_len
end = data_start + compressed_size - 1
response = requests.get(url, headers={'Range': f'bytes={data_start}-{end}'}, timeout=600)
response.raise_for_status()
compressed = response.content
if len(compressed) != compressed_size:
    raise SystemExit(f'compressed length mismatch: expected {compressed_size}, got {len(compressed)}')
if method == 8:
    raw = zlib.decompress(compressed, -15)
elif method == 0:
    raw = compressed
else:
    raise SystemExit(f'unsupported ZIP compression method: {method}')
output_path.write_bytes(raw)
print(f'written={output_path} bytes={len(raw)} method={method} data_start={data_start}')
