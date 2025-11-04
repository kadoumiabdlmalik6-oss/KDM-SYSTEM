const DATA_VERSION_KEY = 'kdm_journal_data_version';
const TRADES_KEY = 'kdm_journal_trades';
const ACCOUNTS_KEY = 'kdm_journal_accounts';

// The current version of the data schema. Increment this when you make breaking schema changes.
const CURRENT_VERSION = 1;

/**
 * Define migration functions here.
 * Each key is the version number you are migrating TO.
 * The function should handle the transformation of data from version (key - 1) to version (key).
 */
const migrations: { [version: number]: () => void } = {
  // Example for a future version 2:
  // 2: () => {
  //   console.log('Migrating data to version 2...');
  //   const tradesJson = localStorage.getItem(TRADES_KEY);
  //   if (tradesJson) {
  //       const trades: any[] = JSON.parse(tradesJson);
  //       const migratedTrades = trades.map(trade => ({
  //         ...trade,
  //         newRequiredField: 'default value', // Add a new field with a default
  //       }));
  //       localStorage.setItem(TRADES_KEY, JSON.stringify(migratedTrades));
  //   }
  //   console.log('Trade migration to v2 complete.');
  // },
};

export const runMigrations = () => {
  const storedVersionStr = localStorage.getItem(DATA_VERSION_KEY);
  let storedVersion = storedVersionStr ? parseInt(storedVersionStr, 10) : 0;

  // If this is a fresh install (no version key), and there's no data, set version and exit.
  if (storedVersion === 0 && !localStorage.getItem(TRADES_KEY) && !localStorage.getItem(ACCOUNTS_KEY)) {
    localStorage.setItem(DATA_VERSION_KEY, CURRENT_VERSION.toString());
    console.log(`Fresh install. Set data version to ${CURRENT_VERSION}.`);
    return;
  }
  
  if (storedVersion >= CURRENT_VERSION) {
    // Data is already up-to-date.
    return;
  }

  console.log(`Data version mismatch. Stored: ${storedVersion}, Current: ${CURRENT_VERSION}. Running migrations...`);

  // Run all necessary migrations in sequence.
  for (let v = storedVersion + 1; v <= CURRENT_VERSION; v++) {
    const migration = migrations[v];
    if (migration) {
      try {
        console.log(`Running migration for version ${v}...`);
        migration();
        console.log(`Migration to version ${v} successful.`);
      } catch (error) {
        console.error(`Migration for version ${v} failed:`, error);
        // If a migration fails, we stop to avoid further data corruption.
        // The version is not updated, so it will attempt to run again on the next app load.
        return;
      }
    }
    // Update version for this step, even if no specific migration function ran.
    // This allows skipping versions that only had non-breaking changes.
    localStorage.setItem(DATA_VERSION_KEY, v.toString());
  }

  console.log(`All migrations complete. Data is now at version ${CURRENT_VERSION}.`);
};
