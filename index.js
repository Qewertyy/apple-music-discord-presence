const { execSync } = require("child_process");
const { Client } = require("@xhayper/discord-rpc");

const CLIENT_ID = process.env.CLIENT_ID || null;
if (!CLIENT_ID) {
  console.error("please set the CLIENT_ID environment variable.");
  process.exit(1);
}

const rpc = new Client({ transport: { type: "ipc" }, clientId: CLIENT_ID });

let lastTrack = null;

async function getCurrentAppleMusicTrack() {
  try {
    const script = `
      tell application "Music"
        if it is running and player state is playing then
          set trackName to name of current track
          set artistName to artist of current track
          set albumName to album of current track
          set currentTime to player position
          set totalTime to duration of current track
          return trackName & "||" & artistName & "||" & albumName & "||" & currentTime & "||" & totalTime
        else
          return ""
        end if
      end tell
    `;
    const result = execSync(`osascript -e '${script}'`).toString().trim();
    if (!result || !result.includes("||")) return null;

    const [name, artist, album, current, total] = result
      .split("||")
      .map((s) => s.trim());
    return {
      name,
      artist,
      album,
      current: parseFloat(current),
      total: parseFloat(total),
    };
  } catch (e) {
    console.error("error fetching Apple Music track:", e);
    return null;
  }
}

async function getAlbumArtwork(song, artist) {
  const query = encodeURIComponent(`${song} ${artist}`);
  const url = `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const image = data.results?.[0]?.artworkUrl100;
    return image?.replace("100x100", "600x600") || null;
  } catch (e) {
    console.error("error fetching album artwork:", e);
    return null;
  }
}

async function updateActivity(track) {
  const state = track.album;
  const artwork = await getAlbumArtwork(track.name, track.artist);

  const currentMs = parseFloat(track.current) * 1000;
  const totalMs = parseFloat(track.total) * 1000;
  const startTimestamp = Date.now() - currentMs;
  const endTimestamp = startTimestamp + totalMs;

  await rpc?.user?.setActivity({
    name: "Apple Music",
    type: 2,
    details: track.name,
    state: track.artist,
    startTimestamp,
    endTimestamp,
    largeImageKey: artwork || "apple_music",
    largeImageText: state,
    buttons: [
      { label: "Listen on Apple Music", url: "https://music.apple.com" },
    ],
    smallImageKey: "apple_music",
    smallImageText: "Listening on Apple Music",
  });
}

async function startPresence() {
  rpc.on("ready", () => {
    console.log("connected to discord!");

    setInterval(async () => {
      const track = await getCurrentAppleMusicTrack();
      if (track && JSON.stringify(track) !== JSON.stringify(lastTrack)) {
        lastTrack = track;
        await updateActivity(track);
      }
    }, 5000);
  });

  rpc.on("disconnected", () => {
    console.log("disconnected from discord");
    process.exit();
  });

  try {
    await rpc.login();
  } catch (error) {
    console.error("login failed:", error);
  }
}

startPresence();
