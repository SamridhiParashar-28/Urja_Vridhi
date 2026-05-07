BigInt.prototype.toJSON = function() { return Number(this); };
const db = require('./db.js');

const users = db.prepare('SELECT id, username FROM users').all();
const datasets = db.prepare('SELECT id, name FROM datasets').all();
const roles = db.prepare('SELECT * FROM dataset_roles').all();

console.log('\n=== USERS ===');
users.forEach(u => console.log(`  id=${Number(u.id)} username=${u.username}`));

console.log('\n=== DATASETS ===');
datasets.forEach(d => console.log(`  id=${Number(d.id)} name=${d.name}`));

console.log('\n=== ROLES ===');
roles.forEach(r => console.log(`  dataset_id=${Number(r.dataset_id)} user_id=${Number(r.user_id)} role=${r.role}`));
