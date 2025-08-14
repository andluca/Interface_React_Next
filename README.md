# Interface_React_Next — Sistema de Usuários

Aplicação Front-end em Next.js (App Router) para autenticação e gestão de usuários, com TypeScript, Tailwind CSS e Axios.

## Stack

- Next.js (App Router) + React 19
- TypeScript
- Tailwind CSS v3 + PostCSS/Autoprefixer
- Axios (HTTP)
- js-cookie (token)
- ESLint (Next core-web-vitals)

## Requisitos

- Node.js ≥ 18 (recomendado 18/20/22 LTS)
- npm ≥ 9
- Backend com endpoints de autenticação e usuários
- Backend rodando em localhost (por padrão a API deste front aponta para localhost, onde está a api preparada)

## Instalação e execução

```bash
npm install
npm run dev
# http://localhost:3000
```

Scripts úteis:
- `npm run build` — build de produção
- `npm start` — iniciar build produzido
- `npm run lint` — lint

## Estrutura principal

```
src/
  app/
    layout.tsx            # Root layout + AuthProvider
    globals.css           # Tailwind (base, components, utilities)
    login/page.tsx
    users/page.tsx
    users/create/page.tsx
    users/[id]/page.tsx
    users/[id]/edit/page.tsx
  components/
    Navbar.tsx
    UserForm.tsx
    UserList.tsx
  hooks/
    useAuth.tsx           # AuthProvider (default) + hook useAuth()
  services/
    api.ts                # Axios + interceptors + helpers
  types/                  # (se aplicável)
```

## Estilo (Tailwind)

- Diretivas em `src/app/globals.css`:
  ```
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```
- Configuração em `tailwind.config.js` com content para `./src/app`, `./src/components`, `./src/pages`.
- Se ver “Unknown at rule @tailwind”, garanta Tailwind v3:
  ```bash
  npm i -D tailwindcss@^3.4 postcss autoprefixer
  ```
  Reinicie o dev server após mudanças.

## Autenticação

- `AuthProvider` (default export) provê: `isAuthenticated`, `user`, `login`, `logout`, `loading`.
- Token salvo em cookie `auth_token`; usuário em `localStorage`.
- Uso:
  ```tsx
  import { useAuth } from '@/hooks/useAuth';
  const { isAuthenticated, user, login, logout } = useAuth();
  ```

## API e tratamento de erros

- `src/services/api.ts` centraliza Axios, baseURL e interceptors.
- Interceptor converte erros da API em `ApiError` e expõe `getErrorMessage(err, fallback)`.
- Padrão de uso nos pages/components:
  ```tsx
  import { apiService, getErrorMessage } from '@/services/api';

  try {
    const users = await apiService.getUsers();
  } catch (err) {
    setError(getErrorMessage(err, 'Erro ao carregar usuários'));
  }
  ```
- Normalização de respostas:
  - Listagem: se a API retorna `{ message, data, total }`, o serviço retorna apenas `data` (array de usuários).
  - CRUD: unwrap de `{ data }` quando existir.

## Rotas

- `/login` — autenticação
- `/users` — listagem
- `/users/create` — criação (UserForm)
- `/users/[id]` — detalhes
- `/users/[id]/edit` — edição (UserForm)
  - Na edição, o payload envia apenas campos alterados (diff entre original e form).

## Padrões e boas práticas

- TypeScript estrito (tipos para requests/responses).
- Separação por camadas:
  - UI (pages/components)
  - Estado/Contexto (hooks)
  - Infra/HTTP (services)
- Erros sempre exibidos com `getErrorMessage`.
- Navegação com `router.push()` a partir de handlers de UI.

## Configurações úteis (VS Code)

Crie `.vscode/settings.json` para melhorar a experiência com Tailwind e CSS:
```json
{
  "css.validate": false,
  "scss.validate": false,
  "less.validate": false,
  "files.associations": { "*.css": "tailwindcss" }
}
```

## Ajustes de ambiente

- A URL do backend é definida no `src/services/api.ts` (baseURL). Ajuste para a porta do seu backend.
- Se preferir usar variável de ambiente, adapte o serviço para ler `process.env.NEXT_PUBLIC_API_BASE_URL`.

## Troubleshooting

- Tailwind não aplica estilos:
  - Verifique `globals.css` importado no `layout.tsx`.
  - Confirme Tailwind v3 + `postcss.config.js`.
  - Reinicie o servidor (`Ctrl+C`, depois `npm run dev`).
- “users.map is not a function”:
  - O serviço já normaliza para array; confira se o consumo não usa objeto `{ data, total }` diretamente.
- “File ... useAuth.ts is not a module”:
  - Use `useAuth.tsx` (tem JSX) e importe como `@/hooks/useAuth` (sem extensão).

## Licença

Uso interno/educacional (defina a licença conforme necessidade).