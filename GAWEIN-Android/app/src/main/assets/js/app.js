(() => {
'use strict';
const $ = s => document.querySelector(s);
const money = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)||0);
const seed = [
 {id:1,title:'Operator Produksi',category:'Lainnya',location:'Belitung',budget:3500000,period:'/bulan',description:'Dibutuhkan operator produksi. Pengalaman menjadi nilai tambah.',offers:[],status:'Terbuka'},
 {id:2,title:'Tukang Bangunan',category:'Perbaikan',location:'Manggar',budget:100000,period:'/hari',description:'Membutuhkan tenaga tukang untuk pekerjaan bangunan.',offers:[],status:'Terbuka'},
 {id:3,title:'Bersihkan Rumah',category:'Kebersihan',location:'Tanjungpandan',budget:250000,period:'/pekerjaan',description:'Pembersihan rumah dan halaman.',offers:[],status:'Terbuka'}
];
let jobs;
try { jobs = JSON.parse(localStorage.getItem('gawein_jobs') || 'null') || seed; } catch(e) { jobs = seed; }
jobs = jobs.map(j => ({...j, offers:Array.isArray(j.offers)?j.offers:[], period:j.period||'/pekerjaan'}));
let role = localStorage.getItem('gawein_role') || 'Pekerja';
if(!['Pekerja','Pemberi Kerja','Admin'].includes(role)) role='Pekerja';
let activeJobId = null;

