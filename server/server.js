// Server JS hereconst WebSocket = require('ws');
const { spawn } = require('child_process');

const wss = new WebSocket.Server({ port: 8080 });
console.log('WebSocket server running on ws://localhost:8080');

wss.on('connection', ws => {
  let ffmpeg = null;
  ws.on('message', msg => {
    if (typeof msg === 'string') return;
    if (!ffmpeg) {
      const rtmpUrl = process.env.RTMP_URL || 'rtmp://live.example.com/live/STREAMKEY';
      ffmpeg = spawn('ffmpeg', ['-i', 'pipe:0', '-c:v', 'copy', '-c:a', 'aac', '-f', 'flv', rtmpUrl]);
      ffmpeg.stderr.on('data', data => console.log('ffmpeg:', data.toString()));
      ffmpeg.on('close', code => console.log('ffmpeg closed', code));
    }
    try { ffmpeg.stdin.write(Buffer.from(msg)); } catch(e){ console.error(e); }
  });
  ws.on('close', () => { if(ffmpeg) ffmpeg.stdin.end(); });
});
