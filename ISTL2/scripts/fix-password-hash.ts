import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixPasswordHash() {
  try {
    console.log('🔐 Fixing password hash for neworganizer@example.com...');

    // Find the user
    const user = await prisma.user.findUnique({
      where: {
        email: 'neworganizer@example.com'
      }
    });

    if (!user) {
      console.log('❌ User not found: neworganizer@example.com');
      return;
    }

    console.log('✅ Found user:', user.email);
    console.log('📋 Current passwordHash:', user.passwordHash);
    console.log('�� Current password (plain text): newpass123');

    // Hash the password properly
    const hashedPassword = await bcrypt.hash('newpass123', 12);
    console.log('🔐 Generated hashed password');

    // Update the user with the hashed password
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        passwordHash: hashedPassword
      }
    });

    console.log('✅ Password hash updated successfully!');
    console.log('🔑 New hashed password stored in database');

    // Verify the password works
    const isPasswordValid = await bcrypt.compare('newpass123', hashedPassword);
    console.log('✅ Password verification test:', isPasswordValid ? 'PASSED' : 'FAILED');

    if (isPasswordValid) {
      console.log('\n🎉 PASSWORD FIXED SUCCESSFULLY!');
      console.log('�� Login credentials: neworganizer@example.com / newpass123');
      console.log('�� Try logging in now at: http://localhost:3001/auth/login');
    } else {
      console.log('❌ Password verification failed!');
    }

    return updatedUser;

  } catch (error) {
    console.error('❌ Error fixing password hash:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixPasswordHash()
  .then(() => {
    console.log('\n✨ Password hash fix completed!');
  })
  .catch((error) => {
    console.error('💥 Failed to fix password hash:', error);
    process.exit(1);
  });