<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 7 créditos restantes para usar o sistema de feedback AI.

# Feedback para AlessandroPFreitas:

Nota final: **50.3/100**

Olá AlessandroPFreitas! 🚀

Primeiramente, parabéns pelo esforço e dedicação em construir essa API REST robusta com Node.js, Express e PostgreSQL! 🎉 Você implementou a base de autenticação com JWT, hashing de senhas com bcrypt, e a proteção das rotas, o que já é um grande avanço para uma aplicação segura. Além disso, você acertou vários testes importantes, inclusive do fluxo de usuários, logout, e proteção de rotas com token JWT — isso mostra que seu entendimento dos conceitos fundamentais está bem sólido.

---

## 🎯 Conquistas Bônus que você alcançou

- Implementou corretamente a validação de senha com requisitos de segurança.
- Fez o hash da senha usando bcrypt corretamente.
- Criou o middleware de autenticação JWT e aplicou nas rotas sensíveis.
- Estruturou controllers, repositórios e rotas seguindo o padrão MVC.
- Implementou exclusão e logout de usuários.
- Passou os testes básicos de autenticação e proteção de rotas.
  
Parabéns por esses avanços! Isso mostra que você já domina uma boa parte do desafio.

---

## 🚨 Análise dos Testes que Falharam e Possíveis Causas Raiz

Agora vamos analisar juntos os testes que não passaram para destravar sua nota e garantir que sua API fique ainda mais profissional.

### 1. `'USERS: Recebe erro 400 ao tentar criar um usuário com e-mail já em uso'`

**Análise:**  
No seu `authController.js`, você faz a verificação do email existente usando:

```js
const emailExistente = await usuariosRepository.buscarPorEmail(email);
if (emailExistente) {
  return res.status(400).json({
    status: 400,
    message: "O email está em uso!",
  });
}
```

Isso está correto. Porém, o teste está falhando, o que indica que provavelmente:

- A tabela `usuarios` não está criada corretamente no banco ou a migration não foi executada, então o email nunca é encontrado.
- Ou o método `buscarPorEmail` do `usuariosRepository` não está funcionando como esperado.
- Ou o teste está enviando o email em um formato diferente (ex: com espaços) e a busca não está normalizada.

**Verificações recomendadas:**

- Confirme se a migration `usuarios.js` foi executada e a tabela `usuarios` existe no banco.
- No método `buscarPorEmail` do `usuariosRepository.js`, você tem:

```js
async function buscarPorEmail(email) {
  return await knex("usuarios").where({ email }).first();
}
```

Isso está correto, mas para garantir que espaços ou diferenças de case não prejudiquem, você pode normalizar o email ao buscar, por exemplo:

```js
async function buscarPorEmail(email) {
  return await knex("usuarios")
    .whereRaw("LOWER(email) = ?", email.toLowerCase())
    .first();
}
```

- Além disso, no `register`, você já está fazendo `email.trim()` antes de salvar, então na busca também precisa garantir essa normalização.

---

### 2. Falhas em testes relacionados a agentes e casos (ex: criação, listagem, busca por ID, atualização, deleção, erros 400 e 404)

**Análise:**

Você passou vários testes básicos de agentes e casos, mas falhou em alguns que envolvem:

- Validação de parâmetros incorretos (ex: buscar agente ou caso com ID inválido).
- Respostas com status code corretos para erros (400 e 404).
- Filtragem e busca avançada nos endpoints (testes bônus que falharam).
  
No seu código dos controllers de agentes e casos, a validação está presente, mas parece que:

- Você não está validando se o ID passado na URL é um número válido antes de tentar buscar no banco. Por exemplo, se alguém passar `/agentes/abc`, sua função tenta buscar direto e pode retornar erro interno ou comportamento inesperado.

- Para resolver isso, você pode adicionar validação simples no início dos métodos que recebem `req.params.id`:

```js
const id = Number(req.params.id);
if (isNaN(id) || id <= 0) {
  return res.status(400).json({
    status: 400,
    message: "ID inválido",
  });
}
```

- Isso evita erros e garante que o status 400 seja retornado quando o formato do ID está errado.

- Além disso, para os filtros avançados (ex: por status, agente_id, keywords), você está fazendo filtragem em memória depois de buscar todos os registros com `findAll()`. Isso funciona para poucos dados, mas não é ideal e pode causar problemas de performance e inconsistência.

- O teste bônus falhou justamente porque espera que você implemente filtros diretamente na consulta ao banco, usando o Knex para aplicar condições SQL, por exemplo:

```js
async function findAll(filters = {}) {
  const query = knex("casos");

  if (filters.agente_id) {
    query.where("agente_id", filters.agente_id);
  }
  if (filters.status) {
    query.where("status", filters.status);
  }
  if (filters.q) {
    query.where(function () {
      this.where("titulo", "ilike", `%${filters.q}%`).orWhere("descricao", "ilike", `%${filters.q}%`);
    });
  }

  return await query.select("*");
}
```

