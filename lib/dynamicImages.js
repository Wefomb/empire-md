const axios = require("axios");

let lastMenuImage = "";

const pickRandom = (items = []) => items[Math.floor(Math.random() * items.length)];

const shuffleItems = (items = []) => {
    const next = [...items];
    for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
    }
    return next;
};

const imageApiEnabled = () => global.imageApis?.enabled !== false;

const imageQuality = () => ({
    width: Number(global.imageApis?.quality?.width || 1280),
    height: Number(global.imageApis?.quality?.height || 720),
    perPage: Number(global.imageApis?.quality?.perPage || 20)
});

const fetchApiJson = async (url, options = {}) => {
    const timeout = Number(global.imageApis?.timeout || 9000);
    const res = await axios({ url, method: options.method || "GET", timeout, headers: options.headers || {}, data: options.data });
    return res.data;
};

const getRandomMenuImage = () => {
    const images = Array.isArray(global.menuImages) && global.menuImages.length ? global.menuImages : [];
    if (!images.length) return "";
    const choices = images.length > 1 ? images.filter(image => image !== lastMenuImage) : images;
    const image = pickRandom(choices.length ? choices : images);
    lastMenuImage = image;
    return image;
};

const getRandomStickerImage = () => {
    const images = Array.isArray(global.stickerImages) && global.stickerImages.length ? global.stickerImages : [];
    return pickRandom(images) || "";
};

const getPicsumImage = (query = "") => {
    const quality = imageQuality();
    return `https://picsum.photos/seed/${encodeURIComponent(`${query || "empire"}-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`)}/${quality.width}/${quality.height}`;
};

const getWaifuImage = async (category) => {
    const data = await fetchApiJson(`https://api.waifu.pics/sfw/${encodeURIComponent(category || "waifu")}`);
    return data?.url || "";
};

const getNekosImage = async (tag) => {
    const url = `https://api.nekosapi.com/v3/images/random?rating=safe&limit=1${tag ? `&tags=${encodeURIComponent(tag)}` : ""}`;
    const data = await fetchApiJson(url);
    const image = Array.isArray(data?.items) ? data.items[0] : Array.isArray(data) ? data[0] : data;
    return image?.image_url || image?.url || image?.sample_url || image?.file_url || "";
};

const getJikanCharacterImage = async (name) => {
    const data = await fetchApiJson(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(name || "Emilia")}&limit=1`);
    const character = Array.isArray(data?.data) ? data.data[0] : null;
    return character?.images?.jpg?.image_url || character?.images?.webp?.image_url || "";
};

const getPexelsImage = async (query) => {
    const key = String(global.imageApis?.pexelsApiKey || "").trim();
    if (!key) return "";
    const quality = imageQuality();
    const data = await fetchApiJson(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query || "quality background")}&orientation=landscape&size=large&per_page=${quality.perPage}`, {
        headers: { Authorization: key }
    });
    const photo = pickRandom(Array.isArray(data?.photos) ? data.photos : []);
    return photo?.src?.large2x || photo?.src?.large || photo?.src?.original || "";
};

const getPixabayImage = async (query) => {
    const key = String(global.imageApis?.pixabayApiKey || "").trim();
    if (!key) return "";
    const quality = imageQuality();
    const data = await fetchApiJson(`https://pixabay.com/api/?key=${encodeURIComponent(key)}&q=${encodeURIComponent(query || "quality background")}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${quality.perPage}`);
    const image = pickRandom(Array.isArray(data?.hits) ? data.hits : []);
    return image?.largeImageURL || image?.webformatURL || "";
};

const getUnsplashImage = async (query) => {
    const key = String(global.imageApis?.unsplashAccessKey || "").trim();
    if (!key) return "";
    const quality = imageQuality();
    const data = await fetchApiJson(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query || "quality background")}&orientation=landscape&per_page=${quality.perPage}`, {
        headers: {
            Authorization: `Client-ID ${key}`,
            "Accept-Version": "v1"
        }
    });
    const photo = pickRandom(Array.isArray(data?.results) ? data.results : []);
    return photo?.urls?.full || photo?.urls?.regular || photo?.urls?.raw || "";
};

const getDynamicImage = async (type = "menu", query = "") => {
    const fallbackMap = {
        menu: () => getRandomMenuImage(),
        sticker: () => getRandomStickerImage(),
        empress: () => getRandomStickerImage(),
        game: () => getPicsumImage(query),
        woodcut: () => getPicsumImage("forest lumberjack"),
        work: () => getPicsumImage("city work"),
        casino: () => getPicsumImage("casino table"),
        slot: () => getPicsumImage("slot machine"),
        blackjack: () => getPicsumImage("blackjack cards"),
        leaderboard: () => getPicsumImage("trophy leaderboard"),
        balance: () => getPicsumImage("money vault")
    };
    const fallback = fallbackMap[type] || fallbackMap.game;
    if (!imageApiEnabled()) return fallback();

    const config = global.imageApis || {};
    const waifuCategories = Array.isArray(config.waifuCategories) && config.waifuCategories.length ? config.waifuCategories : ["waifu", "neko"];
    const nekosTags = Array.isArray(config.nekosTags) && config.nekosTags.length ? config.nekosTags : ["girl", "cute"];
    const empressCharacters = Array.isArray(config.empressCharacters) && config.empressCharacters.length ? config.empressCharacters : ["Esdeath"];
    const gameQuery = query || config.gameQueries?.[type] || type;
    const isEmpressImage = ["menu", "sticker", "empress"].includes(type);
    const empressProviders = [
        ...shuffleItems(empressCharacters).map(name => () => getJikanCharacterImage(name)),
        ...shuffleItems([
            () => getWaifuImage(pickRandom(waifuCategories)),
            () => getNekosImage(pickRandom(nekosTags)),
            () => getPexelsImage("anime empress"),
            () => getUnsplashImage("anime empress"),
            () => getPixabayImage("anime empress"),
            () => getPicsumImage("empress")
        ])
    ];
    const gameProviders = shuffleItems([
        () => getPexelsImage(gameQuery),
        () => getUnsplashImage(gameQuery),
        () => getPixabayImage(gameQuery),
        () => getPicsumImage(gameQuery),
        () => getWaifuImage(type === "slot" || type === "casino" || type === "blackjack" ? "waifu" : "happy")
    ]);

    for (const provider of isEmpressImage ? empressProviders : gameProviders) {
        try {
            const image = await provider();
            if (image) return image;
        } catch (err) {
            console.error(`Image API failed for ${type}:`, err.message);
        }
    }
    return fallback();
};

const fetchImageBuffer = async (url = "") => {
    const timeout = Number(global.imageApis?.timeout || 9000);
    const res = await axios({
        url,
        method: "GET",
        responseType: "arraybuffer",
        timeout,
        maxRedirects: 5,
        headers: {
            Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            "User-Agent": "Mozilla/5.0 EmpireMD/2.0"
        }
    });
    const contentType = String(res.headers?.["content-type"] || "");
    if (contentType && !contentType.startsWith("image/")) throw new Error(`Expected image, got ${contentType}`);
    return Buffer.from(res.data);
};

module.exports = {
    getDynamicImage,
    getRandomMenuImage,
    getRandomStickerImage,
    fetchImageBuffer
};
