const express = require('express');
const app = express();
const port = 3000;
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

// Inicializa o Firebase
const serviceAccount = require(');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: ',
});

const db = admin.database();

// Configurações do Handlebars
app.engine('handlebars', engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', './views');

// Configuração do Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuração de arquivos estáticos (CSS, JS, imagens)
app.use(express.static('public'));

// Rota para listar todos os usuários
app.get('/users', (req, res) => {
  db.ref('users')
    .once('value')
    .then((snapshot) => {
      const users = snapshot.val() || {};
      res.json(users); // Retorna os dados como JSON para a API
    })
    .catch((error) => res.status(500).send('Erro ao buscar dados: ' + error.message));
});

// Rota para criar um novo usuário
app.post('/users', (req, res) => {
  const { nome, tipo, idade, raca, descricao } = req.body;

  if (!nome || !tipo || !idade || !raca || !descricao) {
    return res.status(400).render('mensagem', { mensagem: 'Campos nome e tipo são obrigatórios.' });
  }

  db.ref('users/' + nome).set({ tipo, idade, raca, descricao })
        .then(() => {
            res.render('mensagem', { mensagem: 'Usuário criado com sucesso!' });  // Exibe a mensagem de sucesso
        })
        .catch((error) => {
            res.status(500).render('mensagem', { mensagem: 'Erro ao salvar os dados: ' + error.message });  // Exibe a mensagem de erro
        });
});

// Rota para obter um usuário específico
app.get('/users/:id', (req, res) => {
  const id = req.params.id;

  db.ref('users/' + id)
    .once('value')
    .then((snapshot) => {
      if (snapshot.exists()) {
        res.json(snapshot.val());
      } else {
        res.status(404).send('Usuário não encontrado.');
      }
    })
    .catch((error) => res.status(500).send('Erro ao buscar dados: ' + error.message));
});

// Rota para atualizar um usuário
app.put('/users/:id', (req, res) => {
  const id = req.params.id;
  const updates = req.body;

  db.ref('users/' + id)
    .update(updates)
    .then(() => res.send('Usuário atualizado com sucesso!'))
    .catch((error) => res.status(500).send('Erro ao atualizar usuário: ' + error.message));
});

// Rota para deletar um usuário
app.delete('/users/:id', (req, res) => {
  const id = req.params.id;

  db.ref('users/' + id)
    .remove()
    .then(() => res.send('Usuário removido com sucesso!'))
    .catch((error) => res.status(500).send('Erro ao remover usuário: ' + error.message));
});

// Atualizar um pet
app.put('/users/:id', (req, res) => {
    const id = req.params.id;
    const { nome, tipo, idade, raca, descricao } = req.body;

    if (!nome || !tipo || !idade || !raca || !descricao) {
        return res.status(400).send('Todos os campos são obrigatórios!');
    }

    db.ref('users/' + id)
        .update({ nome, tipo, idade, raca, descricao })
        .then(() => res.send('Pet atualizado com sucesso!'))
        .catch((error) => res.status(500).send('Erro ao atualizar o pet: ' + error.message));
});


// Página de formulário (para interface web)
app.get('/cadastrar', (req, res) => {
  res.render('formulario');
});

// Rota raiz 
app.get('/', (req, res) => {
    res.send(`
        
        <html>
            <head>
                <link rel="stylesheet" type="text/css" href="/css/style.css">
            </head>
            <body>
                <div class="message">A aplicação está funcionando corretamente!</div>

            </body
        </html>
        
        `);
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
