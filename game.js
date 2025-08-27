const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameState = "play";

// Example data structures
let player = { x: 400, y: 300, party: [] };
let npcs = [
  { x: 200, y: 200 },
  { x: 600, y: 400 }
];
let simitaurs = [
  { x: 100, y: 100, type:{name:"Simitaur A", src:"https://via.placeholder.com/64"}, maxHp: 40, attacks:[{dmg:5}], defense:5, speed:3, size:1, weight:20, rarity:"Common"},
  { x: 700, y: 500, type:{name:"Simitaur B", src:"https://via.placeholder.com/64"}, maxHp: 60, attacks:[{dmg:10}], defense:8, speed:2, size:2, weight:40, rarity:"Rare"}
];
let simdex = {};

// Panels
function panel(name, show) {
  document.getElementById(name+"Panel").style.display = show ? "block" : "none";
}

// SimDex Refresh
function refreshDex() {
  const grid = document.getElementById('dexGrid');
  grid.innerHTML = '';
  Object.values(simdex).forEach(s => {
    const div = document.createElement('div');
    div.className = `dexCard rarity-${s.rarity}`;
    div.innerHTML = `
      <img src="${s.type.img?.src || s.type.src || ''}" alt="${s.type.name}">
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

// Mini-map
function drawMiniMap(ctx) {
  const mapSize = 120;
  const padding = 10;
  const scaleX = mapSize / canvas.width;
  const scaleY = mapSize / canvas.height;
  const x0 = canvas.width - mapSize - padding;
  const y0 = padding;

  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(x0, y0, mapSize, mapSize);

  // Player
  ctx.fillStyle = "white";
  ctx.fillRect(x0 + player.x * scaleX, y0 + player.y * scaleY, 4, 4);

  // NPCs
  npcs.forEach(npc => {
    ctx.fillStyle = "yellow";
    ctx.fillRect(x0 + npc.x * scaleX, y0 + npc.y * scaleY, 4, 4);
  });

  // Wild Simitaurs
  simitaurs.forEach(sim => {
    ctx.fillStyle = "red";
    ctx.fillRect(x0 + sim.x * scaleX, y0 + sim.y * scaleY, 3, 3);
  });
}

// Game Loop
function update() {
  if(keys["ArrowUp"]) player.y -= 2;
  if(keys["ArrowDown"]) player.y += 2;
  if(keys["ArrowLeft"]) player.x -= 2;
  if(keys["ArrowRight"]) player.x += 2;
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Player
  ctx.fillStyle = "blue";
  ctx.fillRect(player.x-10, player.y-10, 20, 20);

  // NPCs
  ctx.fillStyle = "orange";
  npcs.forEach(npc=>{
    ctx.fillRect(npc.x-10,npc.y-10,20,20);
  });

  // Wild Simitaurs
  simitaurs.forEach(sim=>{
    ctx.fillStyle = "green";
    ctx.fillRect(sim.x-10, sim.y-10, 20, 20);
  });

  // Mini-map
  drawMiniMap(ctx);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();

// Input
let keys = {};
window.addEventListener("keydown",e=>keys[e.key]=true);
window.addEventListener("keyup",e=>keys[e.key]=false);

// Wire buttons
document.getElementById("btnDex").addEventListener("click",()=>{
  refreshDex();
  panel("dex",true);
});
document.getElementById("btnCloseDex").addEventListener("click",()=>{
  panel("dex",false);
});

// Example: catching a simitaur (press C to catch nearest)
window.addEventListener("keydown",e=>{
  if(e.key==="c"||e.key==="C"){
    if(simitaurs.length>0){
      let caught = simitaurs.pop();
      simdex[caught.type.name]=caught;
      player.party.push(caught);
      console.log("Caught",caught.type.name);
    }
  }
});
