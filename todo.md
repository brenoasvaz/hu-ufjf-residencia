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
- [x] Implementar responsividade mobile (lista por dia com swipe)

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


## Nova Funcionalidade - Gerar PDF de Avaliações
- [x] Implementar endpoint tRPC para gerar PDF de avaliação com respostas e notas
- [x] Adicionar botão de exportar PDF na interface admin (aba Avaliações)
- [x] Formatar PDF com informações do residente, questões, respostas e resultado
- [x] Testar geração de PDF


## Nova Funcionalidade - Gerenciamento de Usuários
- [x] Implementar endpoints tRPC para listar todos os usuários (admin apenas)
- [x] Implementar endpoint tRPC para editar usuário (nome, email, role)
- [x] Criar página de gerenciamento de usuários para administrador
- [x] Adicionar interface para conceder/revogar credenciais de administrador
- [x] Implementar testes para endpoints de gerenciamento
- [x] Testar funcionalidade completa


## Ajuste - Admin Ver Todas as Avaliações
- [x] Modificar endpoint de listagem para admin ver todas as avaliações (não apenas próprias)
- [x] Adicionar informações do residente/usuário na listagem de avaliações
- [x] Garantir que geração de PDF funcione para avaliações de qualquer usuário
- [x] Testar acesso admin a resultados de avaliações de outros usuários


## Nova Funcionalidade - Deletar Usuários
- [x] Implementar endpoint tRPC para deletar usuário (admin apenas)
- [x] Adicionar proteção para não deletar o próprio usuário admin
- [x] Adicionar botão de deletar na interface de gerenciamento de usuários
- [x] Implementar dialog de confirmação antes de deletar
- [x] Implementar testes para endpoint de deletar
- [x] Testar funcionalidade completa


## Reforço de Segurança - Restrições de Acesso a Avaliações
- [x] Auditar todos os endpoints de avaliações para garantir que residentes vejam apenas suas próprias
- [x] Verificar que respostas corretas não são expostas em nenhum endpoint para residentes
- [x] Remover visualização de respostas corretas nas páginas de resultado
- [x] Garantir que apenas pontuação e estatísticas são mostradas, não gabaritos
- [x] Implementar testes de segurança para validar restrições
- [x] Testar acesso cruzado entre usuários


## Nova Funcionalidade - Links Úteis
- [x] Criar tabela no banco de dados para armazenar links
- [x] Implementar endpoints tRPC para CRUD de links (admin)
- [x] Implementar endpoint público para listar links
- [x] Criar página admin de gerenciamento de links
- [x] Criar página pública de visualização de links úteis
- [x] Adicionar item "Links Úteis" no menu de navegação
- [x] Adicionar primeiro link (avaliações práticas)
- [x] Testar funcionalidade completa


## Melhorias - Links Úteis e Navegação
- [x] Adicionar botões de gerenciamento (editar/deletar/adicionar) na página pública de Links Úteis para admin
- [x] Adicionar card de Links Úteis na página de Administração
- [x] Ocultar menu de Importações temporariamente


## Nova Funcionalidade - Aprovação de Novos Usuários
- [x] Adicionar campo 'status' ao schema de usuários (pendente/aprovado/rejeitado)
- [x] Modificar autenticação para bloquear acesso de usuários pendentes
- [x] Criar endpoints tRPC para admin aprovar/rejeitar usuários
- [x] Atualizar página de gerenciamento de usuários com status e botões de aprovação
- [x] Adicionar mensagem na tela de login para usuários pendentes
- [x] Implementar testes para fluxo de aprovação
- [x] Testar fluxo completo de cadastro → aprovação → acesso


## Atualização - Banco de Questões Revisado e Imagens
- [x] Analisar planilha revisada (nova coluna de imagens, redistribuição de áreas)
- [x] Adicionar campo imageUrl ao schema de questões e migrar banco
- [x] Criar script para atualizar banco com dados revisados da planilha
- [x] Implementar endpoint tRPC para upload de imagem em questão
- [x] Criar interface admin para adicionar/editar imagem no enunciado
- [x] Exibir imagens nas questões durante a avaliação
- [x] Testar funcionalidade completa


## Correções - Contador e Visualização de Questões
- [x] Corrigir contador de questões (mostrar 2.233 em vez de 2.044) - agora dinâmico via banco
- [x] Investigar e corrigir problema de visualização de questões na gestão de avaliações
- [x] Implementar listagem paginada com busca e filtro por especialidade
- [x] Adicionar endpoint tRPC de contagem dinâmica e listagem de questões


