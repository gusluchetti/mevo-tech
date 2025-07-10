# mevo-tech

teste técnico da Mevo. começei com um único script, bem simples, e dei uma melhorada pós-entrevista
com zod e drizzle + sqlite. deixei um local.db no repo mesmo com alguns valores básicos.

API fica rodando na porta 8080, tem um CRUD disponível referente a tabela 'orders', que era a
proposta do teste.
qualquer outra consulta ao arquivo da base pode ser feita na CLI, com `sqlite3 local.db`, e rodando o SQL desejado.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.18. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
