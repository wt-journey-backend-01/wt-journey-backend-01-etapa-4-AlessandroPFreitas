<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 8 créditos restantes para usar o sistema de feedback AI.

# Feedback para AlessandroPFreitas:

Nota final: **55.5/100**

# Feedback para AlessandroPFreitas 🚓👮‍♂️

Olá Alessandro! Que jornada incrível você está trilhando para construir uma API segura e profissional para o Departamento de Polícia! 🚀 Quero começar parabenizando você pelos pontos fortes do seu projeto e também ajudar a destravar os desafios que ainda ficaram pendentes. Vamos juntos? 💪

---

## 🎉 O que você mandou muito bem!

- Sua estrutura de pastas está **muito próxima** do esperado, o que é fundamental para manter o projeto organizado e escalável.
- Os endpoints básicos de agentes e casos estão funcionando corretamente, com tratamento adequado de erros e validações — isso é ótimo!
- Você implementou o cadastro, login, logout e exclusão de usuários, e os testes básicos dessas funcionalidades passaram, incluindo a geração correta do JWT e a validação de expiração do token.
- Os testes bônus sobre filtragem simples de casos e agentes passaram, o que mostra que você conseguiu implementar filtros importantes.
- O uso do Knex para manipulação do banco de dados está bem consistente e você utilizou migrations e seeds corretamente para agentes e casos.
- A validação da senha no `authController.js` está presente e com uma regex bem robusta, garantindo requisitos de segurança.

---

## ⚠️ Pontos de atenção para avançar 🚦

### 1. **Rotas de autenticação incompletas e middleware de proteção ausente**

- Você criou o arquivo `routes/authRoutes.js` com a rota para registro (`POST /auth/register`), mas não há rotas para login (`POST /auth/login`), logout ou exclusão de usuário (`DELETE /users/:id`), que são obrigatórias no desafio.
- O `authController.js` não exporta nenhuma função (o `module.exports = {}` está vazio), e a função `register` está declarada, mas não exportada nem usada.
- Além disso, **não há middleware de autenticação implementado** (`middlewares/authMiddleware.js` está vazio). Isso explica porque os testes que exigem proteção de rotas com JWT falharam, como:
  - `AGENTS: Recebe status code 401 ao tentar criar agente sem token JWT`
  - `CASES: Recebe status code 401 ao tentar criar caso sem token JWT`
- Sem esse middleware, suas rotas `/agentes` e `/casos` não estão protegidas, o que é um requisito crítico.

**Como resolver:**

- Implemente o middleware `authMiddleware.js` que:
  - Leia o token JWT do header `Authorization: Bearer <token>`.
  - Valide o token usando `jsonwebtoken` e o segredo da variável de ambiente `JWT_SECRET`.
  - Caso válido, anexe os dados do usuário autenticado em `req.user`.
  - Caso inválido ou ausente, retorne `401 Unauthorized`.
- Aplique esse middleware nas rotas de agentes e casos.
- Exporte as funções do `authController.js` e crie as rotas faltantes (`/auth/login`, `/auth/logout`, `/users/:id`).
- Use `bcrypt` para hashear senhas no registro e para comparar a senha no login.
- Gere o JWT no login com tempo de expiração.

Exemplo básico do middleware:

```js
// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // pode conter id, email, etc
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

module.exports = authMiddleware;
```

---

### 2. **Validação e tratamento incompletos no registro de usuários**

- No seu `authController.js`, a função `register` está definida, mas não exportada nem usada nas rotas.
- Você chama `usuariosRepository.buscarPorEmail(email)` mas não aguarda o resultado com `await`, o que faz o código não funcionar corretamente.
- Ao verificar se o email já existe, você não aguarda a Promise, então a verificação sempre será verdadeira (pois uma Promise é truthy), e o teste de "email já em uso" pode falhar.
- Você não está validando se o campo `senha` está vazio ou nulo antes de aplicar a regex, o que pode causar erros.
- Também não faz validação se há campos extras no corpo da requisição, nem se todos os campos obrigatórios estão presentes (nome, email, senha).
- O status code para criação de usuário deve ser **201 Created**, mas você está retornando 200.

**Como melhorar:**

- Use `await` para chamadas assíncronas, como a busca por email.
- Valide todos os campos obrigatórios, retornando erro 400 com mensagens claras.
- Valide se há campos extras não permitidos.
- Hasheie a senha com `bcrypt` antes de salvar.
- Retorne status 201 e o objeto do usuário criado (sem a senha).
- Exporte a função `register` e use-a na rota `POST /auth/register`.
- Implemente também as funções `login`, `logout` e `deleteUser`.

Exemplo corrigido do trecho de verificação de email:

```js
const emailExistente = await usuariosRepository.buscarPorEmail(email);
if (emailExistente) {
  return res.status(400).json({
    status: 400,
    message: "O email está em uso!",
  });
}
```

---

### 3. **Repositório de usuários incompleto**

- No `usuariosRepository.js`, você exporta apenas `buscarPorEmail`, mas não exporta a função `newUsuario`, que você usa no controller.
- Além disso, `newUsuario` não está usando `await` no insert, o que pode gerar problemas.
- Isso pode causar erros silenciosos e falhas nos testes que criam usuários.

**Como ajustar:**

- Exporte todas as funções que você criou:

