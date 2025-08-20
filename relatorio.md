<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 8 créditos restantes para usar o sistema de feedback AI.

# Feedback para gnvr29:

Nota final: **60.5/100**

# Feedback para gnvr29 🚔✨

Olá, gnvr29! Primeiro, quero parabenizá-lo pelo seu empenho e pelo trabalho que você já entregou! 🎉 Seu código mostra que você compreendeu muito bem a estrutura básica da API REST com Express e PostgreSQL, e que soube modularizar em controllers, repositories e rotas. Além disso, você implementou corretamente várias validações importantes e retornos de status HTTP adequados, o que é essencial para uma API robusta. 👏

Também quero destacar que você conseguiu implementar filtros simples por status e por agente nos casos, além de filtros e ordenações nos agentes — isso é um bônus que mostra seu esforço extra! 🚀

---

## Vamos juntos analisar os pontos que podem ser aprimorados para deixar sua API tinindo?

---

### 1. Sobre a criação e atualização completa dos agentes (POST e PUT)

Você teve dificuldades na criação (`POST /agentes`) e na atualização completa (`PUT /agentes/:id`) do agente, o que indica que algo está impedindo que esses endpoints funcionem corretamente.

Ao analisar seu controller e repository, notei que você não está protegendo o campo `id` contra alterações indevidas no método PUT. Isso é um problema porque o `id` é a chave primária e não deve ser alterado pelo cliente.

Por exemplo, no seu controller `putAgente`:

```js
async function putAgente(req, res) {
  // ...
  const { nome, dataDeIncorporacao, cargo } = req.body;
  // Não há validação para impedir alteração do id aqui
  const agente = {
    nome,
    dataDeIncorporacao,
    cargo,
  };

  const updateAgente = await agentesRepository.attAgente(id, agente);
  // ...
}
```

Se o cliente enviar um payload com `id` dentro do corpo, ele pode alterar o `id` no banco, o que não é correto.

**Por que isso causa falha?**  
O banco pode rejeitar a alteração da chave primária, ou a aplicação pode atualizar um registro errado, causando inconsistência.

**Como corrigir?**  
Você deve garantir que o campo `id` não seja alterado no corpo da requisição. Uma forma simples é excluir o `id` do objeto antes de enviar para o repository, ou nem sequer aceitar `id` no corpo.

Exemplo:

```js
const { id: _, ...dados } = req.body; // Ignora o id enviado no corpo
const agente = {
  nome: dados.nome,
  dataDeIncorporacao: dados.dataDeIncorporacao,
  cargo: dados.cargo,
};
```

Ou melhor, valide explicitamente que o `id` não está presente no corpo e retorne erro 400 caso esteja.

---

### 2. O mesmo vale para os casos no método PUT

No `putCaso` do controller, observe que você também não protege o campo `id` contra alteração:

```js
const { titulo, descricao, status, agente_id } = req.body;
// Não há verificação para o campo id
const newCaso = {
  titulo,
  descricao,
  status,
  agente_id,
};

const casoAtt = await casosRepository.attCaso(id, newCaso);
```

É importante aplicar a mesma lógica para impedir alteração do `id` do caso.

---

### 3. Sobre o erro 404 ao buscar um caso por ID inválido

Você implementou o endpoint `GET /casos/:id` no controller corretamente, verificando se o caso existe e retornando 404 se não existir:

```js
async function getCasoId(req, res) {
  try {
    const id = req.params.id;
    const caso = await casosRepository.findById(id);
    if (!caso) {
      return res.status(404).json({
        status: 404,
        message: "Caso não encontrado",
      });
    }
    res.status(200).json(caso);
  } catch (error) {
    // ...
  }
}
```

Porém, se o erro 404 não foi retornado corretamente durante os testes, pode ser que o problema esteja no repository ou no banco de dados.

**Verifique se o método `findById` no `casosRepository` está funcionando corretamente:**

```js
async function findById(id) {
  return await knex("casos").where({ id }).first();
}
```

Se a tabela `casos` não existir ou não estiver populada, essa consulta pode falhar silenciosamente.

**Sugestão:** Confira se as migrations foram executadas e as seeds populadas corretamente.

---

### 4. A estrutura dos seus arquivos está quase correta, mas há pequenos detalhes importantes

Ao comparar sua estrutura com a esperada, percebi que você tem a pasta `utils/errorHandler.js`, mas não está usando esse arquivo no seu código. Além disso, o arquivo `INSTRUCTIONS.md` está vazio, e o `.gitignore` não está ignorando a pasta `node_modules`.

Essas pequenas coisas impactam a organização e a manutenção do projeto.

**Por que isso importa?**  
- O `.gitignore` evita que arquivos pesados ou desnecessários, como `node_modules`, sejam enviados para o repositório.  
- Ter um `errorHandler.js` ajuda a centralizar o tratamento de erros, tornando o código mais limpo e fácil de manter.

---

### 5. Sobre a filtragem por data de incorporação e ordenação em agentes

Você implementou um filtro por cargo e ordenação por `dataDeIncorporacao` no controller de agentes:

