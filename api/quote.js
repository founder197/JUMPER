// api/quote.js
// Rota GET: /api/quote?fromChain=...&toChain=...&tokenSymbol=...

// ⚠️ Mapeamento Centralizado dos Tokens (Mais seguro e fácil de gerenciar)
const TOKEN_ADDRESS_MAP = {
    'USDT': {
        '1': '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum
        '10': '0x94b008aA29c5124dD070aE447a029fcd6436bB71', // Optimism
        '137': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // Polygon
        // Seu endereço USDT Nativo corrigido
        '42161': '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // Arbitrum
        '56': '0x55d398326f99059fF775485246999027B3197955', // BNB Chain
        '43114': '0x9702230A8Ea53601f5cd2dc00fDBc13d632aC4CD', // Avalanche (USDT.e)
        '59144': '0xA063B1aB55b7fC8B991515A11105c3167b66A1F8', // Linea
        // Adicionar outros tokens e chains aqui...
    }
};

export default async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });

    const { fromChain, toChain, tokenSymbol, fromAddress, toAddress, fromAmount, ...rest } = req.query;
    
    // 1. MAPEAMENTO DE TOKENS AGORA É FEITO NO BACKEND
    const fromTokenAddress = TOKEN_ADDRESS_MAP[tokenSymbol]?.[''+fromChain];
    const toTokenAddress = TOKEN_ADDRESS_MAP[tokenSymbol]?.[''+toChain];

    if (!fromTokenAddress || !toTokenAddress) {
        return res.status(400).json({ 
            error: `Token ${tokenSymbol} não mapeado para Chain ID ${fromChain} ou ${toChain}.`,
            details: 'O frontend deve estar enviando um tokenSymbol inválido ou a Chain não é suportada internamente.'
        });
    }
    
    // 2. CONSTRUÇÃO DA QUERY STRING COM ENDEREÇOS CORRETOS
    const queryParams = new URLSearchParams({
        ...rest,
        fromChain,
        toChain,
        fromToken: fromTokenAddress, // <-- ENDEREÇO CORRIGIDO E BUSCADO AQUI
        toToken: toTokenAddress,     // <-- ENDEREÇO CORRIGIDO E BUSCADO AQUI
        fromAddress,
        toAddress,
        fromAmount,
    }).toString();
    
    const liFiQuoteUrl = `https://li.quest/v1/quote?${queryParams}`;

    try {
        const response = await fetch(liFiQuoteUrl);
        const data = await response.json();
        
        // 3. VERIFICAÇÃO DE ERROS DA PRÓPRIA API LI.FI
        if (response.status !== 200) {
            console.error('Erro da LI.FI:', data.message);
            return res.status(response.status).json({ 
                error: 'Erro retornado pela API da LI.FI.',
                message: data.message || 'Erro desconhecido.'
            });
        }
        
        return res.status(200).json(data);

    } catch (error) {
        console.error('Erro ao buscar a cotação:', error);
        return res.status(500).json({ error: 'Falha crítica ao buscar a cotação da LI.FI.' });
    }
}
