import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { ArrowLeft, LogOut, Plus, Pencil, Trash2, RefreshCw, ShieldCheck, Wifi, Tv, MessageSquare } from 'lucide-react';

const blankPlan = { name:'', category:'Internet', description:'', speed:'', price:'', price_label:'', billing_period:'/ mes', active:true, sort_order:0 };

export default function Admin() {
  const [session,setSession] = useState(null);
  const [checking,setChecking] = useState(true);
  const [authorized,setAuthorized] = useState(false);
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState('');
  const [tab,setTab] = useState('plans');
  const [plans,setPlans] = useState([]);
  const [leads,setLeads] = useState([]);
  const [loading,setLoading] = useState(false);
  const [editing,setEditing] = useState(null);
  const [plan,setPlan] = useState(blankPlan);
  const [saving,setSaving] = useState(false);

  useEffect(()=>{
    if (!isSupabaseConfigured) { setChecking(false); return; }
    supabase.auth.getSession().then(({data})=>{setSession(data.session);setChecking(false);});
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_event,next)=>setSession(next));
    return ()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    let alive=true;
    async function verify(){
      setAuthorized(false);
      if(!session?.user?.id){return;}
      const {data,error:err}=await supabase.from('admin_users').select('user_id').eq('user_id',session.user.id).maybeSingle();
      if(alive){setAuthorized(Boolean(data && !err)); if(err)setError('No se pudo verificar el permiso administrativo. Revisa las políticas SQL.');}
    }
    verify(); return ()=>{alive=false;};
  },[session]);

  useEffect(()=>{if(authorized) refresh();},[authorized]);

  async function refresh(){
    setLoading(true); setError('');
    const [p,l]=await Promise.all([
      supabase.from('plans').select('*').order('sort_order').order('created_at',{ascending:false}),
      supabase.from('leads').select('*').order('created_at',{ascending:false}).limit(200)
    ]);
    if(p.error || l.error) setError(p.error?.message || l.error?.message || 'No fue posible cargar la información.');
    setPlans(p.data||[]); setLeads(l.data||[]); setLoading(false);
  }

  async function login(e){e.preventDefault();setError(''); if(!isSupabaseConfigured){setError('Falta configurar las variables de Supabase en Vercel.');return;}
    const {error:err}=await supabase.auth.signInWithPassword({email:email.trim(),password});
    if(err)setError('No fue posible iniciar sesión. Verifica el correo y la contraseña.');
  }
  async function logout(){await supabase.auth.signOut();setAuthorized(false);setPlans([]);setLeads([]);}
  function startNew(){setEditing('new');setPlan(blankPlan);setError('');}
  function startEdit(item){setEditing(item.id);setPlan({...item,price:item.price??''});setError('');}
  async function savePlan(e){e.preventDefault();setSaving(true);setError('');
    const payload={...plan,name:plan.name.trim(),price:plan.price===''?null:Number(plan.price),sort_order:Number(plan.sort_order)||0,updated_at:new Date().toISOString()};
    const result=editing==='new'?await supabase.from('plans').insert(payload):await supabase.from('plans').update(payload).eq('id',editing);
    setSaving(false); if(result.error){setError(result.error.message);return;} setEditing(null);setPlan(blankPlan);refresh();
  }
  async function deletePlan(id){if(!confirm('¿Eliminar este plan?'))return;const {error:err}=await supabase.from('plans').delete().eq('id',id);if(err)setError(err.message);else refresh();}
  async function updateLead(id,status){const {error:err}=await supabase.from('leads').update({status}).eq('id',id);if(err)setError(err.message);else setLeads(old=>old.map(x=>x.id===id?{...x,status}:x));}

  return <div className="admin-shell">
    <header className="admin-top"><a href="/" className="admin-brand"><img src="https://cdn.imagetourls.com/uploads/tyImg/DI0JAuOh.png" alt="Conectando Fronteras"/><span>Panel administrativo</span></a>
      {session && <button className="admin-logout" onClick={logout}><LogOut size={16}/> Cerrar sesión</button>}
    </header>
    {checking ? <div className="admin-loading">Verificando sesión…</div> : !session ? <main className="admin-login-wrap"><form className="admin-login" onSubmit={login}><div className="admin-lock"><ShieldCheck size={28}/></div><p className="admin-kicker">ÁREA PRIVADA</p><h1>Ingreso administrativo</h1><p>Accede con el usuario autorizado de Conectando Fronteras.</p>
      <label>Correo electrónico<input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="admin@empresa.com"/></label>
      <label>Contraseña<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Tu contraseña"/></label>
      {error && <div className="admin-error">{error}</div>}<button className="admin-primary" type="submit">Ingresar al panel</button><a href="/" className="admin-back"><ArrowLeft size={15}/> Volver al sitio web</a>
      {!isSupabaseConfigured && <div className="admin-error">Supabase todavía no está configurado en este despliegue.</div>}
    </form></main> : !authorized ? <main className="admin-login-wrap"><div className="admin-login"><div className="admin-lock"><ShieldCheck size={28}/></div><h1>Acceso no autorizado</h1><p>La cuenta inició sesión, pero todavía no tiene permisos de administrador.</p>{error&&<div className="admin-error">{error}</div>}<p>Agrega el UUID de este usuario a la tabla <b>admin_users</b> en Supabase.</p><button className="admin-primary" onClick={logout}>Cerrar sesión</button></div></main> : <main className="admin-content">
      <div className="admin-welcome"><div><p className="admin-kicker">GESTIÓN DEL SITIO WEB</p><h1>Hola, administrador</h1><p>Administra los planes y las solicitudes de tus clientes.</p></div><button className="admin-refresh" onClick={refresh}><RefreshCw size={16}/> Actualizar</button></div>
      {error&&<div className="admin-error admin-wide">{error}</div>}
      <div className="admin-tabs"><button className={tab==='plans'?'selected':''} onClick={()=>{setTab('plans');setEditing(null);}}><Wifi size={17}/> Planes ({plans.length})</button><button className={tab==='leads'?'selected':''} onClick={()=>{setTab('leads');setEditing(null);}}><MessageSquare size={17}/> Solicitudes ({leads.length})</button></div>
      {tab==='plans' ? <section className="admin-panel"><div className="admin-panel-head"><div><h2>Planes y servicios</h2><p>Publica, edita, ordena o desactiva los planes que aparecen en la página.</p></div><button className="admin-primary admin-add" onClick={startNew}><Plus size={17}/> Nuevo plan</button></div>
        {editing!==null && <form className="admin-plan-form" onSubmit={savePlan}><h3>{editing==='new'?'Crear plan':'Editar plan'}</h3><div className="admin-form-grid">
          <label>Nombre del plan<input value={plan.name} onChange={e=>setPlan({...plan,name:e.target.value})} required/></label>
          <label>Tipo de servicio<select value={plan.category} onChange={e=>setPlan({...plan,category:e.target.value})}><option>Internet</option><option>Televisión</option><option>Internet + Televisión</option><option>Empresarial</option></select></label>
          <label>Velocidad / detalle<input value={plan.speed||''} onChange={e=>setPlan({...plan,speed:e.target.value})} placeholder="Ej. 300 Mbps"/></label>
          <label>Precio numérico<input type="number" min="0" value={plan.price} onChange={e=>setPlan({...plan,price:e.target.value})} placeholder="Sin separadores"/></label>
          <label>Texto del precio<input value={plan.price_label||''} onChange={e=>setPlan({...plan,price_label:e.target.value})} placeholder="Ej. Desde $..."/></label>
          <label>Periodo de cobro<input value={plan.billing_period||''} onChange={e=>setPlan({...plan,billing_period:e.target.value})} placeholder="/ mes"/></label>
          <label>Orden de aparición<input type="number" value={plan.sort_order??0} onChange={e=>setPlan({...plan,sort_order:e.target.value})}/></label>
          <label className="admin-check"><input type="checkbox" checked={Boolean(plan.active)} onChange={e=>setPlan({...plan,active:e.target.checked})}/> Publicar este plan en la página</label>
          <label className="admin-full">Descripción<textarea rows="3" value={plan.description||''} onChange={e=>setPlan({...plan,description:e.target.value})}/></label>
        </div><div className="admin-form-actions"><button type="button" className="admin-secondary" onClick={()=>setEditing(null)}>Cancelar</button><button className="admin-primary" disabled={saving}>{saving?'Guardando…':'Guardar plan'}</button></div></form>}
        {loading?<p className="admin-empty">Cargando planes…</p>:plans.length===0?<p className="admin-empty">Todavía no hay planes registrados. Usa “Nuevo plan” para agregar el primero.</p>:<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Plan</th><th>Precio</th><th>Estado</th><th>Orden</th><th>Acciones</th></tr></thead><tbody>{plans.map(p=><tr key={p.id}><td><b>{p.name}</b><small>{p.category} {p.speed?`· ${p.speed}`:''}</small></td><td>{p.price_label||(p.price!=null?`$${Number(p.price).toLocaleString('es-CO')}`:'Consultar')}{p.billing_period||''}</td><td><span className={p.active?'admin-status on':'admin-status off'}>{p.active?'Publicado':'Oculto'}</span></td><td>{p.sort_order}</td><td><div className="admin-actions"><button title="Editar" onClick={()=>startEdit(p)}><Pencil size={16}/></button><button title="Eliminar" onClick={()=>deletePlan(p.id)}><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div>}
      </section> : <section className="admin-panel"><div className="admin-panel-head"><div><h2>Solicitudes de clientes</h2><p>Consulta los contactos recibidos desde el formulario de la página.</p></div></div>
        {loading?<p className="admin-empty">Cargando solicitudes…</p>:leads.length===0?<p className="admin-empty">Aún no se han recibido solicitudes.</p>:<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Cliente</th><th>Contacto</th><th>Servicio</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>{leads.map(l=><tr key={l.id}><td><b>{l.name}</b><small>{l.neighborhood||'Sin barrio indicado'}</small>{l.message&&<small>{l.message}</small>}</td><td>{l.phone}</td><td>{l.service}</td><td>{new Date(l.created_at).toLocaleString('es-CO')}</td><td><select className="admin-status-select" value={l.status||'new'} onChange={e=>updateLead(l.id,e.target.value)}><option value="new">Nueva</option><option value="contacted">Contactada</option><option value="closed">Cerrada</option></select></td></tr>)}</tbody></table></div>}
      </section>}
      <p className="admin-security"><ShieldCheck size={15}/> Panel privado. Las operaciones se validan mediante políticas de seguridad de Supabase.</p>
    </main>}
  </div>;
}