function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function persist(){localStorage.setItem('gawein_jobs',JSON.stringify(jobs));}
function show(html){$('#modalContent').innerHTML=html;$('#modalBackdrop').hidden=false;}
function close(){ $('#modalBackdrop').hidden=true; }
function counts(){
 return {all:jobs.length,open:jobs.filter(j=>j.status==='Terbuka').length,offers:jobs.reduce((n,j)=>n+j.offers.length,0),done:jobs.filter(j=>j.status==='Disepakati').length};
}
const config = {
 'Pekerja': {
  cls:'role-worker',title:'Cari pekerjaan',subtitle:'Peluang kerja untuk Anda',icon:'👷',stats:[['⌕','Lowongan', 'open'],['✉','Penawaran saya','myOffers'],['✓','Diterima','myAccepted']],
  menus:[['⌕','Cari kerja','jobs'],['✉','Penawaran saya','myOffers'],['♡','Favorit','favorites'],['◉','Profil','profile']],
  heroTitle:'Temukan pekerjaan <em>terbaik.</em>',heroText:'Cari peluang, ajukan upah, dan negosiasikan harga.',heroIcon:'👷',listTitle:'Lowongan terbaru',listText:'Pilih pekerjaan yang sesuai dengan keahlian Anda.'
 },
 'Pemberi Kerja': {
  cls:'role-employer',title:'Kelola rekrutmen',subtitle:'Temukan tenaga kerja yang tepat',icon:'🏢',stats:[['▣','Lowongan saya','myJobs'],['♙','Pelamar','offers'],['✓','Disepakati','done']],
  menus:[['＋','Pasang lowongan','post'],['▣','Lowongan saya','myJobs'],['♙','Pelamar','offers'],['⇄','Negosiasi','negotiation']],
  heroTitle:'Temukan tenaga kerja <em>terbaik.</em>',heroText:'Pasang lowongan dan pilih pekerja sesuai kebutuhan.',heroIcon:'🤝',listTitle:'Lowongan saya',listText:'Pantau lowongan dan penawaran dari pekerja.'
 },
 'Admin': {
  cls:'role-admin',title:'Ringkasan sistem',subtitle:'Pemantauan GAWEIN',icon:'🛡️',stats:[['▣','Total lowongan','all'],['●','Masih terbuka','open'],['⇄','Penawaran','offers'],['✓','Disepakati','done']],
  menus:[['▣','Lowongan','jobs'],['♙','Pengguna','users'],['⇄','Negosiasi','negotiation'],['⚑','Pengaduan','complaints'],['▤','Laporan','reports'],['⚙','Pengaturan','settings']],
  heroTitle:'Pantau GAWEIN <em>dengan mudah.</em>',heroText:'Ringkasan aktivitas platform dalam satu tempat.',heroIcon:'🛡️',listTitle:'Semua lowongan',listText:'Pantau daftar pekerjaan yang tersimpan pada perangkat.'
 }
};
function statValue(key,c){
 if(key==='myJobs') return jobs.length;
 if(key==='myOffers') return jobs.reduce((n,j)=>n+j.offers.filter(o=>o.from==='Pekerja').length,0);
 if(key==='myAccepted') return jobs.reduce((n,j)=>n+j.offers.filter(o=>o.from==='Pekerja'&&o.state==='Disetujui').length,0);
 return c[key]??0;
}
function renderDashboard(){
 const c=config[role], n=counts();
 document.body.className=c.cls;
 $('#roleToggle').textContent='Mode: '+role+' ▾';
 $('#heroTitle').innerHTML=c.heroTitle; $('#heroText').textContent=c.heroText; $('#heroIcon').textContent=c.heroIcon;
 $('#listTitle').textContent=c.listTitle; $('#listText').textContent=c.listText;
 $('#newJobBtn').style.display=role==='Pemberi Kerja'?'inline-flex':'none';
 $('#heroAction').textContent=role==='Pemberi Kerja'?'＋ Pasang lowongan':'⌕ '+(role==='Admin'?'Lihat lowongan':'Cari pekerjaan');
 $('#heroAction').href=role==='Pemberi Kerja'?'#jobs':'#jobs';
 $('#heroAction').onclick=role==='Pemberi Kerja'?(e)=>{e.preventDefault();newJobForm();}:null;
 $('#hero').style.display=role==='Admin'?'none':'grid';
 $('#how').style.display=role==='Admin'?'none':'block';
 $('#navPost').style.display=role==='Pemberi Kerja'?'':'none';

 const stats=c.stats.map(([ico,label,key])=>`<div class="stat-card"><span class="stat-icon">${ico}</span><div><b>${statValue(key,n)}</b><small>${label}</small></div></div>`).join('');
 const menus=c.menus.map(([ico,label,action])=>`<button class="dash-menu-item" data-action="${action}"><span>${ico}</span><b>${label}</b></button>`).join('');
 $('#roleDashboard').innerHTML=`
  <div class="dash-top"><div><span class="eyebrow">RUANG KERJA GAWEIN</span><h2>${c.title}</h2><p>${c.subtitle}</p></div><span class="role-badge">${c.icon} ${role}</span></div>
  <div class="stat-grid">${stats}</div>
  <div class="dash-menu">${menus}</div>
  ${role==='Admin'?'<div class="admin-note">ⓘ Data prototype tersimpan lokal di perangkat.</div>':''}`;
 $('#roleDashboard').querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>menuAction(b.dataset.action)));
}
function menuAction(action){
 if(action==='post'){newJobForm();return;}
 if(action==='jobs'||action==='myJobs'){ $('#jobs').scrollIntoView({behavior:'smooth'});return;}
 if(action==='myOffers'||action==='offers'||action==='negotiation'){showOffers();return;}
 const labels={favorites:'Favorit',profile:'Profil',users:'Pengguna',complaints:'Pengaduan',reports:'Laporan',settings:'Pengaturan'};
 show(`<span class="eyebrow">GAWEIN</span><h2 id="modalTitle">${labels[action]||action}</h2><div class="notice">Bagian ini masih berupa tampilan awal. Fitur dan penyimpanan online perlu diaktifkan pada tahap pengembangan berikutnya.</div><button class="btn btn-primary" id="doneBtn">Tutup</button>`);
 $('#doneBtn').onclick=close;
}
function renderJobs(){
 const q=$('#searchInput').value.trim().toLowerCase(),cat=$('#categoryFilter').value;
 let list=jobs.filter(j=>(j.title+' '+j.location+' '+j.description).toLowerCase().includes(q)&&(!cat||j.category===cat));
 if(role==='Pemberi Kerja') list=jobs;
 $('#jobList').innerHTML=list.length?list.map(j=>`
 <article class="job-card">
  <div class="job-card-top"><span class="tag">${esc(j.category)}</span><span class="status ${j.status==='Disepakati'?'done':''}">${esc(j.status)}</span></div>
  <h3>${esc(j.title)}</h3><p class="job-location">⌖ ${esc(j.location)}</p><p>${esc(j.description)}</p>
  <div class="job-bottom"><div><small>Upah / budget</small><b>${money(j.budget)}${esc(j.period)}</b></div><button class="btn btn-card" data-open="${j.id}">${role==='Pekerja'?'Ajukan upah':role==='Pemberi Kerja'?'Kelola':'Pantau'} →</button></div>
  <small class="offer-count">${j.offers.length} penawaran</small>
 </article>`).join(''):'<div class="empty">Belum ada lowongan yang cocok.</div>';
 $('#jobList').querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>openJob(Number(b.dataset.open))));
}
function render(){renderDashboard();renderJobs();}
function newJobForm(){
 if(role!=='Pemberi Kerja'){show('<h2>Mode Pemberi Kerja</h2><p>Ganti mode melalui tombol di bagian atas untuk memasang lowongan.</p>');return;}
 show(`<span class="eyebrow">LOWONGAN BARU</span><h2 id="modalTitle">Pasang lowongan</h2>
 <form id="jobForm">
  <div class="field"><label>Nama pekerjaan</label><input name="title" required placeholder="Contoh: Operator produksi"></div>
  <div class="field"><label>Kategori</label><select name="category"><option>Perbaikan</option><option>Kebersihan</option><option>Desain</option><option>Transportasi</option><option>Lainnya</option></select></div>
  <div class="field"><label>Lokasi</label><input name="location" required placeholder="Kota atau area"></div>
  <div class="field"><label>Upah / budget (Rp)</label><input name="budget" type="number" min="1" required placeholder="500000"></div>
  <div class="field"><label>Satuan upah</label><select name="period"><option value="/pekerjaan">Per pekerjaan</option><option value="/hari">Per hari</option><option value="/bulan">Per bulan</option></select></div>
  <div class="field"><label>Deskripsi singkat</label><textarea name="description" required placeholder="Jelaskan pekerjaan"></textarea></div>
  <button class="btn btn-primary full" type="submit">Terbitkan lowongan</button>
 </form>`);
 $('#jobForm').onsubmit=e=>{e.preventDefault();const d=new FormData(e.target);jobs.unshift({id:Date.now(),title:d.get('title'),category:d.get('category'),location:d.get('location'),budget:Number(d.get('budget')),period:d.get('period'),description:d.get('description'),offers:[],status:'Terbuka'});persist();close();render();};
}
function openJob(id){
 const j=jobs.find(x=>x.id===id);if(!j)return;
 const offers=j.offers.map(o=>`<div class="offer-row"><div><b>${money(o.amount)}</b><small>${esc(o.from)} · ${esc(o.note||'Tanpa catatan')}</small></div><span>${esc(o.state)}</span></div>`).join('');
 let action='';
 if(j.status==='Disepakati') action=`<div class="notice success">✓ Harga disepakati: <b>${money(j.finalPrice)}</b></div>`;
 else if(role==='Pekerja') action=`<form id="offerForm"><div class="field"><label>Penawaran upah (Rp)</label><input name="amount" type="number" min="1" required placeholder="Masukkan upah yang diajukan"></div><div class="field"><label>Catatan (opsional)</label><textarea name="note" placeholder="Catatan untuk pemberi kerja"></textarea></div><button class="btn btn-primary full">Kirim penawaran</button></form>`;
 else if(role==='Pemberi Kerja') action=`<form id="offerForm"><div class="field"><label>Tawaran balik (Rp)</label><input name="amount" type="number" min="1" required placeholder="Masukkan harga tawaran balik"></div><div class="field"><label>Catatan (opsional)</label><textarea name="note"></textarea></div><button class="btn btn-primary full">Kirim tawaran balik</button></form>`;
 else action='<div class="notice">Mode admin hanya untuk pemantauan pada prototipe ini.</div>';
 show(`<span class="eyebrow">${esc(j.category)}</span><h2 id="modalTitle">${esc(j.title)}</h2><p class="modal-sub">⌖ ${esc(j.location)} · Budget ${money(j.budget)}${esc(j.period)}</p><p>${esc(j.description)}</p><h3>Riwayat negosiasi</h3><div class="offer-list">${offers||'<div class="notice">Belum ada penawaran.</div>'}</div>${action}`);
 const form=$('#offerForm');
 if(form) form.onsubmit=e=>{e.preventDefault();const d=new FormData(form);j.offers.push({amount:Number(d.get('amount')),from:role,note:d.get('note'),state:'Menunggu persetujuan'});persist();openJob(id);renderDashboard();};
 if(role==='Pemberi Kerja'&&j.offers.some(o=>o.state==='Menunggu persetujuan')&&j.status!=='Disepakati'){
  const pending=j.offers.filter(o=>o.state==='Menunggu persetujuan');
  const controls=document.createElement('div');controls.className='modal-actions';
  controls.innerHTML=`<button class="btn btn-outline" id="rejectOffer">Tolak terbaru</button><button class="btn btn-primary" id="acceptOffer">Setujui terbaru</button>`;
  $('#modalContent').appendChild(controls);
  $('#acceptOffer').onclick=()=>{const o=pending[pending.length-1];o.state='Disetujui';j.status='Disepakati';j.finalPrice=o.amount;persist();render();openJob(id);};
  $('#rejectOffer').onclick=()=>{pending[pending.length-1].state='Ditolak';persist();render();openJob(id);};
 }
}
function showOffers(){
 const all=jobs.flatMap(j=>j.offers.map(o=>({job:j,offer:o}))).filter(x=>role==='Admin'||(role==='Pekerja'?x.offer.from==='Pekerja':true));
 show(`<span class="eyebrow">AKTIVITAS</span><h2 id="modalTitle">${role==='Pekerja'?'Penawaran saya':'Daftar penawaran'}</h2><div class="offer-list">${all.length?all.map(x=>`<div class="offer-row"><div><b>${esc(x.job.title)}</b><small>${money(x.offer.amount)} · ${esc(x.offer.from)}</small></div><span>${esc(x.offer.state)}</span></div>`).join(''):'<div class="notice">Belum ada penawaran.</div>'}</div><button class="btn btn-primary full" id="doneBtn">Tutup</button>`);
 $('#doneBtn').onclick=close;
}
$('#roleToggle').addEventListener('click',()=>{
 const roles=['Pekerja','Pemberi Kerja','Admin'];role=roles[(roles.indexOf(role)+1)%roles.length];
 localStorage.setItem('gawein_role',role);render();
});
$('#newJobBtn').addEventListener('click',newJobForm);
$('#searchInput').addEventListener('input',renderJobs);
$('#categoryFilter').addEventListener('change',renderJobs);
$('#closeModal').addEventListener('click',close);
$('#modalBackdrop').addEventListener('click',e=>{if(e.target.id==='modalBackdrop')close();});
$('#navPost').addEventListener('click',e=>{if(role==='Pemberi Kerja'){e.preventDefault();newJobForm();}});
render();
})();
