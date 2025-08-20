<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 9 créditos restantes para usar o sistema de feedback AI.

# Feedback para gnvr29:

Nota final: **60.5/100**

# Feedback para você, gnvr29! 🚀👮‍♂️

Olá! Primeiro, quero te parabenizar pelo esforço e pelo código que você compartilhou. Você já conseguiu implementar muitas funcionalidades importantes da API, especialmente a integração com o banco de dados PostgreSQL usando Knex.js, além de manter uma arquitetura modular muito boa com controllers, repositories e rotas. Isso é essencial para um projeto escalável e organizado. 👏👏

Além disso, notei que você implementou filtros simples para os casos e agentes, como filtragem por status e agente responsável, o que é um excelente passo para deixar a API mais flexível. Também cuidou muito bem das validações e dos retornos HTTP, garantindo respostas claras para o cliente. Isso mostra que você está preocupado com a experiência do usuário da sua API, o que é ótimo! 🎯

---

## Vamos analisar juntos alguns pontos que podem ser melhorados para deixar seu projeto ainda mais robusto e alinhado com as expectativas do desafio. 🕵️‍♂️

---

## 1. Sobre a Estrutura de Diretórios

Eu dei uma olhada na estrutura do seu projeto e percebi que você tem a maioria dos arquivos no lugar certo, mas notei que a pasta `utils` contém apenas o arquivo `errorHandler.js`, que parece estar vazio (não foi enviado no código). Além disso, seu `.gitignore` não está incluindo a pasta `node_modules`, o que pode causar problemas no versionamento e no tamanho do repositório.

**Por que isso importa?**  
Seguir a estrutura padrão e boas práticas de organização ajuda a manter o projeto limpo, facilita a manutenção e a colaboração, além de evitar problemas com arquivos desnecessários no controle de versão.

**O que fazer?**  
- Verifique seu `.gitignore` e adicione a linha `node_modules/` para ignorar essa pasta.  
- Certifique-se que seu arquivo `utils/errorHandler.js` está implementado ou remova se não for usar.  
- Mantenha a estrutura conforme abaixo para evitar confusões futuras:

```
📦 SEU-REPOSITÓRIO
│
├── package.json
├── server.js
├── knexfile.js
├── INSTRUCTIONS.md
│
├── db/
│   ├── migrations/
│   ├── seeds/
│   └── db.js
│
├── routes/
│   ├── agentesRoutes.js
│   └── casosRoutes.js
│
├── controllers/
│   ├── agentesController.js
│   └── casosController.js
│
├── repositories/
│   ├── agentesRepository.js
│   └── casosRepository.js
│
└── utils/
    └── errorHandler.js
```

Para entender melhor a arquitetura MVC e organização de arquivos, recomendo muito este vídeo:  
👉 https://youtu.be/bGN_xNc4A1k?si=Nj38J_8RpgsdQ-QH

---

## 2. Problema Fundamental: Validação e Atualização do ID dos Recursos

Eu percebi que você permite alterar o campo `id` tanto para agentes quanto para casos via método PUT, o que não é uma prática recomendada e foi identificado como um problema.

Por exemplo, no seu controller `agentesController.js` no método `putAgente`, você aceita o corpo inteiro do recurso para atualização, porém não há nenhuma proteção para impedir que o campo `id` seja alterado:

```js
const { nome, dataDeIncorporacao, cargo } = req.body;
// O campo id não está sendo filtrado nem bloqueado
const agente = {
  nome,
  dataDeIncorporacao,
  cargo,
};
```

O mesmo acontece em `putCaso` no `casosController.js`.

**Por que isso é um problema?**  
O `id` é a chave primária do recurso no banco de dados e deve ser imutável. Permitir sua alteração pode causar inconsistências, problemas de integridade referencial e falhas na aplicação.

**Como corrigir?**  
Você deve ignorar ou bloquear o campo `id` no corpo da requisição para PUT e PATCH, garantindo que ele nunca seja alterado. Por exemplo:

```js
// No putAgente, desestruture apenas os campos permitidos, ignore o id
const { nome, dataDeIncorporacao, cargo, id: _id, ...rest } = req.body;
// Ou explicitamente não permita id no corpo
if (req.body.id) {
  return res.status(400).json({
    status: 400,
    message: "O campo 'id' não pode ser alterado",
  });
}
```

Faça o mesmo para o `putCaso` e `patch` dos dois recursos.

---

