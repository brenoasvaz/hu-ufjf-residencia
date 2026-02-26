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

## Nova Funcionalidade - Escala Semanal Completa
- [x] Analisar PDF da Semana Padrão e extrair estrutura de horários
- [x] Atualizar seed com atividades completas por bloco/ano
- [x] Redesenhar calendário semanal com visão em colunas por dia
- [x] Implementar visualização de escala ao clicar no rodízio
- [x] Mostrar todos os dias da semana visíveis com atividades por horário

## Bug - Escalas CC1 e CC2 Vazias
- [x] Diagnosticar por que CC1 e CC2 não exibem atividades na escala semanal
- [x] Adicionar atividades para R1 CC1 e CC2 no seed
- [x] Testar visualização após correção

## Ajuste de Horários das Atividades Semanais
- [x] Extrair horários corretos do PDF para Bloco A (especificado pelo usuário)
- [x] Extrair horários corretos do PDF para Bloco B
- [x] Extrair horários corretos do PDF para Bloco C
- [x] Extrair horários corretos do PDF para Enfermaria R1
- [x] Extrair horários corretos do PDF para CC1 R1
- [x] Extrair horários corretos do PDF para CC2 R1
- [x] Atualizar seed com todos os horários corrigidos
- [x] Executar seed e testar visualização

## Ajustes Solicitados
- [x] Padronizar horário da Reunião Clínica para sempre iniciar às 07:00h (corrigir Bloco B que está 07:15h)
- [x] Ajustar visualização do calendário semanal para preencher todos os blocos de horário ocupados por cada atividade (evitar horários em branco)

## Novo Ajuste
- [x] Remover opção "Todos" do filtro de Bloco/Estágio no calendário semanal

## Nova Funcionalidade - Destaque Visual
- [x] Implementar destaque visual no primeiro bloco de atividade longa
- [x] Blocos intermediários devem mostrar apenas cor de fundo sem texto repetido
- [x] Testar visualização em diferentes blocos

## Implementação de Escalas Anuais
- [x] Extrair cronograma de rodízios do ano completo (mar/2026 - fev/2027)
- [x] Criar mapeamento de residentes R2 e R3 por bloco e mês
- [x] Implementar seed com rodízios do ano completo
- [x] Atualizar calendário mensal para exibir nomes dos residentes
- [x] Testar visualização em diferentes meses

## Correção - Calendário Mensal por Residente
- [x] Reformular filtro de residente para exibir apenas o bloco escalado naquele mês
- [x] Remover exibição de todos os blocos quando um residente é selecionado
- [x] Testar visualização com diferentes residentes (R2a, R2b, R2c, R3a, R3b, R3c)

## Revisão de Horários das Escalas Semanais
- [x] Reler PDF da Semana Padrão e extrair horários corretos
- [x] Comparar horários atuais com PDF e identificar erros
- [x] Corrigir horários do Bloco A (já estava correto)
- [x] Corrigir horários do Bloco B (corrigido CC Coluna segunda)
- [x] Corrigir horários do Bloco C (já estava correto)
- [x] Corrigir horários da Enfermaria R1 (já estava correto)
- [x] Corrigir horários do CC1 R1 (já estava correto)
- [x] Corrigir horários do CC2 R1 (já estava correto)
- [x] Remover 44 atividades duplicadas do banco
- [x] Testar visualização após correções

## Nova Revisão de Horários das Escalas Semanais
- [x] Reler PDF da Semana Padrão página por página
- [x] Extrair horários detalhados de cada bloco (A, B, C, Enfermaria, CC1, CC2)
- [x] Comparar com banco atual e identificar todas as diferenças
- [x] Corrigir horários no banco de dados
- [x] Testar visualização após correções

## Correção Final de Horários (especificações do usuário)
- [x] Corrigir horários do Bloco A conforme especificação
- [x] Corrigir horários do Bloco B conforme especificação
- [x] Corrigir horários do Bloco C conforme especificação
- [x] Corrigir horários da Enfermaria R1 conforme especificação
- [x] Corrigir horários do CC1 R1 conforme especificação
- [x] Corrigir horários do CC2 R1 conforme especificação
- [x] Testar visualização de todos os blocos

## Alteração Visual do Usuário
- [x] Atualizar título da Home para "HU UFJF Residência Médica Ortopedia e Traumatologia"

## Nova Aba - Reuniões Clínicas
- [x] Analisar PDF de Reuniões Clínicas e extrair programação
- [x] Extrair orientações para apresentação dos temas
- [x] Criar modelo de dados para reuniões clínicas
- [x] Criar página de Reuniões Clínicas com programação
- [x] Adicionar seção de orientações para apresentação
- [x] Adicionar aba ao menu de navegação
- [x] Popular dados das reuniões do ano
- [x] Testar visualização


## Correção - Datas das Reuniões Clínicas
- [x] Corrigir todas as datas para quintas-feiras
- [x] Adicionar reuniões de fevereiro de 2026
- [x] Testar visualização após correção