## Melhoria - Visualização de Alternativas nas Questões
- [x] Implementar expansão de alternativas ao clicar em questão na listagem
- [x] Buscar alternativas via endpoint tRPC ao expandir
- [x] Exibir alternativas com indicação visual da correta (apenas para admin)
- [x] Testar expansão/colapso das questões


## Correção de Segurança - Race Condition no Endpoint Submeter
- [x] Envolver operação de submissão em transação Drizzle ORM (verificação + respostas + finalização)
- [x] Prevenir gravações conflitantes de totalAcertos em requests simultâneos
- [x] Testar atomicidade da transação


## Padronização de Cores e Tema
- [x] Login.tsx: substituir bg-blue-600 por bg-primary, from-blue-50 to-blue-100 por from-background to-muted, text-blue-600 por text-primary
- [x] CalendarioMensal.tsx: adicionar variantes dark em getStageColor (blue, green, purple, amber, rose, orange)
- [x] CalendarioSemanal.tsx: adicionar variantes dark em getActivityColor (rose, blue, amber, purple, green)
- [x] MainLayout.tsx: adicionar botão toggle light/dark com ícones Sun/Moon usando useTheme


## Padronização de Tipografia e Espaçamento
- [x] Home.tsx: H1 text-4xl→text-2xl, H2 text-3xl→text-lg, p text-xl→text-sm, estrutura space-y-6
- [x] Admin.tsx: H1 text-3xl→text-2xl, H2 text-2xl→text-lg, estrutura space-y-6
- [x] Residentes.tsx: H1 text-3xl→text-2xl, estrutura space-y-6
- [x] ClinicalMeetings.tsx: labels HTML→Label shadcn, estrutura space-y-6 (H1 já correto)
- [x] LinksUteis.tsx: H1 text-3xl→text-2xl, estrutura space-y-6
- [x] CalendarioMensal.tsx: H1 text-3xl→text-2xl, labels HTML→Label shadcn, estrutura space-y-6
- [x] CalendarioSemanal.tsx: H1 text-3xl→text-2xl, H2 text-xl→text-lg, labels HTML→Label shadcn, estrutura space-y-6
- [x] Avaliacoes.tsx: H1 text-3xl→text-2xl, H2 text-2xl→text-lg, estrutura space-y-6
- [x] DashboardAvaliacoes.tsx: H1 text-3xl→text-2xl, estrutura space-y-6
- [x] ResultadoSimulado.tsx: H1 text-3xl→text-2xl, estrutura space-y-6
- [x] ModelosProva.tsx: H1 text-3xl→text-2xl, estrutura space-y-6
- [x] UserManagement.tsx: H1 text-3xl→text-2xl, estrutura space-y-6
- [x] admin/AdminAvaliacoes.tsx: H1 text-3xl→text-2xl, H2 text-2xl→text-lg, estrutura space-y-6
- [x] admin/GerenciarImagensQuestoes.tsx: H1 text-3xl→text-2xl, contadores text-3xl→text-2xl, estrutura space-y-6
- [x] admin/GerenciarLinks.tsx: H1 text-3xl→text-2xl, estrutura space-y-6
- [x] admin/GerenciarUsuarios.tsx: H1 text-3xl→text-2xl, estrutura space-y-6

## Ajustes de Layout
- [x] Home.tsx: diagramação centralizada (hero + cards centralizados)

## Bugs - Módulo de Avaliações
- [x] Bug 1: simulado gera menos questões que o configurado (ex.: 10 configuradas → 5 entregues). Causa: selecionarQuestoesInteligentes limita ao total disponível por especialidade sem compensar com outras especialidades, e o modelo pode ter especialidades com poucas questões.
- [x] Bug 2: todos os residentes compartilham a mesma instância do simulado. Cada residente deve gerar sua própria instância independente ao clicar "Iniciar Avaliação".
- [x] Bug 3: admin deve ver os resultados nomeados por residente (ex.: "Prova 1 - Mariana Moraes") na aba Avaliações do painel admin.

