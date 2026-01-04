
export const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const THEME = {
  primary: '#DB2777', // Deep Pink 600
  secondary: '#2563EB', // Blue 600
  accent: '#BE185D',
  background: '#FDF2F8',
  textDark: '#0F172A', // Slate 900
  textLight: '#F8FAFC',
};

export const formatThaiDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = THAI_MONTHS[date.getMonth()];
  const year = date.getFullYear() + 543;
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${year} ${hours}:${minutes} น.`;
};
