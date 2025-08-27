// =========================
// SimDex + Mini-map System
// =========================

// Utility to show/hide panels
function panel(name, show) {
  document.getElementById(name + "Panel").style.display = show ? "block" : "none";
}

// Refresh SimDex content
function refreshDex() {
  const grid = document.getElementById('dexGrid');
  grid.innerHTML = '';
  Object.values(simdex).forEach(s => {
    const div = document.createElement('div');
    div.style.border = "1px solid #aaa";
    div.style.margin = "5px";
    div.style.padding = "5px";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.innerHTML = `
      <img src="${s.type.img.src}" width="48" height="48" style="margin-right:8px;">
      <div>
        <div><b>${s.type.name}</b> <small>(${s.rarity})</small></div>
        <div>HP: ${s.maxHp}</div>
        <div>ATK: ${s.attacks.map(a=>a.dmg).join('/')}</div>
        <div>DEF: ${s.defense || 0}</div>
        <div>SPD: ${s.speed || 0}</div>
        <div>Size: ${s.size}, Wt: ${s.weight}</div>
      </div>
    `;
    grid.appendChild(div);
  });
}

// Button event listeners
document.getElementById("btnDex").addEventListener("click", () => {
  refreshDex();
  panel("dex", true);
});
document.getElementById("btnCloseDex").addEventListener("click", () => {
  panel("dex", false);
});

// =========================
// Mini-map Drawing
// =========================
function drawMiniMap(ctx) {
  const mapSize = 120;   // square minimap
  const padding = 10;
  const scaleX = mapSize / canvas.width;
  const scaleY = mapSize / canvas.height;
  const x0 = canvas.width - mapSize - padding;
  const y0 = padding;

  // Background
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(x0, y0, mapSize, mapSize);

  // Player marker
  ctx.fillStyle = "white";
  ctx.fillRect(x0 + player.x * scaleX, y0 + player.y * scaleY, 4, 4);

  // NPCs
  if (typeof npcs !== "undefined") {
    npcs.forEach(npc => {
      ctx.fillStyle = "yellow";
      ctx.fillRect(x0 + npc.x * scaleX, y0 + npc.y * scaleY, 4, 4);
    });
  }

  // Wild Simitaurs (show only uncaught ones)
  if (typeof simitaurs !== "undefined") {
    simitaurs.forEach(sim => {
      if (!simdex[sim.type.name]) {
        ctx.fillStyle = "red";
        ctx.fillRect(x0 + sim.x * scaleX, y0 + sim.y * scaleY, 3, 3);
      }
    });
  }
}

// =========================
// HOW TO USE
// =========================
// 1. Add the required HTML in index.html:
//
// <button id="btnDex" style="position:absolute;top:10px;left:10px;z-index:5;">SimDex</button>
// <div id="dexPanel" style="display:none;position:absolute;top:50px;left:10px;width:300px;height:400px;overflow-y:auto;background:#fff;border:2px solid #333;z-index:10;padding:8px;">
//   <button id="btnCloseDex" style="float:right;">X</button>
//   <h3>SimDex</h3>
//   <div id="dexGrid"></div>
// </div>
//
// 2. Call drawMiniMap(ctx) at the end of your draw() function:
//
// function draw() {
//   // ...your existing drawing code...
//   drawMiniMap(ctx);
// }

