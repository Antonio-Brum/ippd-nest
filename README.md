# API de tarefas e projetos

Requer Node.js 20 ou superior.

```bash
npm install
npm run build
npm start
```

A API roda em `http://localhost:3000`. Use `PORT` para mudar a porta e `DATA_DIR` para mudar a pasta dos dados. Por padrão, os arquivos ficam em `data/tasks.json` e `data/projects.json`.

Os recursos `/tasks` e `/projects` oferecem as mesmas rotas:

| Método | Rota | Corpo |
| --- | --- | --- |
| GET | `/tasks` | — |
| GET | `/tasks/:id` | — |
| POST | `/tasks` | `{"name":"Exemplo"}` |
| PUT | `/tasks/:id` | `{"name":"Novo nome"}` |
| PATCH | `/tasks/:id` | `{"name":"Novo nome"}` |
| DELETE | `/tasks/:id` | — |

Troque `tasks` por `projects` para projetos. O campo `name` é obrigatório na criação e na substituição; no PATCH é opcional. 

Execute `npm test` para testar os dois recursos e a persistência após reiniciar o servidor.
