// api/quote.js
// Rota GET: /api/quote?fromChain=...&toChain=...

// Para o Vercel, usamos o 'fetch' nativo do Node.js moderno, sem precisar de 'node-fetch'
export default async function (req, res) {
    // Definimos os cabeçalhos CORS para que seu HTML (rodando local ou em outro domínio) possa acessá-lo
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Se for uma requisição OPTIONS (pré-voo do CORS), retornamos 200 OK
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }
    
    // A API da LI.FI usa GET, então repassamos a query string inteira
    const queryString = new URLSearchParams(req.query).toString();
    const liFiQuoteUrl = `https://li.quest/v1/quote?${queryString}`;

    try {
        const response = await fetch(liFiQuoteUrl);
        const data = await response.json();
        
        // Retorna a resposta da LI.FI para o frontend
        return res.status(200).json(data);

    } catch (error) {
        console.error('Erro ao buscar a cotação:', error);
        // Retorna um erro amigável ao frontend
        return res.status(500).json({ error: 'Falha ao buscar a cotação da LI.FI.' });
    }
}
