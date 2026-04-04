import bcrypt from 'bcryptjs';

const password = 'password';
const hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

const match = bcrypt.compareSync(password, hash);
console.log(`Password 'password' matches hash: ${match}`);
