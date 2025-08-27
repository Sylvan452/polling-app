# Supabase Integration

This directory contains the Supabase client configuration for the polling application.

## Files

- `client.ts`: Creates a Supabase client for client-side components
- `server.ts`: Creates a Supabase client for server-side components

## Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from the Supabase dashboard
3. Update the `.env.local` file with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Usage

### In Client Components

```typescript
'use client';

import { createClientComponentClient } from '@/app/lib/supabase/client';

export default function ClientComponent() {
  const supabase = createClientComponentClient();
  
  // Use supabase client here
  // Example: const { data } = await supabase.from('polls').select('*');
  
  return <div>Client Component</div>;
}
```

### In Server Components

```typescript
import { createServerComponentClient } from '@/app/lib/supabase/server';

export default async function ServerComponent() {
  const supabase = createServerComponentClient();
  
  // Use supabase client here
  // Example: const { data } = await supabase.from('polls').select('*');
  
  return <div>Server Component</div>;
}
```

## Database Types

The database types are defined in `src/app/types/database.types.ts`. These types provide type safety when interacting with the Supabase database.

To generate updated types from your actual Supabase database schema, use the Supabase CLI:

```bash
npx supabase gen types typescript --project-id your-project-id > src/app/types/database.types.ts
```