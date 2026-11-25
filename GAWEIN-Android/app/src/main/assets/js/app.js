const money = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
const seed = [
 {id:1,title:'Perbaikan keran air',category:'Perbaikan',location:'Jakarta Selatan',budget:500000,description:'Mencari teknisi untuk memperbaiki keran dapur yang bocor.',offers:[],status:'Terbuka'},
 {id:2,title:'Bersihkan rumah 2 kamar',category:'Kebersihan',location:'Depok',budget:350000,description:'Pembersihan rumah, termasuk kamar mandi dan dapur.',offers:[],status:'Terbuka'},
 {id:3,title:'Desain poster promosi',category:'Desain',location:'Online',budget:250000,description:'Membutuhkan desain poster promosi untuk media sosial.',offers:[],status:'Terbuka'}
];
let jobs = JSON.parse(localStorage.getItem('gawein_jobs')||'null') || seed;
let role = localStorage.getItem('gawein_role') || 'Pekerja';
if(!['Pekerja','Pemberi Kerja','Admin'].includes(role)) role='Pekerja';
let activeJob = null;
const $ = s => document.querySelector(s);
function save(){localStorage.setItem('gawein_jobs',JSON.stringify(jobs));render();}
function render(){
 $('#roleToggle').textContent='Mode: '+role;
 const dash=$('#roleDashboard');
 const counts={total:jobs.length,open:jobs.filter(j=>j.status==='Terbuka').length,deal:jobs.filter(j=>j.status==='Disepakati').length,offers:jobs.reduce((n,j)=>n+j.offers.length,0)};
 const configs={
  'Pekerja':{title:'Dashboard Pekerja',desc:'Temukan pekerjaan yang sesuai dan ajukan penawaran upah.',menus:['Beranda','Cari Pekerjaan','Lamaran Saya','Negosiasi Upah','Pesan','Profil Saya'],cta:'Lihat Pekerjaan'},
  'Pemberi Kerja':{title:'Dashboard Pemberi Kerja',desc:'Pasang kebutuhan tenaga kerja, kelola pelamar, dan sepakati upah.',menus:['Dashboard','Pasang Pekerjaan','Pekerjaan Saya','Daftar Pelamar','Negosiasi','Pesan','Profil Saya'],cta:'Pasang Pekerjaan'},
  'Admin':{title:'Dashboard Admin',desc:'Panel pemantauan GAWEIN. Data pada versi ini masih tersimpan lokal di perangkat.',menus:['Statistik','Kelola Pekerja','Kelola Pemberi Kerja','Kelola Lowongan','Pantau Negosiasi','Pengaduan','Transaksi','Laporan','Pengaturan'],cta:'Lihat Lowongan'}
 };
 const c=configs[role];
 dash.innerHTML=`<div class="dash-head"><div><span class="eyebrow">RUANG KERJA GAWEIN</span><h2>${c.title}</h2><p>${c.desc}</p></div><span class="role-pill">${role}</span></div><div class="dash-stats"><div><b>${counts.total}</b><span>Total pekerjaan</span></div><div><b>${counts.open}</b><span>Masih terbuka</span></div><div><b>${counts.offers}</b><span>Total penawaran</span></div><div><b>${counts.deal}</b><span>Disepakati</span></div></div><div class="dash-menu">${c.menus.map((m,i)=>`<button class="dash-item" data-menu="${m}"><span>${['⌂','⌕','▤','⇄','✉','◉','⚙','▣','☷'][i%9]}</span>${m}</button>`).join('')}</div><div class="dash-foot"><b>${role==='Admin'?'Catatan Admin':'Mulai aktivitas'}</b><span>${role==='Admin'?'Login admin dan database online perlu diaktifkan sebelum aplikasi dipublikasikan.':'Gunakan menu di atas untuk mengakses fitur sesuai peran.'}</span></div>`;
 dash.querySelectorAll('.dash-item').forEach(b=>b.onclick=()=>{const m=b.dataset.menu;if(m==='Pasang Pekerjaan') $('#newJobBtn').click();else if(m==='Cari Pekerjaan'||m==='Lihat Lowongan'||m==='Beranda'||m==='Dashboard') $('#jobs').scrollIntoView({behavior:'smooth'});else show(`<h2>${esc(m)}</h2><p>Bagian ${esc(m)} disiapkan untuk tahap pengembangan berikutnya.</p><button class="btn btn-primary" onclick="close()">Tutup</button>`);});
 $('#newJobBtn').style.display=role==='Pemberi Kerja'?'inline-flex':'none';
 document.querySelector('.hero').style.display=role==='Admin'?'none':'';
 document.querySelector('.how').style.display=role==='Admin'?'none':'';
 const q=$('#searchInput').value.toLowerCase(), cat=$('#categoryFilter').value;
 const list=jobs.filter(j=>(j.title+' '+j.location+' '+j.description).toLowerCase().includes(q)&&(!cat||j.category===cat));
 $('#jobList').innerHTML=list.length?list.map(j=>`<article class="job-card"><span class="tag">${j.category}</span><h3>${esc(j.title)}</h3><p>⌖ ${esc(j.location)}<br>${esc(j.description)}</p><div class="job-meta"><small>Budget</small><b>${money(j.budget)}</b></div><div class="job-meta"><small>${j.offers.length} penawaran · ${j.status}</small><span class="status">${j.status==='Disepakati'?'Disepakati':'Terbuka'}</span></div><button class="btn btn-primary" onclick="openJob(${j.id})">${role==='Pemberi Kerja'?'Kelola & negosiasi':role==='Admin'?'Pantau pekerjaan':'Ajukan harga'}</button></article>`).join(''):'<div class="empty">Belum ada pekerjaan yang cocok.</div>';
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function show(html){$('#modalContent').innerHTML=html;$('#modalBackdrop').hidden=false;}
function close(){ $('#modalBackdrop').hidden=true; }
$('#closeModal').onclick=close;$('#modalBackdrop').addEventListener('click',e=>{if(e.target.id==='modalBackdrop')close();});
$('#roleToggle').onclick=()=>{const roles=['Pekerja','Pemberi Kerja','Admin'];role=roles[(roles.indexOf(role)+1)%roles.length];localStorage.setItem('gawein_role',role);render();};
$('#searchInput').oninput=render;$('#categoryFilter').onchange=render;
$('#newJobBtn').onclick=()=>{if(role!=='Pemberi Kerja'){show(`<h2>Fitur Pemberi Kerja</h2><p>Untuk memasang pekerjaan, pilih mode Pemberi Kerja melalui tombol di bagian atas.</p><button class="btn btn-primary" onclick="close()">Mengerti</button>`);return;}
 show(`<h2>Pasang pekerjaan</h2><form id="jobForm"><div class="field"><label>Nama pekerjaan</label><input name="title" required placeholder="Contoh: Perbaikan pompa air"></div><div class="field"><label>Kategori</label><select name="category"><option>Perbaikan</option><option>Kebersihan</option><option>Desain</option><option>Transportasi</option><option>Lainnya</option></select></div><div class="field"><label>Lokasi</label><input name="location" required placeholder="Kota atau area"></div><div class="field"><label>Budget (Rp)</label><input name="budget" type="number" min="1" required placeholder="500000"></div><div class="field"><label>Deskripsi</label><textarea name="description" required placeholder="Jelaskan pekerjaan yang dibutuhkan"></textarea></div><button class="btn btn-primary" type="submit">Publikasikan pekerjaan</button></form>`);
 $('#jobForm').onsubmit=e=>{e.preventDefault();const d=new FormData(e.target);jobs.unshift({id:Date.now(),title:d.get('title'),category:d.get('category'),location:d.get('location'),budget:Number(d.get('budget')),description:d.get('description'),offers:[],status:'Terbuka'});save();close();};
};
window.openJob=id=>{activeJob=jobs.find(j=>j.id===id);if(!activeJob)return;const j=activeJob;
 const offers=j.offers.map((o,i)=>`<div class="offer"><div><b>${money(o.amount)}</b><div>${esc(o.from)} · ${esc(o.note||'Tanpa catatan')}</div></div><span>${o.state}</span></div>`).join('');
 let actions='';
 if(j.status==='Disepakati') actions=`<div class="notice">Harga final telah disepakati: <b>${money(j.finalPrice)}</b>. Harga ini menjadi acuan kesepakatan kedua pihak.</div>`;
 else if(role==='Pencari Kerja') actions=`<form id="offerForm"><div class="field"><label>Harga penawaran Anda (Rp)</label><input name="amount" type="number" min="1" required placeholder="Masukkan harga yang sesuai"></div><div class="field"><label>Catatan (opsional)</label><textarea name="note" placeholder="Jelaskan alasan atau rincian harga"></textarea></div><button class="btn btn-primary" type="submit">Kirim penawaran</button></form>`;
 else actions=`<form id="counterForm"><div class="field"><label>Ajukan harga / tawaran balik (Rp)</label><input name="amount" type="number" min="1" required placeholder="Masukkan harga kesepakatan"></div><div class="field"><label>Catatan (opsional)</label><textarea name="note" placeholder="Catatan untuk pekerja"></textarea></div><button class="btn btn-primary" type="submit">Kirim tawaran</button></form>`;
 show(`<span class="tag">${esc(j.category)}</span><h2>${esc(j.title)}</h2><p>${esc(j.location)} · Budget ${money(j.budget)}</p><p>${esc(j.description)}</p><h3>Riwayat negosiasi</h3><div class="offer-list">${offers||'<div class="notice">Belum ada penawaran. Pekerja dapat mengajukan harga sesuai kebutuhan pekerjaan.</div>'}</div>${actions}`);
 const form=$('#offerForm')||$('#counterForm');
 if(form)form.onsubmit=e=>{e.preventDefault();const d=new FormData(form);j.offers.push({amount:Number(d.get('amount')),from:role,note:d.get('note'),state:'Menunggu persetujuan'});save();openJob(id);};
 if(role==='Pemberi Kerja'&&j.offers.length&&j.status!=='Disepakati'){
   const latest=j.offers[j.offers.length-1];
   const box=document.createElement('div');box.className='modal-actions';
   box.innerHTML=`<button class="btn btn-outline" id="rejectOffer">Tolak penawaran</button><button class="btn btn-primary" id="acceptOffer">Setujui ${money(latest.amount)}</button>`;
   $('#modalContent').appendChild(box);
   $('#acceptOffer').onclick=()=>{j.status='Disepakati';j.finalPrice=latest.amount;latest.state='Disetujui';save();openJob(id);};
   $('#rejectOffer').onclick=()=>{latest.state='Ditolak';save();openJob(id);};
 }
};
render();
