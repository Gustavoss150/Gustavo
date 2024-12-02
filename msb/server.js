// Importação dos módulos necessários
const express = require('express'); // Framework para criar a API
const fs = require('fs'); // Módulo para manipular arquivos no sistema
const path = require('path'); // Módulo para trabalhar com caminhos de arquivos e diretórios
const cors = require('cors'); // Middleware para habilitar CORS (Cross-Origin Resource Sharing)

const app = express(); // Instância do servidor Express
const port = 3000; // Porta onde o servidor irá rodar

// Configuração do middleware
app.use(cors()); // Habilita CORS para permitir requisições de origens diferentes
app.use(express.json()); // Middleware para parsear requisições com corpo em JSON

// Endpoint principal para busca
app.get('/search', (req, res) => 
{
    // Obtém a query de busca, garantindo que esteja em letras minúsculas
    const searchQuery = req.query.query?.toLowerCase();
    if (!searchQuery) { // Verifica se a query foi fornecida
        return res.status(400).send('Query não fornecida'); // Retorna erro 400 se a query estiver ausente
    }

    // Função que realiza a busca nos arquivos JSON
    const searchData = (file, key) =>
    {
        return new Promise((resolve, reject) => 
        {
            // Determina o caminho do arquivo baseado na pasta 'data'
            const filePath = path.join(__dirname, 'data', `${file}.json`);
            fs.readFile(filePath, 'utf8', (err, data) => // Lê o conteúdo do arquivo
            {
                if (err) return reject(err); // Rejeita a promessa se ocorrer erro ao ler o arquivo
                try {
                    const parsedData = JSON.parse(data); // Faz o parse do conteúdo JSON
                    const results = parsedData.filter(item =>
                        // Filtra itens onde qualquer valor contém a query de busca (não sensível a maiúsculas)
                        Object.values(item).some(val => 
                            val?.toString().toLowerCase().includes(searchQuery)
                        )
                    );
                    // Resolve a promessa com os resultados e a chave associada
                    resolve({ key, results });
                } catch (parseError) {
                    // Rejeita a promessa se ocorrer erro ao parsear o JSON
                    reject(parseError);
                }
            });
        });
    };

    // Chama a função de busca para múltiplos arquivos em paralelo
    Promise.all
    ([
        searchData('sales_orders', 'Pedidos de Venda'), // Busca em sales_orders.json
        searchData('purchase_orders', 'Pedidos de Compra'), // Busca em purchase_orders.json
        searchData('materials', 'Produtos'), // Busca em materials.json
        searchData('equipments', 'Equipamentos'), // Busca em equipments.json
        searchData('workforce', 'Mão de Obra'), // Busca em workforce.json
    ]).then((results) =>
    {
        // Combina os resultados em um objeto de resposta
        const response = results.reduce((acc, { key, results }) => 
        {
            acc[key] = results; // Adiciona os resultados de cada arquivo à chave correspondente
            return acc;
        }, {});
        res.json(response); // Envia a resposta como JSON
    }).catch(err => 
    {
        // Trata erros ocorridos durante a busca
        console.error('Erro ao buscar dados:', err.message); // Log do erro no console
        res.status(500).send('Erro ao processar a solicitação'); // Retorna erro 500 genérico
        res.status(500).json({ message: 'Erro ao processar os dados no servidor', error: err.message }); // Envia detalhes do erro no JSON (a segunda chamada de `res.status(500)` é redundante e desnecessária)
    });
});

// Inicia o servidor na porta configurada
app.listen(port, () => 
{
    console.log(`API backend rodando na http://localhost:${port}`); // Mensagem de confirmação no console
});
