import type { RealWorldStory } from '@/types/implementation';

export const bitManipulationRealWorldStories: RealWorldStory[] = [
  {
    id: 'bit-manipulation-ip-subnet',
    resources: [
      { type: 'link', url: 'https://www.rfc-editor.org/rfc/rfc4632' },
      { type: 'link', url: 'https://docs.python.org/3/library/ipaddress.html' },
    ],
    pythonDemo: {
      outputType: 'text',
      inputs: [
        {
          variable: 'ip_address',
          type: 'text',
          default: '192.168.1.130',
        },
        {
          variable: 'prefix',
          type: 'slider',
          default: 24,
          min: 8,
          max: 30,
          step: 1,
        },
      ],
      code: `ip_text = str(globals().get('ip_address', '192.168.1.130')).strip()
prefix = int(globals().get('prefix', 24))


def to_int(text):
    parts = [int(p) for p in text.split('.')]
    if len(parts) != 4 or any(p < 0 or p > 255 for p in parts):
        raise ValueError(text)
    return (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]


def to_text(value):
    return '.'.join(str((value >> s) & 0xFF) for s in (24, 16, 8, 0))


def to_bits(value):
    return '.'.join(format((value >> s) & 0xFF, '08b') for s in (24, 16, 8, 0))


ip = to_int(ip_text)
mask = (0xFFFFFFFF << (32 - prefix)) & 0xFFFFFFFF
network = ip & mask
broadcast = network | (~mask & 0xFFFFFFFF)

for label, value in [
    ('ip', ip),
    ('mask', mask),
    ('ip & mask', network),
    ('ip | ~mask', broadcast),
]:
    print(f'{label:<11}{to_bits(value)}  {to_text(value)}')

print()
print(f'2 ** (32 - {prefix}) = {2 ** (32 - prefix)}')`,
    },
  },
];
