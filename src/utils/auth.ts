import { User, PetValue, PlayerPetItem, AmvggPet } from '../types';
import rawPetsData from '../data/amvggPets.json';

const amvggList = rawPetsData as unknown as AmvggPet[];
const amvggMapByName = new Map<string, AmvggPet>();
const amvggMapById = new Map<string, AmvggPet>();

for (const p of amvggList) {
  if (p.name) {
    amvggMapByName.set(p.name.toLowerCase().trim(), p);
  }
  if (p.itemId) {
    amvggMapById.set(String(p.itemId), p);
  }
  if (p.id) {
    amvggMapById.set(String(p.id), p);
  }
}

export interface RobloxAccount {
  id: string; // rbx-{userId}
  robloxId: number;
  username: string;
  displayName: string;
  avatar: string;
  balance: number; // in Robux
  level: number;
  createdAt: number;
  lastLoginAt: number;
  isAdmin?: boolean;
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: number;
}

export interface ResolvedRobloxProfile {
  id: number;
  username: string;
  displayName: string;
  description: string;
  avatar: string;
  created?: string;
}

const STORAGE_KEY_ACCOUNTS = 'bankro_roblox_accounts_v3';
const STORAGE_KEY_SESSION = 'bankro_auth_session_v3';
const STORAGE_KEY_PET_VALUES = 'bankro_pet_values_v3';
const STORAGE_KEY_PLAYER_PETS = 'bankro_player_inventories_v3';

export const ADMIN_USERNAME = 'cute240bunny';

export function isUserAdmin(username?: string): boolean {
  if (!username) return false;
  return username.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase();
}

const PHRASE_WORDS = [
  'falcon', 'cloud', 'silver', 'dragon', 'forest', 'planet',
  'comet', 'pixel', 'hammer', 'shadow', 'shield', 'legend', 'turbo', 'spark',
  'blaze', 'nebula', 'storm', 'ocean', 'golden', 'cyber', 'solar', 'alpha',
  'frost', 'hyper', 'pulse', 'knight', 'vortex', 'rocket'
];

export function generateVerificationPhrase(): string {
  const w1 = PHRASE_WORDS[Math.floor(Math.random() * PHRASE_WORDS.length)];
  const w2 = PHRASE_WORDS[Math.floor(Math.random() * PHRASE_WORDS.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `bankro-${w1}-${w2}-${num}`;
}

export function getStoredAccounts(): RobloxAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAccounts(accounts: RobloxAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save accounts', err);
  }
}

/**
 * Resolves a Roblox user by their username or userId via our proxy API
 */
export async function fetchRobloxUser(
  identifier: string
): Promise<{ success: boolean; user?: ResolvedRobloxProfile; error?: string }> {
  const trimmed = identifier.trim();
  if (!trimmed) {
    return { success: false, error: 'Please enter your Roblox username.' };
  }

  try {
    const isNumericId = /^\d+$/.test(trimmed);
    const param = isNumericId ? `userId=${trimmed}` : `username=${encodeURIComponent(trimmed)}`;
    const res = await fetch(`/api/roblox/user?${param}`);
    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data?.error || 'Roblox user not found. Please verify spelling.',
      };
    }

    return {
      success: true,
      user: data.user,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Could not connect to Roblox authentication service.',
    };
  }
}

/**
 * Verifies if the target phrase appears in the user's Roblox profile description/bio
 */
export async function verifyRobloxBio(
  userId: number,
  phrase: string
): Promise<{
  verified: boolean;
  currentBio?: string;
  user?: {
    id: string;
    robloxId: number;
    username: string;
    displayName: string;
    avatar: string;
  };
  error?: string;
}> {
  try {
    const res = await fetch('/api/roblox/verify-phrase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, phrase }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        verified: false,
        currentBio: data?.currentBio,
        error: data?.error || 'Verification check failed.',
      };
    }

    return {
      verified: !!data.verified,
      currentBio: data.currentBio,
      user: data.user,
      error: data.error,
    };
  } catch (err: any) {
    return {
      verified: false,
      error: err?.message || 'Network error while checking Roblox profile.',
    };
  }
}

/**
 * Creates or updates the authenticated Roblox account and issues an active session
 * Starting balance is strictly 0 Banknotes (no demo balance)
 */
