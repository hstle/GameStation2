export const getBoxArtUrl = (title: string, platform: string): string => {
  // Clean up title for libretro
  let cleanTitle = title
    .replace(/ \(USA\)/g, '')
    .replace(/ \(Europe\)/g, '')
    .replace(/ \(World\)/g, '')
    .replace(/ \(Rev.*\)/g, '')
    .replace(/ \(Virtual Console\)/g, '')
    .replace(/ \(Sega Genesis Mini\)/g, '')
    .trim();

  const encodedTitle = encodeURIComponent(cleanTitle.replace(/ & /g, ' %26 '));
  
  if (platform === 'Genesis') {
    return `https://thumbnails.libretro.com/Sega%20-%20Mega%20Drive%20-%20Genesis/Named_Boxarts/${encodedTitle}%20(USA).png`;
  }
  if (platform === 'SNES') {
    return `https://thumbnails.libretro.com/Nintendo%20-%20Super%20Nintendo%20Entertainment%20System/Named_Boxarts/${encodedTitle}%20(USA).png`;
  }
  if (platform === 'N64') {
    return `https://thumbnails.libretro.com/Nintendo%20-%20Nintendo%2064/Named_Boxarts/${encodedTitle}%20(USA).png`;
  }
  if (platform === 'GBA') {
    return `https://thumbnails.libretro.com/Nintendo%20-%20Game%20Boy%20Advance/Named_Boxarts/${encodedTitle}%20(USA%2C%20Europe).png`;
  }
  if (platform === 'GBC') {
    return `https://thumbnails.libretro.com/Nintendo%20-%20Game%20Boy%20Color/Named_Boxarts/${encodedTitle}%20(USA%2C%20Europe).png`;
  }
  
  return 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400';
};
