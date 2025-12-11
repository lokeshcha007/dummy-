import { createClient } from '@supabase/supabase-js';



const supabaseUrl = 'https://muymfcscxtgfhzajiuqx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11eW1mY3NjeHRnZmh6YWppdXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA1MzYwOSwiZXhwIjoyMDc5NjI5NjA5fQ.liWpwuSwPyLNQFDZtpCdO7lxLElxiCOCpb1Y15hiBRA'
// const supabaseUrl = 'https://qmimnuwhsxzdhehvdkep.supabase.co'
// const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtaW1udXdoc3h6ZGhlaHZka2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MjMwODMsImV4cCI6MjA4MDM5OTA4M30.hYEXIDjP86tWMicHh60HG4_DZz2kwtjdyHZMXFHzMyg'


export const supabase = createClient(supabaseUrl, supabaseKey);

//     // SUPABASE_URL=https://qmimnuwhsxzdhehvdkep.supabase.co
// SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtaW1udXdoc3h6ZGhlaHZka2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MjMwODMsImV4cCI6MjA4MDM5OTA4M30.hYEXIDjP86tWMicHh60HG4_DZz2kwtjdyHZMXFHzMyg
