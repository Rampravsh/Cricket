const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Match = require('../models/Match');
const User = require('../models/User');
const connectDB = require('../config/db');

const TEAM_NAMES = [
  'Mumbai Indians', 'Chennai Super Kings', 'Royal Challengers Bangalore', 
  'Kolkata Knight Riders', 'Delhi Capitals', 'Punjab Kings', 
  'Rajasthan Royals', 'Sunrisers Hyderabad', 'Gujarat Titans', 'Lucknow Super Giants',
  'Australia', 'India', 'England', 'South Africa', 'New Zealand', 
  'Pakistan', 'West Indies', 'Sri Lanka', 'Bangladesh', 'Afghanistan'
];

const PLAYER_NAMES = [
  'Virat Kohli', 'Rohit Sharma', 'MS Dhoni', 'Sachin Tendulkar', 'AB de Villiers',
  'Chris Gayle', 'Lasith Malinga', 'Jasprit Bumrah', 'Rashid Khan', 'Babar Azam',
  'Steve Smith', 'Kane Williamson', 'Joe Root', 'Ben Stokes', 'David Warner',
  'Quinton de Kock', 'Kagiso Rabada', 'Trent Boult', 'Pat Cummins', 'Hardik Pandya'
];

const generateMatchId = () => {
  return 'MATCH_' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seed = async () => {
  try {
    await connectDB();
    console.log('Connected to database...');

    // Find or create a dummy user to own these matches
    let user = await User.findOne({ email: 'seed@example.com' });
    if (!user) {
      user = await User.create({
        name: 'Seed User',
        email: 'seed@example.com',
        providerId: 'seed_provider_id_' + Date.now(),
        provider: 'google'
      });
      console.log('Created seed user');
    }

    const matches = [];

    for (let i = 0; i < 20; i++) {
      const team1Name = TEAM_NAMES[i % TEAM_NAMES.length];
      const team2Name = TEAM_NAMES[(i + 5) % TEAM_NAMES.length];
      
      const format = getRandomElement(['T10', 'T20', 'ODI', 'custom']);
      const status = getRandomElement(['waiting', 'live', 'completed']);
      const overs = format === 'T10' ? 10 : format === 'T20' ? 20 : format === 'ODI' ? 50 : Math.floor(Math.random() * 20) + 1;

      const team1Players = [];
      const team2Players = [];

      for (let j = 0; j < 5; j++) {
        team1Players.push({ nameSnapshot: getRandomElement(PLAYER_NAMES) + ' ' + (j + 1) });
        team2Players.push({ nameSnapshot: getRandomElement(PLAYER_NAMES) + ' ' + (j + 1) });
      }

      const matchData = {
        matchId: generateMatchId() + '_' + i,
        status: status,
        isPublic: Math.random() > 0.5,
        format: format,
        overs: overs,
        teams: [
          { name: team1Name, players: team1Players },
          { name: team2Name, players: team2Players }
        ],
        createdByUserId: user._id,
        scorers: [user._id],
        activeScorer: user._id,
      };

      if (status === 'completed' || status === 'live') {
        matchData.score = {
          runs: Math.floor(Math.random() * 200),
          wickets: Math.floor(Math.random() * 10),
          overs: Math.floor(Math.random() * overs),
          balls: Math.floor(Math.random() * 6)
        };
        
        matchData.toss = {
          winner: Math.random() > 0.5 ? team1Name : team2Name,
          decision: Math.random() > 0.5 ? 'bat' : 'bowl'
        };
      }

      if (status === 'completed') {
        matchData.finalizedAt = new Date();
      }

      matches.push(matchData);
    }

    await Match.insertMany(matches);
    console.log('Successfully seeded 20 matches');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding matches:', error);
    process.exit(1);
  }
};

seed();
