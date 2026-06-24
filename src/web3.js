(function () {
  const C = window.GOLDHAVEN_CONFIG || {};
  const ABI = window.GOLDHAVEN_ABI || {};
  const ZERO = '0x0000000000000000000000000000000000000000';
  let provider;
  let signer;
  let account;
  let ghvDecimals;
  const state = {
    pendingArenaTokens: new Set(),
    ethBalance: 0n,
    ghvBalance: 0n,
    myStake: 0n,
    pendingDividendEpochs: [],
    pendingDividendAmount: 0n,
    pendingDividendRefreshSeq: 0,
    lastNfts: []
  };

  const LS_CONNECTED = 'goldhavenWalletConnected';
  const LS_ACCOUNT = 'goldhavenWalletAccount';

  const CLASS_NAMES = ['Zhanjiang / 战将','Yingren / 影刃','Fangshi / 方士','Zhenyue / 镇岳','Shenshe / 神射','Yuhun / 御魂','Huanying / 幻影'];
  const ELEMENT_NAMES = ['Earth / 土','Wind / 风','Water / 水','Fire / 火','Light / 光','Dark / 暗','Void / 空'];
  const BEAST_NAMES = ['Huanglong / 黄龙','Baize / 白泽','Xuanwu / 玄武','Zhuque / 朱雀','Baihu / 白虎','Jiuwei / 九尾','Dijiang / 帝江'];
  const FATE_NAMES = ['None / 无','Pojun / 破军','Guxing / 孤星','Guiren / 贵人','Tianyi / 天乙','Shipo / 十魄','Jiesha / 劫煞'];
  const SKILL_NAMES = [
    'DiMai / 地脉','ShanGu / 山骨','HouTu / 厚土','YanZhen / 岩阵','LiuYun / 流云','JiXing / 疾行','FengQie / 风切','HuiShen / 回身','HanChao / 寒潮','ChaoSheng / 潮生','ShuiJing / 水镜','ChiShui / 迟水','ZhuHuo / 祝火','LieYan / 烈焰','FenXin / 焚心','HuoMai / 火脉','ShenHui / 神辉','PoXiao / 破晓','MingJing / 明镜','CaiGuang / 裁光','ShiHun / 蚀魂','AnShi / 暗蚀','YeXing / 夜行','HunYin / 魂饮','DuanKong / 断空','CuoWei / 错位','NiXiang / 逆象','GuiYing / 归影',
    'LongQiang / 龙枪','TieQi / 铁骑','ZhenYue / 镇岳','YingXi / 影袭','LianRen / 连刃','BaiZeYin / 白泽印','XuanWuZhen / 玄武阵','FuYueZhen / 覆岳阵','ChiShuiFu / 迟水符','ZhuQueDunFan / 朱雀盾反','ZhenTianBi / 镇天壁','ChiYuShou / 赤羽守','GuanRiShi / 贯日矢','BaiHuChuanYun / 白虎穿云','PoZhouJian / 破咒箭','JiuWeiZhouYin / 九尾咒印','SheHunFan / 摄魂幡','SuoHunDeng / 锁魂灯','WuMianBu / 无面步','XuShiJie / 虚实界','DuanXuYin / 断序印',
    'WanYueGuanQiang / 万岳贯枪','HuangLongBengZhen / 黄龙崩阵','ShanHeDingSha / 山河定杀','JueYingSha / 绝影杀','ShuangRenZhuiHun / 双刃追魂','BaiZeLieXi / 白泽裂隙','BeiHaiFengJie / 北海封界','ZhenWuGuiLiu / 真武归流','ShuiJingZhenFu / 水镜镇伏','BuMieHuoYu / 不灭火羽','ZhuQueFenTian / 朱雀焚天','ChiYanZhenHun / 赤焰镇魂','LuoXingShi / 落星矢','BaiHuCaiJue / 白虎裁决','LianZhuZhongShi / 连珠终矢','SanHunZhouBao / 三魂咒爆','WanGuiGuiFan / 万鬼归幡','DuanPo / 断魄','WanXiangGuiKong / 万象归空','DiJiangWuMian / 帝江无面','XuKongZhongCai / 虚空终裁',
    'DiMaiLongWei / 地脉龙威','WanLingShiPo / 万灵识破','BeiMingJia / 北冥甲','ChiYuNieHuo / 赤羽涅火','LieKongCaiGu / 裂空裁骨','HunQi / 魂契','WuXiangDuanXu / 无相断序'
  ];

  const $ = (id) => document.getElementById(id);
  const cfgAddress = (key) => (C.addresses && C.addresses[key] || '').trim();
  const hasAddress = (key) => /^0x[a-fA-F0-9]{40}$/.test(cfgAddress(key)) && cfgAddress(key) !== ZERO;
  const short = (a) => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '';
  const safeBig = (v, fallback = 0n) => { try { return BigInt(v); } catch { return fallback; } };
  const nowDayId = () => Math.floor(Date.now() / 1000 / 86400);
  const langNow = () => (localStorage.getItem('goldhavenLang') || document.documentElement.dataset.lang || 'en').startsWith('zh') ? 'zh' : 'en';
  const L = (en, zh) => langNow() === 'zh' ? zh : en;

  function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
  async function waitForEthereum(timeout = 6000) {
    if (window.ethereum) return window.ethereum;
    return await new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        window.removeEventListener('ethereum#initialized', finish);
        resolve(window.ethereum || null);
      };
      window.addEventListener('ethereum#initialized', finish, { once: true });
      const start = Date.now();
      const timer = setInterval(() => {
        if (window.ethereum || Date.now() - start >= timeout) {
          clearInterval(timer);
          finish();
        }
      }, 150);
    });
  }
  async function readAccountsWithRetry(maxAttempts = 8) {
    const eth = await waitForEthereum();
    if (!eth) return [];
    const ethers = requireEthers();
    provider = new ethers.BrowserProvider(eth);
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const accounts = await provider.send('eth_accounts', []);
        if (accounts?.[0]) return accounts;
        if (eth.selectedAddress) return [eth.selectedAddress];
      } catch {}
      await sleep(250);
    }
    return [];
  }

  function log(message, kind = 'info') {
    const el = $('contractLog');
    if (!el) return;
    const line = document.createElement('div');
    line.className = `contract-log-line ${kind}`;
    line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    el.prepend(line);
  }

  function ensureDisconnectButtons() {
    document.querySelectorAll('#connectWallet').forEach((btn) => {
      const wrap = btn.parentElement || document.body;
      if (!wrap.querySelector('#disconnectWallet')) {
        const d = document.createElement('button');
        d.className = 'wallet wallet-disconnect';
        d.id = 'disconnectWallet';
        d.type = 'button';
        d.dataset.i18n = 'disconnectWallet';
        d.textContent = L('Disconnect','断开连接');
        d.style.display = 'none';
        btn.insertAdjacentElement('afterend', d);
      }
    });
  }

  function updateWalletUI(addr) {
    ensureDisconnectButtons();
    document.querySelectorAll('[data-wallet-address]').forEach((el) => { el.textContent = addr ? short(addr) : '—'; });
    document.querySelectorAll('#connectWallet').forEach((btn) => {
      btn.textContent = addr ? short(addr) : L('Connect Wallet','连接钱包');
      btn.classList.toggle('connected', Boolean(addr));
    });
    document.querySelectorAll('#disconnectWallet').forEach((btn) => {
      btn.textContent = L('Disconnect','断开连接');
      btn.style.display = addr ? '' : 'none';
    });
  }

  function requireEthers() {
    if (!window.ethers) throw new Error('ethers.js is not loaded.');
    return window.ethers;
  }

  async function connect() {
    const ethers = requireEthers();
    const eth = await waitForEthereum(8000);
    if (!eth) throw new Error('No injected wallet found. Install MetaMask/Rabby.');
    provider = new ethers.BrowserProvider(eth);
    const accounts = await provider.send('eth_requestAccounts', []);
    account = accounts[0];
    signer = await provider.getSigner();
    if (C.chainId) {
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== Number(C.chainId)) {
        log(`Connected to chain ${network.chainId}, expected ${C.chainId}.`, 'warn');
      }
    }
    localStorage.setItem(LS_CONNECTED, '1');
    if (account) localStorage.setItem(LS_ACCOUNT, account);
    updateWalletUI(account);
    log(`Wallet connected: ${account}`);
    await refreshDashboard();
    await refreshMyNfts().catch((e) => log(e.message, 'warn'));
    return { provider, signer, account };
  }

  async function restoreExistingSession() {
    const cached = localStorage.getItem(LS_ACCOUNT) || '';
    if (localStorage.getItem(LS_CONNECTED) === '1' && cached) updateWalletUI(cached);
    const accounts = await readAccountsWithRetry();
    account = accounts?.[0] || cached || '';
    if (!account) {
      signer = undefined;
      updateWalletUI('');
      return '';
    }
    if (accounts?.[0]) {
      signer = await provider.getSigner();
      localStorage.setItem(LS_ACCOUNT, account);
    }
    updateWalletUI(account);
    await refreshDashboard().catch((e) => log(e.message, 'warn'));
    await refreshMyNfts().catch((e) => log(e.message, 'warn'));
    return account;
  }

  async function disconnectLocal() {
    account = undefined;
    signer = undefined;
    localStorage.removeItem(LS_ACCOUNT);
    updateWalletUI('');
    await refreshDashboard().catch(() => {});
    await refreshMyNfts().catch(() => {});
  }

  async function getProvider() {
    if (provider) return provider;
    const ethers = requireEthers();
    const eth = await waitForEthereum(6000);
    if (eth) {
      provider = new ethers.BrowserProvider(eth);
      return provider;
    }
    throw new Error('No wallet provider found.');
  }

  async function getSigner() {
    if (!signer) await connect();
    return signer;
  }

  function requireAddress(key) {
    if (!hasAddress(key)) throw new Error(`Missing contract address: ${key}. Fill config/contracts.js first.`);
    return cfgAddress(key);
  }

  async function contract(key, abiKey, write = false) {
    const ethers = requireEthers();
    const addr = requireAddress(key);
    const runner = write ? await getSigner() : await getProvider();
    return new ethers.Contract(addr, ABI[abiKey], runner);
  }

  async function decimals() {
    if (ghvDecimals !== undefined) return ghvDecimals;
    if (!hasAddress('ghvToken')) return 18;
    const token = await contract('ghvToken', 'erc20');
    ghvDecimals = Number(await token.decimals());
    return ghvDecimals;
  }

  async function parseGhv(value) {
    const ethers = requireEthers();
    return ethers.parseUnits(String(value || '0'), await decimals());
  }

  async function formatGhv(value, places = 4) {
    const ethers = requireEthers();
    return trimDecimals(ethers.formatUnits(value || 0n, await decimals()), places);
  }

  function formatEth(value, places = 6, suffix = true) {
    const ethers = requireEthers();
    const out = trimDecimals(ethers.formatEther(value || 0n), places);
    return suffix ? `${out} ${C.nativeSymbol || 'ETH'}` : out;
  }

  function formatUsdWad(value, places = 2) {
    const ethers = requireEthers();
    return `$${trimDecimals(ethers.formatUnits(value || 0n, 18), places)}`;
  }

  function trimDecimals(x, places = 4) {
    const [a, b = ''] = String(x).split('.');
    if (!b || places === 0) return a;
    const cut = b.slice(0, places).replace(/0+$/, '');
    return cut ? `${a}.${cut}` : a;
  }

  function setText(id, value) {
    document.querySelectorAll(`#${id}`).forEach((el) => { el.textContent = value; });
  }

  function setInputValue(id, value) {
    const el = $(id);
    if (el) el.value = value;
  }

  function v4Config() { return C.uniswapV4 || {}; }

  function slippageBps() {
    const n = Number(C.quoteSlippageBps ?? v4Config().quoteSlippageBps ?? 100);
    return Number.isFinite(n) && n >= 0 && n < 10_000 ? Math.floor(n) : 100;
  }

  function poolKey() {
    return {
      currency0: v4Config().ethCurrency || ZERO,
      currency1: requireAddress('ghvToken'),
      fee: Number(v4Config().poolFee || 3000),
      tickSpacing: Number(v4Config().tickSpacing || 60),
      hooks: requireAddress('ghvHook')
    };
  }

  let curveCache = { K: 21_000_000, S: 295.537394935162868716 };

  async function refreshCurveConstants(hook) {
    const ethers = requireEthers();
    if (!hook) hook = await contract('ghvHook', 'hook');
    const [kWei, sWei] = await Promise.all([
      hook.K_SUPPLY().catch(() => null),
      hook.S().catch(() => null)
    ]);
    if (kWei) curveCache.K = Number(ethers.formatEther(kWei));
    if (sWei) curveCache.S = Number(ethers.formatEther(sWei));
    return curveCache;
  }

  function reserveEthToMintedHuman(reserveEth) {
    const K = curveCache.K;
    const S = curveCache.S;
    if (!Number.isFinite(reserveEth) || reserveEth <= 0) return 0;
    return K * (1 - Math.exp(-reserveEth / S));
  }

  function mintedHumanToReserveEth(mintedHuman) {
    const K = curveCache.K;
    const S = curveCache.S;
    if (!Number.isFinite(mintedHuman) || mintedHuman <= 0) return 0;
    const clipped = Math.min(mintedHuman, K * 0.999999999999);
    return -S * Math.log(1 - clipped / K);
  }

  function fixedForParse(value, decimals = 18) {
    if (!Number.isFinite(value) || value <= 0) return '0';
    if (value >= 1e24) return '0';
    return value.toFixed(decimals).replace(/\.?0+$/, '');
  }

  async function tokenWeiFromHuman(value) {
    const ethers = requireEthers();
    return ethers.parseUnits(fixedForParse(value, await decimals()), await decimals());
  }

  function ethWeiFromHuman(value) {
    const ethers = requireEthers();
    return ethers.parseEther(fixedForParse(value, 18));
  }

  function bigintMulDiv(x, n, d) {
    return (x * BigInt(n)) / BigInt(d);
  }

  async function buyQuoteFromEth(ethInWei) {
    const ethers = requireEthers();
    const hook = await contract('ghvHook', 'hook');
    await refreshCurveConstants(hook);
    const [reserveWei, genesisBlock, entropyBlocks, thresholdUsd] = await Promise.all([
      hook.curveReserveEth().catch(() => 0n),
      hook.GENESIS_BLOCK().catch(() => 0n),
      hook.ENTROPY_BLOCKS().catch(() => 0n),
      hook.NFT_THRESHOLD_USD_WAD().catch(() => safeBig(C.nftMintThresholdUsdWad, 50n * 10n ** 18n))
    ]);
    const deprecated = false;
    const feeWei = bigintMulDiv(ethInWei, Number(v4Config().buyFeeBps ?? 200), 10_000);
    const curveWei = ethInWei - feeWei;
    const beforeEth = Number(ethers.formatEther(reserveWei));
    const afterEth = Number(ethers.formatEther(reserveWei + curveWei));
    const fairHuman = Math.max(0, reserveEthToMintedHuman(afterEth) - reserveEthToMintedHuman(beforeEth));
    const fairWei = await tokenWeiFromHuman(fairHuman);
    const currentBlock = await (await getProvider()).getBlockNumber().catch(() => 0);
    const entropyActive = BigInt(currentBlock) < safeBig(genesisBlock) + safeBig(entropyBlocks);
    const minEntropyWei = entropyActive ? bigintMulDiv(fairWei, 9000, 10000) : fairWei;
    const maxEntropyWei = entropyActive ? bigintMulDiv(fairWei, 11000, 10000) : fairWei;
    let buyUsdWad = 0n;
    if (hasAddress('priceOracle')) {
      try { buyUsdWad = await (await contract('priceOracle', 'priceOracle')).ethToUsdWad(ethInWei); } catch {}
    }
    const minOutWei = bigintMulDiv(minEntropyWei, 10_000 - slippageBps(), 10_000);
    return { ethInWei, reserveWei, deprecated, feeWei, curveWei, fairWei, minEntropyWei, maxEntropyWei, entropyActive, minOutWei, buyUsdWad, thresholdUsd };
  }

  async function quoteHookBuy() {
    const ethers = requireEthers();
    if (!hasAddress('ghvHook') || !hasAddress('ghvToken')) throw new Error('Fill ghvHook and ghvToken first.');
    const ethIn = ethers.parseEther(String($('tradeBuyEthAmount')?.value || '0'));
    if (ethIn <= 0n) throw new Error('Enter a buy amount greater than zero.');
    const maxBuy = await (await contract('ghvHook', 'hook')).MAX_BUY_WEI().catch(() => ethers.parseEther(v4Config().maxBuyEth || '5'));
    if (ethIn > maxBuy) log(`Buy amount exceeds max buy ${ethers.formatEther(maxBuy)} ETH.`, 'warn');
    const q = await buyQuoteFromEth(ethIn);
    const outText = q.entropyActive ? `${await formatGhv(q.minEntropyWei, 4)} – ${await formatGhv(q.maxEntropyWei, 4)} GHV` : `${await formatGhv(q.fairWei, 4)} GHV`;
    setText('quoteBuyGhvOut', outText);
    setText('quoteBuyTax', formatEth(q.feeWei, 6));
    setText('quoteBuyCurveEth', formatEth(q.curveWei, 6));
    if (q.buyUsdWad > 0n) {
      const usd = Number(ethers.formatUnits(q.buyUsdWad, 18));
      const th = Number(ethers.formatUnits(q.thresholdUsd, 18));
      setText('quoteBuyNftStatus', `${usd.toFixed(2)}U ${usd > th ? '✓ NFT' : `< ${th.toFixed(0)}U`}`);
    } else setText('quoteBuyNftStatus', 'Oracle unavailable');
    setInputValue('tradeBuyMinOut', await formatGhv(q.minOutWei, 8));
    log(`Buy quote: ${outText}.`);
    return q;
  }

  async function sellQuoteFromGhv(ghvInWei) {
    const ethers = requireEthers();
    const [hook, token] = await Promise.all([contract('ghvHook', 'hook'), contract('ghvToken', 'erc20')]);
    await refreshCurveConstants(hook);
    const [reserveWei, actualSupplyWei] = await Promise.all([
      hook.curveReserveEth().catch(() => 0n),
      token.totalSupply().catch(() => 0n)
    ]);
    if (actualSupplyWei <= 0n) throw new Error('Token supply is zero; sell quote unavailable.');
    const reserveEth = Number(ethers.formatEther(reserveWei));
    const currentFairHuman = reserveEthToMintedHuman(reserveEth);
    const actualSupplyHuman = Number(ethers.formatUnits(actualSupplyWei, await decimals()));
    const ghvInHuman = Number(ethers.formatUnits(ghvInWei, await decimals()));
    const ghvFairHuman = Math.min(currentFairHuman, ghvInHuman * currentFairHuman / Math.max(actualSupplyHuman, 1e-18));
    const beforeReserve = mintedHumanToReserveEth(currentFairHuman);
    const afterReserve = mintedHumanToReserveEth(Math.max(0, currentFairHuman - ghvFairHuman));
    const rawEthWei = ethWeiFromHuman(Math.max(0, beforeReserve - afterReserve));
    const feeWei = bigintMulDiv(rawEthWei, Number(v4Config().sellFeeBps ?? 200), 10_000);
    const ethOutWei = rawEthWei - feeWei;
    const minEthOutWei = bigintMulDiv(ethOutWei, 10_000 - slippageBps(), 10_000);
    return { ghvInWei, reserveWei, actualSupplyWei, currentFairHuman, ghvFairHuman, rawEthWei, feeWei, ethOutWei, minEthOutWei };
  }

  async function quoteHookSell() {
    const ethers = requireEthers();
    if (!hasAddress('ghvHook') || !hasAddress('ghvToken')) throw new Error('Fill ghvHook and ghvToken first.');
    const ghvIn = await parseGhv($('tradeSellGhvAmount')?.value || '0');
    if (ghvIn <= 0n) throw new Error('Enter a sell amount greater than zero.');
    const q = await sellQuoteFromGhv(ghvIn);
    setText('quoteSellEthOut', formatEth(q.ethOutWei, 8));
    setText('quoteSellTax', formatEth(q.feeWei, 8));
    setText('quoteSellRawEth', formatEth(q.rawEthWei, 8));
    setInputValue('tradeSellMinEth', trimDecimals(ethers.formatEther(q.minEthOutWei), 12));
    if (account) {
      const token = await contract('ghvToken', 'erc20');
      const [allowance, last, cd] = await Promise.all([
        hasAddress('uniswapV4Router') ? token.allowance(account, cfgAddress('uniswapV4Router')).catch(() => 0n) : Promise.resolve(0n),
        (await contract('ghvHook', 'hook')).lastBuyBlock(account).catch(() => 0n),
        (await contract('ghvHook', 'hook')).COOLDOWN_BLOCKS().catch(() => 1n)
      ]);
      const block = BigInt(await (await getProvider()).getBlockNumber().catch(() => 0));
      const remain = last > 0n && block - last < cd ? cd - (block - last) : 0n;
      setText('quoteSellCooldown', `${remain > 0n ? remain + ' blocks' : 'Ready'} · allowance ${await formatGhv(allowance, 2)}`);
    } else setText('quoteSellCooldown', 'Connect wallet');
    log(`Sell quote: ${await formatGhv(ghvIn, 4)} GHV → ${formatEth(q.ethOutWei, 8)}.`);
    return q;
  }

  async function executeHookBuy() {
    const ethers = requireEthers();
    await getSigner();
    if (!hasAddress('uniswapV4Router')) throw new Error('Fill uniswapV4Router first.');
    const ethIn = ethers.parseEther(String($('tradeBuyEthAmount')?.value || '0'));
    if (ethIn <= 0n) throw new Error('Enter a buy amount greater than zero.');
    const q = await quoteHookBuy();
    const minOut = await parseGhv($('tradeBuyMinOut')?.value || ethers.formatUnits(q.minOutWei, await decimals()));
    const router = await contract('uniswapV4Router', 'v4SwapRouter', true);
    const key = poolKey();
    await router.buy.staticCall(key, minOut, { value: ethIn });
    const gas = await router.buy.estimateGas(key, minOut, { value: ethIn });
    const tx = await router.buy(key, minOut, { value: ethIn, gasLimit: gas + 100000n });
    log(`Hook buy submitted: ${tx.hash}`);
    await tx.wait();
    log('Hook buy confirmed.');
    await refreshDashboard();
    await refreshMyNfts().catch(() => {});
  }

  async function approveGhvForRouter() {
    const amount = await parseGhv($('tradeSellGhvAmount')?.value || '0');
    const token = await contract('ghvToken', 'erc20', true);
    const tx = await token.approve(requireAddress('uniswapV4Router'), amount);
    log(`Router approve submitted: ${tx.hash}`);
    await tx.wait();
    log('Router approve confirmed.');
    await quoteHookSell().catch(() => {});
  }

  async function executeHookSell() {
    await getSigner();
    if (!hasAddress('uniswapV4Router')) throw new Error('Fill uniswapV4Router first.');
    const ghvIn = await parseGhv($('tradeSellGhvAmount')?.value || '0');
    if (ghvIn <= 0n) throw new Error('Enter a sell amount greater than zero.');
    const q = await quoteHookSell();
    const minEthOut = requireEthers().parseEther(String($('tradeSellMinEth')?.value || requireEthers().formatEther(q.minEthOutWei)));
    const token = await contract('ghvToken', 'erc20', true);
    const [balance, allowance] = await Promise.all([
      token.balanceOf(account).catch(() => 0n),
      token.allowance(account, cfgAddress('uniswapV4Router')).catch(() => 0n)
    ]);
    if (balance < ghvIn) throw new Error(`Insufficient GHV balance. You have ${await formatGhv(balance, 4)} GHV.`);
    if (allowance < ghvIn) {
      const approveTx = await token.approve(requireAddress('uniswapV4Router'), ghvIn);
      log(`Router approve submitted: ${approveTx.hash}`);
      await approveTx.wait();
      log('Router approve confirmed.');
    }
    const router = await contract('uniswapV4Router', 'v4SwapRouter', true);
    const key = poolKey();
    await router.sell.staticCall(key, ghvIn, minEthOut);
    const gas = await router.sell.estimateGas(key, ghvIn, minEthOut);
    const tx = await router.sell(key, ghvIn, minEthOut, { gasLimit: gas + 100000n });
    log(`Hook sell submitted: ${tx.hash}`);
    await tx.wait();
    log('Hook sell confirmed.');
    await refreshDashboard();
  }

  async function refreshDashboard() {
    const tasks = [];
    if (hasAddress('ghvHook')) tasks.push(refreshHookStats());
    if (hasAddress('ghvToken') && account) tasks.push(refreshWalletTokenStats());
    if (hasAddress('goldhavenVault')) tasks.push(refreshStakeStats());
    if (hasAddress('arenaFactory')) tasks.push(refreshArenaFactoryStats());
    if (hasAddress('activeArena')) tasks.push(refreshArenaReadOnly());
    if (!tasks.length) {
      log('No contract addresses configured yet.', 'warn');
      return;
    }
    await Promise.allSettled(tasks);
    if (account) await updateEthBalance().catch(() => {});
    log('On-chain data refreshed.');
  }

  async function refreshHookStats() {
    const ethers = requireEthers();
    const hook = await contract('ghvHook', 'hook');
    await refreshCurveConstants(hook);
    const [vaultEth, reserve, minted, price, kSupply] = await Promise.all([
      hook.arenaVaultEth().catch(() => 0n),
      hook.curveReserveEth().catch(() => 0n),
      hook.totalMintedFair().catch(() => 0n),
      hook.marginalPrice().catch(() => 0n),
      hook.K_SUPPLY().catch(() => 0n)
    ]);
    setText('tradeArenaVault', formatEth(vaultEth));
    setText('tradeCurveReserve', formatEth(reserve));
    setText('tradeTotalMinted', `${await formatGhv(minted, 2)} GHV`);
    setText('tradeMaxSupply', `${await formatGhv(kSupply || ethers.parseEther(String(curveCache.K)), 0)} GHV`);
    const mintNet = price ? (price * 10000n) / 9800n : 0n;
    const burnNet = price ? (price * 9800n) / 10000n : 0n;
    setText('tradeMintPrice', price ? `${trimDecimals(ethers.formatEther(mintNet), 12)} ETH/GHV` : '—');
    setText('tradeBurnPrice', price ? `${trimDecimals(ethers.formatEther(burnNet), 12)} ETH/GHV` : '—');
    // Backward-compatible IDs used on other pages.
    setText('onchainArenaVault', formatEth(vaultEth));
    setText('onchainArenaVaultPanel', formatEth(vaultEth));
    setText('onchainTodayFunding', formatEth((vaultEth * 70n) / 100n));
    setText('onchainCurveReserve', formatEth(reserve));
    setText('onchainTotalMinted', `${await formatGhv(minted, 2)} GHV`);
    setText('onchainMarginalPrice', price ? `${trimDecimals(ethers.formatEther(price), 10)} ETH/GHV` : '—');
  }

  async function updateEthBalance() {
    state.ethBalance = await (await getProvider()).getBalance(account).catch(() => 0n);
  }

  async function refreshWalletTokenStats() {
    const token = await contract('ghvToken', 'erc20');
    state.ghvBalance = await token.balanceOf(account).catch(() => 0n);
    setText('myGhvBalance', `${await formatGhv(state.ghvBalance, 4)} GHV`);
  }

  async function refreshStakeStats() {
    const vault = await contract('goldhavenVault', 'vault');
    const [totalStake, avgToken, avgUsd, lockWindow, nextEpoch] = await Promise.all([
      vault.totalTokenStaked().catch(() => 0n),
      vault.averageTokenAmount24h().catch(() => 0n),
      vault.averageLockUsdWad24h().catch(() => 0n),
      vault.isArenaLockWindow().catch(() => false),
      vault.nextDividendEpochId().catch(() => 0n)
    ]);
    setText('stakeTotalAmount', `${await formatGhv(totalStake, 2)} GHV`);
    setText('onchainTotalTokenStaked', `${await formatGhv(totalStake, 2)} GHV`);
    setText('onchainAvgToken24h', `${await formatGhv(avgToken, 2)} GHV`);
    setText('onchainAvgUsd24h', formatUsdWad(avgUsd, 2));
    setText('onchainLockWindow', lockWindow ? 'Closed / 禁止操作' : 'Open / 可操作');
    setText('onchainNextEpoch', nextEpoch.toString());
    if (account) {
      const [mine, myAvg, valid] = await Promise.all([
        vault.tokenStakeOf(account).catch(() => 0n),
        vault.userAverageTokenAmount24h(account).catch(() => 0n),
        vault.isValidator(account).catch(() => false)
      ]);
      state.myStake = mine;
      setText('stakeMyAmount', `${await formatGhv(mine, 4)} GHV`);
      setText('stakeMyAvg24h', `${await formatGhv(myAvg, 4)} GHV`);
      setText('stakeValidatorStatus', valid ? 'Active / 已有验证权限' : 'Inactive / 暂无验证权限');
      setText('onchainMyStake', `${await formatGhv(mine, 2)} GHV`);
      setText('onchainMyAvg', `${await formatGhv(myAvg, 2)} GHV`);
      setText('onchainValidator', valid ? 'Active / 已激活' : 'Inactive / 未激活');
      await refreshPendingDividends(vault, nextEpoch);
    } else {
      setText('stakeMyAmount', 'Connect wallet');
      setText('stakeMyAvg24h', '—');
      setText('stakeValidatorStatus', '—');
      setText('stakePendingDividend', 'Connect wallet');
      setText('stakePendingEpochs', '—');
    }
  }

  async function refreshPendingDividends(vault, nextEpoch) {
    const seq = ++state.pendingDividendRefreshSeq;
    const localEpochs = [];
    let localAmount = 0n;
    const seen = new Set();
    const next = Number(nextEpoch || 0n);
    if (!next || next <= 1) {
      if (seq === state.pendingDividendRefreshSeq) {
        state.pendingDividendEpochs = [];
        state.pendingDividendAmount = 0n;
        setText('stakePendingDividend', '0 ETH');
        setText('stakePendingEpochs', '—');
      }
      return;
    }
    const maxScan = Number(C.dividendScanMax || 80);
    const start = Math.max(1, next - maxScan);
    for (let id = start; id < next; id++) {
      try {
        const epochId = BigInt(id);
        const key = epochId.toString();
        if (seen.has(key)) continue;
        const claimed = await vault.dividendClaimed(epochId, account);
        if (claimed) continue;
        const preview = await vault.previewDividend(epochId, account);
        const amount = BigInt(preview.amount ?? preview[0] ?? 0n);
        if (amount > 0n) {
          seen.add(key);
          localEpochs.push(epochId);
          localAmount += amount;
        }
      } catch {}
    }
    // Commit atomically so concurrent refreshes cannot temporarily double-count epochs.
    if (seq !== state.pendingDividendRefreshSeq) return;
    state.pendingDividendEpochs = localEpochs;
    state.pendingDividendAmount = localAmount;
    setText('stakePendingDividend', formatEth(localAmount, 8));
    setText('stakePendingEpochs', localEpochs.length ? localEpochs.map(String).join(', ') : '—');
  }

  async function refreshArenaFactoryStats() {
    const factory = await contract('arenaFactory', 'arenaFactory');
    const [open, todayArena] = await Promise.all([
      factory.isOpenWindow().catch(() => false),
      factory.arenaOfDay(nowDayId()).catch(() => ZERO)
    ]);
    setText('onchainOpenWindow', open ? 'Open now / 可开启' : 'Closed now / 未开放');
    setText('onchainOpenWindowPanel', open ? 'Open now / 可开启' : 'Closed now / 未开放');
    setText('onchainTodayArena', todayArena && todayArena !== ZERO ? todayArena : '—');
    if (!hasAddress('activeArena') && todayArena && todayArena !== ZERO) C.addresses.activeArena = todayArena;
  }

  async function refreshArenaReadOnly() {
    const arena = await contract('activeArena', 'arena');
    const bal = await (await getProvider()).getBalance(cfgAddress('activeArena')).catch(() => 0n);
    const [round, finished, champion, totalVerifications] = await Promise.all([
      arena.currentRoundNumber().catch(() => 0n),
      arena.finished().catch(() => false),
      arena.championTokenId().catch(() => 0n),
      arena.totalVerifications().catch(() => 0n)
    ]);
    setText('onchainActiveArenaBalance', formatEth(bal));
    setText('onchainArenaRound', round.toString());
    setText('onchainArenaFinished', finished ? 'Finished / 已结束' : 'Running / 进行中');
    setText('onchainChampion', champion && champion > 0n ? `#${champion}` : '—');
    setText('onchainTotalVerifications', totalVerifications.toString());
  }

  async function approveToken(spenderKey, amountInputId) {
    const amount = await parseGhv($(amountInputId)?.value || '0');
    if (amount <= 0n) throw new Error('Enter an amount greater than zero.');
    const token = await contract('ghvToken', 'erc20', true);
    const tx = await token.approve(requireAddress(spenderKey), amount);
    log(`Approve submitted: ${tx.hash}`);
    await tx.wait();
    log('Approve confirmed.');
  }

  async function stakeToken() {
    const amount = await parseGhv($('stakeAmount')?.value || '0');
    if (amount <= 0n) throw new Error('Enter a stake amount greater than zero.');
    const token = await contract('ghvToken', 'erc20', true);
    const allowance = await token.allowance(account, requireAddress('goldhavenVault')).catch(() => 0n);
    if (allowance < amount) {
      const approveTx = await token.approve(requireAddress('goldhavenVault'), amount);
      log(`Vault approve submitted: ${approveTx.hash}`);
      await approveTx.wait();
    }
    const vault = await contract('goldhavenVault', 'vault', true);
    const tx = await vault.stakeToken(amount);
    log(`stakeToken submitted: ${tx.hash}`);
    await tx.wait();
    log('Token stake confirmed.');
    await refreshDashboard();
  }

  async function unstakeToken() {
    const amount = await parseGhv($('unstakeAmount')?.value || $('stakeAmount')?.value || '0');
    if (amount <= 0n) throw new Error('Enter an unstake amount greater than zero.');
    const vault = await contract('goldhavenVault', 'vault', true);
    const tx = await vault.unstakeToken(amount);
    log(`unstakeToken submitted: ${tx.hash}`);
    await tx.wait();
    log('Token unstake confirmed.');
    await refreshDashboard();
  }

  async function claimDividend() {
    const epoch = BigInt($('dividendEpochId')?.value || '0');
    if (!epoch) throw new Error('Enter a dividend epoch ID.');
    const vault = await contract('goldhavenVault', 'vault', true);
    const tx = await vault.claimDividend(epoch);
    log(`claimDividend(${epoch}) submitted: ${tx.hash}`);
    await tx.wait();
    log('Dividend claim confirmed.');
    state.pendingDividendRefreshSeq++;
    state.pendingDividendEpochs = [];
    state.pendingDividendAmount = 0n;
    setText('stakePendingDividend', '0 ETH');
    setText('stakePendingEpochs', '—');
    await refreshDashboard();
  }

  async function claimPendingDividends() {
    await getSigner();
    const vault = await contract('goldhavenVault', 'vault', true);
    const nextEpoch = await vault.nextDividendEpochId().catch(() => 0n);
    await refreshPendingDividends(vault, nextEpoch);
    const ids = state.pendingDividendEpochs;
    if (!ids.length) throw new Error('No pending dividends found in scanned epochs.');
    const tx = ids.length === 1 ? await vault.claimDividend(ids[0]) : await vault.claimDividends(ids);
    log(`Dividend claim submitted for epoch(s): ${ids.map(String).join(', ')} · ${tx.hash}`);
    await tx.wait();
    log('Dividend claim confirmed.');
    state.pendingDividendRefreshSeq++;
    state.pendingDividendEpochs = [];
    state.pendingDividendAmount = 0n;
    setText('stakePendingDividend', '0 ETH');
    setText('stakePendingEpochs', '—');
    await refreshDashboard();
  }

  async function ensureNftApproval(nft, operator, tokenId) {
    const [approved, approvedAll] = await Promise.all([
      nft.getApproved(tokenId).catch(() => ZERO),
      nft.isApprovedForAll(account, operator).catch(() => false)
    ]);
    if (approved?.toLowerCase?.() === operator.toLowerCase() || approvedAll) return;
    const tx = await nft.approve(operator, tokenId);
    log(`NFT approve #${tokenId} submitted: ${tx.hash}`);
    await tx.wait();
    log(`NFT #${tokenId} approve confirmed.`);
  }

  function cardNum(card, key, idx) {
    const v = card?.[key] ?? card?.[idx] ?? 0;
    return Number(v);
  }

  function cardName(arr, idx) { return arr[idx] || `#${idx}`; }

  function uriToHttp(uri) {
    if (!uri) return '';
    if (uri.startsWith('ipfs://')) return `${C.nftImageGateway || 'https://ipfs.io/ipfs/'}${uri.slice(7)}`;
    if (/^Qm[1-9A-HJ-NP-Za-km-z]{44,}$/.test(uri)) return `${C.nftImageGateway || 'https://ipfs.io/ipfs/'}${uri}`;
    return uri;
  }

  function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

  function findErrorData(err) {
    return err?.data || err?.error?.data || err?.info?.error?.data || err?.receipt?.revertReason || '';
  }

  function decodeContractError(err) {
    const data = findErrorData(err);
    const ethers = window.ethers;
    if (data && ethers && window.GOLDHAVEN_ABI) {
      const groups = ['vault', 'nft', 'marketplace', 'arena', 'arenaFactory', 'hook', 'erc20'];
      for (const g of groups) {
        try {
          const parsed = new ethers.Interface(window.GOLDHAVEN_ABI[g] || []).parseError(data);
          if (parsed) return parsed.name;
        } catch (_) {}
      }
    }
    // Observed from deployed Vault when staking an NFT that is already locked in Vault.
    if (String(data).toLowerCase().startsWith('0x9c8bdaf2')) return 'AlreadyStaked';
    return err?.shortMessage || err?.reason || err?.message || String(err);
  }

  function friendlyError(err) {
    const name = decodeContractError(err);
    const map = {
      AlreadyStaked: L('This NFT is already locked in the arena Vault. Refreshing NFT status…','这个 NFT 已经锁入竞技场 Vault，正在刷新 NFT 状态…'),
      ArenaLocked: L('Arena lock window is active. You cannot stake or unlock NFTs during this period.','当前处于竞技场锁定窗口，暂时不能投放或解锁 NFT。'),
      ArenaInProgress: L('An arena is in progress. Wait until settlement before staking or unlocking this NFT.','竞技场正在进行中，请等待结算后再投放或解锁 NFT。'),
      ArenaFull: L('Arena participant queue is full.','竞技场参赛队列已满。'),
      BadFee: L('Incorrect NFT arena staking fee. Check NFT_STAKE_FEE.','NFT 竞技场投放费用不正确，请检查 NFT_STAKE_FEE。'),
      HookNotSet: L('Vault hook is not configured yet.','Vault 的 Hook 地址还没有配置。'),
      NotStakeOwner: L('You are not the owner of this Vault stake.','你不是这个 Vault 锁仓的所有者。'),
      NotStaked: L('This NFT stake was not found or already unlocked.','没有找到该 NFT 锁仓，或它已经解锁。'),
      InvalidNftTransfer: L('Vault only accepts NFTs through Put Arena.','Vault 只接受通过投放竞技场流程转入的 NFT。')
    };
    return map[name] || name;
  }


  function comboImageURIFromConfig(card) {
    if (!card) return '';
    const classId = cardNum(card, 'classId', 9);
    const beast = cardNum(card, 'beast', 11);
    const cid = C.nftImageCids && C.nftImageCids[`${classId}-${beast}`];
    if (!cid) return '';
    return `ipfs://${cid}`;
  }

  function resolveNftImageURI(card, onchainUri) {
    return onchainUri || comboImageURIFromConfig(card);
  }

  async function readOwnedNft(tokenId, nft, vault, market) {
    const owner = await nft.ownerOf(tokenId).catch(() => '');
    const stakeOwner = vault ? await vault.stakeOwnerOfToken(tokenId).catch(() => ZERO) : ZERO;
    const isWalletOwned = owner && owner.toLowerCase() === account.toLowerCase();
    const isVaultStakedByMe = stakeOwner && stakeOwner !== ZERO && stakeOwner.toLowerCase() === account.toLowerCase();
    if (!isWalletOwned && !isVaultStakedByMe) return null;

    const [card, uri, stakeId, lockedInActiveArena, arenaOf, arenaFinishedAt, listing] = await Promise.all([
      nft.cardOf(tokenId).catch(() => null),
      nft.imageURI(tokenId).catch(() => ''),
      vault ? vault.stakeIdOfToken(tokenId).catch(() => 0n) : Promise.resolve(0n),
      vault ? vault.lockedInActiveArena(tokenId).catch(() => false) : Promise.resolve(false),
      vault ? vault.arenaOfToken?.(tokenId).catch(() => ZERO) : Promise.resolve(ZERO),
      vault ? vault.arenaFinishedAtOfToken?.(tokenId).catch(() => 0n) : Promise.resolve(0n),
      market ? market.listings(tokenId).catch(() => [ZERO, 0n]) : Promise.resolve([ZERO, 0n])
    ]);
    const seller = listing?.seller ?? listing?.[0] ?? ZERO;
    const price = listing?.price ?? listing?.[1] ?? 0n;
    const stakeIdBI = BigInt(stakeId || 0);
    return {
      tokenId,
      owner: isVaultStakedByMe ? stakeOwner : owner,
      currentOwner: owner,
      stakeOwner,
      card,
      uri: resolveNftImageURI(card, uri),
      stakeId: stakeIdBI,
      lockedInActiveArena: Boolean(lockedInActiveArena),
      arenaOf: arenaOf || ZERO,
      arenaFinishedAt: BigInt(arenaFinishedAt || 0),
      vaultStaked: isVaultStakedByMe || stakeIdBI > 0n,
      listed: seller && seller !== ZERO,
      seller,
      price
    };
  }

  async function refreshMyNfts() {
    const grid = $('myNftGrid');
    if (!grid) return;
    if (!account) {
      grid.innerHTML = `<article class="empty-state"><h3>${L('Connect wallet','连接钱包')}</h3><p>${L('Connect your wallet to scan owned Goldhaven NFTs.','连接钱包后扫描你持有或锁仓的 Goldhaven NFT。')}</p></article>`;
      return;
    }
    if (!hasAddress('goldhavenNFT')) throw new Error(L('Missing GoldhavenNFT address.','缺少 GoldhavenNFT 合约地址。'));
    const nft = await contract('goldhavenNFT', 'nft');
    const vault = hasAddress('goldhavenVault') ? await contract('goldhavenVault', 'vault') : null;
    const market = hasAddress('nftMarketplace') ? await contract('nftMarketplace', 'marketplace') : null;
    const next = await nft.nextTokenId().catch(() => 1n);
    const maxScan = BigInt(Number($('nftScanLimit')?.value || C.nftScanLimit || 500));
    const last = next > 1n ? next - 1n : 0n;
    const start = last > maxScan ? last - maxScan + 1n : 1n;
    grid.innerHTML = `<article class="empty-state"><h3>${L('Scanning NFTs…','正在扫描 NFT…')}</h3><p>${L('Checking token IDs','正在检查 token ID')} ${start.toString()} ${L('to','到')} ${last.toString()}.</p></article>`;
    const found = [];
    for (let i = start; i <= last; i++) {
      const item = await readOwnedNft(i, nft, vault, market);
      if (item) found.push(item);
    }
    state.lastNfts = found;
    if (!found.length) {
      grid.innerHTML = `<article class="empty-state"><h3>${L('No NFTs found','未找到 NFT')}</h3><p>${L('No wallet-held or Vault-staked Goldhaven NFT was found in the scanned range. Increase the scan limit if needed.','当前扫描范围内没有找到钱包持有或 Vault 锁仓的 Goldhaven NFT。如有需要请增大扫描范围。')}</p></article>`;
      return;
    }
    found.sort((a, b) => Number(BigInt(a.tokenId) - BigInt(b.tokenId)));
    grid.innerHTML = found.map(renderNftCard).join('');
    const stakedCount = found.filter((n) => n.vaultStaked).length;
    log(L(`Loaded ${found.length} NFT(s): ${found.length - stakedCount} in wallet, ${stakedCount} staked in Vault.`, `已加载 ${found.length} 个 NFT：${found.length - stakedCount} 个在钱包，${stakedCount} 个在 Vault 锁仓。`));
  }

  function renderNftCard(item) {
    const card = item.card;
    const tokenId = item.tokenId.toString();
    const classId = cardNum(card, 'classId', 9);
    const element = cardNum(card, 'element', 10);
    const beast = cardNum(card, 'beast', 11);
    const attr = cardNum(card, 'attrSkill', 12);
    const starter = cardNum(card, 'starterSkill', 13);
    const beastSkill = cardNum(card, 'beastSkill', 14);
    const finisher = cardNum(card, 'finisherSkill', 15);
    const fate = cardNum(card, 'fate', 16);
    const attack = cardNum(card, 'attack', 5);
    const defense = cardNum(card, 'defense', 6);
    const speed = cardNum(card, 'speed', 7);
    const hp = cardNum(card, 'hp', 8);
    const uri = uriToHttp(item.uri);
    const pendingArena = state.pendingArenaTokens?.has?.(tokenId);
    const locked = pendingArena || item.vaultStaked || item.stakeId > 0n || cardNum(card, 'stakeId', 1) > 0;
    const listed = Boolean(item.listed);
    const tag = locked
      ? `<span class="status-dot danger">${pendingArena ? L('Pending Arena','竞技场确认中') : (item.lockedInActiveArena ? L('Arena Running','竞技场进行中') : (item.arenaOf && item.arenaOf !== ZERO ? L('Arena Finished','竞技场已结束') : L('Arena','竞技场')))}</span>`
      : listed ? `<span class="status-dot warn">${L('Listed','已上架')}</span>` : `<span class="status-dot good">${L('Free','空闲')}</span>`;
    let actions = '';
    if (locked) {
      const stakeId = item.stakeId > 0n ? item.stakeId : BigInt(cardNum(card, 'stakeId', 1));
      const disabled = pendingArena || stakeId <= 0n;
      const title = pendingArena ? 'Waiting for transaction confirmation' : (stakeId > 0n ? '' : 'Stake ID not found in scan');
      actions = `<button class="btn line" type="button" data-nft-action="unlock" data-token-id="${tokenId}" data-stake-id="${stakeId}" ${disabled ? `disabled title="${title}"` : ''}>${pendingArena ? L('Pending…','确认中…') : (item.lockedInActiveArena ? L('Arena Running','竞技场进行中') : L('Unlock','解锁'))}</button>`;
    } else if (listed) {
      actions = `<button class="btn line" type="button" data-nft-action="cancel" data-token-id="${tokenId}" ${hasAddress('nftMarketplace')?'':'disabled'}>${L('Cancel Listing','下架')}</button>`;
    } else {
      actions = `<label class="mini-input">${L('Send to','发送至')}<input data-nft-input="recipient-${tokenId}" placeholder="0x..." /></label>
        <label class="mini-input">${L('List price GHV','上架价格 GHV')}<input data-nft-input="price-${tokenId}" type="number" min="0" step="0.000001" placeholder="100" /></label>
        <button class="btn line" type="button" data-nft-action="send" data-token-id="${tokenId}">${L('Send','发送')}</button>
        <button class="btn ghost" type="button" data-nft-action="burn" data-token-id="${tokenId}">${L('Burn','销毁')}</button>
        <button class="btn line" type="button" data-nft-action="list" data-token-id="${tokenId}" ${hasAddress('nftMarketplace')?'':'disabled title="Marketplace address empty"'}>${L('List','上架')}</button>
        <button class="btn primary" type="button" data-nft-action="arena" data-token-id="${tokenId}">${L('Put Arena','投放竞技场')}</button>`;
    }
    return `<article class="nft-tile live-nft-card">
      <div class="tile-head"><span class="tag">#${tokenId}</span>${tag}</div>
      ${uri ? `<a href="${uri}" target="_blank" rel="noopener"><img class="nft-image" src="${uri}" alt="Goldhaven NFT #${tokenId}" /></a>` : `<div class="nft-image placeholder">${L('No image URI','暂无图片链接')}</div>`}
      <h3>${cardName(CLASS_NAMES, classId)} × ${cardName(BEAST_NAMES, beast)}</h3>
      <div class="nft-meta-grid">
        <span>${L('Element','属性')}<b>${cardName(ELEMENT_NAMES, element)}</b></span><span>${L('Fate','命格')}<b>${cardName(FATE_NAMES, fate)}</b></span>
        <span>ATK<b>${attack}</b></span><span>DEF<b>${defense}</b></span><span>HP<b>${hp}</b></span><span>SPD<b>${speed}</b></span>
      </div>
      <p class="skill-line"><b>${L('Skills','技能')}</b><br>${[attr, starter, beastSkill, finisher].map((s)=>cardName(SKILL_NAMES, s)).join(' ｜ ')}</p>
      ${locked ? `<p class="skill-line"><b>${L('Vault stake','Vault 锁仓')}</b><br>stakeId: ${item.stakeId > 0n ? item.stakeId.toString() : cardNum(card, 'stakeId', 1)}${item.arenaOf && item.arenaOf !== ZERO ? ` · Arena ${short(item.arenaOf)}` : ''}${item.lockedInActiveArena ? ' · active arena lock' : (item.arenaFinishedAt > 0n ? ' · finished / redeemable' : '')}</p>` : ''}
      <div class="tile-actions nft-actions">${actions}</div>
    </article>`;
  }

  async function sendNft(tokenId) {
    const to = document.querySelector(`[data-nft-input="recipient-${tokenId}"]`)?.value?.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(to || '')) throw new Error('Enter a valid recipient address.');
    const nft = await contract('goldhavenNFT', 'nft', true);
    const tx = await nft.transferFrom(account, to, BigInt(tokenId));
    log(`NFT #${tokenId} transfer submitted: ${tx.hash}`);
    await tx.wait();
    log(`NFT #${tokenId} sent.`);
    await refreshMyNfts();
  }

  async function burnNft(tokenId) {
    const nft = await contract('goldhavenNFT', 'nft', true);
    const tx = await nft.burn(BigInt(tokenId));
    log(`NFT #${tokenId} burn submitted: ${tx.hash}`);
    await tx.wait();
    log(`NFT #${tokenId} burned.`);
    await refreshMyNfts();
  }

  async function listNftCard(tokenId) {
    if (!hasAddress('nftMarketplace')) throw new Error('Marketplace address is empty.');
    const input = document.querySelector(`[data-nft-input="price-${tokenId}"]`)?.value || '0';
    const price = await parseGhv(input);
    if (price <= 0n) throw new Error('Enter a list price greater than zero.');
    const nft = await contract('goldhavenNFT', 'nft', true);
    await ensureNftApproval(nft, requireAddress('nftMarketplace'), BigInt(tokenId));
    const market = await contract('nftMarketplace', 'marketplace', true);
    const tx = await market.list(BigInt(tokenId), price);
    log(`NFT #${tokenId} list submitted: ${tx.hash}`);
    await tx.wait();
    log(`NFT #${tokenId} listed.`);
    await refreshMyNfts();
  }

  async function cancelNftListing(tokenId) {
    if (!hasAddress('nftMarketplace')) throw new Error('Marketplace address is empty.');
    const market = await contract('nftMarketplace', 'marketplace', true);
    const tx = await market.cancel(BigInt(tokenId));
    log(`NFT #${tokenId} cancel listing submitted: ${tx.hash}`);
    await tx.wait();
    log(`NFT #${tokenId} listing cancelled.`);
    await refreshMyNfts();
  }

  async function readVaultStakeStatus(vault, nft, tokenId) {
    const [stakeId, stakeOwner, locked, isParticipant, currentOwner] = await Promise.all([
      vault.stakeIdOfToken(tokenId).catch(() => 0n),
      vault.stakeOwnerOfToken(tokenId).catch(() => ZERO),
      vault.lockedInActiveArena(tokenId).catch(() => false),
      vault.isArenaParticipant(tokenId).catch(() => false),
      nft.ownerOf(tokenId).catch(() => ZERO)
    ]);
    return {
      stakeId: BigInt(stakeId || 0),
      stakeOwner: stakeOwner || ZERO,
      locked: Boolean(locked),
      isParticipant: Boolean(isParticipant),
      currentOwner: currentOwner || ZERO
    };
  }

  async function waitForVaultStake(vault, nft, tokenId) {
    for (let i = 0; i < 6; i++) {
      const st = await readVaultStakeStatus(vault, nft, tokenId);
      if (st.stakeId > 0n || (st.stakeOwner && st.stakeOwner !== ZERO && st.stakeOwner.toLowerCase() === account.toLowerCase())) return st;
      await sleep(900);
    }
    return readVaultStakeStatus(vault, nft, tokenId);
  }

  async function refreshMyNftsAfterArenaAction(tokenId) {
    await refreshMyNfts().catch((e) => log(e.message || String(e), 'warn'));
    await sleep(900);
    await refreshMyNfts().catch((e) => log(e.message || String(e), 'warn'));
    const item = (state.lastNfts || []).find((n) => n.tokenId.toString() === tokenId.toString());
    if (item?.vaultStaked) return true;
    return false;
  }

  async function stakeNftForArenaToken(tokenId) {
    const ethers = requireEthers();
    const tokenIdBI = BigInt(tokenId);
    const nft = await contract('goldhavenNFT', 'nft', true);
    const vault = await contract('goldhavenVault', 'vault', true);

    const before = await readVaultStakeStatus(vault, nft, tokenIdBI);
    if (before.stakeId > 0n || (before.stakeOwner && before.stakeOwner !== ZERO)) {
      log(L(`NFT #${tokenId} is already locked in Vault.`, `NFT #${tokenId} 已经锁入 Vault。`), 'warn');
      await refreshMyNftsAfterArenaAction(tokenIdBI);
      return;
    }
    if (before.currentOwner.toLowerCase() !== account.toLowerCase()) {
      throw new Error(L(`NFT #${tokenId} is not in your wallet. Current owner: ${short(before.currentOwner)}`, `NFT #${tokenId} 当前不在你的钱包。当前 owner：${short(before.currentOwner)}`));
    }

    state.pendingArenaTokens.add(tokenIdBI.toString());
    await refreshMyNfts().catch(() => {});

    await ensureNftApproval(nft, requireAddress('goldhavenVault'), tokenIdBI);

    const afterApproval = await readVaultStakeStatus(vault, nft, tokenIdBI);
    if (afterApproval.stakeId > 0n || (afterApproval.stakeOwner && afterApproval.stakeOwner !== ZERO)) {
      log(L(`NFT #${tokenId} was already locked before staking transaction.`, `NFT #${tokenId} 在发送投放交易前已经锁入 Vault。`), 'warn');
      await refreshMyNftsAfterArenaAction(tokenIdBI);
      return;
    }

    const fee = await vault.NFT_STAKE_FEE().catch(() => ethers.parseEther(C.nftStakeFeeEth || '0.001'));
    try {
      const tx = await vault.stakeNftForArena(tokenIdBI, { value: fee });
      log(`NFT #${tokenId} arena lock submitted: ${tx.hash}`);
      await tx.wait();
      const st = await waitForVaultStake(vault, nft, tokenIdBI);
      if (st.stakeId > 0n || (st.stakeOwner && st.stakeOwner !== ZERO)) {
        log(L(`NFT #${tokenId} locked for arena. stakeId ${st.stakeId.toString()}`, `NFT #${tokenId} 已投放竞技场。stakeId ${st.stakeId.toString()}`));
      } else {
        log(L(`NFT #${tokenId} transaction confirmed, but Vault status is not indexed yet. Refreshing again…`, `NFT #${tokenId} 交易已确认，但 Vault 状态尚未同步，正在再次刷新…`), 'warn');
      }
      await refreshMyNftsAfterArenaAction(tokenIdBI);
    } catch (err) {
      const decoded = decodeContractError(err);
      if (decoded === 'AlreadyStaked') {
        log(L(`NFT #${tokenId} is already locked in Vault. Refreshing status.`, `NFT #${tokenId} 已经锁入 Vault，正在刷新状态。`), 'warn');
        await refreshMyNftsAfterArenaAction(tokenIdBI);
        return;
      }
      throw err;
    } finally {
      state.pendingArenaTokens.delete(tokenIdBI.toString());
      await refreshMyNfts().catch(() => {});
    }
  }

  async function unlockNftByStakeId(stakeId) {
    const vault = await contract('goldhavenVault', 'vault', true);
    const tx = await vault.unstakeNftFromArena(BigInt(stakeId));
    log(`NFT unlock stakeId ${stakeId} submitted: ${tx.hash}`);
    await tx.wait();
    log(`NFT stakeId ${stakeId} unlocked.`);
    await refreshMyNfts();
  }

  async function handleNftAction(action, tokenId, stakeId) {
    await getSigner();
    if (action === 'send') return sendNft(tokenId);
    if (action === 'burn') return burnNft(tokenId);
    if (action === 'list') return listNftCard(tokenId);
    if (action === 'cancel') return cancelNftListing(tokenId);
    if (action === 'arena') return stakeNftForArenaToken(tokenId);
    if (action === 'unlock') return unlockNftByStakeId(stakeId);
    throw new Error(`Unknown NFT action: ${action}`);
  }

  function formatHumanFromWei(value, token = 'ghv', places = 6) {
    if (token === 'eth') return formatEth(value, places, false);
    return formatGhv(value, places);
  }

  async function fillPercent(kind, pctBps) {
    await getSigner();
    if (kind === 'buyEth') {
      await updateEthBalance();
      const ethers = requireEthers();
      const maxBuy = hasAddress('ghvHook') ? await (await contract('ghvHook', 'hook')).MAX_BUY_WEI().catch(() => ethers.parseEther(v4Config().maxBuyEth || '5')) : ethers.parseEther(v4Config().maxBuyEth || '5');
      const gasReserve = ethers.parseEther('0.002');
      const available = state.ethBalance > gasReserve ? state.ethBalance - gasReserve : 0n;
      const base = available < maxBuy ? available : maxBuy;
      setInputValue('tradeBuyEthAmount', formatEth(bigintMulDiv(base, pctBps, 10000), 8, false));
      await quoteHookBuy().catch(() => {});
      return;
    }
    if (kind === 'sellGhv') {
      if (state.ghvBalance === 0n) await refreshWalletTokenStats();
      setInputValue('tradeSellGhvAmount', await formatGhv(bigintMulDiv(state.ghvBalance, pctBps, 10000), 8));
      await quoteHookSell().catch(() => {});
      return;
    }
    if (kind === 'stakeGhv') {
      if (state.ghvBalance === 0n) await refreshWalletTokenStats();
      setInputValue('stakeAmount', await formatGhv(bigintMulDiv(state.ghvBalance, pctBps, 10000), 8));
      return;
    }
    if (kind === 'unstakeGhv') {
      setInputValue('unstakeAmount', await formatGhv(bigintMulDiv(state.myStake, pctBps, 10000), 8));
      return;
    }
  }

  async function openDailyArena() {
    const factory = await contract('arenaFactory', 'arenaFactory', true);
    let tx;
    if (typeof factory['openDailyArena()'] === 'function') {
      tx = await factory['openDailyArena()']();
    } else {
      const ids = String($('participantTokenIds')?.value || '').split(',').map(s => s.trim()).filter(Boolean).map(BigInt);
      tx = await factory.openDailyArena(ids);
    }
    log(`openDailyArena submitted: ${tx.hash}`);
    const receipt = await tx.wait();
    log('Daily arena opened. Check ArenaOpened event for new arena address.');
    await refreshDashboard();
    return receipt;
  }

  async function verifyNextMatch() {
    const arena = await contract('activeArena', 'arena', true);
    const tx = await arena.verifyNextMatch();
    log(`verifyNextMatch submitted: ${tx.hash}`);
    await tx.wait();
    log('Match verification confirmed.');
    await refreshArenaReadOnly();
  }

  async function finishSingleEntrant() {
    const arena = await contract('activeArena', 'arena', true);
    const tx = await arena.finishSingleEntrant();
    log(`finishSingleEntrant submitted: ${tx.hash}`);
    await tx.wait();
    log('Single-entrant arena finished.');
    await refreshArenaReadOnly();
  }

  async function listNft() { return listNftCard($('marketTokenId')?.value || '0'); }
  async function cancelListing() { return cancelNftListing($('marketTokenId')?.value || '0'); }
  async function buyListing() {
    const tokenId = BigInt($('marketTokenId')?.value || '0');
    const market = await contract('nftMarketplace', 'marketplace', true);
    const tx = await market.buy(tokenId);
    log(`buy(#${tokenId}) submitted: ${tx.hash}`);
    await tx.wait();
    log('NFT purchase confirmed.');
  }
  async function readListing() {
    const tokenId = BigInt($('marketTokenId')?.value || '0');
    const market = await contract('nftMarketplace', 'marketplace');
    const [seller, price] = await market.listings(tokenId);
    const priceText = seller === ZERO ? 'Not listed' : `${short(seller)} · ${await formatGhv(price, 4)} GHV`;
    setText('marketReadout', `#${tokenId}: ${priceText}`);
  }

  async function handleAction(action) {
    const actions = {
      connect,
      refreshDashboard,
      quoteHookBuy,
      executeHookBuy,
      quoteHookSell,
      approveGhvForRouter,
      executeHookSell,
      approveGhvForVault: () => approveToken('goldhavenVault', 'stakeAmount'),
      stakeToken,
      unstakeToken,
      claimDividend,
      claimPendingDividends,
      refreshMyNfts,
      openDailyArena,
      verifyNextMatch,
      finishSingleEntrant,
      approveNftForMarket: () => approveNft('nftMarketplace', 'marketTokenId'),
      approveGhvForMarket: () => approveToken('nftMarketplace', 'marketPrice'),
      listNft,
      cancelListing,
      buyListing,
      readListing
    };
    if (!actions[action]) throw new Error(`Unknown action: ${action}`);
    await actions[action]();
  }

  async function approveNft(operatorKey, tokenIdInputId = 'marketTokenId') {
    const tokenId = BigInt($(tokenIdInputId)?.value || '0');
    const nft = await contract('goldhavenNFT', 'nft', true);
    const tx = await nft.approve(requireAddress(operatorKey), tokenId);
    log(`NFT approve submitted: ${tx.hash}`);
    await tx.wait();
    log('NFT approve confirmed.');
  }

  function fillConfigTable() {
    const el = $('contractConfigList');
    if (!el) return;
    const names = [
      ['ghvToken', 'GHVToken'], ['goldhavenNFT', 'GoldhavenNFT'], ['goldhavenVault', 'GoldhavenVault'], ['ghvHook', 'GHVHook'],
      ['arenaFactory', 'ArenaFactory'], ['activeArena', 'Active Arena'], ['nftMarketplace', 'NFT Marketplace'], ['priceOracle', 'PriceOracle'], ['poolManager', 'PoolManager'], ['uniswapV4Router', 'Uniswap v4 Router']
    ];
    el.innerHTML = names.map(([key, label]) => `<div class="config-row"><span>${label}</span><code>${cfgAddress(key) || '(empty)'}</code></div>`).join('');
  }

  function bindActions() {
    document.addEventListener('click', async (e) => {
      const fill = e.target.closest('[data-fill-percent]');
      if (fill) {
        e.preventDefault();
        try { await fillPercent(fill.dataset.fillPercent, Number(fill.dataset.percent || 0)); } catch (err) { log(err.shortMessage || err.reason || err.message || String(err), 'error'); }
        return;
      }
      const nftBtn = e.target.closest('[data-nft-action]');
      if (nftBtn) {
        e.preventDefault();
        const old = nftBtn.textContent;
        nftBtn.disabled = true;
        try { await handleNftAction(nftBtn.dataset.nftAction, nftBtn.dataset.tokenId, nftBtn.dataset.stakeId); } catch (err) { console.error(err); log(friendlyError(err), 'error'); }
        finally { nftBtn.disabled = false; nftBtn.textContent = old; }
        return;
      }
      const btn = e.target.closest('[data-contract-action]');
      if (!btn) return;
      e.preventDefault();
      const old = btn.textContent;
      btn.disabled = true;
      btn.classList.add('loading');
      try { await handleAction(btn.dataset.contractAction); }
      catch (err) { console.error(err); log(friendlyError(err), 'error'); }
      finally { btn.disabled = false; btn.classList.remove('loading'); if (old) btn.textContent = old; }
    });
  }

  function bindInputs() {
    const buyInput = $('tradeBuyEthAmount');
    const sellInput = $('tradeSellGhvAmount');
    if (buyInput) buyInput.addEventListener('input', () => quoteHookBuy().catch(() => {}));
    if (sellInput) sellInput.addEventListener('input', () => quoteHookSell().catch(() => {}));
  }

  function init() {
    ensureDisconnectButtons();
    fillConfigTable();
    bindActions();
    bindInputs();
    setText('configNetworkName', C.networkName || '(empty)');
    setText('configChainId', C.chainId || '(empty)');
    if (localStorage.getItem(LS_CONNECTED) === '1') {
      restoreExistingSession().catch((e) => log(e.message, 'warn'));
    } else if (Object.values(C.addresses || {}).some(Boolean)) {
      refreshDashboard().catch((e) => log(e.message, 'warn'));
    }
  }

  window.GHV_DAPP = {
    connect,
    restoreExistingSession,
    disconnectLocal,
    refreshDashboard,
    quoteHookBuy,
    executeHookBuy,
    quoteHookSell,
    executeHookSell,
    stakeToken,
    unstakeToken,
    claimPendingDividends,
    refreshMyNfts,
    openDailyArena,
    verifyNextMatch,
    finishSingleEntrant,
    listNft,
    cancelListing,
    buyListing,
    readListing,
    config: C
  };
  document.addEventListener('DOMContentLoaded', init);
})();
