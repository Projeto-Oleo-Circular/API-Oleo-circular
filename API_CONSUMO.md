# API Oleo Circular - Guia de consumo

Este documento reúne os principais endpoints da API, exemplos de requisições e os cenários de sucesso e falha esperados.

## Exemplos completos de POST (curl, headers e body)

Abaixo estão exemplos práticos para executar as principais requisições `POST`. Incluem o comando `curl`, cabeçalhos obrigatórios e um body JSON pronto para teste.

- Registrar parceiro — `POST /parceiros/register`

curl:
```bash
curl -X POST "http://localhost:3000/parceiros/register" \
  -H "Content-Type: application/json" \
  -d '{
    "razaoSocial": "Cooperativa Exemplo",
    "email": "parceiro@exemplo.com",
    "senha": "SenhaForte123",
    "documento": "12345678000190",
    "tipoParceiro": "INSTITUCIONAL",
    "categoria": 3
  }'
```

Resposta esperada (201 Created): objeto do parceiro criado (ex.: id, nome, email).

- Login de parceiro — `POST /parceiros/login`

curl:
```bash
curl -X POST "http://localhost:3000/parceiros/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parceiro@exemplo.com",
    "senha": "SenhaForte123"
  }'
```

Resposta esperada (200 OK): contém `token` JWT e dados do usuário.

- Criar ponto de coleta — `POST /pontos-coleta`

Observação: o campo `categoria` aceita número (ex.: `3`) ou texto (ex.: `"Escola / Universidade"`). Internamente o sistema normaliza o valor.

curl (com autorização):
```bash
curl -X POST "http://localhost:3000/pontos-coleta" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "nomePontoColeta": "Ponto Central",
    "cep": "01000-000",
    "logradouro": "Rua Teste",
    "numero": "200",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "capacidadeBombona": 200,
    "categoria": "Escola / Universidade"
  }'
```

Resposta esperada (201 Created): objeto do ponto com `categoria` (label) e `categoriaNumero`.

- Criar solicitação de coleta — `POST /solicitacoes-coleta`

curl (com autorização do parceiro):
```bash
curl -X POST "http://localhost:3000/solicitacoes-coleta" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "pontoColetaId": 11,
    "volumeInformado": 50,
    "descricao": "Solicitação para coleta parcial"
  }'
```

Resposta esperada (201 Created): objeto da solicitação com `id`, `status` inicial (`AGUARDANDO`) e `criadoEm`.

- Login admin — `POST /admin/login`

curl:
```bash
curl -X POST "http://localhost:3000/admin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@oleo.com",
    "senha": "SenhaAdmin123"
  }'
```

Resposta esperada (200 OK): token JWT para chamadas de admin.

---

Se quiser, posso também:
- Gerar exemplos em formato Postman/Insomnia (coleção importável), ou
- Incluir payloads alternativos (ex.: criar parceiro com `categoria` textual e numérica) para testar casos extremos.

## Base URL

- Desenvolvimento local: http://localhost:3000
- Se estiver usando Docker, confirme a porta exposta no arquivo docker-compose.yml

## Autenticação

Alguns endpoints exigem token JWT em `Authorization: Bearer <token>`.

### Como obter o token

1. Faça login como parceiro ou admin.
2. Copie o token retornado na resposta.
3. Envie o token em todas as requisições autenticadas.

Exemplo:

```bash
curl -X GET http://localhost:3000/parceiros/me \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 1. Parceiros

### POST /parceiros/register
Cria um novo parceiro.

Exemplo:

```bash
curl -X POST http://localhost:3000/parceiros/register \
  -H "Content-Type: application/json" \
  -d '{
    "tipoPessoa": "JURIDICA",
    "tipoParceiro": "INSTITUCIONAL",
    "razaoSocial": "Cooperativa Exemplo",
    "email": "parceiro@exemplo.com",
    "senha": "123456",
    "documento": "12345678000190",
    "cep": "01000-000",
    "logradouro": "Rua Teste",
    "numero": "100",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP"
  }'
