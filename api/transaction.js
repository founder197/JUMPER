// api/transaction.js
// Rota POST: /api/transaction (com o body JSON)

export default async function (req, res) {
    // Definimos os cabeçalhos CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    // A requisição POST do seu frontend envia o quote no body
    const quote = req.body;
    const liFiHopUrl = 'https://li.quest/v1/hop';

    if (!quote || !quote.tool) {
        return res.status(400).json({ error: 'Corpo da requisição inválido ou cotação ausente.' });
    }

    try {
        const response = await fetch(liFiHopUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Enviamos o JSON da cotação
            body: JSON.stringify(quote),
        });
        
        const data = await response.json();
        
        // Retorna a resposta da LI.FI (que contém o transactionRequest)
        return res.status(200).json(data);
        
    } catch (error) {
        console.error('Erro ao buscar os dados da transação:', error);
        return res.status(500).json({ error: 'Falha ao buscar os dados da transação da LI.FI.' });
    }
}
