const bcrypt = require('bcrypt');

const users = [
  { role: 'admin',   email: 'admin@gmail.com',          password: 'Admin@123'   },
  { role: 'teacher', email: 'giaovien@gmail.com',  password: 'Giaovien@123' },
  { role: 'student', email: 'hocsinh@gmail.com',   password: 'Hocsinh@123' },
];

async function main() {
  console.log('='.repeat(60));
  console.log('  BCRYPT HASH GENERATOR — AIHistoryLearning');
  console.log('='.repeat(60));

  for (const user of users) {
    const hash = await bcrypt.hash(user.password, 10);
    console.log(`\nRole     : ${user.role}`);
    console.log(`Email    : ${user.email}`);
    console.log(`Password : ${user.password}`);
    console.log(`Hash     : ${hash}`);
    console.log('-'.repeat(60));
  }

  console.log('\nDone! Copy từng hash vào field password_hash trong Atlas.\n');
}

main();