import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_CRI_SUPABASE_URL!;
// const supabaseKey = process.env.NEXT_PUBLIC_CRI_SUPABASE_KEY!;

const supabaseUrl = 'https://muymfcscxtgfhzajiuqx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11eW1mY3NjeHRnZmh6YWppdXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA1MzYwOSwiZXhwIjoyMDc5NjI5NjA5fQ.liWpwuSwPyLNQFDZtpCdO7lxLElxiCOCpb1Y15hiBRA'


export const supabaseCri = createClient(supabaseUrl, supabaseKey);
