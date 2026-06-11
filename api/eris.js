/**
 * Backend proxy para a API ERIS.
 *
 * Variáveis de ambiente necessárias (configurar no painel da Vercel):
 *   ERIS_API_URL  — URL base da API ERIS  ex: https://api.eris.com.br/v1
 *   ERIS_API_KEY  — Chave/token de autenticação fornecido pelo ERIS
 *
 * Rota acessível pelo frontend em: /api/eris
 */
module.exports = async (req, res) => {
  // ── Configurar CORS (mesmo domínio Vercel, mas garante flexibilidade) ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── Verificar variáveis de ambiente ──
  const { ERIS_API_URL, ERIS_API_KEY } = process.env;

  if (!ERIS_API_URL || !ERIS_API_KEY) {
    return res.status(503).json({
      ok: false,
      error: 'not_configured',
      message: 'Variáveis ERIS_API_URL e ERIS_API_KEY não definidas na Vercel.'
    });
  }

  // ── Leitura do parâmetro de rota desejada ──
  // Ex: /api/eris?rota=producao  →  chama  ERIS_API_URL/producao
  const rota = req.query.rota || '';

  try {
    const url = `${ERIS_API_URL.replace(/\/$/, '')}/${rota}`;

    // TODO: ajustar headers conforme autenticação real do ERIS
    //       (Bearer token, API-Key header, Basic auth, etc.)
    const upstream = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${ERIS_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        ok: false,
        error: 'upstream_error',
        status: upstream.status,
        message: `ERIS respondeu com status ${upstream.status}`
      });
    }

    const data = await upstream.json();
    return res.status(200).json({ ok: true, data });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: 'fetch_error',
      message: err.message
    });
  }
};
