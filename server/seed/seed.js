const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_lost_found');
    console.log(`[Seed] Connected to MongoDB: ${conn.connection.host}`);
  } catch (err) {
    console.error(`[Seed Error] MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany();
    await Item.deleteMany();
    await Claim.deleteMany();

    console.log('[Seed] Creating demo users...');
    // Create admin user
    const adminUser = await User.create({
      name: 'Campus Administrator',
      email: process.env.ADMIN_DEFAULT_EMAIL || 'admin@campus.edu',
      passwordHash: process.env.ADMIN_DEFAULT_PASSWORD || 'AdminPass123!',
      role: 'admin',
      department: 'Campus Administration',
      idNumber: 'ADM-2024-01',
      phone: '+91 98765 43210'
    });

    // Create student 1
    const student1 = await User.create({
      name: 'Rohit Sharma',
      email: 'rohit.sharma@college.edu',
      passwordHash: 'StudentPass123!',
      role: 'student',
      department: 'Computer Science & Engineering',
      idNumber: 'CS-2023-042',
      phone: '+91 98111 22334'
    });

    // Create student 2
    const student2 = await User.create({
      name: 'Ananya Verma',
      email: 'ananya.verma@college.edu',
      passwordHash: 'StudentPass123!',
      role: 'student',
      department: 'Electronics & Communication',
      idNumber: 'EC-2023-088',
      phone: '+91 98222 33445'
    });

    // Create faculty user
    const facultyUser = await User.create({
      name: 'Dr. Arindam Sen',
      email: 'prof.sen@college.edu',
      passwordHash: 'FacultyPass123!',
      role: 'faculty',
      department: 'Department of Physics',
      idNumber: 'FAC-PHY-12',
      phone: '+91 98333 44556'
    });

    console.log('[Seed] Creating initial campus items...');

    // Item 1: Lost Apple AirPods Pro
    const item1 = await Item.create({
      title: 'Apple AirPods Pro (2nd Gen) with White Case',
      description: 'Lost my AirPods Pro white charging case somewhere near the Central Library reading room on the 2nd floor. It might have dropped near the study cubicle #14.',
      category: 'Electronics',
      reportType: 'lost',
      dateOfIncident: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      campusLocation: 'Central Library',
      locationDetails: '2nd Floor, Cubicle 14, Quiet Study Section',
      identifyingDetails: 'Has a small Naruto vinyl sticker on the back of the case and serial number ending in 89FJ.',
      contactPreference: 'email',
      contactPhone: '+91 98111 22334',
      status: 'lost',
      reporter: student1._id
    });

    // Item 2: Found Blue Spiral Notebook & Calculator
    const item2 = await Item.create({
      title: 'Classmate Blue Spiral Notebook with Casio fx-991EX Calculator',
      description: 'Found a thick blue spiral notebook with Engineering Mathematics notes left behind on a cafeteria dining table around lunchtime.',
      category: 'Books & Stationery',
      reportType: 'found',
      dateOfIncident: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      campusLocation: 'Main Cafeteria',
      locationDetails: 'Corner wooden table near the juice counter',
      identifyingDetails: 'First page has name written in pencil: Ananya V., and formulas written on page 23.',
      contactPreference: 'handover_security',
      contactPhone: '',
      status: 'found',
      reporter: facultyUser._id
    });

    // Item 3: Found Black Titan Leather Wallet
    const item3 = await Item.create({
      title: 'Black Titan Leather Bifold Wallet',
      description: 'Found a black leather wallet on the bench outside the Sports Complex badminton courts after evening practice. Kept safely for genuine owner verification.',
      category: 'Wallets & Bags',
      reportType: 'found',
      dateOfIncident: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      campusLocation: 'Sports Complex',
      locationDetails: 'Wooden bench outside Court 2',
      identifyingDetails: 'Contains a metro card, gym locker token #47, and library receipt.',
      contactPreference: 'email',
      contactPhone: '+91 98222 33445',
      status: 'claim_pending',
      reporter: student2._id
    });

    // Item 4: Lost Campus Student ID Card
    const item4 = await Item.create({
      title: 'College Smart ID Card (RFID) - CSE Dept',
      description: 'Misplaced my college ID card with blue lanyard while attending morning lecture in the Engineering Wing.',
      category: 'IDs & Cards',
      reportType: 'lost',
      dateOfIncident: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      campusLocation: 'Engineering Wing',
      locationDetails: 'Lecture Hall LH-302, 3rd row desk',
      identifyingDetails: 'Card barcode has slight chip at bottom left corner.',
      contactPreference: 'phone',
      contactPhone: '+91 98111 22334',
      status: 'lost',
      reporter: student1._id
    });

    // Item 5: Resolved HP Laptop Charger
    const item5 = await Item.create({
      title: 'HP 65W Blue-Pin Laptop Charger',
      description: 'Found an HP laptop charger plugged into the wall outlet in Science Lab 3.',
      category: 'Electronics',
      reportType: 'found',
      dateOfIncident: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      campusLocation: 'Science Block / Labs',
      locationDetails: 'Computer Lab 3, Workstation #18',
      identifyingDetails: 'Wrapped with blue velcro tie.',
      contactPreference: 'handover_admin',
      status: 'resolved',
      reporter: facultyUser._id
    });

    // Item 6: Found Set of Two Keys with Red Honda Keychain
    const item6 = await Item.create({
      title: 'Two Brass Keys on Red Bike Keychain',
      description: 'Found a pair of keys lying near the bike parking bay 4 near the west gate.',
      category: 'Keys',
      reportType: 'found',
      dateOfIncident: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      campusLocation: 'Campus Parking',
      locationDetails: 'Two-wheeler Bay 4, Near West Gate Guard Booth',
      identifyingDetails: 'One Godrej door key and one Honda bike ignition key with miniature helmet charm.',
      contactPreference: 'handover_security',
      status: 'found',
      reporter: student1._id
    });

    console.log('[Seed] Creating demo claims...');
    // Create a pending claim on the Titan wallet (student 1 claims item 3 reported by student 2)
    const claim1 = await Claim.create({
      item: item3._id,
      claimant: student1._id,
      itemOwner: student2._id,
      message: 'Hello, I think this is my wallet that slipped from my sports track pants during badminton practice!',
      identifyingEvidence: 'Inside you will find my gym locker token #47 and a metro transit card. The brand is Titan black leather.',
      claimantContact: '+91 98111 22334',
      status: 'pending'
    });

    // Create a resolved claim on item 5 (laptop charger)
    const claim2 = await Claim.create({
      item: item5._id,
      claimant: student2._id,
      itemOwner: facultyUser._id,
      message: 'I had my Physics simulation practical in Lab 3 and accidentally forgot my charger there.',
      identifyingEvidence: 'It has a blue velcro cord strap and a small scratch on the 3-pin plug.',
      claimantContact: 'ananya.verma@college.edu',
      status: 'completed',
      ownerFeedback: 'Verified and handed over at the faculty desk. Glad you got it back!',
      reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });

    console.log('========================================================');
    console.log('  Database Seeding Completed Successfully!              ');
    console.log('========================================================');
    console.log('  Demo Accounts Created:                                ');
    console.log(`  1. Administrator: admin@campus.edu / AdminPass123!    `);
    console.log(`  2. Student 1:     rohit.sharma@college.edu / StudentPass123!`);
    console.log(`  3. Student 2:     ananya.verma@college.edu / StudentPass123!`);
    console.log(`  4. Faculty:       prof.sen@college.edu / FacultyPass123!    `);
    console.log('========================================================');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] Failed to seed database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
