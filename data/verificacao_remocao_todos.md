# Verificação - Remoção da Opção "Todos" do Filtro de Bloco

## Data: 30/01/2026

### Alterações Implementadas

1. **Estado inicial do filtro de bloco alterado**
   - Antes: `selectedBloco = "all"`
   - Depois: `selectedBloco = "Enfermaria"` (primeiro bloco de R1)

2. **Opção "Todos" removida do Select**
   - Removida linha: `<SelectItem value="all">Todos</SelectItem>`
   - Agora o select exibe apenas os blocos específicos

3. **Lógica de auto-seleção ajustada**
   - Ao trocar de ano, o sistema auto-seleciona o primeiro bloco daquele ano
   - R1 → Enfermaria
   - R2/R3 → Bloco A

4. **Condição de renderização simplificada**
   - Removida verificação `selectedBloco !== "all"` do título
   - Título sempre é exibido pois sempre há um bloco selecionado

### Resultado da Verificação

**Teste realizado:**
- Acessado calendário semanal
- Filtro de Bloco/Estágio aberto
- **Opções disponíveis para R1:**
  - Enfermaria ✅
  - Centro Cirúrgico 1 ✅
  - Centro Cirúrgico 2 ✅
  - **"Todos" NÃO aparece** ✅

### Conclusão

A opção "Todos" foi removida com sucesso do filtro de Bloco/Estágio. Agora o usuário sempre visualiza a escala de um bloco específico, conforme solicitado.
