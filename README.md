# Etapa 4: Segurança, Autenticação e Aplicação Completa em Node.js

## 🧩 Contexto
O Departamento de Polícia agora precisa garantir que apenas pessoas autorizadas tenham acesso ao sistema. Após a persistência dos dados com PostgreSQL (Etapa 3), chegou a hora de implementar **segurança, autenticação e autorização** para proteger os registros de agentes e casos.  
Sua missão será evoluir a API para um nível profissional, adicionando **hashing de senhas**, **geração de tokens JWT** e **proteção de rotas**, além de **documentar todo o processo** para que a aplicação esteja pronta para uso real em produção.

## 🎯 Objetivo
Transformar a API em uma aplicação completa e segura, com autenticação via **JWT** e rotas protegidas, permitindo **cadastro, login e acesso controlado** aos recursos do sistema.

⸻

## O que deve ser feito

### 📁 Estrutura dos Diretórios (pastas)
```
📦 SEU-REPOSITÓRIO
│
├── package.json
├── server.js
├── .env
├── knexfile.js
├── INSTRUCTIONS.md
│
├── db/
│ ├── migrations/
│ ├── seeds/
│ └── db.js
│
├── routes/
│ ├── agentesRoutes.js
│ ├── casosRoutes.js
│ └── authRoutes.js (novo)
│
├── controllers/
│ ├── agentesController.js
│ ├── casosController.js
│ └── authController.js (novo)
│
├── repositories/
│ ├── agentesRepository.js
│ ├── casosRepository.js
│ └── usuariosRepository.js (novo)
│
├── middlewares/
│ └── authMiddleware.js (novo)
│
├── utils/
│ └── errorHandler.js
```
⸻

### 1. Criar a tabela de usuários no banco
- Adicione uma migration para criar a tabela **usuarios** com os campos:
  - **id** (auto increment, chave primária)
  - **nome** (string, obrigatório)
  - **email** (string único, obrigatório)
  - **senha** (string, obrigatória — será armazenada de forma **hasheada**. A senha deve ter no mínimo 8 caracteres, sendo pelo menos uma letra minúscula, uma letra maiúscula, um número e um caractere especial)

⸻

### 2. Implementar autenticação
- Criar **registro de usuários** (`POST /auth/register`)
  - Receber **nome**, **email** e **senha**.
  - Validar se o **email** já está em uso.
  - Armazenar a **senha** com hash usando **bcrypt**.
- Criar **login de usuários** (`POST /auth/login`)
  - Receber **email** e **senha**.
  - Validar credenciais.
  - Gerar e retornar um **token JWT** com tempo de expiração.
- Criar **exclusão de usuários** (`DELETE /users/:id`).
- Criar **logout** (`POST /auth/logout`).

⸻

### 3. Proteger rotas sensíveis
- Criar um **middleware de autenticação** que:
  - Verifique o header `Authorization: Bearer <token>`.
  - Valide o **JWT**.
  - Adicione os dados do usuário autenticado ao `req.user`.
- Aplicar esse middleware em rotas de **/agentes** e **/casos**.

⸻

### 4. Documentar endpoints e segurança
No arquivo **INSTRUCTIONS.md**, incluir:
- Como **registrar** e **logar** usuários.
- **Exemplo** de envio de token JWT no header `Authorization`.
- **Fluxo de autenticação** esperado.

⸻
## Status Codes e Orientações
### Endpoints de login
- O endpoint de login deve retornar um objeto com o acess token e **status code 200 OK** da seguinte maneira:
  ```
    {

        acess_token: "token aqui"

    }
  ```
- Caso o email do login já esteja em uso, **status code 400 BAD REQUEST**
- Caso o acess token seja inválido, **status code 401 Unauthorized**

### Importante
- Para gerenciar o segredo do seu JWT, utilize a seguinte variável de ambiente:

```.env
...
JWT_SECRET="segredo aqui"
```

- NUNCA insira seus segredos diretamente no código, pois essa é uma brecha crítica de segurança, além de interferir com o funcionamento dos testes.

## 💡 Bônus 🌟
- Implementar **refresh tokens** para prolongar sessões de forma segura.
- Criar endpoint **`/usuarios/me`** para retornar informações do usuário autenticado.



# wt-journey-backend-01-etapa-1-template
