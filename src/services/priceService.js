// src/services/priceService.js
/**
 * Service to fetch live crypto prices from public APIs
 * with caching and fallback support.
 */

const CACHE_DURATION = 15000; // 15 seconds
const GOLD_COINGECKO_ID = "tether-gold";

let priceCache = {
    data: null,
    timestamp: 0
};

let goldCache = {
    data: null,
    timestamp: 0
};

// Primary API (CoinGecko)
// Primary API (CoinGecko)
const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,solana,binancecoin,ripple,cardano,dogecoin,polkadot,litecoin,chainlink&vs_currencies=usd";

// Backup API (CoinCap)
const COINCAP_API = "https://api.coincap.io/v2/assets?ids=bitcoin,ethereum,tether,solana,binancecoin,ripple,cardano,dogecoin,polkadot,litecoin,chainlink";

/**
 * Get current prices for major cryptocurrencies
 * @returns {Promise<Object>} Object with symbol as key and USD price as value
 */
function tickPrice(price) {
    if (!price || price <= 0) return price;

    const volatility = price > 10000 ? 0.0008
        : price > 100 ? 0.0012
        : price > 1 ? 0.002
        : 0.004;

    const change = price * volatility * (Math.random() * 2 - 1);
    const newPrice = Math.max(price * 0.98, price + change);
    return parseFloat(newPrice.toFixed(price > 1 ? 4 : 8));
}

export async function getCryptoPrices(forceRefresh = false) {
    const now = Date.now();

    // Return cached data if valid
    if (!forceRefresh && priceCache.data && (now - priceCache.timestamp < CACHE_DURATION)) {
        return priceCache.data;
    }

    try {
        // Try CoinGecko first
        const response = await fetch(COINGECKO_API);
        if (!response.ok) throw new Error("CoinGecko failed");

        const data = await response.json();
        const goldPrice = await getGoldPrice();

        const prices = {
            BTC: data.bitcoin.usd,
            ETH: data.ethereum.usd,
            USDT: data.tether.usd,
            SOL: data.solana.usd,
            BNB: data.binancecoin.usd,
            XRP: data.ripple.usd,
            ADA: data.cardano.usd,
            DOGE: data.dogecoin.usd,
            DOT: data.polkadot.usd,
            LTC: data.litecoin.usd,
            LINK: data.chainlink.usd,
            XAU: goldPrice,
        };

        priceCache = { data: prices, timestamp: now };
        return prices;
    } catch (error) {
        console.warn("CoinGecko price fetch failed, trying backup...", error);

        try {
            // Fallback to CoinCap
            const response = await fetch(COINCAP_API);
            if (!response.ok) throw new Error("CoinCap failed");

            const json = await response.json();
            const prices = {};

            json.data.forEach(asset => {
                const symbol = asset.symbol.toUpperCase();
                prices[symbol] = parseFloat(asset.priceUsd);
            });

            // Ensure USDT is 1 if missing or slightly off
            if (!prices.USDT) prices.USDT = 1;

            priceCache = { data: prices, timestamp: now };
            return prices;
        } catch (backupError) {
            console.error("All price APIs failed", backupError);
            // Return defaults if everything fails to avoid crashing
            return {
                BTC: 42000,
                ETH: 2200,
                USDT: 1,
                SOL: 100,
                BNB: 300
            };
        }
    }
}

/**
 * Get live spot gold price (XAUt tracks 1 troy oz of gold)
 * @returns {Promise<number>}
 */
