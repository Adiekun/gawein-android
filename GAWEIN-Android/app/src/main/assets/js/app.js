const money = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
const seed = [
 {id:1,title:'Perbaikan keran air',category:'Perbaikan',location:'Jakarta Selatan',budget:500000,description:'Mencari teknisi untuk memperbaiki keran dapur yang bocor.',offers:[],status:'Terbuka'},
 {id:2,title:'Bersihkan rumah 2 kamar',category:'Kebersihan',location:'Depok',budget:350000,description:'Pembersihan rumah, termasuk kamar mandi dan dapur.',offers:[],status:'Terbuka'},
 {id:3,title:'Desain poster promosi',category:'Desain',location:'Online',budget:250000,description:'Membutuhkan desain poster promosi untuk media sosial.',offers:[],status:'Terbuka'}
];
let jobs = JSON.parse(localStorage.getItem('gawein_jobs')||'null') || seed;
let role = localStorage.getItem('gawein_role') || 'Pencari Kerja';
let activeJob = null;
const $ = s => document.querySelector(s);
function save(){localStorage.setItem('gawein_jobs',JSON.stringify(jobs));render();}
function render(){
 $('#roleToggle').textContent='Mode: '+role;
 const q=$('#searchInput').value.toLowerCase(), cat=$('#categoryFilter').value;
 const list=jobs.filter(j=>(j.title+' '+j.location+' '+j.description).toLowerCase().includes(q)&&(!cat||j.category===cat));
 $('#jobList').innerHTML=list.length?list.map(j=>`<article class="job-card"><span class="tag">${j.category}</span><h3>${esc(j.title)}</h3><p>⌖ ${esc(j.location)}<br>${esc(j.description)}</p><div class="job-meta"><small>Budget</small><b>${money(j.budget)}</b></div><div class="job-meta"><small>${j.offers.length} penawaran · ${j.status}</small><span class="status">${j.status==='Disepakati'?'Disepakati':'Terbuka'}</span></div><button class="btn btn-primary" onclick="openJob(${j.id})">${role==='Pemberi Kerja'?'Kelola & negosiasi':'Ajukan harga'}</button></article>`).join(''):'<div class="empty">Belum ada pekerjaan yang cocok.</div>';
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function show(html){$('#modalContent').innerHTML=html;$('#modalBackdrop').hidden=false;}
function close(){ $('#modalBackdrop').hidden=true; }
$('#closeModal').onclick=close;$('#modalBackdrop').addEventListener('click',e=>{if(e.target.id==='modalBackdrop')close();});
$('#roleToggle').onclick=()=>{role=role==='Pencari Kerja'?'Pemberi Kerja':'Pencari Kerja';localStorage.setItem('gawein_role',role);render();};
$('#searchInput').oninput=render;$('#categoryFilter').onchange=render;
$('#newJobBtn').onclick=()=>{if(role!=='Pemberi Kerja'){show(`<h2>Ganti ke mode pemberi kerja</h2><p>Untuk memasang pekerjaan, ubah mode akun menjadi Pemberi Kerja melalui tombol di bagian atas.</p><button class="btn btn-primary" onclick="close()">Mengerti</button>`);return;}
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
