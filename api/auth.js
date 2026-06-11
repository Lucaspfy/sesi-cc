const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const { action, senha, hash } = req.body || {};

  // ── Gerar hash de uma senha nova ──────────────────────────────────────────
  if (action === 'hash') {
    if (!senha) return res.status(400).json({ error: 'senha required' });
    const hashed = await bcrypt.hash(senha, 12);
    return res.status(200).json({ hash: hashed });
  }

  // ── Verificar senha contra hash armazenado ────────────────────────────────
  if (action === 'verify') {
    if (!senha || !hash) return res.status(400).json({ error: 'senha and hash required' });

    const isBcrypt = typeof hash === 'string' && hash.startsWith('$2');

    if (isBcrypt) {
      const ok = await bcrypt.compare(senha, hash);
      return res.status(200).json({ ok, rehash: null });
    } else {
      // Senha ainda em texto puro (legado) — verifica e já devolve o hash
      // para que o frontend faça a migração automática
      const ok = senha === hash;
      const rehash = ok ? await bcrypt.hash(senha, 12) : null;
      return res.status(200).json({ ok, rehash });
    }
  }

  return res.status(400).json({ error: 'invalid_action' });
};
