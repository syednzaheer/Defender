from pathlib import Path
import html
import xml.etree.ElementTree as ET

root = ET.fromstring(Path('/home/ubuntu/cse_cic_ids2018/bucket_manifest.xml').read_text())
for content in root.findall('.//{*}Contents'):
    key = html.unescape(content.findtext('{*}Key', ''))
    size = int(content.findtext('{*}Size', '0'))
    if any(token in key for token in ('Wednesday-28-02-2018', 'Thursday-01-03-2018')):
        print(f'{size:>14} {key}')