```js
async function buscarPorEmail(email) {
  return await knex('usuarios').where({email}).first();
}

async function newUsuario(usuario) {
  const [insert] = await knex('usuarios').insert(usuario).returning("*");
  return insert;
}

module.exports = {
  buscarPorEmail,
  newUsuario,
};
```

---

### 4. **Falta de documentação no arquivo INSTRUCTIONS.md**

- O arquivo `INSTRUCTIONS.md` está vazio.
- O desafio exige que você documente como registrar, logar, enviar o token JWT no header e explique o fluxo de autenticação.
- Isso é importante para o uso correto da API e para o entendimento dos avaliadores.

**Sugestão:**

- Documente pelo menos:
  - Como fazer `POST /auth/register` (exemplo de payload).
  - Como fazer `POST /auth/login` e receber o token.
  - Como enviar o token no header `Authorization: Bearer <token>`.
  - Quais rotas estão protegidas.
  - Como fazer logout e exclusão de usuário.

---

### 5. **Estrutura e organização**

- Você está quase lá com a estrutura, mas:
  - O arquivo `authController.js` não exporta nada.
  - O arquivo `authRoutes.js` tem apenas a rota de registro, faltando as demais.
  - O middleware de autenticação está vazio.
- Essas ausências impactam diretamente a segurança e o funcionamento esperado.

---

## 📋 Análise detalhada dos testes que falharam e suas causas

| Teste que Falhou | Possível causa no código |
|-|-|
| USERS: Recebe erro 400 ao tentar criar um usuário com nome vazio/nulo, email vazio/nulo, senha inválida, etc | Validações incompletas no `authController.js` e falta de await no `buscarPorEmail`. Falta de checagem de campos extras e campo faltantes. |
| USERS: Recebe erro 400 ao tentar criar um usuário com e-mail já em uso | Falta de `await` ao buscar email existente, fazendo a checagem falhar. |
| USERS: Recebe erro 400 ao tentar criar usuário com campo extra/faltante | Falta de validação rigorosa dos campos recebidos no corpo da requisição. |
| AGENTS: Recebe status code 401 ao tentar criar/consultar/atualizar/deletar agente sem token JWT | Middleware de autenticação não implementado/aplicado. |
| CASES: Recebe status code 401 ao tentar criar/listar/atualizar/deletar caso sem token JWT | Middleware de autenticação não implementado/aplicado. |
| USERS: Logout e exclusão de usuário não testados porque rotas não implementadas | Rotas `/auth/logout` e `/users/:id` inexistentes. |
| Bonus: `/usuarios/me` não implementado | Endpoint não criado. |
| Bonus: Falta de mensagens de erro customizadas para argumentos inválidos | Pode ser aprimorado com mensagens mais específicas. |

---

## 💡 Recomendações de aprendizado para você

- Para entender melhor **autenticação JWT e uso do bcrypt**, recomendo fortemente este vídeo, feito pelos meus criadores, que explica os conceitos básicos e a implementação prática:  
  🔗 https://www.youtube.com/watch?v=L04Ln97AwoY
- Para aprofundar o uso do **JWT especificamente**, este vídeo é excelente:  
  🔗 https://www.youtube.com/watch?v=keS0JWOypIU
- Para aprimorar a estrutura do seu projeto e seguir boas práticas MVC, veja este conteúdo:  
  🔗 https://www.youtube.com/watch?v=bGN_xNc4A1k&t=3s
- Se você quiser revisar a configuração do banco e Knex, aqui está um guia muito bom:  
  🔗 https://www.youtube.com/watch?v=dXWy_aGCW1E

---

## 🎯 Resumo dos principais pontos para focar e melhorar

- [ ] **Implementar e exportar todas as funções do `authController.js`**: registro, login, logout, exclusão.
- [ ] **Corrigir o uso do `await` em chamadas assíncronas**, especialmente para verificar email existente.
- [ ] **Implementar middleware de autenticação JWT (`authMiddleware.js`)** e aplicá-lo nas rotas protegidas `/agentes` e `/casos`.
- [ ] **Criar as rotas faltantes de autenticação** (`/auth/login`, `/auth/logout`, `/users/:id`).
- [ ] **Hashear senhas com bcrypt no registro e comparar no login**.
- [ ] **Retornar status HTTP corretos** (ex: 201 para criação, 400 para erros de validação, 401 para não autorizado).
- [ ] **Documentar no `INSTRUCTIONS.md` o fluxo de autenticação e uso do token JWT**.
- [ ] **Exportar todas as funções do `usuariosRepository.js`** e garantir uso correto.
- [ ] **Validar campos extras e ausentes no corpo das requisições para usuários**.
- [ ] **Implementar o endpoint `/usuarios/me` para retornar dados do usuário autenticado (bônus)**.

---

## 🚀 Finalizando

Alessandro, você está no caminho certo! A base do seu projeto está muito boa, e com os ajustes que discutimos você vai conseguir entregar uma API segura, profissional e completa. Segurança e autenticação são temas desafiadores, mas com calma e prática você dominará rapidinho!  

Continue focado, revisando os pontos que destaquei, e não hesite em buscar os vídeos que recomendei para consolidar seu aprendizado. Estou torcendo muito pelo seu sucesso e aqui para o que precisar! 💙

Um grande abraço e até a próxima revisão! 👊✨

---

Se quiser, posso te ajudar a começar a implementar o middleware de autenticação ou as rotas de login/logout. Quer?

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>