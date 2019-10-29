## Requerimentos
[Node.js](https://nodejs.org) para instalação de dependências e execução de scripts

## Comandos
| Comando | Descrição |
|---------|-------------|
| ` npm install ` | Instalar dependências do projeto |
| ` node server/index.js ` | Inicializa servidor express |
| ` node --inspect server/index.js ` | Inicializa servidor express em modo inspect para node devtools |

# Módulos Utilizados
- [Express](https://expressjs.com/pt-br/)
- [Socket.io](https://socket.io/)
- [jsdom](https://github.com/jsdom/jsdom)
- [datauri](https://www.npmjs.com/package/datauri)
- [node-canvas](https://github.com/Automattic/node-canvas)

## Observações
- Caso ocorrer erro de ENOENT ao ligar servidor, mover projeto para uma pasta sem caracteres ASCII
