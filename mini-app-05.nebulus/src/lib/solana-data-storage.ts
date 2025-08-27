import { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js';
import { connection } from './solana-payment';

// Data account structure for storing user preferences and sessions
export interface UserDataAccount {
  owner: string;
  searchHistory: string[];
  favoriteQueries: string[];
  chatHistory: string[];
  preferences: {
    theme: 'dark' | 'light';
    notifications: boolean;
    autoSave: boolean;
    aiModel: string;
  };
  createdAt: number;
  lastUpdated: number;
}

// Size calculation for data account (approximate)
const USER_DATA_SIZE = 4096; // 4KB is enough for user data

/**
 * Creates a data account on Solana to store user preferences and session data
 */
export async function createUserDataAccount(
  userWallet: PublicKey,
  sendTransaction: (transaction: Transaction, connection: Connection) => Promise<string>
): Promise<PublicKey> {
  try {
    // Generate a new account for storing user data
    const dataAccount = new PublicKey(await crypto.subtle.digest('SHA-256', 
      new TextEncoder().encode(userWallet.toString() + 'nebulus-data')
    ).then(hash => new Uint8Array(hash.slice(0, 32))));

    // Calculate rent exemption amount
    const rentExemption = await connection.getMinimumBalanceForRentExemption(USER_DATA_SIZE);

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: userWallet,
        newAccountPubkey: dataAccount,
        lamports: rentExemption,
        space: USER_DATA_SIZE,
        programId: SystemProgram.programId,
      })
    );

    const signature = await sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, 'confirmed');

    console.log('User data account created:', dataAccount.toString());
    return dataAccount;
  } catch (error) {
    console.error('Failed to create user data account:', error);
    throw new Error('Failed to create data storage account');
  }
}

/**
 * Stores user data in the Solana data account
 */
export async function storeUserData(
  userWallet: PublicKey,
  userData: Partial<UserDataAccount>,
  sendTransaction: (transaction: Transaction, connection: Connection) => Promise<string>
): Promise<boolean> {
  try {
    // TODO: For now, data will be stored as JSON in localStorage to simulate blockchain storage - use a custom program to store this data
    
    const existingData = getUserDataFromLocal(userWallet);
    const updatedData: UserDataAccount = {
      ...existingData,
      ...userData,
      owner: userWallet.toString(),
      lastUpdated: Date.now(),
    };

    localStorage.setItem(`nebulus-user-data-${userWallet.toString()}`, JSON.stringify(updatedData));
    
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: userWallet,
        toPubkey: userWallet, // Self transfer of 0 lamports
        lamports: 0,
      })
    );

    // Add a memo with the data hash for verification
    const dataHash = await crypto.subtle.digest('SHA-256', 
      new TextEncoder().encode(JSON.stringify(updatedData))
    );
    
    console.log('User data stored with hash:', Buffer.from(dataHash).toString('hex').slice(0, 16));
    return true;
  } catch (error) {
    console.error('Failed to store user data:', error);
    return false;
  }
}

/**
 * Retrieves user data from local storage (simulating blockchain retrieval)
 */
export function getUserDataFromLocal(userWallet: PublicKey): UserDataAccount {
  try {
    const stored = localStorage.getItem(`nebulus-user-data-${userWallet.toString()}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to retrieve user data:', error);
  }

  // Return default data structure
  return {
    owner: userWallet.toString(),
    searchHistory: [],
    favoriteQueries: [],
    chatHistory: [],
    preferences: {
      theme: 'dark',
      notifications: true,
      autoSave: true,
      aiModel: 'gpt-4'
    },
    createdAt: Date.now(),
    lastUpdated: Date.now(),
  };
}

/**
 * Adds a search query to user's history
 */
export async function addToSearchHistory(
  userWallet: PublicKey,
  query: string,
  sendTransaction: (transaction: Transaction, connection: Connection) => Promise<string>
): Promise<void> {
  const userData = getUserDataFromLocal(userWallet);
  
  // Add to search history (keep last 50 searches)
  userData.searchHistory = [query, ...userData.searchHistory.filter(q => q !== query)].slice(0, 50);
  
  await storeUserData(userWallet, userData, sendTransaction);
}

/**
 * Adds a query to user's favorites
 */
export async function addToFavorites(
  userWallet: PublicKey,
  query: string,
  sendTransaction: (transaction: Transaction, connection: Connection) => Promise<string>
): Promise<void> {
  const userData = getUserDataFromLocal(userWallet);
  
  if (!userData.favoriteQueries.includes(query)) {
    userData.favoriteQueries = [query, ...userData.favoriteQueries].slice(0, 20);
    await storeUserData(userWallet, userData, sendTransaction);
  }
}

/**
 * Updates user preferences
 */
export async function updateUserPreferences(
  userWallet: PublicKey,
  preferences: Partial<UserDataAccount['preferences']>,
  sendTransaction: (transaction: Transaction, connection: Connection) => Promise<string>
): Promise<void> {
  const userData = getUserDataFromLocal(userWallet);
  userData.preferences = { ...userData.preferences, ...preferences };
  
  await storeUserData(userWallet, userData, sendTransaction);
}

/**
 * Saves chat message to user's history
 */
export async function saveChatMessage(
  userWallet: PublicKey,
  message: string,
  sendTransaction: (transaction: Transaction, connection: Connection) => Promise<string>
): Promise<void> {
  const userData = getUserDataFromLocal(userWallet);
  
  // Keep last 100 chat messages
  userData.chatHistory = [message, ...userData.chatHistory].slice(0, 100);
  
  await storeUserData(userWallet, userData, sendTransaction);
}

/**
 * Gets user's search suggestions based on history and favorites
 */
export function getUserSearchSuggestions(userWallet: PublicKey): string[] {
  const userData = getUserDataFromLocal(userWallet);
  
  // Combine favorites and recent history
  const suggestions = [
    ...userData.favoriteQueries,
    ...userData.searchHistory.slice(0, 10)
  ];
  
  // Remove duplicates and return
  return Array.from(new Set(suggestions));
}

/**
 * Exports user data for backup
 */
export function exportUserData(userWallet: PublicKey): string {
  const userData = getUserDataFromLocal(userWallet);
  return JSON.stringify(userData, null, 2);
}

/**
 * Imports user data from backup
 */
export async function importUserData(
  userWallet: PublicKey,
  dataJson: string,
  sendTransaction: (transaction: Transaction, connection: Connection) => Promise<string>
): Promise<boolean> {
  try {
    const userData = JSON.parse(dataJson) as UserDataAccount;
    userData.owner = userWallet.toString();
    userData.lastUpdated = Date.now();
    
    return await storeUserData(userWallet, userData, sendTransaction);
  } catch (error) {
    console.error('Failed to import user data:', error);
    return false;
  }
}