export function completeRobloxLogin(verifiedUser: {
  robloxId: number;
  username: string;
  displayName: string;
  avatar: string;
}): User {
  const accounts = getStoredAccounts();
  const existingIndex = accounts.findIndex((a) => a.robloxId === verifiedUser.robloxId);
  const isAdmin = isUserAdmin(verifiedUser.username);

  let account: RobloxAccount;

  if (existingIndex !== -1) {
    account = {
      ...accounts[existingIndex],
      username: verifiedUser.username,
      displayName: verifiedUser.displayName,
      avatar: verifiedUser.avatar,
      isAdmin,
      lastLoginAt: Date.now(),
    };
    accounts[existingIndex] = account;
  } else {
    account = {
      id: `rbx-${verifiedUser.robloxId}`,
      robloxId: verifiedUser.robloxId,
      username: verifiedUser.username,
      displayName: verifiedUser.displayName,
      avatar: verifiedUser.avatar,
      balance: 0, // No demo balances - starts at 0 Banknotes!
      level: 1,
      isAdmin,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    };
    accounts.push(account);
  }

  saveAccounts(accounts);

  const user: User = {
    id: account.id,
    robloxId: account.robloxId,
    username: account.username,
    displayName: account.displayName,
    avatar: account.avatar,
    balance: account.balance,
    level: account.level,
    isAdmin,
    createdAt: account.createdAt,
  };

  createSession(user);
  return user;
}

/**
 * Quick login for testing as cute240bunny (Admin)
 */
export function loginAsCuteBunnyAdmin(): User {
  const adminUser: User = {
    id: 'rbx-cute240bunny',
    robloxId: 240240,
    username: 'cute240bunny',
    displayName: 'cute240bunny (Admin)',
    avatar: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&auto=format&fit=crop&q=80',
    balance: 5000,
    level: 99,
    isAdmin: true,
    createdAt: Date.now(),
  };

  createSession(adminUser);
  return adminUser;
}

export function createSession(user: User): AuthSession {
  const token = `sess_rbx_${user.id}_${Date.now()}`;
  const session: AuthSession = {
    token,
    user: {
      ...user,
      isAdmin: isUserAdmin(user.username),
    },
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
  };

  try {
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
  } catch (err) {
    console.error('Failed to store session', err);
  }

  return session;
}

export function getCurrentSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      logoutAccount();
      return null;
    }
    const accounts = getStoredAccounts();
    const updated = accounts.find((a) => a.id === session.user.id);
    if (updated) {
      session.user = {
        ...session.user,
        balance: updated.balance,
        level: updated.level,
        avatar: updated.avatar || session.user.avatar,
        username: updated.username,
        displayName: updated.displayName,
        isAdmin: isUserAdmin(updated.username),
      };
    } else {
      session.user.isAdmin = isUserAdmin(session.user.username);
    }
    return session;
  } catch {
    return null;
  }
}

export function logoutAccount(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  } catch (err) {
    console.error('Failed to remove session', err);
  }
}

export function updateUserBalance(userId: string, newBalance: number): void {
  const accounts = getStoredAccounts();
  const idx = accounts.findIndex((a) => a.id === userId);
  if (idx !== -1) {
    accounts[idx].balance = Math.max(0, newBalance);
    saveAccounts(accounts);
  }

  const session = getCurrentSession();
  if (session && session.user.id === userId) {
    session.user.balance = Math.max(0, newBalance);
    try {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    } catch {
      // ignore
    }
  }
}

/* ==========================================================================
   PET VALUES & PLAYER INVENTORIES (CUTE240BUNNY ADMIN SUITE)
   ========================================================================== */

const INITIAL_PET_VALUES: PetValue[] = [
  {
    id: 'pet-bat-dragon',
    name: 'Bat Dragon',
    imageUrl: '/api/amvgg/image/1',
    valueInRobux: 297100,
    rarity: 'Legendary',
    addedAt: Date.now() - 1000 * 60 * 60 * 24,
    addedBy: 'cute240bunny',
  },
  {
    id: 'pet-shadow-dragon',
    name: 'Shadow Dragon',
    imageUrl: '/api/amvgg/image/2',
    valueInRobux: 216334,
    rarity: 'Legendary',
    addedAt: Date.now() - 1000 * 60 * 60 * 20,
    addedBy: 'cute240bunny',
  },
  {
    id: 'pet-frost-dragon',
    name: 'Frost Dragon',
    imageUrl: '/api/amvgg/image/4',
    valueInRobux: 100000,
    rarity: 'Legendary',
    addedAt: Date.now() - 1000 * 60 * 60 * 15,
    addedBy: 'cute240bunny',
  },
  {
    id: 'pet-giraffe',
    name: 'Giraffe',
    imageUrl: '/api/amvgg/image/3',
    valueInRobux: 147632,
    rarity: 'Legendary',
    addedAt: Date.now() - 1000 * 60 * 60 * 10,
    addedBy: 'cute240bunny',
  },
];