```

Resultado esperado em caso de sucesso:
- `201 Created`
- Retorno com dados do parceiro criado

Falhas comuns:
- `400 Bad Request`: dados inválidos, e-mail ou documento duplicado

### POST /parceiros/login
Realiza login do parceiro.

Exemplo:

```bash
curl -X POST http://localhost:3000/parceiros/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parceiro@exemplo.com",
    "senha": "123456"
  }'
```

Resultado esperado:
- `200 OK`
- Retorno com token e dados do parceiro

Falhas comuns:
- `401 Unauthorized`: credenciais inválidas
- `429 Too Many Requests`: muitas tentativas de login

### GET /parceiros/me
Retorna os dados do parceiro autenticado.

Exemplo:

```bash
curl -X GET http://localhost:3000/parceiros/me \
  -H "Authorization: Bearer SEU_TOKEN"
```

Resultado esperado:
- `200 OK`
- JSON com dados do parceiro logado

Falhas comuns:
- `401 Unauthorized`: token ausente ou inválido

### PUT /parceiros/logout
Realiza logout do parceiro.

Exemplo:

```bash
curl -X PUT http://localhost:3000/parceiros/logout \
  -H "Authorization: Bearer SEU_TOKEN"
```

Resultado esperado:
- `200 OK`
- Mensagem informando para descartar o token no cliente

### GET /parceiros/buscar-cep/:cep
Busca endereço a partir do CEP.

Exemplo:

```bash
curl -X GET http://localhost:3000/parceiros/buscar-cep/01000-000
```

Resultado esperado:
- `200 OK`
- JSON com endereço, bairro, cidade, estado e complemento

Falhas comuns:
- `400 Bad Request`: CEP inválido
- `404 Not Found`: CEP não encontrado
- `500 Internal Server Error`: erro externo na consulta

### GET /parceiros/verificar-disponibilidade
Verifica se um e-mail ou documento já está em uso.

Exemplo:

```bash
curl -X GET "http://localhost:3000/parceiros/verificar-disponibilidade?email=parceiro@exemplo.com"
```

Resultado esperado:
- `200 OK`
- Status de disponibilidade

Falhas comuns:
- `400 Bad Request`: parâmetros inválidos ou ausentes

---

## 2. Parceiros Indicadores

### GET /parceiros-indicadores
Lista parceiros indicadores ativos.

Exemplo:

```bash
curl -X GET http://localhost:3000/parceiros-indicadores
```

Resultado esperado:
- `200 OK`
- Lista de indicadores ativos

Falhas comuns:
- `500 Internal Server Error`: erro inesperado no repositório

---

## 3. Pontos de Coleta

### GET /pontos-coleta/meus
Lista os pontos de coleta do parceiro autenticado.

Exemplo:

```bash
curl -X GET http://localhost:3000/pontos-coleta/meus \
  -H "Authorization: Bearer SEU_TOKEN"
```

Resultado esperado:
- `200 OK`
- Lista de pontos cadastrados pelo parceiro

Falhas comuns:
- `401 Unauthorized`: token ausente ou inválido
- `400 Bad Request`: erro ao recuperar os pontos

### POST /pontos-coleta
Cria um ponto de coleta.

Exemplo:

```bash
curl -X POST http://localhost:3000/pontos-coleta \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nomePontoColeta": "Ponto Central",
    "categoria": "Escola / Universidade",
    "cep": "01000-000",
    "logradouro": "Rua Teste",
    "numero": "200",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP",
    "capacidadeBombona": 200,
    "nivelAtualPct": 30,
    "statusBombona": "PARCIAL"
  }'