## Fluxo de Revisão Prévia do Simulado (Admin)
- [x] Schema: adicionar campo status ao modelosProva (rascunho | em_revisao | liberado) e tabela simuladoTemplate para o simulado-gabarito do admin
- [x] DB: procedure adminGerarSimuladoTemplate — cria instância de revisão vinculada ao modelo (não a um userId de residente)
- [x] DB: procedure adminTrocarQuestao — substitui uma questão do template por outra da mesma especialidade
- [x] DB: procedure adminLiberarSimulado — muda status do modelo para "liberado", permitindo que residentes iniciem
- [x] Tela admin: página SimuladoRevisao.tsx — lista questões do template, permite trocar questão, adicionar imagem e liberar
- [x] Tela admin: botão "Gerar Simulado para Revisão" na aba Modelos de AdminAvaliacoes.tsx
- [x] Tela admin: badge de status (Rascunho / Em Revisão / Liberado) nos cards de modelos
- [x] Fluxo residente: bloquear geração de simulado se o modelo não estiver com status "liberado"
- [x] Fluxo residente: exibir aviso "Aguardando liberação pelo preceptor" para modelos não liberados

## Melhorias no Módulo de Questões
- [x] Backend: expandir listComImagem para listar TODAS as questões (não só temImagem=1), com filtros por fonte/prova e ano
- [x] Backend: adicionar procedure editarQuestao (atualizar enunciado + alternativas)
- [x] Backend: atualizar uploadImagem para não exigir temImagem=1 e marcar temImagem=1 ao fazer upload
- [x] Frontend GerenciarImagensQuestoes: renomear para "Gerenciar Questões", mostrar todas as questões
- [x] Frontend: adicionar filtros por fonte (TARO/TEOT/SBOT 1000) e ano na barra de busca
- [x] Frontend: botão "Editar" em cada questão abrindo modal com enunciado + alternativas editáveis + upload de imagem
- [x] Frontend: botão "Adicionar Imagem" disponível em qualquer questão (não apenas as marcadas com temImagem)

## Bugs - Gerenciar Questões
- [x] Bug: filtro "Sem Imagem" exibe todas as questões em vez de filtrar apenas as sem imageUrl; os contadores dos cards também mostram contagem da página atual e não do total real

## Melhorias na Execução do Simulado
- [x] ExecucaoSimulado.tsx: exibir imageUrl da questão entre enunciado e alternativas quando preenchido

## Edição de Questões - Especialidade
- [x] Backend: adicionar especialidadeId no input da procedure editar
- [x] Frontend: adicionar Select de especialidades no modal de edição de questões

## Filtro por Especialidade nas Questões
- [x] Backend: adicionar especialidadeId no input de listComImagem
- [x] Frontend: adicionar Select de especialidade nos filtros de GerenciarImagensQuestoes

## Bug - Filtro "Sem Imagem"
- [x] Backend: filtro sem_imagem deve usar temImagem=1 AND imageUrl IS NULL (não apenas imageUrl IS NULL)
- [x] Frontend: card "Sem Imagem" deve ser renomeado para "Pendente de Imagem" e refletir a nova lógica

## Módulo de Edição da Escala Semanal (Admin)
- [x] Backend: procedure updateAudiences para atualizar público-alvo de uma atividade
- [x] Backend: procedure listWithAudiences para retornar todas as atividades com seus audiences
- [x] Frontend: instalar @dnd-kit/core e @dnd-kit/sortable para drag-and-drop
- [x] Frontend: criar página AdminEscalaSemanal com grade horária semanal editável
- [x] Frontend: modal de edição de atividade (título, horário, local, ano de residência, bloco)
- [x] Frontend: drag-and-drop para mover atividades entre dias/horários
- [x] Frontend: botão de nova atividade e exclusão
- [x] Frontend: filtro por ano de residência (R1/R2/R3) para editar apenas um grupo
- [x] App.tsx: adicionar rota /admin/escala-semanal
- [x] MainLayout/Admin: adicionar link para edição da escala no menu admin

## Responsividade Mobile - Calendário Semanal
- [x] CalendarioSemanal.tsx: layout mobile com lista por dia e swipe entre dias
- [x] CalendarioSemanal.tsx: botões de navegação prev/next dia no mobile
- [x] AdminEscalaSemanal.tsx: layout mobile com lista por dia e swipe entre dias
- [x] AdminEscalaSemanal.tsx: botões de navegação prev/next dia no mobile