export async function getGoldPrice(forceRefresh = false) {
    const now = Date.now();

    if (!forceRefresh && goldCache.data && (now - goldCache.timestamp < CACHE_DURATION)) {
        return goldCache.data;
    }

    try {
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${GOLD_COINGECKO_ID}&vs_currencies=usd`
        );
        if (!response.ok) throw new Error("Gold price fetch failed");

        const data = await response.json();
        const price = data[GOLD_COINGECKO_ID]?.usd;
        if (!price) throw new Error("No gold price in response");

        goldCache = { data: price, timestamp: now };
        return price;
    } catch (error) {
        console.warn("Gold price fetch failed:", error);
        return goldCache.data || 0;
    }
}

/**
 * Gold market row for dashboard lists (matches Trade page coin id "gold")
 */
export async function getGoldMarketData(forceRefresh = false) {
    try {
        if (
            !forceRefresh &&
            goldCache.data &&
            (Date.now() - goldCache.timestamp < CACHE_DURATION)
        ) {
            return buildGoldMarketRow(goldCache.data, goldCache.meta || {});
        }

        const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${GOLD_COINGECKO_ID}`
        );
        if (!response.ok) throw new Error("Gold market fetch failed");

        const data = await response.json();
        const coin = data[0];
        if (!coin) throw new Error("No gold market data");

        goldCache = {
            data: coin.current_price,
            timestamp: Date.now(),
            meta: {
                image: coin.image,
                price_change_percentage_24h: coin.price_change_percentage_24h ?? 0,
                total_volume: coin.total_volume ?? 0,
                high_24h: coin.high_24h ?? coin.current_price,
                low_24h: coin.low_24h ?? coin.current_price,
            },
        };

        return buildGoldMarketRow(coin.current_price, {
            image: coin.image,
            price_change_percentage_24h: coin.price_change_percentage_24h,
            total_volume: coin.total_volume,
            high_24h: coin.high_24h,
            low_24h: coin.low_24h,
        });
    } catch (error) {
        console.warn("Gold market fetch failed:", error);
        const price = await getGoldPrice(forceRefresh);
        return buildGoldMarketRow(price);
    }
}

function buildGoldMarketRow(price, meta = {}) {
    return {
        id: "gold",
        symbol: "xau",
        name: "Gold",
        image: meta.image || "https://assets.coingecko.com/coins/images/10481/large/Tether_Gold.png",
        current_price: price,
        price_change_percentage_24h: meta.price_change_percentage_24h ?? 0,
        total_volume: meta.total_volume ?? 0,
        high_24h: meta.high_24h ?? price,
        low_24h: meta.low_24h ?? price,
    };
}

/**
 * Live price feed: 2s ticks + periodic API re-anchor (same as Home marketplace)
 * @returns {() => void} cleanup
 */
export function subscribeLivePrices(setPrices, { tickMs = 2000, anchorMs = 30000 } = {}) {
    let current = {};
    let cancelled = false;

    async function anchor() {
        try {
            const fresh = await getCryptoPrices(true);
            if (cancelled) return;
            current = { ...fresh };
            setPrices({ ...current });
        } catch (error) {
            console.warn("Live price anchor failed:", error);
        }
    }

    anchor();

    const tickId = setInterval(() => {
        if (!Object.keys(current).length) return;
        const next = {};
        for (const [sym, price] of Object.entries(current)) {
            next[sym] = tickPrice(price);
        }
        current = next;
        setPrices({ ...next });
    }, tickMs);

    const anchorId = setInterval(anchor, anchorMs);

    return () => {
        cancelled = true;
        clearInterval(tickId);
        clearInterval(anchorId);
    };
}

/** USD price for a symbol from a live price map */
export function getUsdPrice(prices, symbol) {
    if (!prices || !symbol) return 1;
    const sym = symbol.toUpperCase();
    if (sym === "USDT" || sym === "USD") return prices.USDT || 1;
    return prices[sym] || 1;
}

/** How much `toSymbol` you receive per 1 unit of `fromSymbol` */
export function getConversionRate(prices, fromSymbol, toSymbol) {
    if (fromSymbol === toSymbol) return 1;
    const fromUsd = getUsdPrice(prices, fromSymbol);
    const toUsd = getUsdPrice(prices, toSymbol);
    return fromUsd / toUsd;
}

/**
 * Get price for a specific symbol
 * @param {string} symbol 
 * @returns {Promise<number>}
 */
export async function getPriceBySymbol(symbol) {
    const sym = symbol.toUpperCase();
    if (sym === "XAU") {
        return getGoldPrice();
    }
    const prices = await getCryptoPrices();
    return prices[sym] || 0;
}
