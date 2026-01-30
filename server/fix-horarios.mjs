import { drizzle } from 'drizzle-orm/mysql2';
import { weeklyActivities, activityAudiences } from '../drizzle/schema.ts';
import { eq, and } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL);

console.log('\n=== CORRIGINDO HORÁRIOS ===\n');

// 1. Corrigir Bloco B - Segunda-feira - CC HU SC Coluna
console.log('1. Corrigindo Bloco B - Segunda - CC HU SC Coluna...');

// Buscar a atividade errada
const blocoBAudiences = await db.select().from(activityAudiences).where(eq(activityAudiences.bloco, 'B'));
const activityIds = blocoBAudiences.map(a => a.activityId);

for (const id of activityIds) {
  const acts = await db.select().from(weeklyActivities).where(
    and(
      eq(weeklyActivities.id, id),
      eq(weeklyActivities.diaSemana, 1), // Segunda
      eq(weeklyActivities.titulo, 'CC HU SC Coluna')
    )
  );
  
  if (acts.length > 0) {
    const act = acts[0];
    console.log(`   Encontrada: ${act.titulo} - ${act.horaInicio}-${act.horaFim}`);
    
    // Atualizar horário
    await db.update(weeklyActivities)
      .set({ horaInicio: '16:00', horaFim: '18:00' })
      .where(eq(weeklyActivities.id, act.id));
    
    console.log(`   ✅ Corrigido para: 16:00-18:00`);
  }
}

// 2. Remover atividades duplicadas
console.log('\n2. Removendo atividades duplicadas...');

// Buscar todas as atividades
const allActivities = await db.select().from(weeklyActivities);

// Agrupar por chave única (dia + hora + titulo)
const activityMap = new Map();
const duplicates = [];

for (const act of allActivities) {
  const key = `${act.diaSemana}-${act.horaInicio}-${act.horaFim}-${act.titulo}`;
  
  if (activityMap.has(key)) {
    // Duplicata encontrada
    duplicates.push(act.id);
    console.log(`   Duplicata: ${act.titulo} ${act.horaInicio}-${act.horaFim} (ID: ${act.id})`);
  } else {
    activityMap.set(key, act.id);
  }
}

if (duplicates.length > 0) {
  console.log(`\n   Encontradas ${duplicates.length} atividades duplicadas`);
  
  // Remover audiences das atividades duplicadas
  for (const dupId of duplicates) {
    await db.delete(activityAudiences).where(eq(activityAudiences.activityId, dupId));
  }
  
  // Remover atividades duplicadas
  for (const dupId of duplicates) {
    await db.delete(weeklyActivities).where(eq(weeklyActivities.id, dupId));
  }
  
  console.log(`   ✅ ${duplicates.length} atividades duplicadas removidas`);
} else {
  console.log('   Nenhuma duplicata encontrada');
}

console.log('\n=== CORREÇÕES CONCLUÍDAS ===\n');

process.exit(0);