```

Você também pode enviar a categoria como número:

```json
{
  "categoria": 3
}
```

Resultado esperado:
- `201 Created`
- Objeto com o ponto cadastrado, incluindo `categoria` traduzida e `categoriaNumero`

Falhas comuns:
- `400 Bad Request`: dados inválidos
- `401 Unauthorized`: token inválido

### GET /pontos-coleta/:id
Busca um ponto de coleta por ID.

Exemplo:

```bash
curl -X GET http://localhost:3000/pontos-coleta/1
```

Resultado esperado:
- `200 OK`
- Dados do ponto encontrado, com `categoria` já traduzida e `categoriaNumero`

Falhas comuns:
- `404 Not Found`: ponto não encontrado
- `400 Bad Request`: ID inválido

---

## 4. Solicitações de Coleta

### POST /solicitacoes-coleta
Cria uma nova solicitação de coleta.

Exemplo:

```bash
curl -X POST http://localhost:3000/solicitacoes-coleta \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pontoColetaId": 1,
    "volumeInformado": 50,
    "observacoes": "Bombona na portaria"
  }'
```

Resultado esperado:
- `201 Created`
- Objeto da solicitação criada

Falhas comuns:
- `400 Bad Request`: ponto inválido, dados inválidos ou ponto não pertence ao parceiro
- `401 Unauthorized`: token ausente ou inválido

### GET /solicitacoes-coleta
Lista as solicitações de coleta do parceiro autenticado.

Exemplo:

```bash
curl -X GET http://localhost:3000/solicitacoes-coleta \
  -H "Authorization: Bearer SEU_TOKEN"
```

Resultado esperado:
- `200 OK`
- Lista de solicitações com dados do ponto e do parceiro

Falhas comuns:
- `401 Unauthorized`: usuário não autenticado

---

## 5. Admin

### POST /admin/login
Login de administrador.

Exemplo:

```bash
curl -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cooperativa.com",
    "senha": "admin123"
  }'
```

Resultado esperado:
- `200 OK`
- Retorno com token de acesso admin

Falhas comuns:
- `401 Unauthorized`: credenciais inválidas

### GET /admin/me
Retorna dados do admin autenticado.

Exemplo:

```bash
curl -X GET http://localhost:3000/admin/me \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN"
```

### GET /admin/parceiros/pendentes
Lista parceiros pendentes de aprovação.

Exemplo:

```bash
curl -X GET http://localhost:3000/admin/parceiros/pendentes \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN"
```

### GET /admin/parceiros
Lista todos os parceiros.

Exemplo:

```bash
curl -X GET http://localhost:3000/admin/parceiros \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN"
```

### PATCH /admin/parceiros/:id/status
Atualiza status de parceiro.

Exemplo:

```bash
curl -X PATCH http://localhost:3000/admin/parceiros/1/status \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APROVADO",
    "observacao": "Cadastro validado"
  }'
```

### GET /admin/pontos
Lista todos os pontos de coleta com filtros e paginação.

Exemplo:

```bash
curl -X GET "http://localhost:3000/admin/pontos?categoria=Escola%20/%20Universidade&statusBombona=PARCIAL&page=1&limit=10" \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN"
```

Parâmetros aceitos:
- `categoria`: número da categoria ou nome traduzido
- `nomePonto`: nome do ponto de coleta
- `statusBombona`: status da bombona
- `parceiro`: nome do parceiro
- `statusAprovacao`: `APROVADO`, `REJEITADO` ou `PENDENTE`
- `page`: página da paginação
- `limit`: quantidade por página

Como usar o filtro de categoria:
- Você pode filtrar por número, por exemplo: `?categoria=3`
- Também pode filtrar por nome traduzido, por exemplo: `?categoria=Escola%20/%20Universidade`
- A API aceita variações de texto com acentos e espaços normalizados, então valores como `escola universidade` também funcionam

Exemplo prático:
```bash
curl -X GET "http://localhost:3000/admin/pontos?categoria=3&page=1&limit=10" \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN"
```

Resultado esperado:
- `200 OK`
- Objeto com `items`, `total`, `page`, `limit` e `totalPages`
- Cada item já vem com `categoria` traduzida e `categoriaNumero`

### PATCH /admin/pontos-coleta/:id/status
Atualiza status de ponto de coleta.

Exemplo:

```bash
curl -X PATCH http://localhost:3000/admin/pontos-coleta/1/status \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APROVADO",
    "observacao": "Ponto validado"
  }'
