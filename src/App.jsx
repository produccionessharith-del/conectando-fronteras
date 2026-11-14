import React from 'react';
import { useEffect, useState } from 'react';
import {
  ArrowRight, Check, ChevronDown, CircleHelp, Facebook, Instagram,
  MapPin, Menu, MessageCircle, RadioTower, ShieldCheck, Tv, Wifi, X, Zap
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import Admin from './Admin.jsx';

const LOGO = 'https://cdn.imagetourls.com/uploads/tyImg/DI0JAuOh.png';
const WHATSAPP = ''; // Agregar aquí el número oficial, con indicativo de país y sin signos.
const FALLBACK_PLANS = [];

function App() {
  if (window.location.pathname.replace(/\/+$/, '') === '/admin') return <Admin />;
  const [menuOpen, setMenuOpen] = useState(false);
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [form, setForm] = useState({ name: '', phone: '', neighborhood: '', service: 'Internet', message: '' });
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let alive = true;
    async function loadPlans() {
      if (!isSupabaseConfigured) { setLoadingPlans(false); return; }
      const { data, error } = await supabase.from('plans').select('*').eq('active', true).order('sort_order');
      if (alive && !error && data) setPlans(data);
      if (alive) setLoadingPlans(false);
    }
    loadPlans();
    return () => { alive = false; };
  }, []);

  const waLink = WHATSAPP
    ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hola, quiero información sobre los servicios de Conectando Fronteras.')}`
    : '#contacto';

  async function submitRequest(e) {
    e.preventDefault();
    setNotice('');
    if (!form.name.trim() || !form.phone.trim()) {
      setNotice('Por favor completa tu nombre y teléfono.');
      return;
    }
    if (!isSupabaseConfigured) {
      setNotice('El formulario estará disponible cuando conectemos Supabase. Por ahora puedes completar la información de contacto al configurar el proyecto.');
      return;
    }
    setSending(true);
    const { error } = await supabase.from('leads').insert([form]);
    setSending(false);
    if (error) setNotice('No pudimos enviar tu solicitud. Intenta nuevamente o contáctanos por WhatsApp.');
    else {
      setNotice('¡Solicitud recibida! Nuestro equipo se pondrá en contacto contigo.');
      setForm({ name: '', phone: '', neighborhood: '', service: 'Internet', message: '' });
    }
  }

  const closeMenu = () => setMenuOpen(false);

  return (
    <div>
      <div className="topline"><div className="container topline-inner"><span><MapPin size={14}/> San Alberto, Cesar, Colombia</span><span className="topline-right">Conectamos hogares, acercamos personas</span></div></div>
      <header className="header">
        <div className="container nav-wrap">
          <a className="brand" href="#inicio" aria-label="Conectando Fronteras, inicio"><img src={LOGO} alt="Logo Grupo Empresarial Conectando Fronteras" /></a>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menú">{menuOpen ? <X/> : <Menu/>}</button>
          <nav className={menuOpen ? 'nav nav-open' : 'nav'}>
            <a href="#inicio" onClick={closeMenu}>Inicio</a>
            <a href="#servicios" onClick={closeMenu}>Servicios</a>
            <a href="#planes" onClick={closeMenu}>Planes</a>
            <a href="#cobertura" onClick={closeMenu}>Cobertura</a>
            <a href="#nosotros" onClick={closeMenu}>Nosotros</a>
            <a className="nav-cta" href="#contacto" onClick={closeMenu}>Contáctanos <ArrowRight size={16}/></a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero-glow glow-one"></div><div className="hero-glow glow-two"></div>
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow"><span className="pulse"></span> CONECTIVIDAD PARA TU HOGAR Y NEGOCIO</div>
              <h1>El mundo más cerca.<br/><span>Conectados contigo.</span></h1>
              <p className="hero-text">Internet y entretenimiento para que disfrutes, trabajes, aprendas y compartas sin fronteras.</p>
              <div className="hero-actions">
                <a className="button button-primary" href="#contacto">Quiero contratar <ArrowRight size={18}/></a>
                <a className="button button-ghost" href="#servicios">Conoce nuestros servicios</a>
              </div>
              <div className="hero-proof"><span><ShieldCheck size={17}/> Atención cercana</span><span><Zap size={17}/> Tecnología y conectividad</span></div>
            </div>
            <div className="hero-art" aria-label="Ilustración de conectividad">
              <div className="orbit orbit-a"></div><div className="orbit orbit-b"></div>
              <div className="signal signal-a"><Wifi size={25}/><span>INTERNET</span></div>
              <div className="signal signal-b"><Tv size={25}/><span>TELEVISIÓN</span></div>
              <div className="signal signal-c"><RadioTower size={25}/><span>CONECTIVIDAD</span></div>
              <div className="central-globe"><div className="globe-lines"></div><div className="globe-core"><Wifi size={65}/></div></div>
              <div className="art-caption"><span className="caption-dot"></span> Una conexión que nos une</div>
            </div>
          </div>
          <div className="hero-bottom"><div className="container hero-bottom-inner"><span>GRUPO EMPRESARIAL</span><b>CONECTANDO FRONTERAS</b><span>SAN ALBERTO · CESAR</span></div></div>
        </section>

        <section className="service-strip" id="servicios">
          <div className="container service-grid">
            <article className="service-card"><div className="service-icon"><Wifi/></div><div><h3>Internet</h3><p>Conectividad para estudiar, trabajar y disfrutar.</p></div><a href="#planes" aria-label="Ver planes de internet"><ArrowRight/></a></article>
            <article className="service-card"><div className="service-icon"><Tv/></div><div><h3>Televisión</h3><p>Entretenimiento para compartir en familia.</p></div><a href="#planes" aria-label="Consultar televisión"><ArrowRight/></a></article>
            <article className="service-card"><div className="service-icon"><RadioTower/></div><div><h3>Soluciones para tu hogar</h3><p>Atención y acompañamiento para nuestros usuarios.</p></div><a href="#contacto" aria-label="Contactar"><ArrowRight/></a></article>
          </div>
        </section>

        <section className="section plans-section" id="planes">
          <div className="container">
            <div className="section-heading"><div className="eyebrow eyebrow-light">ENCUENTRA TU CONEXIÓN</div><h2>Planes pensados para ti</h2><p>Conoce las opciones disponibles y encuentra el servicio ideal para tu hogar o negocio.</p></div>
            {loadingPlans ? <div className="empty-plans">Cargando planes...</div> : plans.length ? (
              <div className="plans-grid">{plans.map(plan => <article className="plan-card" key={plan.id}>
                <div className="plan-tag">{plan.category || 'PLAN'}</div><h3>{plan.name}</h3>
                <div className="plan-price">{plan.price_label || (plan.price ? `$${Number(plan.price).toLocaleString('es-CO')}` : 'Consulta el precio')}<small>{plan.billing_period || ''}</small></div>
                {plan.speed && <div className="plan-speed">{plan.speed}</div>}
                <p>{plan.description || 'Conoce los detalles de este servicio.'}</p>
                <a className="button button-primary button-full" href={waLink}>Me interesa <ArrowRight size={17}/></a>
              </article>)}</div>
            ) : <div className="plans-placeholder"><div className="placeholder-icon"><Zap/></div><h3>Próximamente nuestros planes</h3><p>Estamos preparando la información de nuestros paquetes de Internet y televisión. Contáctanos para conocer la disponibilidad.</p><a className="button button-primary" href="#contacto">Consultar planes <ArrowRight size={17}/></a></div>}
          </div>
        </section>

        <section className="coverage-section" id="cobertura">
          <div className="container coverage-grid">
            <div className="coverage-visual"><div className="coverage-ring ring-1"></div><div className="coverage-ring ring-2"></div><div className="coverage-pin"><MapPin size={38}/></div><div className="coverage-label">SAN ALBERTO<br/><small>CESAR · COLOMBIA</small></div></div>
            <div className="coverage-copy"><div className="eyebrow eyebrow-light">ESTAMOS CERCA DE TI</div><h2>Conectando nuestra región con el mundo</h2><p>¿Quieres saber si tenemos cobertura en tu barrio o sector? Escríbenos y nuestro equipo te ayudará a consultar la disponibilidad del servicio.</p><a className="button button-primary" href="#contacto">Consultar cobertura <ArrowRight size={18}/></a></div>
          </div>
        </section>

        <section className="section about-section" id="nosotros"><div className="container about-grid">
          <div><div className="eyebrow">NUESTRA EMPRESA</div><h2>Conectamos personas.<br/><span>Acercamos oportunidades.</span></h2></div>
          <div className="about-copy"><p>Grupo Empresarial Conectando Fronteras trabaja para acercar soluciones de conectividad y entretenimiento a la comunidad de San Alberto, Cesar.</p><p>Queremos ofrecer una experiencia sencilla: información clara, atención cercana y acompañamiento a nuestros usuarios.</p><div className="about-points"><span><Check/> Atención a nuestros usuarios</span><span><Check/> Soluciones de conectividad</span><span><Check/> Compromiso con la región</span></div></div>
        </div></section>

        <section className="contact-section" id="contacto"><div className="container contact-grid">
          <div className="contact-copy"><div className="eyebrow eyebrow-light">HABLEMOS</div><h2>Tu próxima conexión comienza aquí.</h2><p>Déjanos tus datos y cuéntanos qué servicio necesitas. Nuestro equipo se pondrá en contacto contigo.</p><div className="contact-note"><MessageCircle/><span><b>¿Prefieres atención directa?</b><br/>Escríbenos por nuestros canales oficiales.</span></div>{WHATSAPP && <a className="button button-whatsapp" href={waLink} target="_blank" rel="noreferrer"><MessageCircle size={18}/> Hablar por WhatsApp</a>}</div>
          <form className="contact-form" onSubmit={submitRequest}>
            <h3>Solicita información</h3><p>Completa el formulario y nos comunicaremos contigo.</p>
            <label>Nombre completo<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Tu nombre" required /></label>
            <div className="form-row"><label>Teléfono<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Tu número de contacto" required /></label><label>Barrio o sector<input value={form.neighborhood} onChange={e=>setForm({...form,neighborhood:e.target.value})} placeholder="¿Dónde vives?" /></label></div>
            <label>Servicio de interés<select value={form.service} onChange={e=>setForm({...form,service:e.target.value})}><option>Internet</option><option>Televisión</option><option>Internet + Televisión</option><option>Soporte técnico</option><option>Otro</option></select></label>
            <label>Mensaje<textarea rows="3" value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Cuéntanos cómo podemos ayudarte..." /></label>
            {notice && <div className="form-notice" role="status">{notice}</div>}
            <button className="button button-primary button-full" disabled={sending}>{sending ? 'Enviando...' : 'Enviar solicitud'} <ArrowRight size={17}/></button>
            <small className="privacy-note"><ShieldCheck size={13}/> Usaremos tus datos únicamente para atender tu solicitud.</small>
          </form>
        </div></section>
      </main>

      <footer className="footer"><div className="container footer-main"><div className="footer-brand"><img src={LOGO} alt="Conectando Fronteras"/><p>Internet y televisión. Conectividad que nos une.</p></div><div><h4>Explora</h4><a href="#servicios">Servicios</a><a href="#planes">Planes</a><a href="#cobertura">Cobertura</a></div><div><h4>Empresa</h4><a href="#nosotros">Nosotros</a><a href="#contacto">Contáctanos</a></div><div><h4>Ubicación</h4><p><MapPin size={15}/> San Alberto, Cesar, Colombia</p><p className="footer-muted">Pronto agregaremos nuestros canales oficiales de atención.</p></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Grupo Empresarial Conectando Fronteras S.A.S.</span><span>Todos los derechos reservados.</span></div></footer>
      <a className="floating-help" href="#contacto" aria-label="Solicitar información"><MessageCircle/></a>
    </div>
  );
}

export default App;