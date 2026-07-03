import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dqrgyhyewwqkbdzwmqwi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxcmd5aHlld3dxa2JkendtcXdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNDQ0ODUsImV4cCI6MjA5ODYyMDQ4NX0.MZoLFspdhDbpurYP9vbzNgdf4YV2FUvTAFpTi2uuwaU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
