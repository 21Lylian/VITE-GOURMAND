(function(){
  function createModal(title, contentNode, buttons){
    return new Promise(resolve => {
      const overlay = document.createElement('div'); overlay.className='modal-overlay'; overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
      const dialog = document.createElement('div'); dialog.className='modal-dialog'; dialog.setAttribute('role','dialog'); dialog.setAttribute('aria-modal','true'); dialog.style.cssText='background:#fff;border-radius:6px;max-width:520px;width:96%;padding:16px;box-shadow:0 8px 24px rgba(0,0,0,.2);';
      const h = document.createElement('h2'); h.textContent = title; h.style.margin='0 0 8px 0';
      const hid = 'modal-title-' + Math.random().toString(36).slice(2,8);
      h.id = hid; dialog.appendChild(h);
      dialog.setAttribute('aria-labelledby', hid);
      dialog.appendChild(contentNode);
      const actions = document.createElement('div'); actions.style.cssText='display:flex;gap:8px;justify-content:flex-end;margin-top:12px;';
      buttons.forEach(b => { const btn = document.createElement('button'); btn.textContent=b.label; btn.className=b.class||''; btn.addEventListener('click', ()=>{ resolve(b.onClick()); document.body.removeChild(overlay); }); actions.appendChild(btn); });
      dialog.appendChild(actions);
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);

      // focus management
      const focusable = dialog.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0]; if(first) first.focus();
      overlay.addEventListener('keydown', (e)=>{
        if(e.key==='Escape'){ resolve(null); document.body.removeChild(overlay); }
      });
    });
  }

  window.showModalPrompt = function(message, placeholder){
    const wrapper = document.createElement('div');
    const p = document.createElement('p'); p.textContent = message; wrapper.appendChild(p);
    const ta = document.createElement('textarea'); ta.style.width='100%'; ta.placeholder = placeholder||''; ta.rows=4; wrapper.appendChild(ta);
    return createModal('Saisir une information', wrapper, [
      {label:'Annuler', class:'btn-secondary', onClick:()=>null},
      {label:'Confirmer', class:'btn-primary', onClick:()=>ta.value.trim() || null}
    ]);
  };

  window.showModalConfirm = function(message){
    const wrapper = document.createElement('div'); const p = document.createElement('p'); p.textContent = message; wrapper.appendChild(p);
    return createModal('Confirmer', wrapper, [
      {label:'Non', class:'btn-secondary', onClick:()=>false},
      {label:'Oui', class:'btn-primary', onClick:()=>true}
    ]);
  };
})();