export function getPetValues(): PetValue[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PET_VALUES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PET_VALUES, JSON.stringify(INITIAL_PET_VALUES));
      return INITIAL_PET_VALUES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PET_VALUES;
  }
}

export function savePetValues(values: PetValue[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PET_VALUES, JSON.stringify(values));
  } catch (err) {
    console.error('Failed to save pet values', err);
  }
}

export function addPetValue(data: Omit<PetValue, 'id' | 'addedAt'>): PetValue {
  const values = getPetValues();
  const newPet: PetValue = {
    ...data,
    id: `pet-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    addedAt: Date.now(),
    addedBy: 'cute240bunny',
  };
  const updated = [newPet, ...values];
  savePetValues(updated);
  return newPet;
}

export function deletePetValue(id: string): void {
  const values = getPetValues();
  const filtered = values.filter((p) => p.id !== id);
  savePetValues(filtered);
}

export function getAllPlayerInventories(): Record<string, PlayerPetItem[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLAYER_PETS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// 100% REAL Adopt Me Pets matching the Values tab exactly
const STARTER_REAL_NAMES = [
  'Shadow Dragon',
  'Bat Dragon',
  'Frost Dragon',
  'Giraffe',
  'Turtle',
  'Cow'
];

export const STARTER_PET_TEMPLATES = STARTER_REAL_NAMES.map((petName) => {
  const real = amvggMapByName.get(petName.toLowerCase());
  if (real) {
    return {
      petId: `amvgg-${real.itemId}`,
      name: real.name,
      imageUrl: real.localImageUrl || `/api/amvgg/image/${real.itemId}`,
      valueInRobux: real.valueInRobux,
      rarity: real.rarity,
    };
  }
  return {
    petId: 'amvgg-2',
    name: 'Shadow Dragon',
    imageUrl: '/api/amvgg/image/2',
    valueInRobux: 50000,
    rarity: 'Legendary',
  };
});

export function getPlayerPets(username: string): PlayerPetItem[] {
  if (!username) return [];
  const inventories = getAllPlayerInventories();
  const key = username.trim().toLowerCase();
  const rawList = inventories[key];

  // If this user has never had an inventory initialized, give real starter pets
  if (!rawList || rawList.length === 0) {
    const starterPets: PlayerPetItem[] = STARTER_PET_TEMPLATES.map((tpl, i) => ({
      ...tpl,
      id: `starter-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      assignedAt: Date.now() - i * 1000,
    }));
    inventories[key] = starterPets;
    try {
      localStorage.setItem(STORAGE_KEY_PLAYER_PETS, JSON.stringify(inventories));
    } catch {
      // ignore
    }
    return starterPets;
  }

  // Sanitize player's inventory:
  // 1. Remove fake pets (any item that doesn't match a real Adopt Me pet from amvggPets)
  // 2. Ensure pet.imageUrl matches the exact Values tab localImageUrl (/api/amvgg/image/:id)
  let changed = false;
  const sanitized: PlayerPetItem[] = [];

  for (const item of rawList) {
    const real =
      amvggMapByName.get(item.name?.toLowerCase().trim()) ||
      (item.petId ? amvggMapById.get(item.petId.replace(/^amvgg-|^pet-/, '')) : undefined);

    if (real) {
      const realImg = real.localImageUrl || `/api/amvgg/image/${real.itemId}`;
      if (item.imageUrl !== realImg || item.valueInRobux !== realPetValueFallback(real.valueInRobux)) {
        changed = true;
      }
      sanitized.push({
        ...item,
        petId: `amvgg-${real.itemId}`,
        name: real.name,
        imageUrl: realImg,
        valueInRobux: real.valueInRobux,
        rarity: real.rarity,
      });
    } else {
      // Fake pet removed
      changed = true;
    }
  }

  // If all were fake and stripped, re-populate with real starter pets
  if (sanitized.length === 0) {
    const starterPets: PlayerPetItem[] = STARTER_PET_TEMPLATES.map((tpl, i) => ({
      ...tpl,
      id: `starter-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      assignedAt: Date.now() - i * 1000,
    }));
    inventories[key] = starterPets;
    try {
      localStorage.setItem(STORAGE_KEY_PLAYER_PETS, JSON.stringify(inventories));
    } catch {
      // ignore
    }
    return starterPets;
  }

  if (changed) {
    inventories[key] = sanitized;
    try {
      localStorage.setItem(STORAGE_KEY_PLAYER_PETS, JSON.stringify(inventories));
    } catch {
      // ignore
    }
  }

  return sanitized;
}

function realPetValueFallback(v: number): number {
  return v > 0 ? v : 100;
}

export function claimStarterPets(username: string): PlayerPetItem[] {
  if (!username) return [];
  const inventories = getAllPlayerInventories();
  const key = username.trim().toLowerCase();
  const current = getPlayerPets(username);

  const newPets: PlayerPetItem[] = STARTER_PET_TEMPLATES.map((tpl, i) => ({
    ...tpl,
    id: `claimed-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
    assignedAt: Date.now() - i * 1000,
  }));

  const combined = [...newPets, ...current];
  inventories[key] = combined;
  try {
    localStorage.setItem(STORAGE_KEY_PLAYER_PETS, JSON.stringify(inventories));
  } catch (err) {
    console.error('Failed to claim starter pets', err);
  }

  return combined;
}

