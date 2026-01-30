import { getDb } from './db.ts';
import { weeklyActivities, activityAudiences } from '../drizzle/schema.ts';

console.log('🗑️  Removendo atividades antigas...');

const db = await getDb();
await db.delete(activityAudiences);
await db.delete(weeklyActivities);

console.log('✅ Atividades antigas removidas');
process.exit(0);
