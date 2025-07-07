<<<<<<< HEAD
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
};

if (!dbConfig.supabaseUrl || !dbConfig.supabaseKey) {
    console.error("FATAL ERROR: Supabase URL or Key is not defined. Check your .env file.");
    process.exit(1);
}

=======
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
};

if (!dbConfig.supabaseUrl || !dbConfig.supabaseKey) {
    console.error("FATAL ERROR: Supabase URL or Key is not defined. Check your .env file.");
    process.exit(1);
}

>>>>>>> 55b0194c2d6ec825affe8c8a53a320b6496ad045
export default dbConfig; 