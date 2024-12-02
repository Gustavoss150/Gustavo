import React, { useState } from "react"; 
// Importação do React e do hook `useState`

const App = () => {     // Definição do componente funcional `App`
  const [searchQuery, setSearchQuery] = useState(""); // Estado para armazenar a query de busca
  const [results, setResults] = useState(null);  // Estado para armazenar os resultados retornados da API

  const handleSearch = async (e) => { 
    // Função assíncrona para lidar com a submissão do formulário de busca
    e.preventDefault(); 
    // Previne o comportamento padrão do formulário de recarregar a página

    if (!searchQuery.trim()) return; 
    // Verifica se a query de busca não está vazia ou composta apenas por espaços em branco

    try {
      const response = await fetch(`http://localhost:3000/search?query=${searchQuery}`);
      // Faz uma requisição GET para a API no backend usando o valor da query de busca.
      if (!response.ok) throw new Error("Erro ao buscar dados");
      // Lança um erro caso a resposta da API não seja bem-sucedida.

      const data = await response.json();
      // Converte a resposta da API para JSON
      setResults(data);
      // Atualiza o estado `results` com os dados retornados
    } catch (error) {
      console.error(error);
      setResults({ error: "Erro ao buscar." });
      // Define no estado um erro genérico para exibir ao usuário
    }
  };

  const renderCategory = (categoryName, items) => {
    // Função para renderizar os resultados de uma categoria específica
    if (!items || items.length === 0) {
      // Caso a categoria não tenha itens ou o array seja vazio:
      return (
        <div className="result-category">
          <h3>{categoryName}</h3>
          <p>nenhum item encontrado</p>
          {/* Exibe a mensagem de que não foram encontrados itens. */}
        </div>
      );
    }

    return (
      <div className="result-category">
        <h3>
          {categoryName} ({items.length} {items.length > 1 ? "itens encontrados" : "item encontrado"})
          {/* Exibe o nome da categoria seguido pelo número de itens encontrados (singular ou plural). */}
        </h3>
        <ul>
          {items.map((item, index) => (
            // Mapeia cada item na categoria para renderizar uma lista de resultados.
            <li key={index}>
              {Object.entries(item).map(([key, value], idx) => (
                // Para cada par chave-valor no item, cria elementos para exibir os valores.
                <span key={idx} className="result-value">
                  {idx === 0 ? `#${value}` : `${value}`}
                  {/* Adiciona um `#` ao valor do primeiro atributo do item (geralmente um ID). */}
                  {idx < Object.entries(item).length - 1 ? <span className="tab-space"></span> : ""}
                  {/* Adiciona espaçamento entre valores, exceto no último elemento. */}
                </span>
              ))}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="container">
      {/* Componente raiz contendo todo o layout da aplicação. */}
      <img src="/logo_multisearch.png" alt="Logo MSF" className="logo" />
      {/* Imagem da logo da aplicação com um caminho relativo e uma classe CSS. */}
      <form onSubmit={handleSearch} className="search-form">
        {/* Formulário de busca com um evento de submissão atrelado à função `handleSearch`. */}
        <input
          type="text"
          placeholder="Digite sua busca"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          // Input controlado que atualiza o estado `searchQuery` conforme  a digitação
        />
        <button type="submit">
          {/* Botão de submissão para iniciar a busca. */}
          <i className="fa fa-search" aria-hidden="true"></i>
          {/* Ícone de lupa, usando Font Awesome */}
        </button>
      </form>
      <div className="results">
        {/* Container para exibir os resultados da busca */}
        {results && (
          results.error ? (
            <p className="error">{results.error}</p>
            // Caso ocorra um erro, exibe a mensagem correspondente
          ) : (
            Object.keys(results).map((key) => renderCategory(key, results[key]))
            // Mapeia cada chave dos resultados para renderizar a categoria e os itens
          )
        )}
      </div>
    </div>
  );
};

export default App;
