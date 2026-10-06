/**
 * Thai PromptPay EMVCo QR Code Payload Generator
 * Conforms to Bank of Thailand (BOT) Standard
 */

function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xff;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatTag(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

export function generatePromptPayPayload(target: string, amount?: number): string {
  // Clean target: phone or national id / tax id
  const cleaned = target.replace(/[^0-9]/g, '');
  let formattedTarget = '';

  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    // Mobile number: prefix with 0066 and drop leading 0 -> length 13
    formattedTarget = `0066${cleaned.substring(1)}`.padStart(13, '0');
  } else if (cleaned.length === 13) {
    // National ID or Tax ID
    formattedTarget = cleaned;
  } else {
    // Default fallback phone
    formattedTarget = `0066${cleaned.padStart(9, '0')}`;
  }

  // Tag 29: PromptPay Sub-tags
  const aid = formatTag('00', 'A000000677010111');
  const targetTag = formatTag(cleaned.length === 13 && !cleaned.startsWith('0') ? '02' : '01', formattedTarget);
  const tag29 = formatTag('29', aid + targetTag);

  let raw = '';
  raw += formatTag('00', '01'); // Version
  raw += formatTag('01', amount && amount > 0 ? '12' : '11'); // 12 = Dynamic (amount specified), 11 = Static
  raw += tag29;
  raw += formatTag('53', '764'); // THB currency code
  raw += formatTag('58', 'TH'); // Country Code

  if (amount && amount > 0) {
    raw += formatTag('54', amount.toFixed(2));
  }

  // Checksum tag placeholder
  raw += '6304';
  const checksum = crc16(raw);
  return raw + checksum;
}
