# Course Creation Development Setup

## Demo User for Development

For development and testing of the course creation feature, a demo user script is provided.

### Setup Demo User

Run the following command to create demo users for development:

```bash
npx prisma db execute --file create-demo-user.sql --schema prisma/schema.prisma
```

This creates demo users with the following wallet addresses:

- Primary: `0x742d35cc6734052532692c5317b5308e4e3c6d5c`
- Alternative: `0x8ba1f109551bd432803012645hac136c1c6734c0`

### Authentication Flow

1. The course creation form requires authentication via SIWE (Sign-In with Ethereum)
2. Users must connect their wallet and sign a SIWE message
3. The session is stored in a secure HTTP-only cookie
4. Server Actions automatically retrieve the current user from the session

### Production Considerations

- The demo user script is intended for development only
- Production deployments should not rely on hardcoded user IDs
- The system gracefully handles unauthenticated users with appropriate error messages
- All user creation should go through the proper SIWE authentication flow

### Security Features

- Server-side validation of title (max 256 chars) and description (max 10,000 chars)
- CSRF protection via Server Actions
- Session-based authentication with JWT tokens
- Automatic user lookup from wallet address in session