## Correção Final - Datas das Reuniões (Quintas-feiras)
- [x] Verificar datas atuais no banco de dados
- [x] Calcular quintas-feiras corretas para cada mês
- [x] Identificar problema de timezone na formatação
- [x] Corrigir função formatDate para exibir dia correto


## Ajuste de Cronograma - 14/05
- [x] Localizar reunião do dia 14/05/2026
- [x] Alterar tema de "Pediátrica - Fraturas do Cotovelo Infantil" para "Pediátrica - Paralisia Cerebral"
- [x] Validar alteração na interface


## Funcionalidade de Edição de Reuniões Clínicas
- [x] Criar endpoint tRPC para atualizar reunião
- [x] Criar endpoint tRPC para deletar reunião
- [x] Criar componente Dialog de edição com formulário
- [x] Adicionar botões de editar/deletar visíveis apenas para administradores
- [x] Implementar validação de permissões (apenas admin)
- [x] Testar edição e exclusão de reuniões


## Exportação de Reuniões para Calendário (ICS)
- [x] Instalar biblioteca ics para geração de arquivos de calendário
- [x] Criar endpoint tRPC para exportar reuniões em formato ICS
- [x] Implementar função de geração de arquivo ICS com todas as reuniões
- [x] Adicionar botão de exportar na interface de Reuniões Clínicas
- [x] Testar geração e download de arquivo ICS


## Sistema Híbrido de Autenticação (OAuth + Login Interno)
- [x] Atualizar schema com campos de senha hash
- [x] Corrigir erros de TypeScript
- [x] Implementar endpoints de registro e login interno
- [x] Criar página de login com opções (OAuth e email/senha)
- [x] Criar página de registro de usuários
- [x] Integrar autenticação interna com sistema existente
- [x] Testar login interno com sucesso


## Fluxo de Aprovação de Cadastros
- [x] Adicionar campo status ao schema de usuários (pending, approved, rejected)
- [x] Modificar registro para criar usuários com status pending
- [x] Criar endpoint para listar usuários pendentes
- [x] Criar endpoint para aprovar usuário
- [x] Criar endpoint para rejeitar usuário
- [x] Criar página de administração de usuários pendentes
- [x] Bloquear login de usuários não aprovados
- [x] Mostrar mensagem informativa para usuários pendentes
- [x] Testar fluxo completo de aprovação


## Melhorias de Navegação dos Calendários
- [x] Adicionar descrições aos blocos (ex: "Bloco B - Coluna e Quadril")
- [x] Filtrar blocos/estágios por ano de residência selecionado
- [x] Criar links do calendário mensal para o calendário semanal do bloco
- [x] Testar navegação entre calendários


## Busca em Reuniões Clínicas
- [x] Adicionar campo de busca na interface de Reuniões Clínicas
- [x] Implementar filtragem por tema (título da reunião)
- [x] Implementar filtragem por preceptor
- [x] Testar busca com diferentes termos


## Módulo de Avaliações/Simulados
- [x] Criar schema de dados (especialidades, questoes, alternativas, modelos_prova, simulados, simulado_questoes, respostas_usuario)
- [x] Executar db:push para aplicar schema
- [x] Criar script de importação do Excel (2.044 questões)
- [x] Executar importação e validar dados
- [x] Implementar endpoints tRPC Admin (CRUD questões, CRUD modelos, listagem residentes, dashboard agregado)
- [x] Implementar endpoints tRPC Residente (listar modelos, gerar simulado, submeter respostas, dashboard pessoal)
- [x] Implementar algoritmo inteligente de seleção de questões (não respondidas → erradas → acertadas)
- [ ] Criar página Admin: Gestão de Questões
- [x] Criar página Admin: Gestão de Modelos de Prova
- [ ] Criar página Admin: Lista de Residentes
- [x] Criar página Admin: Dashboard Agregado
- [x] Criar página Residente: Seletor de Modelos
- [x] Criar página Residente: Interface de Prova (cronômetro, navegação, progresso)
- [x] Criar página Residente: Feedback Pós-Prova (apenas pontuação, sem gabarito)
- [x] Criar página Residente: Dashboard Pessoal (evolução temporal, radar especialidades)
- [x] Adicionar item "Avaliações" no menu de navegação
- [x] Escrever testes Vitest (especialidades, modelos, geração, submissão, controle de acesso)
- [x] Testar fluxo completo Admin e Residente


## Correção - Link Gerenciar Modelos
- [x] Corrigir link "Gerenciar Modelos" na página Admin de Avaliações (erro 404)
- [x] Redirecionar para página de modelos existente ou criar rota correta

## Nova Funcionalidade - Deletar Avaliações e Alterar Nomenclatura
- [x] Implementar endpoint tRPC para administrador deletar avaliações
- [x] Adicionar botão de deletar na interface admin
- [x] Alterar nomenclatura de "simulado" para "avaliação" em todo o sistema (backend e frontend)
- [x] Atualizar testes para refletir mudanças
- [x] Testar funcionalidade completa
