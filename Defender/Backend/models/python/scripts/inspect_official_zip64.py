from pathlib import Path
import sys
import requests
import struct

url = sys.argv[1]
out = Path(sys.argv[2])
head = requests.head(url, timeout=30)
head.raise_for_status()
size = int(head.headers['Content-Length'])
window = min(size, 4 * 1024 * 1024)
start = size - window
response = requests.get(url, headers={'Range': f'bytes={start}-{size-1}'}, timeout=120)
response.raise_for_status()
blob = response.content
out.write_bytes(blob)
print(f'object_size={size} tail_start={start} tail_bytes={len(blob)}')
# EOCD signature: end of central directory, last occurrence is authoritative.
pos = blob.rfind(bytes((80, 75, 5, 6)))
if pos < 0:
    raise SystemExit('EOCD record not found in downloaded tail')
_, disk, cd_disk, entries_disk, entries_total, cd_size, cd_offset, comment_len = struct.unpack_from('<4s4H2IH', blob, pos)
if entries_total == 0xffff or cd_size == 0xffffffff or cd_offset == 0xffffffff:
    zip64_pos = blob.rfind(bytes((80, 75, 6, 6)))
    if zip64_pos < 0:
        raise SystemExit('ZIP64 EOCD record not found')
    _, zip64_size, ver_made, ver_needed, zip64_disk, zip64_cd_disk, entries_disk64, entries_total64, cd_size64, cd_offset64 = struct.unpack_from('<4sQ2H2I4Q', blob, zip64_pos)
    entries_total, cd_size, cd_offset = entries_total64, cd_size64, cd_offset64
print(f'entries={entries_total} central_directory_size={cd_size} central_directory_offset={cd_offset} comment_length={comment_len}')
if cd_offset < start or cd_offset + cd_size > size:
    print('central directory is outside the downloaded tail; increase the tail window')
    raise SystemExit(2)
cd = blob[cd_offset-start:cd_offset-start+cd_size]
i = 0
for _ in range(entries_total):
    if cd[i:i+4] != bytes((80, 75, 1, 2)):
        raise SystemExit(f'bad central directory signature at {i}')
    fields = struct.unpack_from('<4s6H3I5H2I', cd, i)
    _, ver_made, ver_needed, flags, method, mtime, mdate, crc, comp_size, uncomp_size, name_len, extra_len, comment_len, disk_no, int_attr, ext_attr, local_offset = fields
    name = cd[i+46:i+46+name_len].decode('utf-8', 'replace')
    extra = cd[i+46+name_len:i+46+name_len+extra_len]
    if comp_size == 0xffffffff or uncomp_size == 0xffffffff or local_offset == 0xffffffff:
        j = 0
        while j + 4 <= len(extra):
            field_id, field_size = struct.unpack_from('<HH', extra, j)
            field = extra[j+4:j+4+field_size]
            if field_id == 0x0001:
                k = 0
                if uncomp_size == 0xffffffff: uncomp_size = struct.unpack_from('<Q', field, k)[0]; k += 8
                if comp_size == 0xffffffff: comp_size = struct.unpack_from('<Q', field, k)[0]; k += 8
                if local_offset == 0xffffffff: local_offset = struct.unpack_from('<Q', field, k)[0]; k += 8
                break
            j += 4 + field_size
    print(f'{comp_size:>12} {uncomp_size:>12} method={method} local_offset={local_offset} {name}')
    i += 46 + name_len + extra_len + comment_len
