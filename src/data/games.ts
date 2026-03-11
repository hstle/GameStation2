import { Game } from '../types';

export const GAMES: Game[] = [
  {
    id: 'sonic-1',
    title: 'Sonic the Hedgehog',
    thumbnail: 'https://thumbnails.libretro.com/Sega%20-%20Mega%20Drive%20-%20Genesis/Named_Boxarts/Sonic%20the%20Hedgehog%20(USA%2C%20Europe).png',
    romUrl: 'https://raw.githubusercontent.com/hstle/gamestation/main/Sonic%20The%20Hedgehog%20(USA%2C%20Europe).md',
    description: 'The legendary blue blur makes his debut. Experience the speed that defined a generation.',
    year: '1991',
    genre: 'Platformer',
    platform: 'Genesis'
  },
  {
    id: 'mario-world',
    title: 'Super Mario World',
    thumbnail: 'https://raw.githubusercontent.com/libretro/libretro-thumbnails/master/Nintendo%20-%20Super%20Nintendo%20Entertainment%20System/Named_Boxarts/Super%20Mario%20World%20(USA).png',
    romUrl: 'https://raw.githubusercontent.com/hstle/gamestation/main/Super%20Mario%20World%20(USA).sfc',
    description: 'Mario and Luigi embark on a quest to save Dinosaur Land from Bowser.',
    year: '1990',
    genre: 'Platformer',
    platform: 'SNES'
  },
  {
    id: 'mario-64',
    title: 'Super Mario 64',
    thumbnail: 'https://raw.githubusercontent.com/libretro/libretro-thumbnails/master/Nintendo%20-%20Nintendo%2064/Named_Boxarts/Super%20Mario%2064%20(USA).png',
    romUrl: 'https://raw.githubusercontent.com/hstle/gamestation/main/Super%20Mario%2064%20(USA).z64',
    description: 'The groundbreaking 3D platformer that redefined gaming forever.',
    year: '1996',
    genre: 'Platformer',
    platform: 'N64'
  },
  {
    id: 'pokemon-emerald',
    title: 'Pokemon Emerald',
    thumbnail: 'https://raw.githubusercontent.com/libretro/libretro-thumbnails/master/Nintendo%20-%20Game%20Boy%20Advance/Named_Boxarts/Pokemon%20-%20Emerald%20Version%20(USA%2C%20Europe).png',
    romUrl: 'https://raw.githubusercontent.com/libretro/libretro-samples/master/retro-roms/gba/2048.gba',
    description: 'The definitive Hoenn adventure. Catch them all in this GBA classic.',
    year: '2004',
    genre: 'RPG',
    platform: 'GBA'
  },
  {
    id: 'zelda-dx',
    title: 'Zelda: Link\'s Awakening DX',
    thumbnail: 'https://thumbnails.libretro.com/Nintendo%20-%20Game%20Boy%20Color/Named_Boxarts/Legend%20of%20Zelda%2C%20The%20-%20Link\'s%20Awakening%20DX%20(USA%2C%20Europe).png',
    romUrl: 'https://raw.githubusercontent.com/libretro/libretro-samples/master/retro-roms/gbc/2048.gbc',
    description: 'Link is shipwrecked on the mysterious Koholint Island.',
    year: '1998',
    genre: 'Action-Adventure',
    platform: 'GBC'
  },
  {
    id: 'mgs-1',
    title: 'Metal Gear Solid',
    thumbnail: 'https://thumbnails.libretro.com/Sony%20-%20PlayStation/Named_Boxarts/Metal%20Gear%20Solid%20(USA)%20(Disc%201).png',
    romUrl: 'https://raw.githubusercontent.com/libretro/libretro-samples/master/retro-roms/psx/2048.cue',
    description: 'Tactical Espionage Action. Solid Snake must infiltrate Shadow Moses.',
    year: '1998',
    genre: 'Stealth',
    platform: 'PSX'
  },
  {
    id: 'sor-1',
    title: 'Streets of Rage',
    thumbnail: 'https://thumbnails.libretro.com/Sega%20-%20Mega%20Drive%20-%20Genesis/Named_Boxarts/Streets%20of%20Rage%20(World).png',
    romUrl: 'https://raw.githubusercontent.com/hstle/gamestation/main/Streets%20of%20Rage%20(USA)%20(Rev-A).md',
    description: 'A classic side-scrolling beat em up. Take back the streets from Mr. X.',
    year: '1991',
    genre: 'Beat em up',
    platform: 'Genesis'
  },
  {
    id: 'sor-2',
    title: 'Streets of Rage 2',
    thumbnail: 'https://raw.githubusercontent.com/libretro/libretro-thumbnails/master/Sega%20-%20Mega%20Drive%20-%20Genesis/Named_Boxarts/Streets%20of%20Rage%202%20(USA).png',
    romUrl: 'https://raw.githubusercontent.com/hstle/gamestation/main/Streets%20of%20Rage%202%20(USA).md',
    description: 'Widely considered the best in the series. New characters, better graphics, and an iconic soundtrack.',
    year: '1992',
    genre: 'Beat em up',
    platform: 'Genesis'
  }
];