- Essa abordagem traz dados filtrados direto do banco, melhora performance e atende aos testes de filtragem.

---

### 3. Middleware de autenticação retornando 400 para token inválido, mas teste espera 401

No seu `authMiddleware.js`, você tem:

```js
jwt.verify(token, process.env.JWT_SECRET, (err) => {
  if(err){
     return res.status(400).json({message: "Token Inválido"})
  }
  next()
})
```

O código está retornando status 400 para token inválido, mas o padrão esperado para token inválido é **401 Unauthorized**.

**Como corrigir:**

Altere o status para 401:

```js
jwt.verify(token, process.env.JWT_SECRET, (err) => {
  if (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
  next();
});
```

---

### 4. Falta implementação do endpoint `/usuarios/me` para retornar dados do usuário autenticado

Esse é um requisito bônus que você não implementou ainda. O teste bônus falhou por isso.

Para implementar, crie uma rota e controller que:

- Use o middleware de autenticação para extrair o usuário do token.
- Retorne os dados do usuário autenticado.

No `authMiddleware.js`, você pode modificar para adicionar o payload do token ao `req.user`:

```js
jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  if (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
  req.user = user; // adiciona dados do usuário autenticado
  next();
});
```

No `authRoutes.js`:

```js
router.get('/usuarios/me', authMiddleware, authController.me);
```

No `authController.js`:

```js
async function me(req, res) {
  try {
    const user = req.user;
    // Opcionalmente, buscar dados atualizados no banco
    const usuario = await usuariosRepository.buscarPorEmail(user.email);
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    return res.status(200).json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    });
  } catch (error) {
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}
```

---

### 5. Falta de documentação no arquivo `INSTRUCTIONS.md`

O arquivo está vazio, mas o desafio pede que você documente:

- Como registrar e logar usuários.
- Exemplo de envio do token JWT no header Authorization.
- Fluxo de autenticação esperado.

Esse é um ponto importante para a entrega final e para uso em produção. Recomendo que você escreva um passo a passo simples e claro, para facilitar o uso da API.

---

## 🗂️ Sobre a Estrutura de Diretórios

Sua estrutura está muito próxima do esperado, parabéns! Você criou as pastas e arquivos novos pedidos, como:

- `routes/authRoutes.js`
- `controllers/authController.js`
- `repositories/usuariosRepository.js`
- `middlewares/authMiddleware.js`

O único ponto a observar é que o arquivo `INSTRUCTIONS.md` está vazio, e ele é obrigatório para documentação.

---

## 📚 Recomendações de Aprendizado para Você

- Para aprimorar a filtragem no banco usando Knex e evitar filtros em memória, veja este guia detalhado do Knex Query Builder: https://www.youtube.com/watch?v=GLwHSs7t3Ns&t=4s  
- Para entender melhor o uso correto do JWT e status HTTP na autenticação, recomendo fortemente este vídeo feito pelos meus criadores, que explica os conceitos básicos e a prática com JWT: https://www.youtube.com/watch?v=keS0JWOypIU  
- Para organizar seu projeto com MVC e garantir uma arquitetura escalável, veja este vídeo de boas práticas: https://www.youtube.com/watch?v=bGN_xNc4A1k&t=3s  
- Para garantir que seu banco de dados está configurado corretamente com Docker e Knex migrations, confira este tutorial: https://www.youtube.com/watch?v=uEABDBQV-Ek&t=1s  

---

## 📝 Resumo dos Pontos para Melhorar

- [ ] **Corrigir a verificação de email duplicado** no registro, garantindo que busca seja case insensitive e que a tabela `usuarios` esteja criada e populada corretamente.  
- [ ] **Validar IDs dos recursos (agentes, casos, usuários) para garantir que são números válidos**, retornando 400 para IDs inválidos.  
- [ ] **Modificar o middleware de autenticação para retornar status 401 em caso de token inválido**, não 400.  
- [ ] **Implementar filtros diretamente nas consultas ao banco usando Knex**, ao invés de filtrar arrays em memória.  
- [ ] **Implementar o endpoint `/usuarios/me` para retornar dados do usuário autenticado.**  
- [ ] **Preencher o arquivo `INSTRUCTIONS.md` com a documentação dos endpoints e fluxo de autenticação.**  

---

Alessandro, você está no caminho certo e com uma base muito boa! Corrigindo esses pontos, sua API vai ficar muito mais profissional, segura e alinhada com o que o mercado espera. Continue assim, aprendendo e aprimorando! Você tem tudo para alcançar uma nota excelente na próxima entrega. 🚀💪

Se precisar, volte a estudar os vídeos que indiquei, eles vão te ajudar a entender melhor cada conceito.

Boa sorte e conte comigo para o que precisar! 😊👊

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>