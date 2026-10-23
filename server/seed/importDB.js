const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');

const importDatabase = async () => {
  try {
    // Allows passing a MongoDB URI directly as a command-line argument:
    // e.g.: node server/seed/importDB.js "mongodb+srv://user:pass@cluster0.mongodb.net/campus_lost_found"
    const targetUri = process.argv[2] || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_lost_found';

    console.log('========================================================');
    console.log('  Campus Lost & Found - Database Import Tool            ');
    console.log('========================================================');
    console.log(`Connecting to: ${targetUri.replace(/:([^@]+)@/, ':****@')}`);

    await mongoose.connect(targetUri);
    console.log('[Import] MongoDB Connected successfully.');

    const databaseDir = path.join(__dirname, '../../database');
    const usersFile = path.join(databaseDir, 'users.json');
    const itemsFile = path.join(databaseDir, 'items.json');
    const claimsFile = path.join(databaseDir, 'claims.json');

    if (!fs.existsSync(usersFile) || !fs.existsSync(itemsFile) || !fs.existsSync(claimsFile)) {
      throw new Error(`Database JSON files not found in ${databaseDir}`);
    }

    const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
    const items = JSON.parse(fs.readFileSync(itemsFile, 'utf-8'));
    const claims = JSON.parse(fs.readFileSync(claimsFile, 'utf-8'));

    console.log('[Import] Clearing existing target collections...');
    await User.deleteMany({});
    await Item.deleteMany({});
    await Claim.deleteMany({});

    console.log(`[Import] Inserting ${users.length} users...`);
    await User.insertMany(users);

    console.log(`[Import] Inserting ${items.length} items...`);
    await Item.insertMany(items);

    console.log(`[Import] Inserting ${claims.length} claims...`);
    await Claim.insertMany(claims);

    console.log('========================================================');
    console.log('  Import Completed Successfully!                        ');
    console.log(`  Users:  ${users.length} records imported`);
    console.log(`  Items:  ${items.length} records imported`);
    console.log(`  Claims: ${claims.length} records imported`);
    console.log('========================================================');

    process.exit(0);
  } catch (error) {
    console.error(`[Import Error] Failed to import database: ${error.message}`);
    process.exit(1);
  }
};

importDatabase();
