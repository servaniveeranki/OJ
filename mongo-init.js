// MongoDB initialization script
db = db.getSiblingDB('online_judge');

// Create collections
db.createCollection('users');
db.createCollection('problems');
db.createCollection('submissions');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "googleId": 1 }, { unique: true, sparse: true });
db.problems.createIndex({ "title": 1 });
db.problems.createIndex({ "difficulty": 1 });
db.problems.createIndex({ "tags": 1 });
db.submissions.createIndex({ "userId": 1 });
db.submissions.createIndex({ "problemId": 1 });
db.submissions.createIndex({ "createdAt": 1 });

print('Database initialized successfully!');
