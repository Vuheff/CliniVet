// =====================================================
// fx.js — EFEITOS DE COMEMORAÇÃO
// festa(x, y): explode patinhas, ossinhos e corações a partir
// de um ponto da tela. Use: festa(evento.clientX, evento.clientY)
// =====================================================

const FORMAS = {
  pata: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="16" rx="5.5" ry="4.6"/><ellipse cx="5.5" cy="10" rx="2.3" ry="2.9"/><ellipse cx="9.5" cy="5.5" rx="2.3" ry="2.9"/><ellipse cx="14.5" cy="5.5" rx="2.3" ry="2.9"/><ellipse cx="18.5" cy="10" rx="2.3" ry="2.9"/></svg>',
  osso: '<svg viewBox="0 0 40 20"><path d="M8 4a4 4 0 1 0-2 7.5A4 4 0 1 0 10 16h20a4 4 0 1 0 4-4.5A4 4 0 1 0 32 4a4 4 0 0 0-2 2H10a4 4 0 0 0-2-2z"/></svg>',
  coracao: '<svg viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/></svg>',
};
const CORES = ['#0E9F86', '#FFB547', '#FF7A6B', '#FF8FA3', '#5AA9E6', '#E8A94F'];

const semMovimento = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function festa(x = innerWidth / 2, y = innerHeight / 2, qtd = 26) {
  if (semMovimento()) return;
  const caixa = document.createElement('div');
  caixa.className = 'festa';
  const tipos = Object.keys(FORMAS);
  for (let i = 0; i < qtd; i++) {
    const el = document.createElement('span');
    const ang = Math.random() * Math.PI * 2;
    const dist = 80 + Math.random() * 160;
    el.innerHTML = FORMAS[tipos[i % tipos.length]];
    el.style.cssText = `left:${x}px;top:${y}px;color:${CORES[i % CORES.length]};
      --dx:${Math.cos(ang) * dist}px;--dy:${Math.sin(ang) * dist - 90}px;--r:${Math.random() * 720 - 360}deg;
      --t:${0.9 + Math.random() * 0.7}s;--s:${0.6 + Math.random() * 0.8}`;
    caixa.appendChild(el);
  }
  document.body.appendChild(caixa);
  setTimeout(() => caixa.remove(), 1800);
}

// pega o centro de um elemento clicado
export function centro(evento) {
  const r = evento?.currentTarget?.getBoundingClientRect?.();
  return r ? [r.left + r.width / 2, r.top + r.height / 2] : [innerWidth / 2, innerHeight / 2];
}