```js
if (sort === "dataDeIncorporacao") {
  agentes = agentes.sort(
    (a, b) =>
      new Date(a.dataDeIncorporacao) - new Date(b.dataDeIncorporacao)
  );
} else if (sort === "-dataDeIncorporacao") {
  agentes = agentes.sort(
    (a, b) =>
      new Date(b.dataDeIncorporacao) - new Date(a.dataDeIncorporacao)
  );
}
```

Porém, esse filtro está sendo aplicado **em memória**, ou seja, depois de buscar todos os agentes do banco com `findAll()`. Isso pode ser um problema de performance e não é a melhor prática.

**Melhor abordagem:** Fazer a ordenação diretamente na consulta SQL via Knex, assim:

```js
async function findAll({ cargo, sort }) {
  let query = knex("agentes");
  if (cargo) {
    query = query.where("cargo", cargo);
  }
  if (sort === "dataDeIncorporacao") {
    query = query.orderBy("dataDeIncorporacao", "asc");
  } else if (sort === "-dataDeIncorporacao") {
    query = query.orderBy("dataDeIncorporacao", "desc");
  }
  return await query.select("*");
}
```

Assim, você delega o trabalho pesado para o banco e melhora a eficiência.

---

### 6. Sobre a filtragem de casos por keywords (busca por `q`)

No seu controller de casos, você implementou a busca por termos no título e descrição, mas também filtrando em memória após buscar todos os casos:

```js
if (q) {
  const termo = q.trim().toLowerCase();

  if (termo.length < 2) {
    return res.status(400).json({
      status: 400,
      message: "Parâmetros inválidos",
      errors: {
        q: "O termo de busca deve ter pelo menos 2 caracteres!"
      },
    });
  }

  casos = casos.filter(
    (caso) =>
      caso.titulo.toLowerCase().includes(termo) ||
      caso.descricao.toLowerCase().includes(termo)
  );
}
```

Novamente, essa busca em memória pode ser custosa e não escala bem.

**Melhor prática:** Implementar essa busca diretamente na query SQL com Knex, usando `where` com `ilike` (case-insensitive) para PostgreSQL:

```js
async function findAll({ agente_id, status, q }) {
  let query = knex("casos");

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
  return await query.select("*");
}
```

Assim, a filtragem é feita no banco, que é otimizado para isso.

---

### 7. Sobre as mensagens de erro customizadas para argumentos inválidos

Você implementou mensagens personalizadas para erros de validação, o que é ótimo! Porém, algumas mensagens ainda estão genéricas ou inconsistentes, por exemplo:

```js
return res.status(404).json({
  status: 404,
  message: "Parametros inválidos",
  errors: {
    agente_id: "O agente não existe!",
  },
});
```

O correto seria usar `400 Bad Request` para parâmetros inválidos e `404 Not Found` para recursos inexistentes.

Além disso, padronize as mensagens para que o cliente entenda claramente o que aconteceu.

---

### 8. Sobre o uso do `.gitignore`

Você cometeu um deslize comum: o `.gitignore` não está ignorando a pasta `node_modules`, o que pode deixar seu repositório pesado e desorganizado.

**Corrija adicionando no seu `.gitignore`:**

```
node_modules/
```

---

## Recursos para você mergulhar e aprimorar ainda mais seu código

- Para melhorar a configuração do banco, migrations e seeds:  
  https://knexjs.org/guide/migrations.html  
  https://knexjs.org/guide/query-builder.html  
  http://googleusercontent.com/youtube.com/docker-postgresql-node

- Para refatorar e organizar seu código em MVC:  
  https://youtu.be/bGN_xNc4A1k?si=Nj38J_8RpgsdQ-QH

- Para manipulação correta de requisições e status HTTP:  
  https://youtu.be/RSZHvQomeKE

- Para validação de dados e tratamento de erros:  
  https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/400  
  https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/404  
  https://youtu.be/yNDCRAz7CM8?si=Lh5u3j27j_a4w3A_

---

## Resumo dos principais pontos para focar agora 🔍

- 🚫 **Não permita alteração do campo `id` nos métodos PUT de agentes e casos.** Valide e bloqueie essa alteração para manter a integridade do banco.  
- ⚙️ **Execute corretamente as migrations e seeds para garantir que as tabelas estejam criadas e populadas.** Isso evita erros ao buscar dados inexistentes.  
- 🔍 **Implemente filtros e ordenações diretamente nas queries SQL via Knex, em vez de fazer em memória.** Isso melhora performance e segue boas práticas.  
- 💬 **Padronize as mensagens de erro e os status HTTP, usando 400 para dados inválidos e 404 para recursos não encontrados.**  
- 📂 **Ajuste seu `.gitignore` para ignorar `node_modules/`.**  
- 🧹 **Considere usar seu arquivo `errorHandler.js` para centralizar tratamento de erros e deixar controllers mais limpos.**

---

gnvr29, você está no caminho certo e já entregou uma base muito boa! Com esses ajustes, sua API vai ficar mais robusta, eficiente e profissional. Continue firme e conte comigo para o que precisar! 🚀💙

Abraços do seu Code Buddy! 👊😊

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>