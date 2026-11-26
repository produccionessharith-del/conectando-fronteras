import React, { useEffect, useState } from 'react';
import {
  ArrowRight, Check, Facebook, Instagram, MapPin, Menu, MessageCircle,
  RadioTower, ShieldCheck, Tv, Wifi, X, Zap
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import Admin from './Admin.jsx';

const LOGO = 'https://cdn.phototourl.com/member/2026-11-26-264324ed-f326-40f1-a9c6-d9e2984dd936.png';
const NAV_FALLBACK = [['Inicio','/'],['Internet','/internet'],['Televisión','/television'],['Planes','/planes'],['Cobertura','/cobertura'],['Nosotros','/nosotros'],['Contacto','/contacto']];

function usePublicPages() {
  const [items,setItems] = useState(NAV_FALLBACK);
  useEffect(() => { let alive=true; if (!isSupabaseConfigured) return; supabase.from('site_pages').select('label,slug,nav_order').eq('published',true).eq('nav_visible',true).order('nav_order').then(({data}) => { if(alive && data?.length) setItems(data.map(x=>[x.label,x.slug])); }); return () => {alive=false;}; }, []);
  return items;
}

function useSiteSettings() {
  const [settings,setSettings]=useState({logo_url:LOGO,tagline:'Internet y televisión. Conectividad que nos une.',address:'Calle 4 #4-47, San Alberto, Cesar, Colombia',banner_url:'',whatsapp:'573172437825',phone:'',email:'',facebook_url:'',instagram_url:''});
  useEffect(()=>{let alive=true;if(!isSupabaseConfigured)return;supabase.from('site_settings').select('key,value').then(({data})=>{if(alive&&data?.length){const next={...settings};data.forEach(x=>next[x.key]=x.value??'');setSettings(next);}});return()=>{alive=false;};},[]);
  return settings;
}

function usePageContent(slug) {
  const [content,setContent] = useState(null);
  useEffect(() => { let alive=true; if(!isSupabaseConfigured) return; supabase.from('site_pages').select('*').eq('slug',slug).eq('published',true).maybeSingle().then(({data})=>{if(alive && data)setContent(data);}); return ()=>{alive=false;}; },[slug]);
  return content;
}

function currentPath() {
  const path = window.location.pathname.replace(/\/+$/, '');
  return path || '/';
}

function usePublicBanners() {
  const [banners,setBanners]=useState([]);
  useEffect(()=>{let alive=true;if(!isSupabaseConfigured)return;supabase.from('ad_banners').select('id,title,image_url,link_url,start_date,end_date,active,sort_order').eq('active',true).order('sort_order').then(({data})=>{if(alive&&data){const today=new Date();today.setHours(0,0,0,0);setBanners(data.filter(b=>{const start=!b.start_date||new Date(`${b.start_date}T00:00:00`)<=today;const end=!b.end_date||new Date(`${b.end_date}T23:59:59`)>today;return start&&end;}));}});return()=>{alive=false;};},[]);
  return banners;
}

function AdBanner({settings}) {
  const banners=usePublicBanners();
  if(banners.length) return <div className="ad-banner-wrap"><div className="ad-banner-gallery">{banners.map(b=><div className="ad-banner" key={b.id}>{b.link_url?<a href={b.link_url} target="_blank" rel="noreferrer" aria-label={b.title||'Publicidad'}><img src={b.image_url} alt={b.title||'Banner publicitario'}/></a>:<img src={b.image_url} alt={b.title||'Banner publicitario'}/>}</div>)}</div></div>;
  return <div className="ad-banner-wrap"><div className="ad-banner">{settings.banner_url ? <a href={settings.banner_link || '#'} target={settings.banner_link ? '_blank' : undefined} rel={settings.banner_link ? 'noreferrer' : undefined} aria-label="Publicidad"><img src={settings.banner_url} alt="Banner publicitario"/></a> : <div className="ad-banner-empty"><strong>ESPACIO PUBLICITARIO</strong><span>Banner recomendado: 1050 × 250 px</span></div>}</div></div>;
}

function Header({ path }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const NAV = usePublicPages();
  const settings = useSiteSettings();
  return <>
    <div className="topline"><div className="container topline-inner"><span><MapPin size={14}/> {settings.address || 'San Alberto, Cesar, Colombia'}</span><span className="topline-right">Conectamos hogares, acercamos personas</span></div></div>
    <header className="header"><div className="container nav-wrap">
      <a className="brand" href="/" aria-label="Conectando Fronteras, inicio"><img src={settings.logo_url || LOGO} alt="Logo Grupo Empresarial Conectando Fronteras" /></a>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menú">{menuOpen ? <X/> : <Menu/>}</button>
      <nav className={menuOpen ? 'nav nav-open' : 'nav'}>
        {NAV.map(([label, href]) => <a key={href} className={path === href ? 'active' : ''} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
        <a className="nav-cta" href="/contacto" onClick={() => setMenuOpen(false)}>Contáctanos <ArrowRight size={16}/></a>
      </nav>
    </div></header>
  </>;
}

function PageHero({ slug, kicker, title, text }) {
  const cms = usePageContent(slug);
  return <section className="page-hero"><div className="container"><div className="eyebrow eyebrow-light">{cms?.hero_kicker || kicker}</div><h1>{cms?.hero_title || title}</h1><p>{cms?.hero_text || text}</p></div></section>;
}

function HomePage() {
  const cms = usePageContent('/');
  return <>
    <section className="hero"><div className="hero-glow glow-one"></div><div className="hero-glow glow-two"></div><div className="container hero-grid">
      <div className="hero-copy"><div className="eyebrow"><span className="pulse"></span> {cms?.hero_kicker || 'CONECTIVIDAD PARA TU HOGAR Y NEGOCIO'}</div><h1>{cms?.hero_title || <>El mundo más cerca.<br/><span>Conectados contigo.</span></>}</h1><p className="hero-text">{cms?.hero_text || 'Internet y entretenimiento para que disfrutes, trabajes, aprendas y compartas sin fronteras.'}</p><div className="hero-actions"><a className="button button-primary" href="/planes">Conoce nuestros planes <ArrowRight size={18}/></a><a className="button button-ghost" href="/servicios">Conoce nuestros servicios</a></div><div className="hero-proof"><span><ShieldCheck size={17}/> Atención cercana</span><span><Zap size={17}/> Tecnología y conectividad</span></div></div>
      <div className="hero-art" aria-label="Ilustración de conectividad"><div className="orbit orbit-a"></div><div className="orbit orbit-b"></div><div className="signal signal-a"><Wifi size={25}/><span>INTERNET</span></div><div className="signal signal-b"><Tv size={25}/><span>TELEVISIÓN</span></div><div className="signal signal-c"><RadioTower size={25}/><span>CONECTIVIDAD</span></div><div className="central-globe"><div className="globe-lines"></div><div className="globe-core"><Wifi size={65}/></div></div><div className="art-caption"><span className="caption-dot"></span> Una conexión que nos une</div></div>
    </div><div className="hero-bottom"><div className="container hero-bottom-inner"><span>GRUPO EMPRESARIAL</span><b>CONECTANDO FRONTERAS</b><span>SAN ALBERTO · CESAR</span></div></div></section>
    <section className="service-strip"><div className="container service-grid">
      <article className="service-card"><div className="service-icon"><Wifi/></div><div><h3>Internet</h3><p>Conectividad para estudiar, trabajar y disfrutar.</p></div><a href="/internet" aria-label="Ver Internet"><ArrowRight/></a></article>
      <article className="service-card"><div className="service-icon"><Tv/></div><div><h3>Televisión</h3><p>Entretenimiento para compartir en familia.</p></div><a href="/television" aria-label="Ver televisión"><ArrowRight/></a></article>
      <article className="service-card"><div className="service-icon"><RadioTower/></div><div><h3>Atención al usuario</h3><p>Estamos para acompañarte y ayudarte.</p></div><a href="/contacto" aria-label="Contactar"><ArrowRight/></a></article>
    </div></section>
    <section className="section plans-section"><div className="container"><div className="section-heading"><div className="eyebrow eyebrow-light">ENCUENTRA TU CONEXIÓN</div><h2>{cms?.section_title || 'Planes pensados para ti'}</h2><p>{cms?.section_text || 'Conoce nuestras opciones y encuentra el servicio ideal para tu hogar o negocio.'}</p><a className="button button-primary" href="/planes">Ver planes <ArrowRight size={17}/></a></div></div></section>
    <section className="coverage-section"><div className="container coverage-grid"><CoverageVisual/><div className="coverage-copy"><div className="eyebrow eyebrow-light">ESTAMOS CERCA DE TI</div><h2>Conectando nuestra región con el mundo</h2><p>Consulta si tenemos cobertura en tu barrio o sector.</p><a className="button button-primary" href="/cobertura">Consultar cobertura <ArrowRight size={18}/></a></div></div></section>
  </>;
}

function CoverageVisual() { return <div className="coverage-visual"><div className="coverage-ring ring-1"></div><div className="coverage-ring ring-2"></div><div className="coverage-pin"><MapPin size={38}/></div><div className="coverage-label">SAN ALBERTO<br/><small>CESAR · COLOMBIA</small></div></div>; }

function ServicePage({ type }) {
  const internet = type === 'internet';
  const cms = usePageContent(internet ? '/internet' : '/television');
  return <><PageHero slug={internet ? "/internet" : "/television"} kicker={internet ? 'INTERNET PARA TU DÍA A DÍA' : 'ENTRETENIMIENTO PARA COMPARTIR'} title={internet ? 'Internet que te conecta con lo que importa.' : 'Televisión para disfrutar en familia.'} text={internet ? 'Conectividad para estudiar, trabajar, emprender y disfrutar tus contenidos favoritos.' : 'Una opción de entretenimiento para acompañar los momentos de tu hogar.'}/>
    <section className="section"><div className="container detail-grid"><div className="detail-icon">{internet ? <Wifi size={52}/> : <Tv size={52}/>}</div><div><div className="eyebrow">NUESTROS SERVICIOS</div><h2>{cms?.section_title || (internet ? 'Conexión para tus actividades' : 'Disfruta tus contenidos')}</h2><p>{cms?.section_text || (internet ? 'Queremos acercarte a una experiencia de conexión práctica para las necesidades de tu hogar y negocio. Consulta disponibilidad y alternativas según tu sector.' : 'Conoce las alternativas de televisión disponibles en tu zona. Nuestro equipo puede orientarte sobre cobertura, características y condiciones del servicio.')}</p><div className="about-points"><span><Check/> Atención cercana</span><span><Check/> Información clara</span><span><Check/> Consulta de disponibilidad</span></div><a className="button button-primary" href="/contacto">Solicitar información <ArrowRight size={17}/></a></div></div></section>
  </>;
}

function PlansPage() {
  const cms = usePageContent('/planes');
  const settings = useSiteSettings();
  const whatsapp = (settings.whatsapp || '').replace(/\\D/g, '');
  const [plans, setPlans] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { let alive = true; async function load() { if (!isSupabaseConfigured) { setLoading(false); return; } const { data, error } = await supabase.from('plans').select('*').eq('active', true).order('sort_order'); if (alive && !error && data) setPlans(data); if (alive) setLoading(false); } load(); return () => { alive = false; }; }, []);
  const wa = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola, quiero información sobre los planes de Conectando Fronteras.')}` : '/contacto';
  return <><PageHero slug="/planes" kicker="ENCUENTRA TU CONEXIÓN" title="Planes para tu hogar y negocio." text="Consulta las opciones disponibles y encuentra el servicio que mejor se adapte a tus necesidades."/><section className="section plans-section"><div className="container">{loading ? <div className="empty-plans">Cargando planes...</div> : plans.length ? <div className="plans-grid">{plans.map(plan => <article className="plan-card" key={plan.id}><div className="plan-tag">{plan.category || 'PLAN'}</div><h3>{plan.name}</h3><div className="plan-price">{plan.price_label || (plan.price ? `$${Number(plan.price).toLocaleString('es-CO')}` : 'Consulta el precio')}<small>{plan.billing_period || ''}</small></div>{plan.speed && <div className="plan-speed">{plan.speed}</div>}<p>{plan.description || 'Conoce los detalles de este servicio.'}</p><a className="button button-primary button-full" href={wa}>Me interesa <ArrowRight size={17}/></a></article>)}</div> : <div className="plans-placeholder"><div className="placeholder-icon"><Zap/></div><h3>{cms?.section_title || 'Próximamente nuestros planes'}</h3><p>{cms?.section_text || 'Estamos preparando la información de nuestros paquetes de Internet y televisión. Contáctanos para conocer la disponibilidad.'}</p><a className="button button-primary" href="/contacto">Consultar planes <ArrowRight size={17}/></a></div>}</div></section></>;
}

function CoveragePage() { const cms=usePageContent('/cobertura'); return <><PageHero slug="/cobertura" kicker="ESTAMOS CERCA DE TI" title="Consulta nuestra cobertura." text="Queremos llevar conectividad a más hogares y negocios de nuestra región. Pregúntanos por tu barrio o sector."/><section className="coverage-section"><div className="container coverage-grid"><CoverageVisual/><div className="coverage-copy"><div className="eyebrow eyebrow-light">SAN ALBERTO · CESAR</div><h2>{cms?.section_title || '¿Llegamos hasta tu hogar?'}</h2><p>{cms?.section_text || 'Cuéntanos dónde necesitas el servicio. Nuestro equipo te ayudará a consultar la disponibilidad de cobertura.'}</p><a className="button button-primary" href="/contacto">Consultar mi sector <ArrowRight size={18}/></a></div></div></section></>; }

function AboutPage() { const cms=usePageContent('/nosotros'); return <><PageHero slug="/nosotros" kicker="NUESTRA EMPRESA" title="Conectamos personas. Acercamos oportunidades." text="Somos Grupo Empresarial Conectando Fronteras S.A.S., una empresa orientada a acercar soluciones de conectividad y entretenimiento a nuestra comunidad."/><section className="section about-section"><div className="container about-grid"><div><div className="eyebrow">NUESTRO COMPROMISO</div><h2>{cms?.section_title || 'Conectividad con sentido de región.'}</h2></div><div className="about-copy"><p>{cms?.section_text || 'Trabajamos para acercar soluciones de conectividad y entretenimiento a la comunidad de San Alberto, Cesar.'}</p><p>Queremos ofrecer una experiencia sencilla: información clara, atención cercana y acompañamiento a nuestros usuarios.</p><div className="about-points"><span><Check/> Atención a nuestros usuarios</span><span><Check/> Soluciones de conectividad</span><span><Check/> Compromiso con la región</span></div></div></div></section></>; }

function ContactPage() {
  const cms=usePageContent('/contacto');
  const settings=useSiteSettings(); const whatsapp=(settings.whatsapp||'').replace(/\\D/g,'');
  const [form, setForm] = useState({ name: '', phone: '', neighborhood: '', service: 'Internet', message: '' });
  const [sending, setSending] = useState(false); const [notice, setNotice] = useState('');
  async function submitRequest(e) { e.preventDefault(); setNotice(''); if (!form.name.trim() || !form.phone.trim()) { setNotice('Por favor completa tu nombre y teléfono.'); return; } if (!isSupabaseConfigured) { setNotice('El formulario aún no está conectado. Por favor contáctanos por nuestros canales oficiales.'); return; } setSending(true); const { error } = await supabase.from('leads').insert([form]); setSending(false); if (error) setNotice('No pudimos enviar tu solicitud. Intenta nuevamente o contáctanos.'); else { setNotice('¡Solicitud recibida! Nuestro equipo se pondrá en contacto contigo.'); setForm({ name: '', phone: '', neighborhood: '', service: 'Internet', message: '' }); } }
  return <><PageHero slug="/contacto" kicker="HABLEMOS" title="Tu próxima conexión comienza aquí." text="Déjanos tus datos y cuéntanos qué servicio necesitas. Nuestro equipo se pondrá en contacto contigo."/><section className="contact-section"><div className="container contact-grid"><div className="contact-copy"><div className="eyebrow eyebrow-light">ATENCIÓN AL USUARIO</div><h2>{cms?.section_title || 'Estamos para ayudarte.'}</h2><p>{cms?.section_text || 'Escríbenos para consultar planes, cobertura o resolver tus inquietudes.'}</p><div className="contact-note"><MessageCircle/><span><b>Atención cercana</b><br/>Cuéntanos cómo podemos ayudarte.</span></div>{whatsapp && <a className="button button-whatsapp" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola, quiero información sobre los servicios de Internet y televisión de Conectando Fronteras.')}`} target="_blank" rel="noreferrer"><MessageCircle size={18}/> Hablar por WhatsApp</a>}</div>
    <form className="contact-form" onSubmit={submitRequest}><h3>Solicita información</h3><p>Completa el formulario y nos comunicaremos contigo.</p><label>Nombre completo<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Tu nombre" required/></label><div className="form-row"><label>Teléfono<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Tu número de contacto" required/></label><label>Barrio o sector<input value={form.neighborhood} onChange={e=>setForm({...form,neighborhood:e.target.value})} placeholder="¿Dónde vives?"/></label></div><label>Servicio de interés<select value={form.service} onChange={e=>setForm({...form,service:e.target.value})}><option>Internet</option><option>Televisión</option><option>Internet + Televisión</option><option>Soporte técnico</option><option>Otro</option></select></label><label>Mensaje<textarea rows="3" value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Cuéntanos cómo podemos ayudarte..."/></label>{notice && <div className="form-notice" role="status">{notice}</div>}<button className="button button-primary button-full" disabled={sending}>{sending ? 'Enviando...' : 'Enviar solicitud'} <ArrowRight size={17}/></button><small className="privacy-note"><ShieldCheck size={13}/> Usaremos tus datos únicamente para atender tu solicitud.</small></form>
  </div></section></>;
}

function WhatsAppFloat() { const settings=useSiteSettings(); const number=(settings.whatsapp||'').replace(/\\D/g,''); if(!number)return null; return <a className="floating-whatsapp" href={`https://wa.me/${number}?text=${encodeURIComponent('Hola, quiero información sobre los servicios de Internet y televisión de Conectando Fronteras.')}`} target="_blank" rel="noreferrer" aria-label="Chatear por WhatsApp"><MessageCircle/><span>WhatsApp</span></a>; }

function Footer() { const settings=useSiteSettings(); return <footer className="footer"><div className="container footer-main"><div className="footer-brand"><img src={settings.logo_url || LOGO} alt="Conectando Fronteras"/><p>{settings.tagline || 'Internet y televisión. Conectividad que nos une.'}</p></div><div><h4>Explora</h4><a href="/internet">Internet</a><a href="/television">Televisión</a><a href="/planes">Planes</a><a href="/cobertura">Cobertura</a></div><div><h4>Empresa</h4><a href="/nosotros">Nosotros</a><a href="/contacto">Contáctanos</a><a href="/admin">Panel administrativo</a></div><div><h4>Ubicación</h4><p><MapPin size={15}/> {settings.address || 'San Alberto, Cesar, Colombia'}</p>{settings.phone && <p>{settings.phone}</p>}{settings.email && <p>{settings.email}</p>}</div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Grupo Empresarial Conectando Fronteras S.A.S.</span><span>Todos los derechos reservados.</span></div></footer>; }

function DynamicPage({slug}) { const cms=usePageContent(slug); if(!cms) return <NotFound/>; return <><PageHero slug={slug} kicker={cms.hero_kicker || cms.label} title={cms.hero_title || cms.label} text={cms.hero_text || ''}/><section className="section"><div className="container about-section"><div className="eyebrow">{cms.label}</div><h2>{cms.section_title || cms.label}</h2><p>{cms.section_text || ''}</p><a className="button button-primary" href="/contacto">Solicitar información <ArrowRight size={17}/></a></div></section></>; }

function NotFound() { return <section className="section"><div className="container not-found"><div className="eyebrow">PÁGINA NO ENCONTRADA</div><h1>Esta dirección no está disponible.</h1><p>Verifica la dirección o regresa al inicio.</p><a className="button button-primary" href="/">Volver al inicio <ArrowRight size={17}/></a></div></section>; }

export default function App() {
  const path = currentPath();
  const siteSettings = useSiteSettings();
  if (path === '/admin' || path.startsWith('/admin/')) return <Admin/>;
  let page;
  switch (path) {
    case '/': page = <HomePage/>; break;
    case '/internet': page = <ServicePage type="internet"/>; break;
    case '/television': page = <ServicePage type="television"/>; break;
    case '/planes': page = <PlansPage/>; break;
    case '/cobertura': page = <CoveragePage/>; break;
    case '/nosotros': page = <AboutPage/>; break;
    case '/contacto': page = <ContactPage/>; break;
    case '/servicios': page = <><PageHero slug="/servicios" kicker="NUESTROS SERVICIOS" title="Soluciones para estar conectados." text="Conoce nuestras opciones de Internet y televisión."/><section className="service-strip"><div className="container service-grid"><article className="service-card"><div className="service-icon"><Wifi/></div><div><h3>Internet</h3><p>Conectividad para tu hogar y negocio.</p></div><a href="/internet"><ArrowRight/></a></article><article className="service-card"><div className="service-icon"><Tv/></div><div><h3>Televisión</h3><p>Entretenimiento para compartir.</p></div><a href="/television"><ArrowRight/></a></article></div></section></>; break;
    default: page = <DynamicPage slug={path}/>;
  }
  return <div><Header path={path}/><AdBanner settings={siteSettings}/><main>{page}</main><Footer/><WhatsAppFloat/></div>;
}