## Sistema de Pastas/Categorias - Links Úteis
- [x] Schema: adicionar tabela linksCategorias (id, nome, descricao, icone, ordem, ativo)
- [x] Schema: adicionar campo categoriaId em linksUteis (FK para linksCategorias, nullable)
- [x] DB: migrar banco com pnpm db:push
- [x] Backend: procedures CRUD para categorias (list, listAll, create, update, delete)
- [x] Backend: atualizar procedures de links para incluir categoriaId no create/update
- [x] Backend: procedure listComCategorias que retorna links agrupados por categoria
- [x] Frontend LinksUteis.tsx: exibir links em acordeão por categoria (Accordion shadcn/ui)
- [x] Frontend LinksUteis.tsx: links sem categoria em seção "Geral" no final
- [x] Frontend GerenciarLinks.tsx: CRUD de pastas/categorias (criar, editar, excluir)
- [x] Frontend GerenciarLinks.tsx: campo de categoria no formulário de criação/edição de link

## Bug - CalendarioSemanal Mobile
- [x] Sábado e domingo não aparecem na navegação mobile (pills e swipe)

## Bug - Links Úteis Edição de Pasta
- [x] Nome da pasta não é editável no modal de edição de categoria

## Notificação por E-mail ao Liberar Simulado
- [ ] Backend: ao liberar simulado, buscar todos os residentes ativos com e-mail
- [ ] Backend: enviar e-mail para cada residente com nome do modelo e link para avaliações
- [ ] Backend: usar Resend API ou SMTP para envio de e-mail

## Filtro por Bloco/Estágio na Escala Semanal
- [x] AdminEscalaSemanal.tsx: adicionar filtro por bloco/estágio (A, B, C, Enfermaria, CC1, CC2) além do filtro de ano
- [x] AdminEscalaSemanal.tsx: filtro de bloco deve filtrar atividades exibidas na grade e no modal de criação
- [x] Corrigir edição da pasta "Geral" em Links Úteis (group.id === null bloqueia edição inline e botões de editar/excluir)
- [x] Corrigir bug: nova pasta criada não aparece na listagem (pasta sem links não é exibida)
- [x] Implementar subpastas em Links Úteis (campo parentId, acordeão aninhado, CRUD)
- [x] Implementar troca de datas entre atividades das reuniões clínicas (swap de scheduledDate entre dois registros)
- [x] Criar página de Escala de Avaliações Práticas (dados do PDF) e link em Links Úteis
- [x] Adicionar aviso de datas limite na página Escala de Avaliações Práticas
- [x] Migrar escala de avaliações práticas para banco de dados
- [x] Criar painel admin para edição da escala de avaliações
- [x] Destaque visual de data limite próxima (< 30 dias) na escala
- [x] Seletor de ano e cadastro de novos residentes no painel admin da Escala de Avaliações
- [x] Copiar escala entre anos com progressão automática R1→R2, R2→R3, R3 removidos
- [x] Cópia com progressão de ano para escala mensal de rodízios
- [x] Botão para remover marcação 'pendente de imagem' em questões sem necessidade de imagem
- [x] Revisão de simulado: edição de conteúdo, upload de imagem e troca de questão antes da liberação
- [x] Corrigir erro de troca de datas em reuniões clínicas (data 1970-01-01)
- [x] Botão para admin adicionar atividades em datas da reunião clínica
- [x] Reordenação de atividades dentro de cada data nas reuniões clínicas
- [x] Reorganizar menu superior com dropdowns para eliminar sobreposição e poluição visual
- [x] Exportar programação mensal de reuniões clínicas em PDF
- [x] Logo HU UFJF/EBSERH no cabeçalho do PDF de Reuniões Clínicas
- [x] Badge de simulados pendentes no menu "Avaliações"
- [x] Corrigir botão de gerar PDF das reuniões clínicas
- [x] Clube de Revista: tabela no banco de dados
- [x] Clube de Revista: procedures tRPC (CRUD + upload PDF + download)
- [x] Clube de Revista: página com cronograma e upload/download de PDFs
- [x] Clube de Revista: entrada no menu de navegação
- [x] Clube de Revista: busca por título, autor ou palavra-chave
- [x] Clube de Revista: melhorar visibilidade do botão de download de PDF
- [x] Home: substituir card "Importações" pelo Clube de Revista
- [x] Home: substituir card "Residentes" pelas Reuniões Clínicas
- [x] Clube de Revista: importar cronograma 2026 do PDF (34 artigos)
- [x] Clube de Revista: troca de datas entre artigos (admin)
- [x] Reuniões Clínicas: popup do Artigo da Semana com detalhes e download do PDF do Clube de Revista
