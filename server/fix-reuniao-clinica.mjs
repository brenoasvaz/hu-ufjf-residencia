import { getDb } from './db.ts';
import { weeklyActivities } from '../drizzle/schema.ts';
import { eq, and } from 'drizzle-orm';

console.log('🔧 Corrigindo horário da Reunião Clínica...');

const db = await getDb();

await db.update(weeklyActivities)
  .set({ horaInicio: '07:00' })
  .where(and(
    eq(weeklyActivities.titulo, 'Reunião Clínica SOT HU UFJF'),
    eq(weeklyActivities.horaInicio, '07:15')
  ));

console.log('✅ Reunião Clínica corrigida para 07:00h');
process.exit(0);
