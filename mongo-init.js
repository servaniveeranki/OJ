// MongoDB initialization script
db = db.getSiblingDB('online_judge');

// Create collections if they don't exist
db.createCollection('users');
db.createCollection('problems');
db.createCollection('submissions');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.problems.createIndex({ "title": 1 });
db.submissions.createIndex({ "userId": 1 });
db.submissions.createIndex({ "problemId": 1 });

print('Database initialized successfully');
