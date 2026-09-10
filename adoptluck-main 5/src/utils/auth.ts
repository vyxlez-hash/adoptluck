```tsx
import {
  User,
  PetValue,
  PlayerPetItem,
  AmvggPet,
  CoinflipGame,
} from '../types';
import rawPetsData from '../data/amvggPets.json';
import {
  supabaseConfigured,
  supabaseRest,
  supabaseUpsert,
  supabasePatch,
  supabaseDelete,
} from './supabase';

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
  id: string;
  robloxId: number;
  username: string;
  displayName: string;
  avatar: string;
  balance: number;
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

const STORAGE_KEY_ACCOUNTS = 'adoptluck_roblox_accounts_v4';
const STORAGE_KEY_SESSION = 'adoptluck_auth_session_v4';
const STORAGE_KEY_PET_VALUES = 'adoptluck_pet_values_v4';
const STORAGE_KEY_PLAYER_PETS = 'adoptluck_player_inventories_v4';
const STORAGE_KEY_USER_WAGERS = 'adoptluck_user_wagers_v5';

export const ADMIN_USERNAME = 'cute240bunny';

export function isUserAdmin(username?: string): boolean {
  if (!username) return false;

  return (
    username.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase()
  );
}

const PHRASE_WORDS = [
  'falcon',
  'cloud',
  'silver',
  'dragon',
  'forest',
  'planet',
  'comet',
  'pixel',
  'hammer',
  'shadow',
  'shield',
  'legend',
  'turbo',
  'spark',
  'blaze',
  'nebula',
  'storm',
  'ocean',
  'golden',
  'cyber',
  'solar',
  'alpha',
  'frost',
  'hyper',
  'pulse',
  'knight',
  'vortex',
  'rocket',
];

export function generateVerificationPhrase(): string {
  const w1 =
    PHRASE_WORDS[
      Math.floor(Math.random() * PHRASE_WORDS.length)
    ];

  const w2 =
    PHRASE_WORDS[
      Math.floor(Math.random() * PHRASE_WORDS.length)
    ];

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
    localStorage.setItem(
      STORAGE_KEY_ACCOUNTS,
      JSON.stringify(accounts)
    );
  } catch (err) {
    console.error('Failed to save accounts', err);
  }
}

export async function fetchRobloxUser(
  identifier: string
): Promise<{
  success: boolean;
  user?: ResolvedRobloxProfile;
  error?: string;
}> {
  const trimmed = identifier.trim();

  if (!trimmed) {
    return {
      success: false,
      error: 'Please enter your Roblox username.',
    };
  }

  try {
    const isNumericId = /^\d+$/.test(trimmed);

    const param = isNumericId
      ? `userId=${trimmed}`
      : `username=${encodeURIComponent(trimmed)}`;

    const res = await fetch(`/api/roblox/user?${param}`);
    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        error:
          data?.error ||
          'Roblox user not found. Please verify spelling.',
      };
    }

    return {
      success: true,
      user: data.user,
    };
  } catch (err: any) {
    return {
      success: false,
      error:
        err?.message ||
        'Could not connect to Roblox authentication service.',
    };
  }
}

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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        phrase,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        verified: false,
        currentBio: data?.currentBio,
        error:
          data?.error || 'Verification check failed.',
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
      error:
        err?.message ||
        'Network error while checking Roblox profile.',
    };
  }
}

export async function syncAccountToSupabase(
  user: User
): Promise<void> {
  if (!supabaseConfigured) return;

  try {
    await supabaseUpsert('profiles', {
      id: user.id,
      roblox_id: Number(user.robloxId),
      username: user.username,
      display_name: user.displayName || user.username,
      avatar: user.avatar,
      balance: user.balance,
      level: user.level,
      is_admin: isUserAdmin(user.username),
      created_at: new Date(user.createdAt).toISOString(),
      last_login_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn(
      'Supabase profile sync failed:',
      err
    );
  }
}

export async function hydrateAccountFromSupabase(
  userId: string
): Promise<User | null> {
  if (!supabaseConfigured) return null;

  try {
    const rows = await supabaseRest<any[]>(
      `profiles?id=eq.${encodeURIComponent(
        userId
      )}&select=*`
    );

    const row = rows[0];

    if (!row) return null;

    const user: User = {
      id: row.id,
      robloxId: row.roblox_id,
      username: row.username,
      displayName:
        row.display_name || row.username,
      avatar: row.avatar || '',
      balance: Number(row.balance || 0),
      level: Number(row.level || 1),
      isAdmin:
        !!row.is_admin ||
        isUserAdmin(row.username),
      createdAt: new Date(
        row.created_at
      ).getTime(),
    };

    const accounts = getStoredAccounts();

    const idx = accounts.findIndex(
      (a) => a.id === user.id
    );

    const account: RobloxAccount = {
      id: user.id,
      robloxId: Number(user.robloxId),
      username: user.username,
      displayName:
        user.displayName || user.username,
      avatar: user.avatar,
      balance: user.balance,
      level: user.level,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      lastLoginAt: Date.now(),
    };

    if (idx >= 0) {
      accounts[idx] = account;
    } else {
      accounts.push(account);
    }

    saveAccounts(accounts);

    const session = getCurrentSession();

    if (
      session?.user.id === user.id
    ) {
      session.user = user;

      localStorage.setItem(
        STORAGE_KEY_SESSION,
        JSON.stringify(session)
      );
    }

    return user;
  } catch (err) {
    console.warn(
      'Supabase profile hydrate failed:',
      err
    );

    return null;
  }
}

export async function syncPlayerPetsToSupabase(
  username: string
): Promise<void> {
  if (!supabaseConfigured || !username) return;

  try {
    await supabaseDelete(
      'player_pets',
      `username=ilike.${encodeURIComponent(username)}`
    );

    const pets =
      getAllPlayerInventories()[
        username.trim().toLowerCase()
      ] || [];

    if (pets.length) {
      await supabaseUpsert(
        'player_pets',
        pets.map((p) => ({
          id: p.id,
          username,
          pet_id: p.petId,
          name: p.name,
          image_url: p.imageUrl,
          value_in_robux: p.valueInRobux,
          rarity: p.rarity || null,
          assigned_at: p.assignedAt,
        }))
      );
    }
  } catch (err) {
    console.warn(
      'Supabase inventory sync failed:',
      err
    );
  }
}

export async function hydratePlayerPetsFromSupabase(
  username: string
): Promise<PlayerPetItem[]> {
  if (!supabaseConfigured || !username) {
    return getPlayerPets(username);
  }

  try {
    const rows = await supabaseRest<any[]>(
      `player_pets?username=ilike.${encodeURIComponent(
        username
      )}&select=*`
    );

    const pets: PlayerPetItem[] = rows.map(
      (row) => ({
        id: row.id,
        petId: row.pet_id,
        name: row.name,
        imageUrl: row.image_url,
        valueInRobux: Number(
          row.value_in_robux || 0
        ),
        rarity:
          row.rarity || undefined,
        assignedAt: Number(
          row.assigned_at || Date.now()
        ),
      })
    );

    const inventories =
      getAllPlayerInventories();

    inventories[
      username.trim().toLowerCase()
    ] = pets;

    localStorage.setItem(
      STORAGE_KEY_PLAYER_PETS,
      JSON.stringify(inventories)
    );

    return pets;
  } catch (err) {
    console.warn(
      'Supabase inventory hydrate failed:',
      err
    );

    return getPlayerPets(username);
  }
}

export async function fetchGamesFromSupabase(): Promise<
  CoinflipGame[]
> {
  if (!supabaseConfigured) return [];

  try {
    const rows = await supabaseRest<any[]>(
      'coinflip_games?status=in.(waiting,active)&order=created_at.desc&select=*'
    );

    return rows.map((row) => ({
      id: row.id,
      creator: row.creator,
      challenger:
        row.challenger || undefined,
      creatorSide: row.creator_side,
      betAmount: Number(
        row.bet_amount || 0
      ),
      betType: row.bet_type,
      creatorPets:
        row.creator_pets || undefined,
      challengerPets:
        row.challenger_pets || undefined,
      status: row.status,
      createdAt: Number(
        row.created_at
      ),
      winner:
        row.winner || undefined,
      winningSide:
        row.winning_side || undefined,
      serverSeedHash:
        row.server_seed_hash ||
        undefined,
      serverSeed:
        row.server_seed ||
        undefined,
      clientSeed:
        row.client_seed ||
        undefined,
      isBotMatch:
        !!row.is_bot_match,
    }));
  } catch (err) {
    console.warn(
      'Supabase games fetch failed:',
      err
    );

    return [];
  }
}

export async function saveGameToSupabase(
  game: CoinflipGame
): Promise<void> {
  if (!supabaseConfigured) return;

  try {
    await supabaseUpsert(
      'coinflip_games',
      {
        id: game.id,
        creator_id:
          game.creator.id,
        challenger_id:
          game.challenger?.id ||
          null,
        creator: game.creator,
        challenger:
          game.challenger ||
          null,
        creator_side:
          game.creatorSide,
        bet_amount:
          game.betAmount,
        bet_type:
          game.betType ||
          'currency',
        creator_pets:
          game.creatorPets ||
          null,
        challenger_pets:
          game.challengerPets ||
          null,
        status: game.status,
        created_at:
          game.createdAt,
        winner:
          game.winner ||
          null,
        winning_side:
          game.winningSide ||
          null,
        server_seed_hash:
          game.serverSeedHash ||
          null,
        server_seed:
          game.serverSeed ||
          null,
        client_seed:
          game.clientSeed ||
          null,
        is_bot_match:
          !!game.isBotMatch,
      }
    );
  } catch (err) {
    console.warn(
      'Supabase game sync failed:',
      err
    );
  }
}

export async function deleteGameFromSupabase(
  gameId: string
): Promise<void> {
  if (!supabaseConfigured) return;

  try {
    await supabaseDelete(
      'coinflip_games',
      `id=eq.${encodeURIComponent(gameId)}`
    );
  } catch (err) {
    console.warn(
      'Supabase game delete failed:',
      err
    );
  }
}

export function completeRobloxLogin(
  verifiedUser: {
    robloxId: number;
    username: string;
    displayName: string;
    avatar: string;
  }
): User {
  const accounts =
    getStoredAccounts();

  const existingIndex =
    accounts.findIndex(
      (a) =>
        a.robloxId ===
        verifiedUser.robloxId
    );

  const isAdmin =
    isUserAdmin(
      verifiedUser.username
    );

  let account: RobloxAccount;

  if (existingIndex !== -1) {
    account = {
      ...accounts[existingIndex],
      username:
        verifiedUser.username,
      displayName:
        verifiedUser.displayName,
      avatar:
        verifiedUser.avatar,
      isAdmin,
      lastLoginAt: Date.now(),
    };

    accounts[existingIndex] =
      account;
  } else {
    account = {
      id: `rbx-${verifiedUser.robloxId}`,
      robloxId:
        verifiedUser.robloxId,
      username:
        verifiedUser.username,
      displayName:
        verifiedUser.displayName,
      avatar:
        verifiedUser.avatar,
      balance: 0,
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
    robloxId:
      account.robloxId,
    username:
      account.username,
    displayName:
      account.displayName,
    avatar:
      account.avatar,
    balance:
      account.balance,
    level:
      account.level,
    isAdmin,
    createdAt:
      account.createdAt,
  };

  createSession(user);

  void syncAccountToSupabase(
    user
  );

  void hydratePlayerPetsFromSupabase(
    user.username
  );

  return user;
}

export function loginAsCuteBunnyAdmin(): User {
  const adminUser: User = {
    id: 'rbx-cute240bunny',
    robloxId: 240240,
    username: 'cute240bunny',
    displayName:
      'cute240bunny (Admin)',
    avatar:
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&auto=format&fit=crop&q=80',
    balance: 5000,
    level: 99,
    isAdmin: true,
    createdAt: Date.now(),
  };

  createSession(adminUser);

  return adminUser;
}

export function createSession(
  user: User
): AuthSession {
  const token =
    `sess_rbx_${user.id}_${Date.now()}`;

  const session: AuthSession = {
    token,
    user: {
      ...user,
      isAdmin:
        isUserAdmin(
          user.username
        ),
    },
    expiresAt:
      Date.now() +
      1000 * 60 * 60 * 24 * 30,
  };

  try {
    localStorage.setItem(
      STORAGE_KEY_SESSION,
      JSON.stringify(session)
    );
  } catch (err) {
    console.error(
      'Failed to store session',
      err
    );
  }

  return session;
}

export function getCurrentSession():
  | AuthSession
  | null {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY_SESSION
      );

    if (!raw) return null;

    const session: AuthSession =
      JSON.parse(raw);

    if (
      Date.now() >
      session.expiresAt
    ) {
      logoutAccount();
      return null;
    }

    const accounts =
      getStoredAccounts();

    const updated =
      accounts.find(
        (a) =>
          a.id ===
          session.user.id
      );

    if (updated) {
      session.user = {
        ...session.user,
        balance:
          updated.balance,
        level:
          updated.level,
        avatar:
          updated.avatar ||
          session.user.avatar,
        username:
          updated.username,
        displayName:
          updated.displayName,
        isAdmin:
          isUserAdmin(
            updated.username
          ),
      };
    } else {
      session.user.isAdmin =
        isUserAdmin(
          session.user.username
        );
    }

    return session;
  } catch {
    return null;
  }
}

export function logoutAccount(): void {
  try {
    localStorage.removeItem(
      STORAGE_KEY_SESSION
    );
  } catch (err) {
    console.error(
      'Failed to remove session',
      err
    );
  }
}

export function updateUserBalance(
  userId: string,
  newBalance: number
): void {
  const accounts =
    getStoredAccounts();

  const idx =
    accounts.findIndex(
      (a) => a.id === userId
    );

  if (idx !== -1) {
    accounts[idx].balance =
      Math.max(
        0,
        newBalance
      );

    saveAccounts(accounts);

    const updatedAccount =
      accounts[idx];

    if (supabaseConfigured) {
      void supabasePatch(
        'profiles',
        `id=eq.${encodeURIComponent(
          userId
        )}`,
        {
          balance:
            updatedAccount.balance,
          level:
            updatedAccount.level,
          last_login_at:
            new Date().toISOString(),
        }
      ).catch((err) =>
        console.warn(
          'Supabase balance sync failed:',
          err
        )
      );
    }
  }

  const session =
    getCurrentSession();

  if (
    session &&
    session.user.id === userId
  ) {
    session.user.balance =
      Math.max(
        0,
        newBalance
      );

    try {
      localStorage.setItem(
        STORAGE_KEY_SESSION,
        JSON.stringify(session)
      );
    } catch {
      // Ignore storage errors.
    }
  }
}

/* ==========================================================================
   PET VALUES & PLAYER INVENTORIES
   ========================================================================== */

const INITIAL_PET_VALUES: PetValue[] = [
  {
    id: 'pet-bat-dragon',
    name: 'Bat Dragon',
    imageUrl: '/api/amvgg/image/1',
    valueInRobux: 297100,
    rarity: 'Legendary',
    addedAt:
      Date.now() -
      1000 * 60 * 60 * 24,
    addedBy:
      'cute240bunny',
  },
  {
    id: 'pet-shadow-dragon',
    name: 'Shadow Dragon',
    imageUrl: '/api/amvgg/image/2',
    valueInRobux: 216334,
    rarity: 'Legendary',
    addedAt:
      Date.now() -
      1000 * 60 * 60 * 20,
    addedBy:
      'cute240bunny',
  },
  {
    id: 'pet-frost-dragon',
    name: 'Frost Dragon',
    imageUrl: '/api/amvgg/image/4',
    valueInRobux: 100000,
    rarity: 'Legendary',
    addedAt:
      Date.now() -
      1000 * 60 * 60 * 15,
    addedBy:
      'cute240bunny',
  },
  {
    id: 'pet-giraffe',
    name: 'Giraffe',
    imageUrl: '/api/amvgg/image/3',
    valueInRobux: 147632,
    rarity: 'Legendary',
    addedAt:
      Date.now() -
      1000 * 60 * 60 * 10,
    addedBy:
      'cute240bunny',
  },
];

export function getPetValues(): PetValue[] {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY_PET_VALUES
      );

    if (!raw) {
      localStorage.setItem(
        STORAGE_KEY_PET_VALUES,
        JSON.stringify(
          INITIAL_PET_VALUES
        )
      );

      return INITIAL_PET_VALUES;
    }

    return JSON.parse(raw);
  } catch {
    return INITIAL_PET_VALUES;
  }
}

export function savePetValues(
  values: PetValue[]
): void {
  try {
    localStorage.setItem(
      STORAGE_KEY_PET_VALUES,
      JSON.stringify(values)
    );
  } catch (err) {
    console.error(
      'Failed to save pet values',
      err
    );
  }
}

export function addPetValue(
  data: Omit<
    PetValue,
    'id' | 'addedAt'
  >
): PetValue {
  const values =
    getPetValues();

  const newPet: PetValue = {
    ...data,
    id:
      `pet-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 6)}`,
    addedAt:
      Date.now(),
    addedBy:
      'cute240bunny',
  };

  const updated = [
    newPet,
    ...values,
  ];

  savePetValues(updated);

  return newPet;
}

export function deletePetValue(
  id: string
): void {
  const values =
    getPetValues();

  savePetValues(
    values.filter(
      (p) => p.id !== id
    )
  );
}

export function getAllPlayerInventories():
  Record<string, PlayerPetItem[]> {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY_PLAYER_PETS
      );

    return raw
      ? JSON.parse(raw)
      : {};
  } catch {
    return {};
  }
}

/**
 * Returns the current player's inventory.
 *
 * This function is intentionally exported because
 * CreateGameModal and InventoryModal use it.
 */
export function getPlayerPets(
  username: string
): PlayerPetItem[] {
  if (!username) return [];

  const inventories =
    getAllPlayerInventories();

  const key =
    username.trim().toLowerCase();

  return (
    inventories[key] || []
  );
}

export function addPetToPlayer(
  username: string,
  pet: PetValue
): PlayerPetItem {
  const inventories =
    getAllPlayerInventories();

  const key =
    username.trim().toLowerCase();

  const currentList =
    getPlayerPets(username);

  const real =
    amvggMapByName.get(
      pet.name
        ?.toLowerCase()
        .trim()
    );

  const realImg =
    real?.localImageUrl ||
    pet.imageUrl;

  const newItem: PlayerPetItem = {
    id:
      `item-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 6)}`,
    petId:
      real
        ? `amvgg-${real.itemId}`
        : pet.id,
    name:
      real
        ? real.name
        : pet.name,
    imageUrl:
      realImg,
    valueInRobux:
      real
        ? real.valueInRobux
        : pet.valueInRobux,
    rarity:
      real
        ? real.rarity
        : pet.rarity,
    assignedAt:
      Date.now(),
  };

  inventories[key] = [
    newItem,
    ...currentList,
  ];

  try {
    localStorage.setItem(
      STORAGE_KEY_PLAYER_PETS,
      JSON.stringify(inventories)
    );
  } catch (err) {
    console.error(
      'Failed to update player pet inventory',
      err
    );
  }

  void syncPlayerPetsToSupabase(
    username
  );

  return newItem;
}

export function addPetsToPlayer(
  username: string,
  pets: PlayerPetItem[]
): void {
  if (
    !username ||
    !pets.length
  ) {
    return;
  }

  const inventories =
    getAllPlayerInventories();

  const key =
    username.trim().toLowerCase();

  const currentList =
    getPlayerPets(username);

  inventories[key] = [
    ...pets,
    ...currentList,
  ];

  try {
    localStorage.setItem(
      STORAGE_KEY_PLAYER_PETS,
      JSON.stringify(inventories)
    );
  } catch (err) {
    console.error(
      'Failed to add pets to player',
      err
    );
  }

  void syncPlayerPetsToSupabase(
    username
  );
}

export function removePetFromPlayer(
  username: string,
  itemInstanceId: string
): void {
  const inventories =
    getAllPlayerInventories();

  const key =
    username.trim().toLowerCase();

  const currentList =
    getPlayerPets(username);

  inventories[key] =
    currentList.filter(
      (item) =>
        item.id !==
        itemInstanceId
    );

  try {
    localStorage.setItem(
      STORAGE_KEY_PLAYER_PETS,
      JSON.stringify(inventories)
    );
  } catch (err) {
    console.error(
      'Failed to remove player pet',
      err
    );
  }

  void syncPlayerPetsToSupabase(
    username
  );
}

export function removePetsFromPlayer(
  username: string,
  itemInstanceIds: string[]
): void {
  if (
    !username ||
    !itemInstanceIds.length
  ) {
    return;
  }

  const inventories =
    getAllPlayerInventories();

  const key =
    username.trim().toLowerCase();

  const currentList =
    getPlayerPets(username);

  const idSet =
    new Set(itemInstanceIds);

  inventories[key] =
    currentList.filter(
      (item) =>
        !idSet.has(item.id)
    );

  try {
    localStorage.setItem(
      STORAGE_KEY_PLAYER_PETS,
      JSON.stringify(inventories)
    );
  } catch (err) {
    console.error(
      'Failed to remove player pets',
      err
    );
  }

  void syncPlayerPetsToSupabase(
    username
  );
}

export function transferPets(
  fromUsername: string,
  toUsername: string,
  pets: PlayerPetItem[]
): void {
  if (!pets.length) return;

  removePetsFromPlayer(
    fromUsername,
    pets.map((p) => p.id)
  );

  addPetsToPlayer(
    toUsername,
    pets as unknown as PetValue
  );
}

/* ==========================================================================
   LEADERBOARD
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

export function recordUserWager(
  username: string,
  robloxId: number | string,
  avatar: string,
  wagerAmount: number
): void {
  if (
    !username ||
    wagerAmount <= 0
  ) {
    return;
  }

  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY_USER_WAGERS
      );

    const map: Record<
      string,
      {
        username: string;
        robloxId:
          | number
          | string;
        avatar: string;
        wagered: number;
      }
    > = raw
      ? JSON.parse(raw)
      : {};

    const key =
      username.trim().toLowerCase();

    if (!map[key]) {
      map[key] = {
        username,
        robloxId,
        avatar,
        wagered:
          wagerAmount,
      };
    } else {
      map[key].wagered +=
        wagerAmount;

      if (avatar) {
        map[key].avatar =
          avatar;
      }

      if (robloxId) {
        map[key].robloxId =
          robloxId;
      }
    }

    localStorage.setItem(
      STORAGE_KEY_USER_WAGERS,
      JSON.stringify(map)
    );

    if (supabaseConfigured) {
      void supabaseUpsert(
        'user_wagers',
        {
          username:
            map[key].username,
          roblox_id:
            Number(
              map[key].robloxId
            ),
          avatar:
            map[key].avatar,
          wagered:
            map[key].wagered,
          updated_at:
            new Date().toISOString(),
        }
      ).catch((err) =>
        console.warn(
          'Supabase wager sync failed:',
          err
        )
      );
    }
  } catch (err) {
    console.error(
      'Failed to record user wager',
      err
    );
  }
}

export function getRealLeaderboard(
  currentUsername?: string
): LeaderboardUser[] {
  const userMap = new Map<
    string,
    {
      username: string;
      robloxId:
        | number
        | string;
      avatar: string;
      wagered: number;
      badge?: string;
    }
  >();

  userMap.set(
    'cute240bunny',
    {
      username:
        'cute240bunny',
      robloxId:
        135982143,
      avatar:
        'https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=135982143&size=150x150&format=Png&isCircular=false',
      wagered: 0,
      badge: 'ADMIN',
    }
  );

  const accounts =
    getStoredAccounts();

  for (const acc of accounts) {
    const key =
      acc.username.toLowerCase();

    const existing =
      userMap.get(key);

    if (existing) {
      existing.robloxId =
        acc.robloxId;

      existing.avatar =
        acc.avatar ||
        existing.avatar;
    } else {
      userMap.set(
        key,
        {
          username:
            acc.username,
          robloxId:
            acc.robloxId,
          avatar:
            acc.avatar ||
            `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${acc.robloxId}&size=150x150&format=Png&isCircular=false`,
          wagered: 0,
          badge:
            acc.isAdmin
              ? 'ADMIN'
              : undefined,
        }
      );
    }
  }

  if (currentUsername) {
    const key =
      currentUsername.toLowerCase();

    if (!userMap.has(key)) {
      const session =
        getCurrentSession();

      if (
        session &&
        session.user
      ) {
        userMap.set(
          key,
          {
            username:
              session.user.username,
            robloxId:
              session.user.robloxId ||
              '',
            avatar:
              session.user.avatar,
            wagered: 0,
            badge:
              session.user.isAdmin
                ? 'ADMIN'
                : undefined,
          }
        );
      }
    }
  }

  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY_USER_WAGERS
      );

    if (raw) {
      const wagers =
        JSON.parse(raw) as Record<
          string,
          {
            username: string;
            robloxId:
              | number
              | string;
            avatar: string;
            wagered: number;
          }
        >;

      for (const [
        k,
        v,
      ] of Object.entries(
        wagers
      )) {
        const lowerK =
          k.toLowerCase();

        if (
          [
            'newfissy',
            'bethink',
            'meganplays',
            'russotalks',
            'iamsanta',
          ].includes(lowerK)
        ) {
          continue;
        }

        const existing =
          userMap.get(lowerK);

        if (existing) {
          existing.wagered +=
            v.wagered;

          if (v.avatar) {
            existing.avatar =
              v.avatar;
          }

          if (v.robloxId) {
            existing.robloxId =
              v.robloxId;
          }
        } else {
          userMap.set(
            lowerK,
            {
              username:
                v.username,
              robloxId:
                v.robloxId,
              avatar:
                v.avatar,
              wagered:
                v.wagered,
            }
          );
        }
      }
    }
  } catch {
    // Ignore malformed local leaderboard data.
  }

  const sorted =
    Array.from(
      userMap.values()
    ).sort(
      (a, b) =>
        b.wagered -
        a.wagered
    );

  return sorted.map(
    (user, idx) => ({
      rank: idx + 1,
      robloxUsername:
        user.username,
      robloxId:
        user.robloxId,
      avatar:
        user.avatar,
      wagered:
        user.wagered,
      badge:
        user.badge,
      isCurrentUser:
        currentUsername
          ? user.username.toLowerCase() ===
            currentUsername.toLowerCase()
          : false,
    })
  );
}
```
