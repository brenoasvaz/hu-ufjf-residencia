# Integração SSO com Plataforma de Avaliações

## Visão Geral

Este documento descreve a integração Single Sign-On (SSO) entre a plataforma de Residência Médica HU UFJF e a plataforma de Avaliações SOT HU UFJF.

## Fluxo de Autenticação

1. **Usuário autenticado** clica no botão "Avaliações" no menu da plataforma de residência
2. **Geração de token JWT**: O sistema gera um token JWT temporário (válido por 5 minutos) contendo:
   - `userId`: ID do usuário no banco de dados
   - `email`: Email do usuário
   - `name`: Nome completo do usuário
   - `role`: Papel do usuário (admin/viewer)
3. **Redirecionamento**: O usuário é redirecionado para a plataforma de avaliações com o token na URL:
   ```
   https://simuladosort-pu2svbe6.manus.space/sso-login?token=<JWT_TOKEN>
   ```
4. **Validação do token**: A plataforma de avaliações valida o token JWT usando o mesmo secret compartilhado
5. **Autenticação automática**: Se o token for válido, o usuário é autenticado automaticamente na plataforma de avaliações

## Configuração

### Variável de Ambiente Compartilhada

Ambas as plataformas devem usar o **mesmo secret** para assinar e validar tokens JWT:

```bash
JWT_SSO_SECRET=<secret_compartilhado_entre_plataformas>
```

**Importante**: 
- Este secret deve ser diferente do `JWT_SECRET` usado para sessões normais
- Deve ser mantido em segredo e nunca exposto no código-fonte
- Deve ser configurado em ambas as plataformas com o mesmo valor

### Plataforma de Residência (este projeto)

**Endpoint**: `trpc.auth.generateSSOToken`
- **Tipo**: Query protegida (requer autenticação)
- **Retorno**: `{ token: string }`
- **Expiração**: 5 minutos

**Implementação no menu**:
```typescript
const handleAvaliacoesClick = async () => {
  const utils = trpc.useUtils();
  const result = await utils.auth.generateSSOToken.fetch();
  const avaliacoesUrl = `https://simuladosort-pu2svbe6.manus.space/sso-login?token=${result.token}`;
  window.open(avaliacoesUrl, '_blank');
};
```

### Plataforma de Avaliações

**Endpoint necessário**: `/sso-login` ou `trpc.auth.ssoLogin`
- **Parâmetro**: `token` (string) - Token JWT recebido da plataforma de residência
- **Validação**: Usar `jsonwebtoken.verify()` com `JWT_SSO_SECRET`
- **Ação**: Criar sessão de usuário e redirecionar para página inicial

**Exemplo de implementação**:
```typescript
ssoLogin: publicProcedure
  .input(z.object({ token: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const jwt = require('jsonwebtoken');
    const ssoSecret = process.env.JWT_SSO_SECRET;
    
    try {
      const decoded = jwt.verify(input.token, ssoSecret);
      
      // Buscar ou criar usuário no banco de dados
      const user = await upsertUser({
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      });
      
      // Criar sessão
      const sessionToken = createSessionToken(user);
      ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
      
      return { success: true };
    } catch (error) {
      throw new TRPCError({ 
        code: 'UNAUTHORIZED',
        message: 'Token SSO inválido ou expirado'
      });
    }
  }),
```

## Segurança

- **Expiração curta**: Tokens SSO expiram em 5 minutos para minimizar janela de ataque
- **HTTPS obrigatório**: Toda comunicação deve usar HTTPS em produção
- **Validação rigorosa**: A plataforma de avaliações deve validar todos os campos do token
- **Secret forte**: Use um secret longo e aleatório (mínimo 32 caracteres)

## Troubleshooting

### Token inválido ou expirado
- Verifique se `JWT_SSO_SECRET` está configurado em ambas as plataformas
- Verifique se o valor é exatamente o mesmo (case-sensitive)
- Certifique-se de que o token não expirou (5 minutos)

### Usuário não autenticado após redirect
- Verifique se a plataforma de avaliações está criando a sessão corretamente
- Verifique se o cookie de sessão está sendo setado
- Verifique logs do servidor para erros de validação

### CORS ou problemas de domínio
- Certifique-se de que ambas as plataformas estão em HTTPS
- Verifique configurações de CORS se necessário