## 3. Falha na Criação Completa de Agentes (POST) e Atualização Completa (PUT)

Você mencionou que a criação de agentes com POST e atualização completa com PUT estão falhando. Vamos entender por quê.

No seu migration `agentes.js`, o campo `nome` está com `.unique()`, ou seja, não pode haver dois agentes com o mesmo nome no banco.

```js
table.string("nome").notNullable().unique();
```

No seu seed `agentes.js`, você insere dois agentes com nomes diferentes, o que está correto.

No entanto, no seu controller `postAgente`, você não está validando se o nome já existe antes de tentar inserir. Se tentar inserir um agente com nome duplicado, o banco vai rejeitar e o erro pode não estar sendo tratado corretamente.

Além disso, no seu repository `createAgente` você faz:

```js
const [row] = await knex("agentes").insert(agente).returning("*");
if (row) return row;
// fallback
return await knex("agentes").where({ nome: agente.nome }).first();
```

Se o `returning("*")` falhar (por exemplo, em versões antigas do PostgreSQL), você busca pelo nome. Isso é ok, mas se o nome for duplicado, isso pode gerar comportamento inesperado.

**O que pode estar causando a falha?**  
- Tentar criar agentes com nomes já existentes gera erro de banco que não está sendo tratado.  
- Falta de tratamento específico para erros de violação de unicidade.

**Como melhorar?**  
- Antes de criar, faça uma busca para verificar se o nome já existe e retorne um erro 400 com mensagem amigável.  
- Adicione um tratamento de erro no bloco catch para capturar erros do banco referentes a duplicidade.

Exemplo no controller:

```js
const existingAgente = await agentesRepository.findByName(nome);
if (existingAgente) {
  return res.status(400).json({
    status: 400,
    message: "Parâmetros inválidos",
    errors: { nome: "Já existe um agente com este nome" },
  });
}
```

E no repository, implemente:

```js
async function findByName(nome) {
  return await knex("agentes").where({ nome }).first();
}
```

---

## 4. Falha ao Buscar Caso por ID Inválido (Status 404)

No seu controller `casosController.js` para o método `getCasoId`, você faz:

```js
const caso = await casosRepository.findById(id);
if (!caso) {
  return res.status(404).json({
    status: 404,
    message: "Caso não encontrado",
  });
}
res.status(200).json(caso);
```

Isso está correto, mas é importante garantir que o `id` recebido seja um número válido para evitar erros inesperados na query.

**Sugestão:**  
Antes de buscar, valide se o `id` é um número inteiro positivo. Se não for, retorne 400.

Exemplo:

```js
const idNum = Number(id);
if (!Number.isInteger(idNum) || idNum <= 0) {
  return res.status(400).json({
    status: 400,
    message: "ID inválido",
  });
}
```

Isso evita que a query ao banco faça buscas com valores errados e melhore o feedback para o cliente.

---

## 5. Filtros de Busca e Ordenação nos Agentes

Você implementou filtros interessantes no endpoint `/agentes`, como filtro por cargo e ordenação por data de incorporação. Porém, notei que você faz o filtro e ordenação **em memória** após buscar todos os agentes do banco:

```js
let agentes = await agentesRepository.findAll();

if (cargo) {
  agentes = agentes.filter((agente) => agente.cargo === cargo);
}

// ordenação
if (sort === "dataDeIncorporacao") {
  agentes = agentes.sort(...);
}
```

**Por que isso pode ser um problema?**  
- Se o banco tiver muitos agentes, buscar todos e filtrar/ordenar no Node.js pode causar lentidão e desperdício de memória.  
- O ideal é fazer o filtro e ordenação diretamente na query SQL, usando o Knex.

**Como melhorar?**  
Implemente os filtros e ordenação no repository, por exemplo:

```js
async function findAll({ cargo, sort }) {
  let query = knex("agentes").select("*");

  if (cargo) {
    query = query.where("cargo", cargo);
  }

  if (sort === "dataDeIncorporacao") {
    query = query.orderBy("dataDeIncorporacao", "asc");
  } else if (sort === "-dataDeIncorporacao") {
    query = query.orderBy("dataDeIncorporacao", "desc");
  }

  return await query;
}
```

E no controller, passe os parâmetros para o repository.

---

## 6. Filtros de Busca por Palavra-Chave nos Casos (Bonus)

Você tentou implementar a busca por palavra-chave (`q`) no endpoint `/casos`, mas fez isso filtrando os casos **após** buscar todos do banco:

