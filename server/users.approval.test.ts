/**
 * Testes para fluxo de aprovação de usuários
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import type { Context } from './_core/context';

describe('Fluxo de Aprovação de Usuários', () => {
  let adminContext: Context;
  let userContext: Context;
  let pendingUserId: number;

  beforeAll(async () => {
    // Contexto de administrador
    adminContext = {
      user: {
        id: 1,
        email: 'admin@test.com',
        name: 'Admin Test',
        role: 'admin' as const,
      },
    };

    // Contexto de usuário comum
    userContext = {
      user: {
        id: 2,
        email: 'user@test.com',
        name: 'User Test',
        role: 'user' as const,
      },
    };
  });

  it('deve listar usuários com campo accountStatus', async () => {
    const caller = appRouter.createCaller(adminContext);
    const usuarios = await caller.users.list();

    expect(usuarios).toBeDefined();
    expect(Array.isArray(usuarios)).toBe(true);
    
    if (usuarios.length > 0) {
      expect(usuarios[0]).toHaveProperty('accountStatus');
      expect(['pending', 'approved', 'rejected']).toContain(usuarios[0].accountStatus);
    }
  });

  it('deve aprovar um usuário pendente', async () => {
    const caller = appRouter.createCaller(adminContext);
    
    // Listar usuários para encontrar um pendente
    const usuarios = await caller.users.list();
    const pendingUser = usuarios.find(u => u.accountStatus === 'pending');

    if (pendingUser) {
      const result = await caller.users.approve({ userId: pendingUser.id });
      expect(result.success).toBe(true);

      // Verificar se o status foi atualizado
      const updatedUsers = await caller.users.list();
      const approvedUser = updatedUsers.find(u => u.id === pendingUser.id);
      expect(approvedUser?.accountStatus).toBe('approved');
    }
  });

  it('deve rejeitar um usuário', async () => {
    const caller = appRouter.createCaller(adminContext);
    
    // Listar usuários para encontrar um aprovado
    const usuarios = await caller.users.list();
    const approvedUser = usuarios.find(u => u.accountStatus === 'approved' && u.id !== 1);

    if (approvedUser) {
      const result = await caller.users.reject({ userId: approvedUser.id });
      expect(result.success).toBe(true);

      // Verificar se o status foi atualizado
      const updatedUsers = await caller.users.list();
      const rejectedUser = updatedUsers.find(u => u.id === approvedUser.id);
      expect(rejectedUser?.accountStatus).toBe('rejected');
    }
  });

  it('não deve permitir usuário comum aprovar outros usuários', async () => {
    const caller = appRouter.createCaller(userContext);
    
    await expect(
      caller.users.approve({ userId: 999 })
    ).rejects.toThrow();
  });

  it('não deve permitir usuário comum rejeitar outros usuários', async () => {
    const caller = appRouter.createCaller(userContext);
    
    await expect(
      caller.users.reject({ userId: 999 })
    ).rejects.toThrow();
  });

  it('deve retornar erro ao aprovar usuário inexistente', async () => {
    const caller = appRouter.createCaller(adminContext);
    
    await expect(
      caller.users.approve({ userId: 999999 })
    ).rejects.toThrow('Usuário não encontrado');
  });

  it('deve retornar erro ao rejeitar usuário inexistente', async () => {
    const caller = appRouter.createCaller(adminContext);
    
    await expect(
      caller.users.reject({ userId: 999999 })
    ).rejects.toThrow('Usuário não encontrado');
  });
});
