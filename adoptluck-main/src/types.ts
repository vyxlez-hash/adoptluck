export type CoinSide = 'heads' | 'tails';

export type GameStatus = 'waiting' | 'active' | 'completed';

export interface PetValue {
  id: string;
  name: string;
  imageUrl: string;
  valueInRobux: number;
  rarity?: 'Common' | 'Rare' | 'Ultra-Rare' | 'Legendary' | 'Godly' | 'Exclusive';
  addedAt: number;
  addedBy?: string;
}

export interface PlayerPetItem {
  id: string;
  petId: string;
  name: string;
  imageUrl: string;
  valueInRobux: number;
  rarity?: string;
  assignedAt: number;
}

export interface User {
  id: string;
  username: string;
  displayName?: string;
  robloxId?: number | string;
  email?: string;
  avatar: string;
  balance: number; // in Robux (R$)
  level: number;
  createdAt: number;
  isAdmin?: boolean;
}

export interface CoinflipGame {
  id: string;
  creator: User;
  creatorSide: CoinSide;
  betAmount: number; // in Robux / Banknotes (or total pets value)
  betType?: 'currency' | 'pets';
  creatorPets?: PlayerPetItem[];
  challengerPets?: PlayerPetItem[];
  status: GameStatus;
  createdAt: number;
  challenger?: User;
  winner?: User;
  winningSide?: CoinSide;
  serverSeedHash?: string;
  serverSeed?: string;
  clientSeed?: string;
  isBotMatch?: boolean;
}

export type NavTab = 'coinflips' | 'amvgg-pets' | 'leaderboard';

export interface AmvggPet {
  id: string;
  itemId: string;
  name: string;
  category: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Ultra-Rare' | 'Legendary' | string;
  demand: number;
  origin: string;
  imagePath: string;
  amvggImageUrl: string;
  localImageUrl: string;
  amvggPageUrl: string;
  regValue?: { f?: string; r?: string; np?: string; rf?: string } | null;
  neonValue?: { f?: string; r?: string; np?: string; rf?: string } | null;
  megaValue?: { f?: string; r?: string; np?: string; rf?: string } | null;
  regTrend?: string;
  valueInRobux: number;
  tradeable?: boolean;
}

export type FilterTab = 'all' | 'waiting' | 'active' | 'completed';
