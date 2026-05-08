const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Match = require('./models/Match');

// Load env vars
dotenv.config();

const migrateMatches = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const matches = await Match.find({ status: 'completed' });
    console.log(`Found ${matches.length} completed matches.`);
    for (let m of matches) {
      console.log(`Match ${m.matchId}: innings=${m.innings}, runs=${m.score.runs}, target=${m.target}`);
    }

    console.log('Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrateMatches();
