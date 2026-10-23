const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');

const exportDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_lost_found';
    console.log(`[Export] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    const users = await User.find({}).lean();
    const items = await Item.find({}).lean();
    const claims = await Claim.find({}).lean();

    console.log(`[Export] Fetched ${users.length} users, ${items.length} items, ${claims.length} claims.`);

    const outputDir = path.join(__dirname, '../../database');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Export individual collection JSON files (Standard format for MongoDB Compass / mongoimport)
    fs.writeFileSync(path.join(outputDir, 'users.json'), JSON.stringify(users, null, 2), 'utf-8');
    fs.writeFileSync(path.join(outputDir, 'items.json'), JSON.stringify(items, null, 2), 'utf-8');
    fs.writeFileSync(path.join(outputDir, 'claims.json'), JSON.stringify(claims, null, 2), 'utf-8');

    // Export full unified database file
    const fullDB = {
      databaseName: 'campus_lost_found',
      exportedAt: new Date().toISOString(),
      counts: {
        users: users.length,
        items: items.length,
        claims: claims.length
      },
      collections: {
        users,
        items,
        claims
      }
    };
    fs.writeFileSync(path.join(outputDir, 'campus_lost_found_database.json'), JSON.stringify(fullDB, null, 2), 'utf-8');

    console.log(`[Export] Successfully exported database files to: ${outputDir}`);
    console.log(`  - users.json (${users.length} records)`);
    console.log(`  - items.json (${items.length} records)`);
    console.log(`  - claims.json (${claims.length} records)`);
    console.log(`  - campus_lost_found_database.json (Unified file)`);

    process.exit(0);
  } catch (error) {
    console.error(`[Export Error] Failed to export database: ${error.message}`);
    process.exit(1);
  }
};

exportDatabase();
