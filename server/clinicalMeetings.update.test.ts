import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import type { Context } from './_core/context';

describe('Clinical Meetings Update & Delete', () => {
  const adminContext: Context = {
    user: {
      openId: 'admin-test',
      name: 'Admin Test',
      email: 'admin@test.com',
      role: 'admin',
      lastSignedIn: new Date(),
      loginMethod: 'email',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    req: {} as any,
    res: {} as any,
  };

  const viewerContext: Context = {
    user: {
      openId: 'viewer-test',
      name: 'Viewer Test',
      email: 'viewer@test.com',
      role: 'user',
      lastSignedIn: new Date(),
      loginMethod: 'email',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    req: {} as any,
    res: {} as any,
  };

  const caller = appRouter.createCaller(adminContext);
  let testMeetingId: number;

  beforeAll(async () => {
    // Create a test meeting
    await caller.clinicalMeetings.create({
      data: new Date('2026-06-05'),
      tema: 'Teste de Edição',
      tipo: 'AULA',
      preceptor: 'Dr. Teste',
    });

    // Get the created meeting
    const meetings = await caller.clinicalMeetings.list({ year: 2026, month: 6 });
    const testMeeting = meetings.find(m => m.tema === 'Teste de Edição');
    if (testMeeting) {
      testMeetingId = testMeeting.id;
    }
  });

  it('should allow admin to update a clinical meeting', async () => {
    await caller.clinicalMeetings.update({
      id: testMeetingId,
      tema: 'Teste de Edição Atualizado',
      preceptor: 'Dr. Teste Atualizado',
    });

    // Verify the update
    const meetings = await caller.clinicalMeetings.list({ year: 2026, month: 6 });
    const updatedMeeting = meetings.find(m => m.id === testMeetingId);
    expect(updatedMeeting?.tema).toBe('Teste de Edição Atualizado');
    expect(updatedMeeting?.preceptor).toBe('Dr. Teste Atualizado');
  });

  it('should prevent non-admin from updating a clinical meeting', async () => {
    const viewerCaller = appRouter.createCaller(viewerContext);

    await expect(
      viewerCaller.clinicalMeetings.update({
        id: testMeetingId,
        tema: 'Tentativa de Edição Não Autorizada',
      })
    ).rejects.toThrow('Acesso negado');
  });

  it('should allow admin to delete a clinical meeting', async () => {
    await caller.clinicalMeetings.delete({ id: testMeetingId });

    // Verify the deletion
    const meetings = await caller.clinicalMeetings.list({ year: 2026, month: 6 });
    const deletedMeeting = meetings.find(m => m.id === testMeetingId);
    expect(deletedMeeting).toBeUndefined();
  });

  it('should prevent non-admin from deleting a clinical meeting', async () => {
    const viewerCaller = appRouter.createCaller(viewerContext);

    // Create a new meeting for this test
    await caller.clinicalMeetings.create({
      data: new Date('2026-06-12'),
      tema: 'Teste de Exclusão',
      tipo: 'AULA',
    });

    const meetings = await caller.clinicalMeetings.list({ year: 2026, month: 6 });
    const testMeeting = meetings.find(m => m.tema === 'Teste de Exclusão');

    if (testMeeting) {
      await expect(
        viewerCaller.clinicalMeetings.delete({ id: testMeeting.id })
      ).rejects.toThrow('Acesso negado');

      // Cleanup
      await caller.clinicalMeetings.delete({ id: testMeeting.id });
    }
  });
});
