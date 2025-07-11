## apple music discord rich presence

**dynamic rich presence for apple music** on **macOS** using the discord RPC API.
It updates your Discord status in real-time with the current song, artist, and album you're listening to in Apple Music.

---

### screenshot
<img width="276" height="122" alt="Screenshot 2025-07-11 at 12 38 36" src="https://github.com/user-attachments/assets/0da23cfd-a92f-4b6a-981f-e776341ff7da" />

---

### requirements

- macOS
- Discord (Desktop client)
- Node.js
- discord developer application with RPC enabled

---

### setup

1. **clone and dependencies**

   ```bash
   git clone https://github.com/qewertyy/apple-music-discord-presence.git
   cd apple-music-discord-presence
   npm install
   ```

2. **configure**

   - set your client id in env
     ```bash
     export CLIENT_ID=XXXX
     ```
   - upload an image asset named `apple_music` in your discord app under the **Rich Presence → Art Assets** tab.

3. **run**

   ```bash
   node index.js
   ```

---

### what tt does

Every 5 seconds:

- AppleScript queries the apple music app for the currently playing song.
- if changed, it fetches album artwork using the iTunes Search API.
- it then updates your discord status using `discord-rpc`.

---

### how it works

- **AppleScript**: Used to read song metadata from apple music.
- **Node.js + Discord RPC**: Sends presence updates to discord via IPC transport.
- **iTunes API**: (Optional) grabs high-res album art for visual polish.

---

### planned improvements (maybe)

- auto-thumbnail uploading to a CDN and serving it dynamically
- windows support via iTunes COM automation
- richer button integrations (e.g., direct link to current song)
