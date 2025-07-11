'use client';

import { DatabaseService as SupabaseDatabaseService } from './supabaseDatabase';

// Re-export del nuovo DatabaseService per mantenere compatibilità
export const DatabaseService = {
  getInstance: () => SupabaseDatabaseService.getInstance()
};
