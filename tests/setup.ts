import { Contract, Job, Profile } from '../src/model';

console.debug('Syncing tables...');
await Profile.sync({ force: true });
await Contract.sync({ force: true });
await Job.sync({ force: true });
console.debug('Tables synced');
