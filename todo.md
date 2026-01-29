# TODO - HU UFJF Residência Médica

## Modelo de Dados e Backend
- [x] Criar schema completo com tabelas: residents, rotations, rotation_assignments, weekly_activities, activity_audiences, imports
- [x] Implementar sistema de autenticação com papéis ADMIN/VIEWER
- [x] Criar helpers de autorização (adminProcedure, viewerProcedure)
- [x] Desenvolver APIs tRPC para residentes (CRUD, busca, filtros)
- [x] Desenvolver APIs tRPC para rodízios (CRUD, validação de conflitos, duplas)
- [x] Desenvolver APIs tRPC para atividades semanais (CRUD, filtros por ano/bloco)
- [x] Desenvolver APIs tRPC para imports (histórico, versionamento)
- [x] Implementar parser de PDFs com suporte a tabelas e OCR
- [x] Criar pipeline de upload de PDFs para S3 com versionamento

## Interface - Calendários
- [x] Implementar calendário mensal de rodízios com grid de dias
- [x] Adicionar filtros no calendário mensal (mês, estágio, residente, ano)
- [ ] Criar painel lateral com detalhes de rodízio ao clicar no dia
- [x] Implementar calendário semanal com grade de horários
- [x] Adicionar filtros no calendário semanal (ano R1/R2/R3, blocos)
- [x] Criar cards de atividade com tooltip/modal de detalhes
- [ ] Implementar responsividade mobile (lista por dia com swipe)

## Interface - Admin
- [x] Criar painel de importação de PDFs com upload
- [ ] Implementar pré-visualização de PDF antes da extração
- [ ] Criar tela de conferência com tabela editável
- [ ] Adicionar detecção de inconsistências (datas, nomes, campos vazios)
- [ ] Implementar assistente de mapeamento de colunas
- [x] Criar página de gerenciamento de residentes (lista, busca, edição)
- [ ] Criar CRUD de rodízios com validação de conflitos
- [ ] Criar CRUD de atividades semanais
- [ ] Criar CRUD de estágios/locais
- [ ] Implementar auditoria e histórico de alterações

## Funcionalidades Adicionais
- [ ] Implementar validação de datas (formato, ordenação, intervalos)
- [ ] Criar sistema de detecção de conflitos de rodízios
- [ ] Implementar exportação de rodízios para PDF
- [ ] Implementar exportação de cronograma semanal para PDF
- [ ] Implementar exportação de calendário ICS por residente
- [ ] Implementar exportação de calendário ICS por público (ano/bloco)

## Design e UX
- [x] Definir paleta de cores e tipografia elegante
- [x] Criar design system com componentes reutilizáveis
- [x] Implementar layout responsivo mobile-first
- [x] Adicionar animações e transições suaves
- [x] Garantir acessibilidade (contraste, tamanho de fonte, navegação)

## Testes e Documentação
- [x] Adicionar dados seed para demonstração
- [x] Criar testes unitários para APIs críticas
- [ ] Documentar guia de uso para ADMIN
- [ ] Documentar guia de uso para VIEWER
- [ ] Criar lista de limitações e soluções

## Bugs
- [x] Corrigir erro de `<a>` aninhado na página Home
