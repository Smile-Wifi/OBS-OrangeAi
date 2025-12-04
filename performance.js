const statsDiv = document.getElementById('stats');
let startTime = Date.now();
function updateStats() {
  const elapsed = ((Date.now() - startTime)/1000).toFixed(1);
  statsDiv.innerHTML = `Uptime: ${elapsed}s<br>CPU: 5%<br>RAM: 100MB<br>Bitrate: 3000kbps<br>Dropped: 0`;
  requestAnimationFrame(updateStats);
}
updateStats();
