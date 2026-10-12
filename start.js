const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const axios = require('axios');
const config = require('./settings');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    browser: ["CASSIUS-PK-4.2.0", "Chrome", "1.0"]
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if(connection === 'close'){
      let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
      if(reason!== DisconnectReason.loggedOut) startBot();
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    try{
      const m = messages[0];
      if(!m.message || m.key.fromMe) return;
      const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || "";
      const prefix = ".";
      if(!body.startsWith(prefix)) return;
      const args = body.slice(1).trim().split(/ +/);
      const cmd = args.shift().toLowerCase();

      // === MENU - MODERN BLUE RED ===
      if(cmd === "menu" || cmd === "help"){
        let menu = `
*╭─❰ CASSIUS-PK-4.2.0 ❱─╮*
*┃ 🔵 Premium Edition 🔴*
*╰──────────────────╯*

*🏠 MAIN MENU*
*┃ 🧑‍💻 Owner : CASSIUS TECH PROS*
*┃ 🤖 Bot : CASSIUS-PK-4.2.0*
*┃ 💠 Version : 4.2.0*
*┃ 🔹 Prefix :.*

*╭─❰ 🔵 CORE ❱─╮*
*┃ ⚡ alive*
*┃ 🔴 ping*
*┃ 🔵 owner*
*┃ 💙 menu*
*╰────────────╯*

*╭─❰ 🔴 GROUP ❱─╮*
*┃ 👥 tagall*
*┃ 🦶 kick*
*┃ 👑 promote*
*┃ 🔗 link*
*╰────────────╯*

*╭─❰ 💙 DOWNLOADER ❱─╮*
*┃ 🎧.play.song*
*┃ 🎬.ytmp4.ytmp3*
*┃ ⚫.tiktok.tt*
*┃ 🔵.fb.facebook*
*┃ ⚫.x.twitter*
*╰────────────╯*

*━━━━━━━━━━━━━━━━*
*🔵 CASSIUS TECH PROS 🔴*
*━━━━━━━━━━━━━━━━*
`;
        await sock.sendMessage(m.chat, { text: menu }, { quoted: m });
      }

      // === PING ===
      if(cmd === "ping"){
        await sock.sendMessage(m.chat, { text: "*🔵 Pong!*\n*🔴 Speed: Fast*\n*💙 CASSIUS-PK-4.2.0*" }, { quoted: m });
      }

      // === TIKTOK DOWNLOADER ===
      if(cmd === "tiktok" || cmd === "tt"){
        if(!args[0]) return sock.sendMessage(m.chat, {text: "⚫ Example:.tiktok https://vt.tiktok.com/xxx"}, {quoted: m});
        await sock.sendMessage(m.chat, {text: "⚫ Downloading..."}, {quoted: m});
        try{
          let api = `https://tikwm.com/api/?url=${args[0]}`;
          let {data} = await axios.get(api);
          if(data?.data?.play){
            await sock.sendMessage(m.chat, {video: {url: data.data.play}, caption: "*CASSIUS-PK-4.2.0 ⚫*"}, {quoted: m});
          }
        }catch(e){ await sock.sendMessage(m.chat, {text: "❌ Failed"}, {quoted: m}); }
      }

      // === FB & X - SIMPLE ===
      if(cmd === "fb" || cmd === "facebook" || cmd === "x" || cmd === "twitter"){
        if(!args[0]) return sock.sendMessage(m.chat, {text: `🔵 Example:.${cmd} <link>`}, {quoted: m});
        await sock.sendMessage(m.chat, {text: `🔵 CASSIUS downloading ${cmd}... (API needed, menu ready)`}, {quoted: m});
      }

    }catch(e){ console.log(e); }
  });
}
startBot();
