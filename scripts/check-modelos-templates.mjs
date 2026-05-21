import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from '../drizzle/schema.ts';
import { eq, and } from 'drizzle-orm';
import dotenv from 'dotenv';
dotenv.config();

const db = drizzle(process.env.DATABASE_URL, { schema, mode: 'default' });

const modelos = await db.select().from(schema.modelosProva).where(and(eq(schema.modelosProva.ativo, 1)));
console.log('Modelos encontrados:', modelos.length);

for (const m of modelos) {
  const [tmpl] = await db.select().from(schema.simuladoTemplates).where(eq(schema.simuladoTemplates.modeloId, m.id)).limit(1);
  let questoesCount = 0;
  if (tmpl) {
    const rows = await db.select().from(schema.simuladoTemplateQuestoes).where(eq(schema.simuladoTemplateQuestoes.templateId, tmpl.id));
    questoesCount = rows.length;
  }
  console.log(`Modelo ${m.id} (${m.nome}) - status: ${m.status} - template: ${tmpl ? 'SIM (' + questoesCount + ' questões)' : 'NÃO'}`);
}

process.exit(0);