export function addPetToPlayer(username: string, pet: PetValue): PlayerPetItem {
  const inventories = getAllPlayerInventories();
  const key = username.trim().toLowerCase();
  const currentList = getPlayerPets(username);

  // Match against real pet if possible
  const real = amvggMapByName.get(pet.name?.toLowerCase().trim());
  const realImg = real?.localImageUrl || pet.imageUrl;

  const newItem: PlayerPetItem = {
    id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    petId: real ? `amvgg-${real.itemId}` : pet.id,
    name: real ? real.name : pet.name,
    imageUrl: realImg,
    valueInRobux: real ? real.valueInRobux : pet.valueInRobux,
    rarity: real ? real.rarity : pet.rarity,
    assignedAt: Date.now(),
  };

  inventories[key] = [newItem, ...currentList];
  try {
    localStorage.setItem(STORAGE_KEY_PLAYER_PETS, JSON.stringify(inventories));
  } catch (err) {
    console.error('Failed to update player pet inventory', err);
  }

  return newItem;
}

export function addPetsToPlayer(username: string, pets: PlayerPetItem[]): void {
  if (!username || !pets.length) return;
  const inventories = getAllPlayerInventories();
  const key = username.trim().toLowerCase();
  const currentList = getPlayerPets(username);

  inventories[key] = [...pets, ...currentList];
  try {
    localStorage.setItem(STORAGE_KEY_PLAYER_PETS, JSON.stringify(inventories));
  } catch (err) {
    console.error('Failed to add pets to player', err);
  }
}

export function removePetFromPlayer(username: string, itemInstanceId: string): void {
  const inventories = getAllPlayerInventories();
  const key = username.trim().toLowerCase();
  const currentList = getPlayerPets(username);

  inventories[key] = currentList.filter((item) => item.id !== itemInstanceId);
  try {
    localStorage.setItem(STORAGE_KEY_PLAYER_PETS, JSON.stringify(inventories));
  } catch (err) {
    console.error('Failed to remove player pet', err);
  }
}

export function removePetsFromPlayer(username: string, itemInstanceIds: string[]): void {
  if (!username || !itemInstanceIds.length) return;
  const inventories = getAllPlayerInventories();
  const key = username.trim().toLowerCase();
  const currentList = getPlayerPets(username);
  const idSet = new Set(itemInstanceIds);

  inventories[key] = currentList.filter((item) => !idSet.has(item.id));
  try {
    localStorage.setItem(STORAGE_KEY_PLAYER_PETS, JSON.stringify(inventories));
  } catch (err) {
    console.error('Failed to remove player pets', err);
  }
}

export function transferPets(fromUsername: string, toUsername: string, pets: PlayerPetItem[]): void {
  if (!pets.length) return;
  const petIds = pets.map((p) => p.id);
  removePetsFromPlayer(fromUsername, petIds);
  addPetsToPlayer(toUsername, pets);
}

/* ==========================================================================
   REAL ROBLOX USERS & LIVE LEADERBOARD TRACKING
   ========================================================================== */

