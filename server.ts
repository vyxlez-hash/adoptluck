import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AMVGG Pet Image Proxy with in-memory buffer caching
  const petImageCache = new Map<string, { buffer: Buffer; contentType: string }>();

  app.get("/api/amvgg/image/:itemId", async (req, res) => {
    try {
      const itemId = req.params.itemId;
      if (!itemId || !/^\d+$/.test(itemId)) {
        return res.status(400).send("Invalid item ID");
      }

      if (petImageCache.has(itemId)) {
        const cached = petImageCache.get(itemId)!;
        res.setHeader("Content-Type", cached.contentType);
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.send(cached.buffer);
      }

      const upstreamUrl = `https://adoptmevalues.gg/api/adoptme/item-image/${itemId}`;
      const upstreamRes = await fetch(upstreamUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: "https://adoptmevalues.gg/values",
          Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        },
      });

      if (!upstreamRes.ok) {
        return res.redirect("https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200");
      }

      const arrayBuffer = await upstreamRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = upstreamRes.headers.get("content-type") || "image/webp";

      petImageCache.set(itemId, { buffer, contentType });
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.send(buffer);
    } catch (err) {
      console.warn("Error proxying AMVGG image:", err);
      return res.redirect("https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200");
    }
  });

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Resolve Roblox user by username or userId
  app.get("/api/roblox/user", async (req, res) => {
    try {
      const username = req.query.username as string | undefined;
      const userIdParam = req.query.userId as string | undefined;

      let userId: number | null = null;
      let targetUsername = username?.trim() || "";

      if (userIdParam) {
        userId = parseInt(userIdParam, 10);
      } else if (targetUsername) {
        // Resolve username to user ID
        const lookupRes = await fetch("https://users.roblox.com/v1/usernames/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usernames: [targetUsername],
            excludeBannedUsers: false,
          }),
        });

        if (!lookupRes.ok) {
          return res.status(lookupRes.status).json({
            error: "Failed to connect to Roblox user registry.",
          });
        }

        const lookupData = await lookupRes.json();
        if (!lookupData?.data || lookupData.data.length === 0) {
          return res.status(404).json({
            error: `Roblox user "${targetUsername}" does not exist. Check spelling.`,
          });
        }

        userId = lookupData.data[0].id;
        targetUsername = lookupData.data[0].name;
      } else {
        return res.status(400).json({ error: "Please provide a Roblox username or userId." });
      }

      if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: "Invalid Roblox user identifier." });
      }

      // Fetch user profile info (including bio / description)
      const userRes = await fetch(`https://users.roblox.com/v1/users/${userId}?_t=${Date.now()}`);
      if (!userRes.ok) {
        return res.status(userRes.status).json({
          error: "Unable to retrieve Roblox profile details.",
        });
      }
      const userData = await userRes.json();

      // Fetch Roblox headshot thumbnail
      let avatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";
      try {
        const thumbRes = await fetch(
          `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`
        );
        if (thumbRes.ok) {
          const thumbData = await thumbRes.json();
          if (thumbData?.data?.[0]?.imageUrl) {
            avatarUrl = thumbData.data[0].imageUrl;
          }
        }
      } catch (thumbErr) {
        console.warn("Avatar thumbnail fetch warning:", thumbErr);
      }

      return res.json({
        success: true,
        user: {
          id: userData.id,
          username: userData.name,
          displayName: userData.displayName || userData.name,
          description: userData.description || "",
          created: userData.created,
          isBanned: userData.isBanned || false,
          avatar: avatarUrl,
        },
      });
    } catch (err: any) {
      console.error("Roblox user lookup error:", err);
      return res.status(500).json({
        error: err?.message || "Internal error resolving Roblox user.",
      });
    }
  });

  // Verify that the user's Roblox profile bio / description contains the required phrase
  app.post("/api/roblox/verify-phrase", async (req, res) => {
    try {
      const { userId, phrase } = req.body;
      if (!userId || !phrase) {
        return res.status(400).json({
          verified: false,
          error: "Missing required parameters: userId and phrase.",
        });
      }

      // Fetch fresh profile from Roblox without caching
      const userRes = await fetch(
        `https://users.roblox.com/v1/users/${userId}?_cacheBust=${Date.now()}`,
        {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );

      if (!userRes.ok) {
        return res.status(userRes.status).json({
          verified: false,
          error: "Unable to contact Roblox to read your profile bio.",
        });
      }

      const userData = await userRes.json();
      const currentBio: string = userData.description || "";

      // Normalize strings for comparison (case-insensitive, collapsed spaces)
      const cleanBio = currentBio.toLowerCase().replace(/\s+/g, " ");
      const cleanPhrase = phrase.toLowerCase().replace(/\s+/g, " ").trim();

      // Check direct containment
      const directMatch = cleanBio.includes(cleanPhrase);

      // Also check if words in phrase are all present in the bio
      const phraseWords = cleanPhrase.split(/[\s\-_]+/).filter((w: string) => w.length > 0);
      const allWordsMatch =
        phraseWords.length > 0 && phraseWords.every((word: string) => cleanBio.includes(word));

      const isVerified = directMatch || allWordsMatch;

      if (isVerified) {
        // Also fetch user avatar thumbnail
        let avatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";
        try {
          const thumbRes = await fetch(
            `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`
          );
          if (thumbRes.ok) {
            const thumbData = await thumbRes.json();
            if (thumbData?.data?.[0]?.imageUrl) {
              avatarUrl = thumbData.data[0].imageUrl;
            }
          }
        } catch {
          // fallback avatar
        }

        return res.json({
          verified: true,
          currentBio,
          user: {
            id: `rbx-${userData.id}`,
            robloxId: userData.id,
            username: userData.name,
            displayName: userData.displayName || userData.name,
            avatar: avatarUrl,
          },
        });
      } else {
        return res.json({
          verified: false,
          currentBio,
          error: "Verification phrase was not found in your Roblox 'About' (Bio) section.",
        });
      }
    } catch (err: any) {
      console.error("Roblox bio verification error:", err);
      return res.status(500).json({
        verified: false,
        error: err?.message || "Server error while checking Roblox profile.",
      });
    }
  });

  // Vite middleware for development vs static production serve
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
