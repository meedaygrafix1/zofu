import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://arjafnrdiirodqsacjoh.supabase.co';
const supabaseKey = 'sb_publishable_92S8Eo606DGgqkOxmwlExA_R__ALXIp';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data, error } = await supabase.from('sessions').select('*').limit(1);
    if (error) {
        console.error("Error fetching sessions:", error);
    } else {
        console.log("Sessions data:", JSON.stringify(data, null, 2));
        if (data && data.length > 0) {
            console.log("Keys available:", Object.keys(data[0]));
            console.log("Does cover_letter exist?:", 'cover_letter' in data[0]);
        } else {
            console.log("No sessions found to inspect columns.");
        }
    }
}

checkSchema();