```

### PATCH /admin/solicitacoes-coleta/:id/status
Atualiza status da solicitação de coleta.

Exemplo:

```bash
curl -X PATCH http://localhost:3000/admin/solicitacoes-coleta/1/status \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "AGENDADA",
    "dataAgendamento": "2026-08-10T10:00:00.000Z"
  }'
```

### GET /admin/solicitacoes-coleta
Lista todas as solicitações com filtros e paginação.

Exemplo:

```bash
curl -X GET "http://localhost:3000/admin/solicitacoes-coleta?status=AGUARDANDO&page=1&limit=10" \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN"
```

Resultado esperado:
- `200 OK`
- Objeto com `items`, `total`, `page`, `limit`, `totalPages`

Falhas comuns:
- `400 Bad Request`: query inválida ou parâmetros incorretos
- `401 Unauthorized`: token inválido
- `403 Forbidden`: usuário não é admin

---

## Cenários de sucesso e falha resumidos

### Sucesso
- Cadastro de parceiro realizado com `201 Created`
- Login retornando token com `200 OK`
- Listagem de dados com `200 OK`
- Criação de ponto ou solicitação com `201 Created`
- Atualização de status com `200 OK`

### Falha
- Dados incompletos ou inválidos → `400 Bad Request`
- Token ausente ou inválido → `401 Unauthorized`
- Usuário sem permissão de admin → `403 Forbidden`
- Recurso não encontrado → `404 Not Found`
- Erro interno inesperado → `500 Internal Server Error`

---

## Dicas úteis

- Use `Content-Type: application/json` nas requisições POST/PATCH.
- Sempre envie o token JWT em rotas protegidas.
- Para testar em ferramentas como Postman ou Insomnia, importe a coleção ou monte as requisições manualmente.
- Para endpoints com paginação, use `page` e `limit` para controlar o volume de resposta.

## Esquemas de resposta e exemplos (por endpoint)

Esta seção descreve, por endpoint, exemplos de request e os corpos de response esperados, incluindo sucesso e erros comuns. Use estes exemplos como referência ao integrar ou testar a API.

Obs: os campos `categoria` e `categoriaNumero` aparecem em pontos de coleta — `categoria` é o rótulo traduzido (string) e `categoriaNumero` é o valor numérico salvo (number).

### Parceiros

- POST /parceiros/register
  - Request: ver seção acima (exemplo de body). Pode retornar `201 Created` com:
  - Success (201):
```json
{
  "id": 123,
  "razaoSocial": "Cooperativa Exemplo",
  "email": "parceiro@exemplo.com",
  "documento": "12345678000190",
  "statusAprovacaoParceiro": "PENDENTE",
  "criadoEm": "2026-08-02T12:00:00.000Z"
}
```
  - Error (400):
```json
{ "message": "E-mail já cadastrado" }
```

- POST /parceiros/login
  - Success (200):
```json
{
  "token": "eyJhbGci...",
  "usuario": {
    "id": 123,
    "razaoSocial": "Cooperativa Exemplo",
    "email": "parceiro@exemplo.com"
  }
}
```
  - Error (401):
```json
{ "message": "Credenciais inválidas" }
```

- GET /parceiros/me
  - Success (200):
```json
{
  "id": 123,
  "razaoSocial": "Cooperativa Exemplo",
  "email": "parceiro@exemplo.com",
  "tipoParceiro": "INSTITUCIONAL"
}
```

### Parceiros Indicadores

- GET /parceiros-indicadores
  - Success (200):
```json
[
  { "id": 1, "nome": "Indicador A", "ativo": true },
  { "id": 2, "nome": "Indicador B", "ativo": true }
]
```

### Pontos de Coleta

- GET /pontos-coleta/meus
  - Success (200): lista de pontos (cada item traz `categoria` e `categoriaNumero`):
```json
[
  {
    "id": 10,
    "parceiroId": 123,
    "nomePontoColeta": "Ponto Central",
    "categoria": "Escola / Universidade",
    "categoriaNumero": 3,
    "cep": "01000-000",
    "capacidadeBombona": 200,
    "statusBombona": "PARCIAL"
  }
]
```

- POST /pontos-coleta
  - Success (201): objeto criado (categoria já traduzida):
```json
{
  "id": 11,
  "parceiroId": 123,
  "nomePontoColeta": "Ponto Central",
  "categoria": "Escola / Universidade",
  "categoriaNumero": 3,
  "cep": "01000-000",
  "capacidadeBombona": 200,
  "nivelAtualPct": 30,
  "statusBombona": "PARCIAL",
  "statusAprovacaoPontoColeta": "PENDENTE"
}
```
  - Error (400):
```json
{ "message": "campo capacidadeBombona é obrigatório" }
```

- GET /pontos-coleta/:id
  - Success (200):
```json
{
  "id": 11,
  "parceiroId": 123,
  "nomePontoColeta": "Ponto Central",
  "categoria": "Escola / Universidade",
  "categoriaNumero": 3,
  "cep": "01000-000",
  "logradouro": "Rua Teste",
  "numero": "200",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "capacidadeBombona": 200,
  "nivelAtualPct": 30
}
```
  - Error (404):
```json
{ "message": "Ponto de coleta não encontrado" }
```

### Solicitações de Coleta

- POST /solicitacoes-coleta
  - Success (201):
```json
{
  "id": 200,
  "pontoColetaId": 11,
  "volumeInformado": 50,
  "status": "AGUARDANDO",
  "criadoEm": "2026-08-02T12:30:00.000Z"
}
```
  - Error (400):
```json
{ "message": "Ponto não pertence ao parceiro" }
```

- GET /solicitacoes-coleta
  - Success (200): lista com solicitações do parceiro:
```json
[
  {
    "id": 200,
    "pontoColetaId": 11,
    "volumeInformado": 50,
    "status": "AGUARDANDO",
    "pontoColeta": { "id": 11, "nomePontoColeta": "Ponto Central", "categoria": "Escola / Universidade", "categoriaNumero": 3 }
  }
]
```

### Admin

- POST /admin/login
  - Success (200): token (igual ao parceiro)

- GET /admin/parceiros/pendentes
  - Success (200): array de parceiros com `statusAprovacaoParceiro = PENDENTE`

- GET /admin/parceiros
  - Success (200): array de parceiros (ver exemplo de parceiro acima)

- PATCH /admin/parceiros/:id/status
  - Success (200): retorna parceiro atualizado
  - Error (400): parceiro não encontrado ou status inválido

- GET /admin/pontos (listagem com filtros e paginação)
  - Request query: `categoria`, `nomePonto`, `statusBombona`, `parceiro`, `statusAprovacao`, `page`, `limit`
  - Success (200):
```json
{
  "items": [
    {
      "id": 11,
      "parceiroId": 123,
      "nomePontoColeta": "Ponto Central",
      "categoria": "Escola / Universidade",
      "categoriaNumero": 3,
      "capacidadeBombona": 200,
      "statusAprovacaoPontoColeta": "PENDENTE"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

- PATCH /admin/pontos-coleta/:id/status
  - Success (200): retorna ponto atualizado

- PATCH /admin/solicitacoes-coleta/:id/status
  - Success (200): retorna solicitação atualizada

---

## Como verificar respostas na integração

- Verifique o código HTTP primeiro:
  - 200/201: sucesso — processe o JSON retornado
  - 400: erro de validação — leia `message` ou corpo de erro
  - 401/403: problema de autenticação/autorização
  - 404: recurso não encontrado

- Estrutura JSON:
  - Endpoints de listagem paginada retornam um objeto com `items`, `total`, `page`, `limit`, `totalPages`.
  - Objetos de recurso (parceiro, ponto, solicitação) retornam os campos principais listados nos exemplos acima.

- Dicas para testes automatizados:
  - Asserte status HTTP correto.
  - Valide presença e tipo dos campos obrigatórios (`id`, `criadoEm`, `categoria`/`categoriaNumero`, etc.).
  - Para filtros: primeiro crie dados conhecidos (fixtures), depois verifique `total` e `items` correspondentes ao filtro.