```js
if (q) {
  casos = casos.filter(
    (caso) =>
      caso.titulo.toLowerCase().includes(termo) ||
      caso.descricao.toLowerCase().includes(termo)
  );
}
```

**Por que isso pode ser melhorado?**  
- Fazer isso no banco usando o operador `ILIKE` traz muito mais performance e aproveita o poder do SQL para busca textual.  
- Além disso, o filtro em memória não escala para grandes volumes de dados.

**Como fazer?**  
No repository `casosRepository.js`, crie um método que recebe o termo de busca e monta a query com `where` e `orWhere` usando `ILIKE` (case-insensitive):

```js
async function findAll({ agente_id, status, q }) {
  let query = knex("casos").select("*");

  if (agente_id) {
    query = query.where("agente_id", agente_id);
  }

  if (status) {
    query = query.where("status", status);
  }

  if (q) {
    query = query.andWhere(function () {
      this.where("titulo", "ilike", `%${q}%`).orWhere("descricao", "ilike", `%${q}%`);
    });
  }

  return await query;
}
```

Depois, no controller, apenas chame esse método passando os parâmetros.

---

## 7. Configuração do Banco de Dados e Migrations

Seu `knexfile.js` e `db/db.js` parecem corretos, e você está usando variáveis de ambiente para conexão, o que é ótimo! 👍

Só uma dica importante: sempre verifique se as migrations foram executadas corretamente antes de rodar a aplicação, pois a ausência das tabelas `agentes` e `casos` pode causar erros em todas as operações.

Para isso, você pode rodar:

```bash
npx knex migrate:latest
npx knex seed:run
```

Se quiser entender melhor como configurar o ambiente com Docker e PostgreSQL, recomendo este vídeo que explica desde a criação do container até a conexão com o Node.js:  
👉 http://googleusercontent.com/youtube.com/docker-postgresql-node

---

## 8. Sobre as Penalidades Detectadas

- **Alteração do ID via PUT:** Já falamos, bloqueie o campo `id` na atualização.  
- **`.gitignore` sem `node_modules`:** Ajuste seu `.gitignore` para evitar subir a pasta `node_modules`.  
- **Estrutura de arquivos diferente do esperado:** Ajuste a organização para seguir o padrão do desafio, isso evita confusão e facilita a avaliação.

---

## Recapitulando o que você pode focar para melhorar 📝

- 🚫 Bloquear alteração do campo `id` nos métodos PUT e PATCH para agentes e casos.  
- ✅ Validar unicidade do campo `nome` ao criar agentes, com tratamento de erro amigável.  
- 🔍 Validar o `id` recebido nas rotas para garantir que é um número válido.  
- ⚡ Mover filtros e ordenações para dentro das queries SQL no repository, evitando filtragem em memória.  
- 🔎 Implementar busca por palavra-chave (`q`) usando `ILIKE` no banco para casos.  
- 🛠️ Garantir que as migrations e seeds estejam rodando corretamente antes de usar a API.  
- 📁 Ajustar `.gitignore` para ignorar `node_modules`.  
- 🏗️ Organizar a estrutura de arquivos conforme o padrão para facilitar manutenção e avaliação.

---

## Para continuar evoluindo, aqui vão alguns recursos que vão te ajudar muito:

- **Validação, tratamento de erros e status HTTP na API:**  
  https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/400  
  https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/404  
  https://youtu.be/yNDCRAz7CM8?si=Lh5u3j27j_a4w3A_

- **Knex.js - Migrations e Query Builder:**  
  https://knexjs.org/guide/migrations.html  
  https://knexjs.org/guide/query-builder.html  

- **Configuração de Banco de Dados com Docker e Node.js:**  
  http://googleusercontent.com/youtube.com/docker-postgresql-node  

- **Arquitetura MVC e organização de projetos Node.js:**  
  https://youtu.be/bGN_xNc4A1k?si=Nj38J_8RpgsdQ-QH  

---

## Finalizando…

Você já está com uma base muito boa e organizada, e com alguns ajustes importantes, sua API vai ficar muito mais sólida, eficiente e alinhada com as boas práticas do mercado! 💪✨

Continue explorando, testando e aprimorando seu código. Cada detalhe que você melhora é um passo gigante na sua jornada como desenvolvedor backend.

Se precisar, estou aqui para ajudar! Vamos juntos nessa! 🚓👨‍💻

Um abraço e até a próxima revisão! 🤗👋

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>