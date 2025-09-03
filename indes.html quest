<script>
(() => {
  let coins = 20;
  const quests = [
    {id:1, text:"Catch 5 Simitaurs (Reward: 50 coins)", goal:5, progress:0, reward:50, type:"simitaur", completed:false},
    {id:2, text:"Catch 1 Exotic Simitaur (Reward: 100 coins)", goal:1, progress:0, reward:100, type:"Exotic", completed:false}
  ];

  // ===== HUD Additions =====
  const hud = document.getElementById('hud');
  const coinBox = document.createElement('div');
  coinBox.id = 'coinBox';
  coinBox.style.cssText = "background:#ffd166;color:#222;font-weight:bold;padding:6px 12px;border-radius:16px;align-self:center;";
  coinBox.textContent = "💰 " + coins;
  hud.prepend(coinBox);

  const shopBtn = document.createElement('button');
  shopBtn.className = 'pill';
  shopBtn.textContent = 'Shop';
  hud.appendChild(shopBtn);

  const questBtn = document.createElement('button');
  questBtn.className = 'pill';
  questBtn.textContent = 'Quests';
  hud.appendChild(questBtn);

  // ===== Draggable Window Maker =====
  function makeWindow(id, title, innerId){
    const win = document.createElement('div');
    win.id = id;
    win.style.cssText = `
      position:fixed;top:100px;left:100px;
      background:#16261a;border:2px solid #ffd166;border-radius:12px;
      box-shadow:0 0 25px rgba(0,0,0,0.8);padding:10px;z-index:2000;
      min-width:280px;max-width:360px;color:#fff;display:none;
    `;
    win.innerHTML = `
      <h2 style="margin:0;cursor:move;color:#ffd166;font-size:18px">${title}</h2>
      <div id="${innerId}" style="margin-top:8px;max-height:60vh;overflow:auto"></div>
      <div style="text-align:center;margin-top:10px">
        <button class="btn">Close</button>
      </div>
    `;
    win.querySelector('button').onclick = ()=> win.style.display='none';
    document.body.appendChild(win);
    makeDraggable(win);
    return win;
  }

  function makeDraggable(el){
    const header = el.querySelector('h2');
    let offsetX=0, offsetY=0, dragging=false;
    header.onmousedown = e=>{
      dragging = true;
      offsetX = e.clientX - el.offsetLeft;
      offsetY = e.clientY - el.offsetTop;
      document.onmousemove = e2=>{
        if(!dragging) return;
        el.style.left = (e2.clientX - offsetX) + "px";
        el.style.top  = (e2.clientY - offsetY) + "px";
      };
      document.onmouseup = ()=>{ dragging=false; document.onmousemove=null; };
    };
  }

  // ===== Create Windows =====
  const shopWin = makeWindow('shopWin','Marketplace','simdexList');
  const questWin = makeWindow('questWin','Quests','questList');

  // ===== Functions =====
  function updateCoins(amount){
    coins += amount;
    coinBox.textContent = "💰 " + coins;
  }

  function renderShop(){
    shopWin.style.display = 'block';
    const list = document.getElementById('simdexList');
    list.innerHTML = '';
    if(window.Simitaur?.player?.sims?.length){
      window.Simitaur.player.sims.forEach(sim=>{
        const div = document.createElement('div');
        div.style.marginBottom = '10px';
        div.innerHTML = `<b>${sim.type.name}</b> — HP: ${sim.hp}/${sim.maxHp}<br>`;
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = 'Heal (5 coins)';
        btn.onclick = ()=> healSim(sim);
        div.appendChild(btn);
        list.appendChild(div);
      });
    } else {
      list.innerHTML = '<p style="opacity:.8">No Sims in your team.</p>';
    }
  }

  function healSim(sim){
    if(coins < 5) return alert("Not enough coins!");
    if(sim.hp >= sim.maxHp) return alert(sim.type.name + " is already at full HP!");
    coins -= 5;
    sim.hp = sim.maxHp;
    updateCoins(0);
    renderShop();
  }

  function renderQuests(){
    questWin.style.display = 'block';
    const list = document.getElementById('questList');
    list.innerHTML = '';
    quests.forEach(q=>{
      const div = document.createElement('div');
      div.style.marginBottom = '12px';
      div.innerHTML = `<b>${q.text}</b><br>Progress: ${q.progress}/${q.goal}<br>`;
      if(!q.completed && q.progress >= q.goal){
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = 'Claim Reward';
        btn.onclick = ()=>{
          updateCoins(q.reward);
          q.completed = true;
          renderQuests();
        };
        div.appendChild(btn);
      } else if(q.completed){
        div.innerHTML += `<i>Completed ✅</i>`;
      }
      list.appendChild(div);
    });
  }

  // ===== Button Wiring =====
  shopBtn.onclick = renderShop;
  questBtn.onclick = renderQuests;

  // ===== Hook into SimDex updates =====
  const oldBuildDex = window.Simitaur ? window.Simitaur.buildDex : null;
  if(oldBuildDex){
    window.Simitaur.buildDex = function(){
      oldBuildDex();
      const keys = Object.keys(window.Simitaur.simdex||{});
      quests.forEach(q=>{
        if(q.type.toLowerCase()==='simitaur') q.progress = keys.length;
        if(q.type.toLowerCase()==='exotic'){
          q.progress = keys.filter(k=>window.Simitaur.simdex[k].rarity==='Exotic').length;
        }
      });
    };
  }

  updateCoins(0);
})();
</script>
