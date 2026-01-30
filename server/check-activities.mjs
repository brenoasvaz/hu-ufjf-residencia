import { drizzle } from 'drizzle-orm/mysql2';
import { weeklyActivities, activityAudiences } from '../drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL);

const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

async function getActivitiesByBloco(bloco) {
  const audiences = await db.select().from(activityAudiences).where(eq(activityAudiences.bloco, bloco));
  const activityIds = audiences.map(a => a.activityId);
  
  const activities = [];
  for (const id of activityIds) {
    const acts = await db.select().from(weeklyActivities).where(eq(weeklyActivities.id, id));
    activities.push(...acts);
  }
  
  return activities.sort((a, b) => {
    if (a.diaSemana !== b.diaSemana) return a.diaSemana - b.diaSemana;
    return a.horaInicio.localeCompare(b.horaInicio);
  });
}

console.log('\n=== BLOCO A ===');
const blocoA = await getActivitiesByBloco('A');
blocoA.forEach(act => {
  console.log(`${dias[act.diaSemana]} ${act.horaInicio}-${act.horaFim}: ${act.titulo} (${act.local || 'sem local'})`);
});

console.log('\n=== BLOCO B ===');
const blocoB = await getActivitiesByBloco('B');
blocoB.forEach(act => {
  console.log(`${dias[act.diaSemana]} ${act.horaInicio}-${act.horaFim}: ${act.titulo} (${act.local || 'sem local'})`);
});

console.log('\n=== BLOCO C ===');
const blocoC = await getActivitiesByBloco('C');
blocoC.forEach(act => {
  console.log(`${dias[act.diaSemana]} ${act.horaInicio}-${act.horaFim}: ${act.titulo} (${act.local || 'sem local'})`);
});

console.log('\n=== ENFERMARIA ===');
const enfermaria = await getActivitiesByBloco('Enfermaria');
enfermaria.forEach(act => {
  console.log(`${dias[act.diaSemana]} ${act.horaInicio}-${act.horaFim}: ${act.titulo} (${act.local || 'sem local'})`);
});

console.log('\n=== CC1 ===');
const cc1 = await getActivitiesByBloco('CC1');
cc1.forEach(act => {
  console.log(`${dias[act.diaSemana]} ${act.horaInicio}-${act.horaFim}: ${act.titulo} (${act.local || 'sem local'})`);
});

console.log('\n=== CC2 ===');
const cc2 = await getActivitiesByBloco('CC2');
cc2.forEach(act => {
  console.log(`${dias[act.diaSemana]} ${act.horaInicio}-${act.horaFim}: ${act.titulo} (${act.local || 'sem local'})`);
});

process.exit(0);
