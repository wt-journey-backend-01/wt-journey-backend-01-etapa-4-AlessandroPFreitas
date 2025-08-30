## Documentação de Endpoints e Segurança

### 1. Como registrar e logar usuários

- **Registro:**
	- Endpoint: `POST /auth/register`
	- Body (JSON):
		```json
		{
			"nome": "Nome do Usuário",
			"email": "usuario@email.com",
			"senha": "senhaSegura"
		}
		```
	- Resposta: Confirmação de registro ou mensagem de erro.

- **Login:**
	- Endpoint: `POST /auth/login`
	- Body (JSON):
		```json
		{
			"email": "usuario@email.com",
			"senha": "senhaSegura"
		}
		```
	- Resposta: Retorna um token JWT em caso de sucesso.

### 2. Exemplo de envio de token JWT no header Authorization

Para acessar endpoints protegidos, envie o token JWT no header `Authorization`:

```
Authorization: Bearer SEU_TOKEN_JWT_AQUI
```

Exemplo usando curl:

```
curl -H "Authorization: Bearer SEU_TOKEN_JWT_AQUI" http://localhost:3000/rota-protegida
```

### 3. Fluxo de autenticação esperado

1. O usuário se registra usando o endpoint `/auth/register`.
2. O usuário faz login usando `/auth/login` e recebe um token JWT.
3. Para acessar rotas protegidas, o usuário deve enviar o token JWT no header `Authorization`.
4. O backend valida o token em cada requisição protegida. Se o token for válido, o acesso é permitido; caso contrário, retorna erro de autenticação.
