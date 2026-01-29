# HU UFJF - Plataforma de Residência Médica em Ortopedia

Sistema de gerenciamento de rodízios e cronogramas para o Serviço de Ortopedia e Traumatologia do Hospital Universitário da UFJF.

## 🎯 Funcionalidades Principais

### Calendários
- **Calendário Mensal**: Visualização de rodízios de residentes por mês com filtros avançados
- **Calendário Semanal**: Grade de horários com atividades semanais por ano e bloco de residência

### Gerenciamento
- **Residentes**: CRUD completo com busca, filtros e histórico
- **Rodízios**: Gerenciamento de períodos de estágio com validação de conflitos
- **Atividades**: Configuração de cronograma semanal com público-alvo específico
- **Importações**: Upload e processamento de PDFs com histórico e versionamento

### Controle de Acesso
- **ADMIN**: Acesso total com permissões de criação, edição e exclusão
- **VIEWER**: Acesso somente leitura aos calendários e informações

## 🏗️ Arquitetura

### Stack Tecnológica
- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Node.js + Express + tRPC 11
- **Banco de Dados**: MySQL/TiDB com Drizzle ORM
- **Autenticação**: Manus OAuth
- **Armazenamento**: AWS S3 para PDFs

### Estrutura de Dados

#### Residentes
- Nome completo e apelido
- Ano de residência (R1, R2, R3)
- Status (ativo/inativo)

#### Rodízios
- Período (data início/fim)
- Local/estágio
- Duplas de residentes
- Mês de referência

#### Atividades Semanais
- Dia da semana e horário
- Título e descrição
- Local
- Público-alvo (ano + bloco)
- Recorrência

#### Estágios
- **R1**: Enfermaria, CC1 (Centro Cirúrgico 1), CC2 (Centro Cirúrgico 2)
- **R2/R3**: Bloco A (Ombro/Pé/Mão), Bloco B (Coluna/Quadril), Bloco C (Joelho/Tumor)

## 🚀 Começando

### Pré-requisitos
- Node.js 22+
- pnpm
- Acesso ao banco de dados MySQL/TiDB

### Instalação

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
# As variáveis são injetadas automaticamente pela plataforma Manus

# Executar migrations
pnpm db:push

# Popular banco com dados de exemplo (opcional)
pnpm exec tsx server/seed.mjs

# Iniciar servidor de desenvolvimento
pnpm dev
```

### Executar Testes

```bash
# Executar todos os testes
pnpm test

# Verificar tipos TypeScript
pnpm check
```

## 📖 Guia de Uso

### Para Administradores

#### Gerenciar Residentes
1. Acesse **Residentes** no menu principal
2. Clique em **Novo Residente** para adicionar
3. Preencha nome, apelido, ano de residência e status
4. Use os ícones de edição/exclusão para modificar registros existentes

#### Configurar Rodízios
1. Acesse **Calendário Mensal**
2. Navegue até o mês desejado
3. Visualize rodízios existentes ou crie novos via painel admin
4. Configure duplas de residentes para cada rodízio

#### Gerenciar Atividades Semanais
1. Acesse **Calendário Semanal**
2. Visualize atividades por dia da semana
3. Configure horários, locais e público-alvo
4. Marque atividades como recorrentes ou pontuais

#### Importar PDFs
1. Acesse **Administração** → **Importações**
2. Selecione o tipo (Rodízio ou Cronograma)
3. Faça upload do arquivo PDF
4. Aguarde processamento e validação
5. Confira dados extraídos antes de confirmar

### Para Visualizadores

#### Consultar Calendários
- **Calendário Mensal**: Filtre por mês, estágio, residente ou ano
- **Calendário Semanal**: Filtre por ano de residência e bloco

#### Buscar Residentes
- Use a barra de busca para encontrar residentes por nome ou apelido
- Visualize informações e histórico de rodízios

## 🗂️ Estrutura do Projeto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── lib/           # Configurações (tRPC)
│   │   └── index.css      # Estilos globais
│   └── public/            # Assets estáticos
│
├── server/                # Backend Node.js
│   ├── routers.ts         # Definição de rotas tRPC
│   ├── db-helpers/        # Helpers de banco de dados
│   ├── pdf-parser.ts      # Parser de PDFs
│   ├── seed.mjs           # Script de seed
│   └── *.test.ts          # Testes unitários
│
├── drizzle/               # Schema e migrations
│   └── schema.ts          # Definição de tabelas
│
└── shared/                # Tipos e constantes compartilhadas
```

## 🧪 Testes

O projeto inclui testes unitários para APIs críticas:

- **Autenticação**: Logout e gerenciamento de sessões
- **Residentes**: CRUD e controle de acesso por papel
- **Validações**: Filtros, buscas e permissões

Execute `pnpm test` para rodar todos os testes.

## 📊 Dados de Exemplo

O script de seed (`server/seed.mjs`) popula o banco com:
- 6 residentes (2 de cada ano: R1, R2, R3)
- 6 estágios/locais
- 3 rodízios para janeiro/2026
- 6 assignments de duplas
- 5 atividades semanais recorrentes

Execute: `pnpm exec tsx server/seed.mjs`

## 🎨 Design

O sistema utiliza um design elegante e moderno com:
- Paleta de cores profissional (azul, roxo, verde, laranja)
- Tipografia clara e legível
- Animações e transições suaves
- Layout responsivo mobile-first
- Componentes shadcn/ui para consistência

## 🔐 Segurança

- Autenticação via Manus OAuth
- Controle de acesso baseado em papéis (RBAC)
- Validação de entrada em todas as APIs
- Proteção contra SQL injection via Drizzle ORM
- Armazenamento seguro de PDFs no S3

## 📝 Próximas Implementações

- [ ] Exportação de cronogramas para PDF e ICS
- [ ] Validação automática de conflitos de rodízios
- [ ] Notificações de mudanças para residentes
- [ ] Histórico completo de alterações com auditoria
- [ ] Relatórios e estatísticas de participação
- [ ] Interface de conferência para importações de PDF
- [ ] Detecção de inconsistências em dados importados

## 🤝 Contribuindo

Este é um projeto interno do HU UFJF. Para sugestões ou problemas, entre em contato com a equipe de desenvolvimento.

## 📄 Licença

MIT License - © 2026 HU UFJF

---

**Desenvolvido com ❤️ para o Serviço de Ortopedia e Traumatologia do HU UFJF**
