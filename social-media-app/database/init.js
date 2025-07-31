// MongoDB initialization script for Docker
// This script will be executed when the MongoDB container starts for the first time

// Switch to the social media database
db = db.getSiblingDB('socialmedia');

// Create a default admin user (optional)
// You can remove this if you don't need a default user
db.createUser({
  user: 'socialmediauser',
  pwd: 'password123',
  roles: [
    {
      role: 'readWrite',
      db: 'socialmedia'
    }
  ]
});

// Create indexes for better performance
db.users.createIndex({ "username": 1 }, { "unique": true });
db.users.createIndex({ "email": 1 }, { "unique": true });
db.users.createIndex({ "createdAt": -1 });

db.posts.createIndex({ "author": 1, "createdAt": -1 });
db.posts.createIndex({ "hashtags": 1 });
db.posts.createIndex({ "mentions": 1 });
db.posts.createIndex({ "createdAt": -1 });
db.posts.createIndex({ "isDeleted": 1 });

db.comments.createIndex({ "post": 1, "createdAt": -1 });
db.comments.createIndex({ "author": 1 });
db.comments.createIndex({ "parentComment": 1 });

print('MongoDB initialization completed successfully!');