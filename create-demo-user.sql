-- Development-only demo user creation
-- This script is only intended for development/testing purposes
-- Run with: npx prisma db execute --file create-demo-user.sql --schema prisma/schema.prisma

-- Create a demo user with a known wallet address for development
INSERT INTO "User" (
    id,
    "walletAddress", 
    role,
    username,
    "displayName",
    email,
    "avatarUrl",
    bio,
    "createdAt",
    "updatedAt"
) VALUES (
    'demo-user-id',
    '0x742d35cc6734052532692c5317b5308e4e3c6d5c', -- Demo wallet address (lowercase)
    'CREATOR',
    'demouser',
    'Demo User',
    'demo@example.com',
    'https://api.dicebear.com/7.x/identicon/svg?seed=demo',
    'Demo user for development and testing purposes',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING; -- Prevent duplicate inserts on any unique constraint if run multiple times

-- Also handle case where the wallet address already exists
INSERT INTO "User" (
    id,
    "walletAddress", 
    role,
    username,
    "displayName", 
    email,
    "avatarUrl",
    bio,
    "createdAt",
    "updatedAt"
) VALUES (
    'demo-user-id-alt',
    '0x8ba1f109551bd432803012645aac136c1c6734c0', -- Alternative demo wallet
    'CREATOR',
    'demouser2',
    'Demo User 2',
    'demo2@example.com',
    'https://api.dicebear.com/7.x/identicon/svg?seed=demo2',
    'Alternative demo user for development',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;