export interface LeaderboardUser {
  rank: number;
  robloxUsername: string;
  robloxId: number | string;
  avatar: string;
  wagered: number;
  badge?: string;
  isCurrentUser?: boolean;
}

const STORAGE_KEY_USER_WAGERS = 'bankro_user_wagers_v4';

export function recordUserWager(
  username: string,
  robloxId: number | string,
  avatar: string,
  wagerAmount: number
): void {
  if (!username || wagerAmount <= 0) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER_WAGERS);
    const map: Record<
      string,
      { username: string; robloxId: number | string; avatar: string; wagered: number }
    > = raw ? JSON.parse(raw) : {};

    const key = username.trim().toLowerCase();
    if (!map[key]) {
      map[key] = {
        username,
        robloxId,
        avatar,
        wagered: wagerAmount,
      };
    } else {
      map[key].wagered += wagerAmount;
      if (avatar) map[key].avatar = avatar;
      if (robloxId) map[key].robloxId = robloxId;
    }

    localStorage.setItem(STORAGE_KEY_USER_WAGERS, JSON.stringify(map));
  } catch (err) {
    console.error('Failed to record user wager', err);
  }
}

/**
 * Returns strictly REAL Roblox users and their profiles, ordered by wagered value.
 * Dynamically updates with real logged-in users and real Roblox accounts.
 */
export function getRealLeaderboard(currentUsername?: string): LeaderboardUser[] {
  const userMap = new Map<
    string,
    { username: string; robloxId: number | string; avatar: string; wagered: number; badge?: string }
  >();

  // 1. Add verified platform admin cute240bunny
  userMap.set('cute240bunny', {
    username: 'cute240bunny',
    robloxId: 135982143,
    avatar: 'https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=135982143&size=150x150&format=Png&isCircular=false',
    wagered: 0,
    badge: 'ADMIN',
  });

  // 2. Add authenticated accounts from getStoredAccounts()
  const accounts = getStoredAccounts();
  for (const acc of accounts) {
    const key = acc.username.toLowerCase();
    const existing = userMap.get(key);
    if (existing) {
      existing.robloxId = acc.robloxId;
      existing.avatar = acc.avatar || existing.avatar;
    } else {
      userMap.set(key, {
        username: acc.username,
        robloxId: acc.robloxId,
        avatar:
          acc.avatar ||
          `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${acc.robloxId}&size=150x150&format=Png&isCircular=false`,
        wagered: 0,
        badge: acc.isAdmin ? 'ADMIN' : undefined,
      });
    }
  }

  // 3. Add current session user if not yet in map
  if (currentUsername) {
    const key = currentUsername.toLowerCase();
    if (!userMap.has(key)) {
      const session = getCurrentSession();
      if (session && session.user) {
        userMap.set(key, {
          username: session.user.username,
          robloxId: session.user.robloxId || '',
          avatar: session.user.avatar,
          wagered: 0,
          badge: session.user.isAdmin ? 'ADMIN' : undefined,
        });
      }
    }
  }

  // 4. Add tracked wager amounts from real live games
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER_WAGERS);
    if (raw) {
      const wagers: Record<
        string,
        { username: string; robloxId: number | string; avatar: string; wagered: number }
      > = JSON.parse(raw);

      for (const [k, v] of Object.entries(wagers)) {
        const lowerK = k.toLowerCase();
        // Ignore any lingering fake demo accounts from previous sessions
        if (['newfissy', 'bethink', 'meganplays', 'russotalks', 'iamsanta'].includes(lowerK)) {
          continue;
        }

        const existing = userMap.get(lowerK);
        if (existing) {
          existing.wagered += v.wagered;
          if (v.avatar) existing.avatar = v.avatar;
          if (v.robloxId) existing.robloxId = v.robloxId;
        } else {
          userMap.set(lowerK, {
            username: v.username,
            robloxId: v.robloxId,
            avatar: v.avatar,
            wagered: v.wagered,
            badge: undefined,
          });
        }
      }
    }
  } catch {
    // ignore
  }

  // Sort descending by total wagered
  const sorted = Array.from(userMap.values()).sort((a, b) => b.wagered - a.wagered);

  return sorted.map((user, idx) => ({
    rank: idx + 1,
    robloxUsername: user.username,
    robloxId: user.robloxId,
    avatar: user.avatar,
    wagered: user.wagered,
    badge: user.badge,
    isCurrentUser: currentUsername
      ? user.username.toLowerCase() === currentUsername.toLowerCase()
      : false,
  }));
}
