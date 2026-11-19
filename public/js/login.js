// =====================================================
// login.js — TELA DE ENTRADA
// Atenção: é uma DEMONSTRAÇÃO. Não existe login de verdade;
// qualquer e-mail entra. Para produção, ligue num back-end
// (ex.: Supabase/Firebase) antes de guardar dados reais.
// =====================================================
import { html, useState } from '../vendor/preact-htm.js';
import { atualizar, ir, Icone, toast } from './core.js';
import { PetFalante, Pegadas } from './pets.js';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [ver, setVer] = useState(false);
  const [erro, setErro] = useState('');

  const entrar = (destino = 'painel', nome = 'Dra. Marina Costa') => {
    atualizar(s => ({ ...s, sessao: { nome, desde: Date.now() } }));
    ir(destino);
    toast('Bem-vinda! Os peludos te esperam.');
  };
  const enviar = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErro('Digite um e-mail válido.');
    if (senha.length < 4) return setErro('A senha precisa de pelo menos 4 caracteres.');
    entrar();
  };

  return html`<div class="login">
    <section class="login-marca">
      <img src="assets/clinivet-logo.png" alt="CliniVet — O cuidado continua além da consulta." class="login-logo" />
      <h1>O tratamento não termina<br />quando o tutor <span>sai da clínica.</span></h1>
      <p>Remédio na hora certa, curativo feito, rabinho abanando. A clínica acompanha tudo, mesmo de longe.</p>
      <div class="login-cena" aria-hidden="false">
        <${Pegadas} qtd=${10} classe="login-pegadas" />
        <div class="flut f1"><span class="kpi-ic verde"><${Icone} n="check" /></span><div><strong>Remédio das 08h</strong><small>Ana confirmou às 08:12</small></div></div>
        <div class="flut f3"><span class="kpi-ic vermelho"><${Icone} n="coracao" /></span><div><strong>Thor está melhorando!</strong><small>Dia 3 de 7</small></div></div>
        <div class="login-pets">
          <${PetFalante} id="luna" tam=${120} lado="dir" />
          <${PetFalante} id="thor" tam=${170} />
          <${PetFalante} id="pipoca" tam=${125} lado="dir" />
        </div>
      </div>
    </section>

    <section class="login-form">
      <form onSubmit=${enviar} novalidate>
        <p class="kicker">Área da clínica</p>
        <h2>Entrar</h2>
        <p class="muted">Bom te ver de novo. Continue de onde parou.</p>

        <label class="rotulo" for="email">E-mail</label>
        <input id="email" type="email" placeholder="voce@clinica.com.br" value=${email} onInput=${e => { setEmail(e.target.value); setErro(''); }} autocomplete="username" />

        <label class="rotulo" for="senha">Senha</label>
        <div class="campo-senha">
          <input id="senha" type=${ver ? 'text' : 'password'} placeholder="••••••••" value=${senha} onInput=${e => { setSenha(e.target.value); setErro(''); }} autocomplete="current-password" />
          <button type="button" class="icon-btn" onClick=${() => setVer(!ver)} aria-label=${ver ? 'Ocultar senha' : 'Mostrar senha'}><${Icone} n="olho" /></button>
        </div>
        ${erro && html`<p class="erro"><${Icone} n="alerta" tam=${14} /> ${erro}</p>`}
        <a class="link direita" href="#/entrar" onClick=${e => { e.preventDefault(); toast('Na demonstração, qualquer senha funciona.'); }}>Esqueceu a senha?</a>

        <button class="btn btn-primario largo grande" type="submit">Entrar <${Icone} n="seta" /></button>
        <div class="ou"><span>ou</span></div>
        <button type="button" class="btn btn-sec largo grande" onClick=${() => entrar('painel')}><${Icone} n="brilho" /> Abrir demonstração guiada</button>
        <button type="button" class="link centro" onClick=${() => entrar('tutor', 'Ana Ribeiro')}>Sou tutor — ver meu plano</button>
        <p class="nota">Demonstração: os dados ficam salvos só neste navegador.</p>
      </form>
    </section>
  </div>`;
}
