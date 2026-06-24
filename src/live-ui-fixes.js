(function () {
  const C = window.GOLDHAVEN_CONFIG || {};
  const ZERO = '0x0000000000000000000000000000000000000000';
  const LS_CONNECTED = 'goldhavenWalletConnected';
  const LS_ACCOUNT = 'goldhavenWalletAccount';
  let provider, signer, account;
  let runtimeActiveArena = sessionStorage.getItem('goldhavenRuntimeActiveArena') || '';
  let openArenaPending = false;

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

  const BPS = 10000;
  const MAX_REPLAY_ROUNDS = 12;
  const SKILL_TABLE_HEX = '2260000010201c20000010002260020000202198000000081db0002010001a900008000420d0000020001ce8000004201964001000001838000040001b58000004001f40000004001b58000000221e78000010001e780000800019c80000002023f00000200027d80000001020080080000022600002000023f000004000200800400000258000010000219800004000200801000000200812000000232800800000226004000000251c0000000824540200002825e4000020002008000000141b58000020001a90000080001b5800003000283c0000340025800010000000000000020019c8080010001f40000000222d500000001028a0000028002a30008200002328000100002648000040002260000000082198010000001f40000010202328048000002e18000000082bc0000020002a30000001001db0000000401e78000000011ce8000080002c880400000024b8000040002a30000004002af80000100028a00000010024b80800400024b8000000402c88000088002bc00000000129040004000026480000400032c8000000802ee0000008002bc0010000002710100040002bc0200000002fa8200000001db02000000027102000000029682000000029682000000023f020000000';
  const SKILL_TABLE_BYTES = [];
  for (let i = 0; i < SKILL_TABLE_HEX.length; i += 2) SKILL_TABLE_BYTES.push(parseInt(SKILL_TABLE_HEX.slice(i, i + 2), 16));
  function replaySkillData(sk) {
    const o = Number(sk) * 6;
    if (o < 0 || o + 6 > SKILL_TABLE_BYTES.length) return { m: BPS, tags: 0n };
    return {
      m: (SKILL_TABLE_BYTES[o] << 8) | SKILL_TABLE_BYTES[o + 1],
      tags: (BigInt(SKILL_TABLE_BYTES[o + 2]) << 24n) | (BigInt(SKILL_TABLE_BYTES[o + 3]) << 16n) | (BigInt(SKILL_TABLE_BYTES[o + 4]) << 8n) | BigInt(SKILL_TABLE_BYTES[o + 5])
    };
  }

  const ABI = {
    erc20: [
      'function decimals() view returns (uint8)',
      'function balanceOf(address) view returns (uint256)',
      'function allowance(address,address) view returns (uint256)',
      'function approve(address,uint256) returns (bool)'
    ],
    nft: [
      'function nextTokenId() view returns (uint256)',
      'function ownerOf(uint256) view returns (address)',
      'function imageURI(uint256) view returns (string)',
      'function cardOf(uint256) view returns (tuple(uint256 tokenId,uint256 stakeId,uint64 stakeTime,uint32 buyUsd,uint32 vaultAvgUsd,uint16 attack,uint16 defense,uint16 speed,uint16 hp,uint8 classId,uint8 element,uint8 beast,uint8 attrSkill,uint8 starterSkill,uint8 beastSkill,uint8 finisherSkill,uint8 fate))'
    ],
    hook: [
      'function arenaVaultEth() view returns (uint256)',
      'function curveReserveEth() view returns (uint256)',
      'function totalMintedFair() view returns (uint256)',
      'function marginalPrice() view returns (uint256)'
    ],
    vault: [
      'error BadFee()',
      'error NotStakeOwner()',
      'error AlreadyStaked()',
      'error NotStaked()',
      'error ArenaFull()',
      'error ArenaLocked()',
      'error ZeroAmount()',
      'error TransferFailed()',
      'error AlreadyClaimed()',
      'error BadEpoch()',
      'error ZeroAddress()',
      'error HookAlreadySet()',
      'error HookNotSet()',
      'error NotArenaController()',
      'error NotActiveArena()',
      'error ArenaInProgress()',
      'error BadParticipantList()',
      'error InvalidArenaParticipant()',
      'error InvalidNftTransfer()',
      'function stakeIdOfToken(uint256) view returns (uint256)',
      'function stakeOwnerOfToken(uint256) view returns (address)',
      'function nftStakes(uint256) view returns (address owner,uint256 tokenId,uint64 stakedAt,bool active)',
      'function arenaParticipantCount() view returns (uint256)',
      'function arenaParticipantAt(uint256) view returns (uint256)',
      'function getArenaParticipants() view returns (uint256[])',
      'function isArenaParticipant(uint256) view returns (bool)',
      'function lockedInActiveArena(uint256) view returns (bool)',
      'function arenaOfToken(uint256) view returns (address)',
      'function arenaFinishedAtOfToken(uint256) view returns (uint256)',
      'function activeArena() view returns (address)',
      'function arenaInProgress() view returns (bool)',
      'function isArenaLockWindow() view returns (bool)',
      'function isNftActionLocked() view returns (bool)',
      'function isValidator(address user) view returns (bool)'
    ],
    market: [
      'function listings(uint256 tokenId) view returns (address seller,uint256 price)',
      'function buy(uint256 tokenId)'
    ],
    factory: [
      'error NotOpenWindow()',
      'error AlreadyOpened()',
      'error ArenaActive()',
      'error NotValidator()',
      'error ZeroAddress()',
      'error HookAlreadySet()',
      'error HookNotSet()',
      'function arenaOfDay(uint256 dayId) view returns (address)',
      'function arenaOfId(uint256 arenaId) view returns (address)',
      'function arenaCount() view returns (uint256)',
      'function activeArena() view returns (address)',
      'function latestArena() view returns (address)',
      'function latestFinishedArena() view returns (address)',
      'function dailyLimitEnabled() view returns (bool)',
      'function testMode() view returns (bool)',
      'function setTestMode(bool enabled)',
      'function setDailyLimitEnabled(bool enabled)',
      'function isOpenWindow() view returns (bool)',
      'function syncArenaStatus()',
      'function openArena() returns (address arena)',
      'function openDailyArena() returns (address arena)',
      'event ArenaOpened(uint256 indexed dayId,address indexed arena,address indexed opener,uint256 funding)',
      'event ArenaOpenedV2(uint256 indexed arenaId,uint256 indexed dayId,address indexed arena,address opener,uint256 funding)',
      'event ArenaStatusSynced(address indexed activeArena,address indexed latestFinishedArena)'
    ],
    arena: [
      'error NotValidator()',
      'error BadParticipantCount()',
      'error Finished()',
      'error NoMatchReady()',
      'error MatchAlreadyVerified()',
      'error BadMatchIndex()',
      'error TransferFailed()',
      'error ZeroAmount()',
      'error InvalidParticipant()',
      'error DuplicateParticipant()',
      'error NotFinished()',
      'function dayId() view returns (uint256)',
      'function currentRound(uint256) view returns (uint256)',
      'function nextRound(uint256) view returns (uint256)',
      'function getCurrentRound() view returns (uint256[])',
      'function getNextRound() view returns (uint256[])',
      'function currentRoundNumber() view returns (uint8)',
      'function nextMatchIndex() view returns (uint256)',
      'function currentRoundMatchCount() view returns (uint256)',
      'function currentRoundVerifiedMatches() view returns (uint256)',
      'function currentRoundRemaining() view returns (uint256)',
      'function matchTokens(uint256 matchIndex) view returns (uint256 tokenA,uint256 tokenB,bool verified,uint256 winner)',
      'function matchCount(uint8 round) view returns (uint256)',
      'function getMatch(uint8 round,uint256 matchIndex) view returns (uint8 round_,uint256 matchIndex_,uint256 tokenA,uint256 tokenB,uint256 winner,uint256 loser,bool verified,address validator)',
      'function entrantCount() view returns (uint256)',
      'function entrantAt(uint256 index) view returns (uint256 tokenId,address owner)',
      'function finalRoundNumber() view returns (uint8)',
      'function top32Count() view returns (uint256)',
      'function top32At(uint256 index) view returns (uint256 rank,uint256 tokenId,address owner)',
      'function finished() view returns (bool)',
      'function championTokenId() view returns (uint256)',
      'function totalVerifications() view returns (uint256)',
      'function validatorVerifications(address validator) view returns (uint256)',
      'function pendingRewards(address) view returns (uint256)',
      'function pendingBattleRewards(address) view returns (uint256)',
      'function pendingValidatorRewards(address) view returns (uint256)',
      'function claimReward() returns (uint256 battleAmount,uint256 validatorAmount)',
      'function claimBattleReward() returns (uint256 amount)',
      'function claimValidatorReward() returns (uint256 amount)',
      'function verifyNextMatch()',
      'function verifyMatch(uint256 matchIndex)',
      'function finishSingleEntrant()',
      'function advanceRound()',
      'event MatchVerified(uint8 indexed round,uint256 indexed tokenA,uint256 indexed tokenB,uint256 winner,address validator)',
      'event MatchVerifiedByIndex(uint8 indexed round,uint256 indexed matchIndex,uint256 indexed winner,uint256 loser,address validator)',
      'event RoundAdvanced(uint8 indexed round)',
      'event ArenaFinished(uint256 indexed championTokenId,uint256 pot)',
      'event RewardClaimed(address indexed account,uint256 battleAmount,uint256 validatorAmount)',
      'event BattleRewardClaimed(address indexed account,uint256 amount)',
      'event ValidatorRewardClaimed(address indexed account,uint256 amount)'
    ]
  };

  const $ = (id) => document.getElementById(id);
  const page = () => document.body?.dataset?.page || '';
  const cfgAddress = (key) => (C.addresses && C.addresses[key] || '').trim();
  const hasAddress = (key) => /^0x[a-fA-F0-9]{40}$/.test(cfgAddress(key)) && cfgAddress(key).toLowerCase() !== ZERO.toLowerCase();
  const short = (a) => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '—';
  const same = (a,b) => String(a||'').toLowerCase() === String(b||'').toLowerCase();
  function rememberRuntimeArena(addr) {
    if (!addr || !/^0x[a-fA-F0-9]{40}$/.test(String(addr)) || same(addr, ZERO)) return;
    runtimeActiveArena = addr;
    try { sessionStorage.setItem('goldhavenRuntimeActiveArena', addr); } catch {}
  }
  const nowDayId = () => Math.floor(Date.now() / 1000 / 86400);
  const nameAt = (arr, idx) => arr[Number(idx)] || `#${idx}`;
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

  function log(message, kind = 'info') {
    const el = $('contractLog');
    if (!el) return;
    const line = document.createElement('div');
    line.className = `contract-log-line ${kind}`;
    line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    el.prepend(line);
  }


  function findErrorDataDeep(value, depth = 0, seen = new Set()) {
    if (!value || depth > 7) return '';
    if (typeof value === 'string') return value.startsWith('0x') && value.length >= 10 ? value : '';
    if (typeof value !== 'object') return '';
    if (seen.has(value)) return '';
    seen.add(value);

    const directKeys = ['data', 'error', 'info', 'originalError', 'cause', 'revert', 'receipt', 'body', 'payload'];
    for (const k of directKeys) {
      const found = findErrorDataDeep(value[k], depth + 1, seen);
      if (found) return found;
    }
    for (const v of Object.values(value)) {
      const found = findErrorDataDeep(v, depth + 1, seen);
      if (found) return found;
    }
    return '';
  }

  function decodeErrorName(err) {
    const data = findErrorDataDeep(err);
    if (!data) return '';
    try {
      const groups = [ABI.factory, ABI.arena, ABI.vault, ABI.market, ABI.nft, ABI.hook, ABI.erc20];
      for (const abi of groups) {
        try {
          const parsed = new (ethersLib().Interface)(abi).parseError(data);
          if (parsed?.name) return parsed.name;
        } catch (_) {}
      }
    } catch (_) {}
    return data;
  }

  function friendlyTxError(err) {
    const name = decodeErrorName(err);
    const raw = err?.shortMessage || err?.reason || err?.message || String(err);
    const rawName = Object.keys({NotOpenWindow:1, NotValidator:1, ArenaActive:1, AlreadyOpened:1, HookNotSet:1, BadParticipantCount:1, InvalidArenaParticipant:1, ArenaInProgress:1, NoMatchReady:1, MatchAlreadyVerified:1, BadMatchIndex:1, Finished:1, NotFinished:1, ZeroAmount:1, TransferFailed:1}).find((x)=>String(raw).includes(x));
    const keyName = name || rawName;
    const map = {
      NotOpenWindow: L('Arena can only be opened from UTC 12:00 to 12:10. Owner test mode can disable the time/day limits for testing.','竞技场只能在 UTC 12:00–12:10 开启。测试时可由 owner 开启 testMode 取消时间/次数限制。'),
      NotValidator: L('This wallet is not a validator. Stake enough GHV first, then refresh validator status.','当前钱包不是验证者，请先质押足够 GHV 后刷新验证者状态。'),
      ArenaActive: L('An arena is already active. Finish/sync the active arena before opening another one.','已经有正在进行的竞技场。请先完成或同步当前竞技场，再开启下一场。'),
      AlreadyOpened: L('An arena has already been opened for the current UTC day. Owner test mode allows same-day repeated tests.','当前 UTC 日期已经开启过竞技场。测试时可由 owner 开启 testMode 允许同日多场。'),
      HookNotSet: L('ArenaFactory/Vault hook is not configured. Call setHook(hook) first.','ArenaFactory 或 Vault 的 Hook 未配置，请先调用 setHook(hook)。'),
      BadParticipantCount: L('Participant count is invalid. Stake 1–32 NFTs into the arena queue first.','参赛 NFT 数量无效，请先投放 1–32 个 NFT 到竞技场队列。'),
      InvalidArenaParticipant: L('One participant is not a valid Vault-staked arena NFT. Refresh and restake if needed.','参赛列表里有无效 NFT，请刷新并重新投放。'),
      ArenaInProgress: L('An arena is in progress; NFTs are locked until it finishes.','竞技场正在进行中，NFT 会锁定到本场结束。'),
      NoMatchReady: L('No match is ready to verify. Refresh the arena state.','当前没有可验证比赛，请刷新竞技场状态。'),
      MatchAlreadyVerified: L('This match was already verified by another validator. Refresh the arena state.','这场比赛已被其他验证者验证，请刷新竞技场状态。'),
      BadMatchIndex: L('Invalid match index for the current round. Refresh the arena state.','当前轮次的比赛序号无效，请刷新竞技场状态。'),
      Finished: L('This arena has already finished.','本场竞技场已经结束。'),
      NotFinished: L('This action requires the arena to be finished first.','这个操作需要等竞技场结束后才能执行。'),
      ZeroAmount: L('Nothing to claim.','没有可领取金额。'),
      TransferFailed: L('ETH transfer failed. Try again or claim from a receiving wallet.','ETH 转账失败，请重试或使用可接收 ETH 的钱包领取。')
    };
    if (map[keyName]) return map[keyName];
    if (raw && raw.includes('Internal JSON-RPC error')) {
      return L(`Internal RPC error. Revert data: ${findErrorDataDeep(err) || 'none'}.`, `RPC 内部错误。回滚数据：${findErrorDataDeep(err) || '无'}。`);
    }
    return name || raw;
  }

  function ethersLib() {
    if (!window.ethers) throw new Error(L('ethers.js is not loaded.','ethers.js 未加载。'));
    return window.ethers;
  }

  async function getProvider() {
    if (provider) return provider;
    const eth = await waitForEthereum(6000);
    if (!eth) throw new Error(L('No injected wallet found.','未检测到浏览器钱包。'));
    provider = new (ethersLib().BrowserProvider)(eth);
    return provider;
  }

  async function getSigner() {
    if (!signer) {
      await connectWalletManaged();
    }
    return signer;
  }

  async function refreshAccountFromProvider(request = false) {
    const eth = await waitForEthereum(request ? 8000 : 6000);
    if (!eth) return '';
    const p = await getProvider();
    const method = request ? 'eth_requestAccounts' : 'eth_accounts';
    let accounts = [];
    if (request) {
      accounts = await p.send(method, []);
    } else {
      for (let i = 0; i < 8; i++) {
        try {
          accounts = await p.send(method, []);
          if (accounts?.[0]) break;
          if (eth.selectedAddress) { accounts = [eth.selectedAddress]; break; }
        } catch {}
        await sleep(250);
      }
    }
    account = accounts?.[0] || '';
    if (account) {
      signer = await p.getSigner();
      localStorage.setItem(LS_ACCOUNT, account);
    }
    updateWalletUI(account || localStorage.getItem(LS_ACCOUNT) || '');
    return account;
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
    document.querySelectorAll('#connectWallet').forEach((btn) => {
      btn.textContent = addr ? short(addr) : L('Connect Wallet','连接钱包');
      btn.classList.toggle('connected', Boolean(addr));
      btn.setAttribute('aria-label', addr ? L('Wallet connected','钱包已连接') : L('Connect Wallet','连接钱包'));
    });
    document.querySelectorAll('#disconnectWallet').forEach((btn) => {
      btn.textContent = L('Disconnect','断开连接');
      btn.style.display = addr ? '' : 'none';
      btn.classList.toggle('connected', Boolean(addr));
    });
    document.querySelectorAll('[data-wallet-address]').forEach((el) => { el.textContent = addr ? short(addr) : '—'; });
  }

  async function connectWalletManaged() {
    try {
      // This is the only place that requests wallet authorization. Page load and
      // cross-page restore use eth_accounts only, so MetaMask opens only after a
      // user click.
      const addr = await refreshAccountFromProvider(true);
      if (addr) { localStorage.setItem(LS_CONNECTED, '1'); localStorage.setItem(LS_ACCOUNT, addr); }
      if (window.GHV_DAPP?.restoreExistingSession) {
        await window.GHV_DAPP.restoreExistingSession().catch(() => {});
        await refreshAccountFromProvider(false).catch(() => {});
      } else if (window.GHV_DAPP?.connect) {
        await window.GHV_DAPP.connect().catch(() => {});
        await refreshAccountFromProvider(false).catch(() => {});
      }
      if (page() === 'market') await loadMarketListings().catch((e)=>log(e.message,'warn'));
      if (page() === 'arena') await refreshArenaPage().catch((e)=>log(e.message,'warn'));
      return addr;
    } catch (err) {
      log(friendlyTxError(err), 'error');
      throw err;
    }
  }

  async function disconnectWalletManaged() {
    account = '';
    signer = undefined;
    localStorage.removeItem(LS_CONNECTED);
    localStorage.removeItem(LS_ACCOUNT);
    updateWalletUI('');
    if (window.GHV_DAPP?.disconnectLocal) {
      await window.GHV_DAPP.disconnectLocal().catch(() => {});
    }
    if (page() === 'market') await loadMarketListings().catch(()=>{});
    if (page() === 'arena') await refreshArenaPage().catch(()=>{});
    log(L('Wallet disconnected locally. To revoke site permission, remove this site in your wallet.','已在页面断开钱包。如需撤销钱包授权，请在钱包中移除此站点权限。'));
  }

  async function restoreWallet() {
    ensureDisconnectButtons();
    // First visit: do not auto-connect even if MetaMask already authorized the
    // domain. After the user clicks Connect once, keep the session across site
    // pages by restoring with eth_accounts only. On mobile wallets the provider
    // can be injected late during navigation, so keep the cached address visible
    // while we retry eth_accounts instead of clearing the session immediately.
    if (localStorage.getItem(LS_CONNECTED) !== '1') {
      account = '';
      signer = undefined;
      updateWalletUI('');
      return '';
    }
    const cached = localStorage.getItem(LS_ACCOUNT) || '';
    if (cached) updateWalletUI(cached);
    try {
      const addr = await refreshAccountFromProvider(false);
      const finalAddr = addr || cached;
      if (finalAddr) {
        account = finalAddr;
        updateWalletUI(finalAddr);
      }
      if (window.GHV_DAPP?.restoreExistingSession) {
        await window.GHV_DAPP.restoreExistingSession().catch(() => {});
        await refreshAccountFromProvider(false).catch(() => {});
      }
      return finalAddr;
    } catch {
      account = cached || '';
      signer = undefined;
      updateWalletUI(account);
      return account;
    }
  }

  function contract(key, abi, write = false) {
    const addr = cfgAddress(key);
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr) || same(addr, ZERO)) throw new Error(`Missing contract address: ${key}`);
    const runnerPromise = write ? getSigner() : getProvider();
    return runnerPromise.then((runner) => new (ethersLib().Contract)(addr, abi, runner));
  }

  async function tokenDecimals() {
    try { return Number(await (await contract('ghvToken', ABI.erc20)).decimals()); } catch { return 18; }
  }
  async function formatGhv(value, places = 4) {
    return trim(ethersLib().formatUnits(value || 0n, await tokenDecimals()), places) + ' GHV';
  }
  function formatEth(value, places = 5) { return trim(ethersLib().formatEther(value || 0n), places) + ' ETH'; }
  function trim(s, places = 4) {
    const [a,b=''] = String(s).split('.');
    if (!b || places === 0) return a;
    const cut = b.slice(0, places).replace(/0+$/, '');
    return cut ? `${a}.${cut}` : a;
  }
  function uriToHttp(uri) {
    if (!uri) return '';
    if (uri.startsWith('ipfs://')) return `${C.nftImageGateway || 'https://ipfs.io/ipfs/'}${uri.slice(7)}`;
    if (/^Qm[1-9A-HJ-NP-Za-km-z]{44,}$/.test(uri)) return `${C.nftImageGateway || 'https://ipfs.io/ipfs/'}${uri}`;
    return uri;
  }


  function comboImageURIFromConfig(card) {
    if (!card) return '';
    const c = cardData(card);
    const cid = C.nftImageCids && C.nftImageCids[`${c.classId}-${c.beast}`];
    if (!cid) return '';
    return `ipfs://${cid}`;
  }

  function resolveNftImageURI(card, onchainUri) {
    return onchainUri || comboImageURIFromConfig(card);
  }

  function startHomeNftShowcase() {
    if (page() !== 'home') return;
    const root = $('homeNftShowcase');
    const img = $('homeShowcaseImage');
    const link = $('homeShowcaseLink');
    const title = $('homeShowcaseTitle');
    const idxEl = $('homeShowcaseIndex');
    if (!root || !img || !link || !title || !C.nftImageCids) return;
    const entries = Object.entries(C.nftImageCids).map(([key, cid]) => {
      const [classId, beast] = key.split('-').map((x) => Number(x));
      const uri = uriToHttp(`ipfs://${cid}`);
      return { key, classId, beast, uri, cid };
    }).filter((x) => x.uri);
    if (!entries.length) return;
    let cursor = Math.floor(Math.random() * entries.length);
    const render = () => {
      const item = entries[cursor % entries.length];
      cursor += 1;
      img.src = item.uri;
      link.href = item.uri;
      title.innerHTML = `${nameAt(CLASS_NAMES, item.classId)} × ${nameAt(BEAST_NAMES, item.beast)}`;
      if (idxEl) idxEl.textContent = `${cursor}/${entries.length}`;
    };
    render();
    window.setInterval(render, Number(C.homeNftRotateMs || 4200));
  }
  function cardNum(card, key, idx) { return Number(card?.[key] ?? card?.[idx] ?? 0); }
  function cardData(card) {
    return {
      tokenId: cardNum(card, 'tokenId', 0), stakeId: cardNum(card, 'stakeId', 1), stakeTime: cardNum(card, 'stakeTime', 2),
      attack: cardNum(card, 'attack', 5), defense: cardNum(card, 'defense', 6), speed: cardNum(card, 'speed', 7), hp: cardNum(card, 'hp', 8),
      classId: cardNum(card, 'classId', 9), element: cardNum(card, 'element', 10), beast: cardNum(card, 'beast', 11),
      attr: cardNum(card, 'attrSkill', 12), starter: cardNum(card, 'starterSkill', 13), beastSkill: cardNum(card, 'beastSkill', 14), finisher: cardNum(card, 'finisherSkill', 15), fate: cardNum(card, 'fate', 16)
    };
  }

  function renderCard(item, mode = 'generic') {
    const c = cardData(item.card);
    const uri = uriToHttp(item.uri);
    const price = item.price !== undefined ? `<div class="market-price-line"><span>${L('Price','价格')}</span><b>${item.priceText || '—'}</b></div>` : '';
    const seller = item.seller ? `<div class="market-price-line"><span>${L('Seller','卖家')}</span><b>${short(item.seller)}</b></div>` : '';
    const ownerTag = item.invalid ? '<span class="status-dot danger">Invalid listing</span>' : item.tag || '<span class="status-dot good">Live</span>';
    const actions = item.actions || '';
    return `<article class="nft-tile live-nft-card">
      <div class="tile-head"><span class="tag">#${item.tokenId}</span>${ownerTag}</div>
      ${uri ? `<a href="${uri}" target="_blank" rel="noopener"><img class="nft-image" src="${uri}" alt="Goldhaven NFT #${item.tokenId}" loading="lazy" /></a>` : `<div class="nft-image placeholder">No image URI</div>`}
      <h3>${nameAt(CLASS_NAMES, c.classId)} × ${nameAt(BEAST_NAMES, c.beast)}</h3>
      <div class="nft-meta-grid">
        <span>ID<b>#${item.tokenId}</b></span><span>${L('Element','属性')}<b>${nameAt(ELEMENT_NAMES, c.element)}</b></span>
        <span>${L('Class','职业')}<b>${nameAt(CLASS_NAMES, c.classId)}</b></span><span>${L('Beast','神兽')}<b>${nameAt(BEAST_NAMES, c.beast)}</b></span>
        <span>${L('ATK','攻击')}<b>${c.attack}</b></span><span>${L('DEF','防御')}<b>${c.defense}</b></span>
        <span>${L('HP','生命')}<b>${c.hp}</b></span><span>${L('SPD','速度')}<b>${c.speed}</b></span>
      </div>
      <p class="skill-line"><b>${L('Skills','技能')}</b><br>${[c.attr,c.starter,c.beastSkill,c.finisher].map((s)=>nameAt(SKILL_NAMES, s)).join(' ｜ ')}</p>
      ${price}${seller}
      <div class="tile-actions nft-actions">${actions}</div>
    </article>`;
  }

  async function readNftFull(tokenId, nft) {
    const [card, uri] = await Promise.all([
      nft.cardOf(tokenId).catch(() => null),
      nft.imageURI(tokenId).catch(() => '')
    ]);
    return { tokenId: Number(tokenId), card, uri: resolveNftImageURI(card, uri) };
  }

  async function loadMarketListings() {
    const grid = $('marketListingsGrid');
    if (!grid) return;
    if (!hasAddress('nftMarketplace')) {
      grid.innerHTML = `<article class="empty-state"><h3>${L('Marketplace not configured','市场合约未配置')}</h3><p>${L('Fill nftMarketplace in config/contracts.js after deployment.','部署后请在 config/contracts.js 填入 nftMarketplace 地址。')}</p></article>`;
      return;
    }
    if (!hasAddress('goldhavenNFT') || !hasAddress('ghvToken')) throw new Error(L('NFT or GHVToken address missing.','缺少 NFT 或 GHVToken 地址。'));
    grid.innerHTML = `<article class="empty-state"><h3>${L('Scanning listings…','正在扫描挂单…')}</h3><p>${L('Reading marketplace listings from the latest token IDs.','正在从最近的 token ID 读取市场挂单。')}</p></article>`;
    const [market, nft] = await Promise.all([contract('nftMarketplace', ABI.market), contract('goldhavenNFT', ABI.nft)]);
    const next = await nft.nextTokenId().catch(() => 1n);
    const maxScan = BigInt(Number($('marketScanLimit')?.value || C.marketScanLimit || 1000));
    const last = next > 1n ? next - 1n : 0n;
    const start = last > maxScan ? last - maxScan + 1n : 1n;
    const cards = [];
    for (let id = start; id <= last; id++) {
      const listing = await market.listings(id).catch(() => [ZERO, 0n]);
      const seller = listing?.seller ?? listing?.[0] ?? ZERO;
      const price = listing?.price ?? listing?.[1] ?? 0n;
      if (!seller || same(seller, ZERO) || BigInt(price) === 0n) continue;
      const item = await readNftFull(id, nft);
      let currentOwner = '';
      try { currentOwner = await nft.ownerOf(id); } catch {}
      item.seller = seller;
      item.price = BigInt(price);
      item.priceText = await formatGhv(price, 4);
      item.invalid = currentOwner && !same(currentOwner, seller);
      item.tag = item.invalid ? `<span class="status-dot danger">${L('Seller moved NFT','卖家已转走 NFT')}</span>` : `<span class="status-dot good">${L('For sale','在售')}</span>`;
      item.actions = `<button class="btn primary" type="button" data-market-buy="${id}" ${item.invalid ? 'disabled title="Seller no longer owns this NFT"' : ''}>${L('Buy','购买')}</button>`;
      cards.push(item);
    }
    $('marketStatus').textContent = L(`Scanned token IDs ${start.toString()}–${last.toString()}. Found ${cards.length} listed NFT(s).`, `已扫描 token ID ${start.toString()}–${last.toString()}，找到 ${cards.length} 个在售 NFT。`);
    grid.innerHTML = cards.length ? cards.map((x)=>renderCard(x,'market')).join('') : `<article class="empty-state"><h3>${L('No listed NFTs found','未找到在售 NFT')}</h3><p>${L('No active listing was found in the scanned range.','当前扫描范围内没有找到有效挂单。')}</p></article>`;
  }

  async function buyMarketNft(tokenId) {
    if (!account) await connectWalletManaged();
    const [market, token] = await Promise.all([contract('nftMarketplace', ABI.market, true), contract('ghvToken', ABI.erc20, true)]);
    const listing = await market.listings(BigInt(tokenId));
    const seller = listing?.seller ?? listing?.[0] ?? ZERO;
    const price = BigInt(listing?.price ?? listing?.[1] ?? 0n);
    if (!seller || same(seller, ZERO) || price === 0n) throw new Error(L('This NFT is not listed.','该 NFT 未上架。'));
    const allowance = await token.allowance(account, cfgAddress('nftMarketplace')).catch(() => 0n);
    if (allowance < price) {
      const approveTx = await token.approve(cfgAddress('nftMarketplace'), price);
      log(`GHV approval submitted: ${approveTx.hash}`);
      await approveTx.wait();
      log('GHV approval confirmed.');
    }
    const tx = await market.buy(BigInt(tokenId));
    log(`Buy NFT #${tokenId} submitted: ${tx.hash}`);
    await tx.wait();
    log(`NFT #${tokenId} purchase confirmed.`);
    await loadMarketListings();
  }

  async function resolveActiveArena() {
    // Prefer a real running arena from Vault/Factory. Session cache can point to a finished previous arena.
    if (hasAddress('goldhavenVault')) {
      try {
        const a = await (await contract('goldhavenVault', ABI.vault)).activeArena();
        if (a && !same(a, ZERO)) return a;
      } catch {}
    }
    if (hasAddress('arenaFactory')) {
      try {
        const factory = await contract('arenaFactory', ABI.factory);
        const a = await factory.activeArena().catch(() => ZERO);
        if (a && !same(a, ZERO)) {
          const ar = new (ethersLib().Contract)(a, ABI.arena, await getProvider());
          const done = await ar.finished().catch(() => false);
          if (!done) return a;
        }
      } catch {}
    }
    if (hasAddress('activeArena')) return cfgAddress('activeArena');
    if (runtimeActiveArena && /^0x[a-fA-F0-9]{40}$/.test(runtimeActiveArena) && !same(runtimeActiveArena, ZERO)) return runtimeActiveArena;
    if (hasAddress('arenaFactory')) {
      try {
        const factory = await contract('arenaFactory', ABI.factory);
        const latestFinished = await factory.latestFinishedArena().catch(() => ZERO);
        if (latestFinished && !same(latestFinished, ZERO)) return latestFinished;
        const latest = await factory.latestArena().catch(() => ZERO);
        if (latest && !same(latest, ZERO)) return latest;
        const today = await factory.arenaOfDay(BigInt(nowDayId())).catch(() => ZERO);
        if (today && !same(today, ZERO)) return today;
      } catch {}
    }
    return '';
  }

  async function resolveArenaHistoryTargets(preferred = '') {
    const p = await getProvider();
    const valid = (addr) => addr && /^0x[a-fA-F0-9]{40}$/.test(String(addr)) && !same(addr, ZERO);
    const isRunning = async (addr) => {
      if (!valid(addr)) return false;
      try { return !(await new (ethersLib().Contract)(addr, ABI.arena, p).finished().catch(() => true)); } catch { return false; }
    };
    // User requested: replay the current running arena first. Only if there is no running arena, replay the latest finished arena.
    if (await isRunning(preferred)) return [preferred];
    if (hasAddress('goldhavenVault')) {
      try { const a = await (await contract('goldhavenVault', ABI.vault)).activeArena(); if (await isRunning(a)) return [a]; } catch {}
    }
    if (hasAddress('arenaFactory')) {
      try {
        const factory = await contract('arenaFactory', ABI.factory);
        const active = await factory.activeArena().catch(() => ZERO);
        if (await isRunning(active)) return [active];
        const latestFinished = await factory.latestFinishedArena().catch(() => ZERO);
        if (valid(latestFinished)) return [latestFinished];
        const latest = await factory.latestArena().catch(() => ZERO);
        if (valid(latest)) return [latest];
      } catch {}
    }
    return valid(preferred) ? [preferred] : [];
  }

  async function loadWalletTokenIds(nft) {
    const ids = new Set();
    if (!account || !nft) return ids;
    const next = await nft.nextTokenId().catch(() => 1n);
    const maxScan = BigInt(Number($('arenaScanLimit')?.value || C.arenaScanLimit || 1000));
    const last = next > 1n ? next - 1n : 0n;
    const start = last > maxScan ? last - maxScan + 1n : 1n;
    for (let id = start; id <= last; id++) {
      try {
        const owner = await nft.ownerOf(id);
        if (same(owner, account)) ids.add(id.toString());
      } catch {}
    }
    return ids;
  }

  async function readArrayUntilRevert(contractObj, fn, max = 64) {
    const out = [];
    for (let i = 0; i < max; i++) {
      try { out.push(BigInt(await contractObj[fn](i))); }
      catch { break; }
    }
    return out;
  }

  async function loadMyArenaCards(vault, nft) {
    if (!account) return [];
    const idsSet = new Set();
    // Pending queue for the next arena.
    try { (await vault.getArenaParticipants()).forEach((x) => idsSet.add(BigInt(x).toString())); } catch {}
    // Fallback scan catches cards already consumed by a running/finished arena.
    const next = await nft.nextTokenId().catch(() => 1n);
    const maxScan = BigInt(Number($('arenaScanLimit')?.value || C.arenaScanLimit || 1000));
    const last = next > 1n ? next - 1n : 0n;
    const start = last > maxScan ? last - maxScan + 1n : 1n;
    for (let id = start; id <= last; id++) {
      const owner = await vault.stakeOwnerOfToken(id).catch(() => ZERO);
      if (owner && same(owner, account)) idsSet.add(id.toString());
    }
    const mine = [];
    for (const key of idsSet) {
      const id = BigInt(key);
      const owner = await vault.stakeOwnerOfToken(id).catch(() => ZERO);
      if (!same(owner, account)) continue;
      const item = await readNftFull(id, nft);
      const stakeId = await vault.stakeIdOfToken(id).catch(() => 0n);
      const locked = await vault.lockedInActiveArena(id).catch(() => false);
      const arenaOf = await vault.arenaOfToken?.(id).catch(() => ZERO) || ZERO;
      const arenaFinishedAt = await vault.arenaFinishedAtOfToken?.(id).catch(() => 0n) || 0n;
      item.stakeId = BigInt(stakeId || 0n);
      item.arenaOf = arenaOf;
      item.arenaFinishedAt = BigInt(arenaFinishedAt || 0n);
      const arenaText = arenaOf && !same(arenaOf, ZERO) ? ` · Arena ${short(arenaOf)}` : '';
      if (locked) item.tag = `<span class="status-dot danger">${L('Arena in progress','竞技场进行中')}</span>`;
      else if (arenaOf && !same(arenaOf, ZERO)) item.tag = `<span class="status-dot good">${L('Arena finished / redeemable','竞技场已结束 / 可赎回')}</span>`;
      else item.tag = `<span class="status-dot good">${L('Queued for next arena','等待下一场')}</span>`;
      item.actions = `<span class="hint">Stake ID: ${item.stakeId.toString()}${arenaText}</span>`;
      mine.push(item);
    }
    return mine;
  }

  function setButtonState(id, enabled, title = '') {
    const btn = $(id);
    if (!btn) return;
    btn.disabled = !enabled;
    if (title) btn.title = title;
    else btn.removeAttribute('title');
  }

  function setProgressBar(id, pct) {
    const el = $(id);
    if (!el) return;
    const safe = Math.max(0, Math.min(100, Number.isFinite(pct) ? pct : 0));
    el.style.width = `${safe}%`;
  }

  async function openDailyArenaTx() {
    if (!hasAddress('arenaFactory')) throw new Error(L('ArenaFactory address is not configured.','ArenaFactory 地址未配置。'));
    if (!account) await connectWalletManaged();
    const factory = await contract('arenaFactory', ABI.factory, true);
    openArenaPending = true;
    setText('arenaStatus', L('Opening arena… please confirm the wallet transaction and wait for confirmation.','正在开启竞技场……请确认钱包交易并等待上链。'));
    setText('arenaActiveAddress', L('Opening…','开启中…'));
    setButtonState('openDailyArena', false, L('Opening arena transaction is pending.','开启竞技场交易确认中。'));

    // Preflight checks provide readable messages before MetaMask hides custom errors behind -32603.
    try {
      if (hasAddress('goldhavenVault')) {
        const vault = await contract('goldhavenVault', ABI.vault);
        const isValidator = await vault.isValidator(account).catch(() => false);
        if (!isValidator) throw new Error('NotValidator');
        const participants = await vault.getArenaParticipants().catch(() => []);
        if (!participants || participants.length === 0) throw new Error('BadParticipantCount');
      }
      const running = await factory.activeArena().catch(() => ZERO);
      if (running && !same(running, ZERO)) {
        const a = new (ethersLib().Contract)(running, ABI.arena, await getProvider());
        const done = await a.finished().catch(() => false);
        if (!done) throw new Error('ArenaActive');
      }
      const testMode = await factory.testMode().catch(() => false);
      const dailyLimit = await factory.dailyLimitEnabled().catch(() => !testMode);
      if (!testMode && dailyLimit) {
        const dayArena = await factory.arenaOfDay(BigInt(nowDayId())).catch(() => ZERO);
        if (dayArena && !same(dayArena, ZERO)) throw new Error('AlreadyOpened');
      }
      const inWindow = await factory.isOpenWindow().catch(() => true);
      if (!inWindow && !testMode) {
        throw new Error('NotOpenWindow');
      }
    } catch (preflightErr) {
      throw new Error(friendlyTxError(preflightErr));
    }

    let tx;
    try { tx = await factory.openArena(); }
    catch (err1) {
      // Some deployments only expose openDailyArena().
      try { tx = await factory.openDailyArena(); }
      catch (err2) { throw err2?.data ? err2 : err1; }
    }
    log(`Open arena submitted: ${tx.hash}`);
    const receipt = await tx.wait();

    let openedArena = '';
    try {
      const iface = factory.interface;
      for (const rawLog of receipt.logs || []) {
        if (!same(rawLog.address, cfgAddress('arenaFactory'))) continue;
        let parsed;
        try { parsed = iface.parseLog(rawLog); } catch { continue; }
        if (parsed?.name === 'ArenaOpened' || parsed?.name === 'ArenaOpenedV2') {
          openedArena = parsed.args.arena || parsed.args[1] || '';
          break;
        }
      }
    } catch {}

    if (!openedArena && hasAddress('goldhavenVault')) {
      try { openedArena = await (await contract('goldhavenVault', ABI.vault)).activeArena(); } catch {}
    }
    if (!openedArena || same(openedArena, ZERO)) {
      try { openedArena = await factory.activeArena(); } catch {}
    }
    if (!openedArena || same(openedArena, ZERO)) {
      try { openedArena = await factory.latestArena(); } catch {}
    }
    if (openedArena && !same(openedArena, ZERO)) rememberRuntimeArena(openedArena);

    log(openedArena && !same(openedArena, ZERO) ? `${L('Arena opened:','竞技场已开启：')} ${openedArena}` : L('Arena open transaction confirmed. Refreshing state…','开赛交易已确认，正在刷新状态…'));

    // Some RPC/indexers need a moment before read calls reflect the new arena.
    await new Promise((resolve) => setTimeout(resolve, 900));
    openArenaPending = false;
    await refreshArenaPage();
  }

  async function verifyNextMatchTx() {
    const active = await resolveActiveArena();
    if (!active) throw new Error(L('No arena address found.','未找到竞技场地址。'));
    if (!account) await connectWalletManaged();
    const arena = new (ethersLib().Contract)(active, ABI.arena, await getSigner());
    const tx = await arena.verifyNextMatch();
    log(`Verify next match submitted: ${tx.hash}`);
    await tx.wait();
    log(L('Match verified.','比赛验证完成。'));
    await refreshArenaPage();
  }

  async function verifyMatchTx(matchIndex) {
    const active = await resolveActiveArena();
    if (!active) throw new Error(L('No arena address found.','未找到竞技场地址。'));
    if (!account) await connectWalletManaged();
    const arena = new (ethersLib().Contract)(active, ABI.arena, await getSigner());
    const tx = await arena.verifyMatch(BigInt(matchIndex));
    log(`Verify match #${matchIndex} submitted: ${tx.hash}`);
    await tx.wait();
    log(L('Match verified.','比赛验证完成。'));
    await refreshArenaPage();
  }

  async function openOrRefreshNextRoundTx() {
    log(L('The current Arena advances automatically after all matches in the round are verified. Refreshing state.','当前竞技场会在本轮全部比赛验证完成后自动进入下一轮，正在刷新状态。'));
    await refreshArenaPage();
  }

  async function refreshArenaPage() {
    if (page() !== 'arena') return;
    if (hasAddress('ghvHook')) {
      const hook = await contract('ghvHook', ABI.hook);
      const vaultEth = await hook.arenaVaultEth().catch(() => 0n);
      setText('onchainArenaVault', formatEth(vaultEth, 5));
      setText('onchainTodayFunding', formatEth((vaultEth * 70n) / 100n, 5));
    }
    let walletIsValidator = false;
    if (account && hasAddress('goldhavenVault')) {
      try { walletIsValidator = Boolean(await (await contract('goldhavenVault', ABI.vault)).isValidator(account)); } catch {}
    }
    setText('arenaIsValidatorNow', account ? (walletIsValidator ? L('Yes','是') : L('No','否')) : L('Connect wallet','连接钱包'));
    setText('arenaValidatorStatus', account ? (walletIsValidator ? L('Validator','验证者') : L('Not validator','非验证者')) : L('Wallet needed','需连接'));

    let factoryActive = '';
    if (hasAddress('arenaFactory')) {
      try {
        const factory = await contract('arenaFactory', ABI.factory);
        factoryActive = await factory.activeArena().catch(() => ZERO);
        if (factoryActive && !same(factoryActive, ZERO)) {
          const a = new (ethersLib().Contract)(factoryActive, ABI.arena, await getProvider());
          if (await a.finished().catch(() => false)) factoryActive = '';
        }
      } catch {}
    }
    const openEnabled = Boolean(!openArenaPending && account && walletIsValidator && hasAddress('arenaFactory') && (!factoryActive || same(factoryActive, ZERO)));
    setButtonState('openDailyArena', openEnabled, openArenaPending ? L('Opening arena transaction is pending.','开启竞技场交易确认中。') : (openEnabled ? '' : L('Needs validator wallet, ArenaFactory, and no running arena.','需要验证者钱包、ArenaFactory，且没有正在进行的竞技场。')));

    const cardsGrid = $('arenaCardsGrid');
    let myCards = [];
    if (hasAddress('goldhavenVault') && hasAddress('goldhavenNFT')) {
      const [vault, nft] = await Promise.all([contract('goldhavenVault', ABI.vault), contract('goldhavenNFT', ABI.nft)]);
      if (account) myCards = await loadMyArenaCards(vault, nft);
      if (cardsGrid) {
        if (!account) cardsGrid.innerHTML = `<article class="empty-state"><h3>${L('Connect wallet','连接钱包')}</h3><p>${L('Connect to view the cards you put into the arena.','连接钱包后查看你投放到竞技场的卡片。')}</p></article>`;
        else cardsGrid.innerHTML = myCards.length ? myCards.map((x)=>renderCard(x,'arena')).join('') : `<article class="empty-state"><h3>${L('No arena cards','暂无竞技场卡片')}</h3><p>${L('No NFT currently staked by this wallet was found.','没有找到该钱包当前投放到竞技场的 NFT。')}</p></article>`;
      }
    }

    const active = await resolveActiveArena();
    setText('arenaActiveAddress', active ? short(active) : '—');
    if (!active) {
      setText('arenaRoundNow', '—'); setText('arenaRemainingNow', '—'); setText('arenaRoundVerifyProgress', '—'); setText('arenaRoundVerifyProgressText', '—'); setProgressBar('arenaRoundVerifyBar', 0); setText('arenaFinishedNow', L('No arena','暂无竞技场')); setText('arenaChampionNow', '—'); setText('arenaMyReward', '—'); setText('arenaMyBattleReward', '—'); setText('arenaMyValidatorReward', '—'); setText('arenaContractBalance', '—'); setText('arenaMyVerifyCount', '—'); setText('arenaVerifyReadyNow', '—'); setText('arenaNextRoundReadyNow', '—'); setButtonState('verifyNextMatch', false); setButtonState('advanceNextRound', false); setButtonState('claimBattleReward', false); setButtonState('claimValidatorReward', false);
      $('arenaHistory') && ($('arenaHistory').innerHTML = `<article class="empty-state"><h3>${L('No arena','暂无竞技场')}</h3><p>${L('Open an arena through ArenaFactory or set an arena address in config.','请通过 ArenaFactory 开启竞技场，或在配置中设置竞技场地址。')}</p></article>`);
      return;
    }

    const arena = new (ethersLib().Contract)(active, ABI.arena, await getProvider());
    const p = await getProvider();
    const [round, finished, champ, reward, battleReward, validatorReward, myVerifyCount, balance] = await Promise.all([
      arena.currentRoundNumber().catch(() => 0n), arena.finished().catch(() => false), arena.championTokenId().catch(() => 0n),
      account ? arena.pendingRewards(account).catch(() => 0n) : Promise.resolve(0n),
      account ? arena.pendingBattleRewards(account).catch(() => 0n) : Promise.resolve(0n),
      account ? arena.pendingValidatorRewards(account).catch(() => 0n) : Promise.resolve(0n),
      account ? arena.validatorVerifications(account).catch(() => 0n) : Promise.resolve(0n),
      p.getBalance(active).catch(() => 0n)
    ]);
    let current = [];
    let next = [];
    try { current = (await arena.getCurrentRound()).map((x)=>BigInt(x)); } catch { current = await readArrayUntilRevert(arena, 'currentRound', 64); }
    try { next = (await arena.getNextRound()).map((x)=>BigInt(x)); } catch { next = await readArrayUntilRevert(arena, 'nextRound', 64); }
    const matchesTotal = Number(await arena.currentRoundMatchCount().catch(() => BigInt(Math.floor(current.length / 2))));
    const matchesDone = Number(await arena.currentRoundVerifiedMatches().catch(async () => {
      const idx = await arena.nextMatchIndex().catch(() => 0n); return BigInt(Math.floor(Number(idx) / 2));
    }));
    const roundProgressPct = matchesTotal ? (matchesDone * 100 / matchesTotal) : (finished ? 100 : 0);
    const matchReady = !finished && matchesTotal > matchesDone;
    const roundComplete = !finished && matchesTotal > 0 && matchesDone >= matchesTotal;
    const remaining = finished ? 0 : Math.max(0, current.length - (matchesDone * 2));
    setText('arenaRoundNow', String(round));
    setText('arenaRemainingNow', String(remaining));
    const progressLabel = matchesTotal ? `${matchesDone}/${matchesTotal}` : (finished ? L('Finished','已结束') : L('No match ready','暂无可验证比赛'));
    setText('arenaRoundVerifyProgress', progressLabel);
    setText('arenaRoundVerifyProgressText', progressLabel);
    setProgressBar('arenaRoundVerifyBar', roundProgressPct);
    setText('arenaFinishedNow', finished ? L('Finished','已结束') : L('Running','进行中'));
    setText('arenaChampionNow', finished ? L('Top 32 listed below','前32强见下方') : (BigInt(champ || 0) > 0n ? `#${champ.toString()}` : '—'));
    setText('arenaMyReward', account ? formatEth(reward, 6) : L('Connect wallet','连接钱包'));
    setText('arenaMyBattleReward', account ? formatEth(battleReward, 6) : L('Connect wallet','连接钱包'));
    setText('arenaMyValidatorReward', account ? formatEth(validatorReward, 6) : L('Connect wallet','连接钱包'));
    setText('arenaContractBalance', formatEth(balance, 6));
    setText('arenaMyVerifyCount', account ? String(myVerifyCount) : L('Connect wallet','连接钱包'));
    setText('arenaVerifyReadyNow', matchReady && walletIsValidator ? L('Ready','可验证') : L('Locked','未激活'));
    setText('arenaNextRoundReadyNow', roundComplete ? L('Auto advancing / refresh','自动进入 / 刷新') : (matchReady ? L('Verify current round','先验证本轮') : (finished ? L('Finished','已结束') : L('Auto / refresh','自动/刷新'))));
    setButtonState('verifyNextMatch', Boolean(account && walletIsValidator && matchReady), matchReady ? '' : L('No match ready or arena is finished.','暂无可验证比赛或竞技场已结束。'));
    setButtonState('advanceNextRound', Boolean(account && walletIsValidator && !finished && (roundComplete || !matchReady)), L('Current contracts auto-open the next round after the round is fully verified.','当前合约会在本轮全部验证完成后自动开启下一轮。'));
    setButtonState('claimBattleReward', Boolean(account && battleReward > 0n));
    setButtonState('claimValidatorReward', Boolean(account && validatorReward > 0n));

    await renderMatchVerifyList(arena, matchesTotal, walletIsValidator, finished);

    const snapshot = $('arenaRoundSnapshot');
    if (snapshot) {
      if (finished) {
        await renderFinishedTop32(snapshot, arena, active, BigInt(champ || 0n));
      } else {
        snapshot.innerHTML = `<div class="battle-row"><b>${L('Current round queue','当前轮队列')}</b><span>${current.length ? current.map((x)=>`#${x}`).join(', ') : '—'}</span></div>
          <div class="battle-row"><b>${L('Next round / bye / winners','下一轮 / 轮空 / 胜者')}</b><span>${next.length ? next.filter((x)=>x>0n).map((x)=>`#${x}`).join(', ') || '—' : '—'}</span></div>
          <div class="battle-row"><b>${L('Current round verification','当前轮验证')}</b><span>${progressLabel}</span></div>`;
      }
    }
    const historyTargets = await resolveArenaHistoryTargets(active);
    await renderArenaHistory(historyTargets, myCards.map((x)=>BigInt(x.tokenId))).catch((e)=>log(e.message,'warn'));
  }

  async function renderMatchVerifyList(arena, matchesTotal, walletIsValidator, finished) {
    const el = $('arenaMatchVerifyList');
    if (!el) return;
    if (finished || !matchesTotal) { el.innerHTML = `<div class="battle-row"><b>${L('Match verification','比赛验证')}</b><span>${finished ? L('Arena finished','竞技场已结束') : L('No match ready','暂无可验证比赛')}</span></div>`; return; }
    const rows = [];
    for (let i = 0; i < matchesTotal; i++) {
      let a=0n,b=0n,done=false,w=0n;
      try { const r = await arena.matchTokens(i); a=BigInt(r.tokenA); b=BigInt(r.tokenB); done=Boolean(r.verified); w=BigInt(r.winner); } catch {}
      rows.push(`<div class="battle-row"><b>#${a} vs #${b}</b><span>${done ? `${L('Verified','已验证')} · ${L('Winner','胜者')} #${w}` : L('Pending','待验证')} ${(!done && walletIsValidator) ? `<button class="mini-btn" data-verify-match-index="${i}">${L('Verify','验证')}</button>` : ''}</span></div>`);
    }
    el.innerHTML = rows.join('');
  }

  function setText(id, value) { const el = $(id); if (el) el.textContent = value; }

  async function renderFinishedTop32(el, arena, arenaAddr, championTokenId) {
    const nft = hasAddress('goldhavenNFT') ? await contract('goldhavenNFT', ABI.nft).catch(() => null) : null;
    const contractRanked = await loadTop32FromContract(arena).catch(() => []);
    if (contractRanked.length) {
      const ownerRows = [];
      for (const r of contractRanked.slice(0, 32)) ownerRows.push(await renderTop32RankCard(r, nft));
      el.innerHTML = `<div class="battle-row rank-title"><b>${L('Top 32 cards and owners','前32强卡片和 owner')}</b><span>${L('Click a card to view attributes','点击卡片查看属性')} · ${short(arenaAddr)}</span></div><div class="rank-list rank-list-rich">${ownerRows.join('')}</div>`;
      return;
    }

    const p = await getProvider();
    const iface = new (ethersLib().Interface)(ABI.arena);
    const latest = await p.getBlockNumber().catch(() => 0);
    const logs = await loadArenaMatchLogs(p, iface, arenaAddr, latest);
    const ranked = buildTop32FromLogs(logs, championTokenId).slice(0, 32);
    if (!ranked.length) {
      el.innerHTML = `<article class="empty-state"><h3>${L('Finished arena','竞技场已结束')}</h3><p>${L('This arena was deployed before the top32 snapshot getters, and no ranking events were found. New arenas will show the top 32 directly from chain getters.','这场竞技场部署早于 top32 快照 getter，且未读取到排名事件。新竞技场会直接从链上 getter 展示前32强。')}</p></article>`;
      return;
    }
    const ownerRows = [];
    for (let i = 0; i < ranked.length; i++) {
      const tokenId = ranked[i];
      const owner = await ownerAddressForToken(tokenId);
      ownerRows.push(await renderTop32RankCard({ rank: i + 1, tokenId, owner, fallback: true }, nft));
    }
    el.innerHTML = `<div class="battle-row rank-title"><b>${L('Top 32 cards and owners','前32强卡片和 owner')}</b><span>${L('Fallback from events; click a card to view attributes','事件兜底；点击卡片查看属性')} · ${short(arenaAddr)}</span></div><div class="rank-list rank-list-rich">${ownerRows.join('')}</div>`;
  }

  async function renderTop32RankCard(row, nft) {
    let item = null;
    if (nft) {
      try { item = await readNftFull(BigInt(row.tokenId), nft); } catch {}
    }
    const cardHtml = item?.card ? compactCardAttributes(item, 'rank-detail') : `<p class="hint">${L('Card attributes are unavailable from the configured NFT contract.','无法从当前 NFT 合约读取卡片属性。')}</p>`;
    const title = item?.card ? `${nameAt(CLASS_NAMES, cardData(item.card).classId)} × ${nameAt(BEAST_NAMES, cardData(item.card).beast)}` : `${L('Card','卡片')} #${row.tokenId}`;
    const img = item?.uri ? `<img class="rank-card-image" src="${uriToHttp(item.uri)}" alt="Goldhaven NFT #${row.tokenId}" loading="lazy" />` : `<div class="rank-card-image placeholder">#${row.tokenId}</div>`;
    const badge = Number(row.rank) === 1 ? L('Champion','冠军') : `Top ${row.rank}`;
    return `<details class="rank-card">
      <summary>
        <b>#${row.rank}</b>
        ${img}
        <span><strong>${title}</strong><small>${L('Card','卡片')} #${row.tokenId}</small></span>
        <code title="${row.owner}">${short(row.owner) || row.owner || '—'}</code>
        <em>${badge}</em>
      </summary>
      <div class="rank-card-body"><div class="history-match-meta"><span>${L('Snapshot owner','快照 owner')} ${row.owner || '—'}</span>${row.fallback ? `<span>${L('Fallback owner may reflect current ownership','兜底 owner 可能是当前持有人')}</span>` : ''}</div>${cardHtml}</div>
    </details>`;
  }

  function compactCardAttributes(item, extraClass = '') {
    const c = cardData(item.card);
    const uri = item.uri ? uriToHttp(item.uri) : '';
    return `<div class="compact-card-attrs ${extraClass}">
      ${uri ? `<a href="${uri}" target="_blank" rel="noopener"><img src="${uri}" alt="Goldhaven NFT #${item.tokenId}" loading="lazy" /></a>` : ''}
      <div class="nft-meta-grid">
        <span>ID<b>#${item.tokenId}</b></span><span>${L('Class','职业')}<b>${nameAt(CLASS_NAMES, c.classId)}</b></span>
        <span>${L('Element','属性')}<b>${nameAt(ELEMENT_NAMES, c.element)}</b></span><span>${L('Beast','神兽')}<b>${nameAt(BEAST_NAMES, c.beast)}</b></span>
        <span>${L('ATK','攻击')}<b>${c.attack}</b></span><span>${L('DEF','防御')}<b>${c.defense}</b></span>
        <span>${L('HP','生命')}<b>${c.hp}</b></span><span>${L('SPD','速度')}<b>${c.speed}</b></span>
      </div>
      <p class="skill-line"><b>${L('Skills','技能')}</b><br>${[c.attr,c.starter,c.beastSkill,c.finisher].map((x)=>nameAt(SKILL_NAMES, x)).join(' ｜ ')}</p>
    </div>`;
  }

  async function loadTop32FromContract(arena) {
    const out = [];
    const count = Number(await arena.top32Count());
    for (let i = 0; i < Math.min(count, 32); i++) {
      const r = await arena.top32At(BigInt(i));
      const rank = Number(r.rank ?? r[0] ?? (i + 1));
      const tokenId = BigInt(r.tokenId ?? r[1] ?? 0n).toString();
      const owner = r.owner ?? r[2] ?? ZERO;
      if (tokenId !== '0') out.push({ rank, tokenId, owner });
    }
    return out;
  }

  function buildTop32FromLogs(logs, championTokenId = 0n) {
    const participants = new Set();
    const lostRound = new Map();
    const winners = new Set();
    for (const item of logs || []) {
      const a = String(item.a || '0');
      const b = String(item.b || '0');
      const w = String(item.w || '0');
      const r = Number(item.round || 0);
      if (a !== '0') participants.add(a);
      if (b !== '0') participants.add(b);
      if (w !== '0') { participants.add(w); winners.add(w); }
      const loser = (w && w !== '0') ? (a === w ? b : a) : '';
      if (loser && loser !== '0') lostRound.set(loser, Math.max(lostRound.get(loser) || 0, r));
    }
    const champion = BigInt(championTokenId || 0n) > 0n ? String(championTokenId) : [...winners].find((x) => !lostRound.has(x));
    const ordered = [];
    if (champion && champion !== '0') ordered.push(champion);
    const losers = [...lostRound.entries()].sort((a, b) => (b[1] - a[1]) || (BigInt(a[0]) < BigInt(b[0]) ? -1 : 1)).map(([id]) => id);
    for (const id of losers) if (!ordered.includes(id)) ordered.push(id);
    for (const id of participants) if (!ordered.includes(id)) ordered.push(id);
    return ordered.slice(0, 32);
  }

  async function ownerAddressForToken(tokenId) {
    const id = BigInt(tokenId);
    if (hasAddress('goldhavenVault')) {
      try {
        const owner = await (await contract('goldhavenVault', ABI.vault)).stakeOwnerOfToken(id).catch(() => ZERO);
        if (owner && !same(owner, ZERO)) return owner;
      } catch {}
    }
    if (hasAddress('goldhavenNFT')) {
      try { return await (await contract('goldhavenNFT', ABI.nft)).ownerOf(id); } catch {}
    }
    return '—';
  }

  async function renderArenaHistory(arenaAddrs, myTokenIds) {
    const el = $('arenaHistory');
    if (!el) return;
    const targets = Array.isArray(arenaAddrs) ? arenaAddrs : [arenaAddrs].filter(Boolean);
    if (!targets.length) {
      el.innerHTML = `<article class="empty-state"><h3>${L('No arena','暂无竞技场')}</h3><p>${L('No active or latest finished arena was found.','未找到正在进行或最新结束的竞技场。')}</p></article>`;
      return;
    }
    const iface = new (ethersLib().Interface)(ABI.arena);
    const p = await getProvider();
    const latest = await p.getBlockNumber().catch(() => 0);
    const nft = hasAddress('goldhavenNFT') ? await contract('goldhavenNFT', ABI.nft) : null;
    const mine = new Set(myTokenIds.map((x)=>x.toString()));
    if (nft) {
      try { (await loadWalletTokenIds(nft)).forEach((x) => mine.add(x)); } catch {}
    }
    if (!mine.size && account && hasAddress('goldhavenVault') && hasAddress('goldhavenNFT')) {
      try {
        const [vault, nftC] = await Promise.all([contract('goldhavenVault', ABI.vault), contract('goldhavenNFT', ABI.nft)]);
        (await loadMyArenaCards(vault, nftC)).forEach((x) => mine.add(String(x.tokenId)));
      } catch {}
    }

    const rows = [];
    for (const arenaAddr of targets.slice(0, 1)) {
      const arena = new (ethersLib().Contract)(arenaAddr, ABI.arena, p);
      const [finished, roundNo] = await Promise.all([
        arena.finished().catch(() => false),
        arena.currentRoundNumber().catch(() => 0n)
      ]);
      if (account) await addMySnapshotEntrants(arena, mine, account).catch(() => {});
      const arenaLabel = `${finished ? L('Latest finished arena','最新一期历史竞技场') : L('Running arena','正在进行的竞技场')} ${short(arenaAddr)}`;

      let matches = await loadArenaMatchesFromContract(arena, finished).catch(() => []);
      if (!matches.length) {
        const logs = await loadArenaMatchLogs(p, iface, arenaAddr, latest);
        matches = logs.map((x) => ({ ...x, verified: Boolean(x.w && x.w !== '0'), source: 'event' }));
      }
      const roundSizes = await computeRoundSizesFromArena(arena, matches).catch(() => computeRoundSizes(matches));
      const mineRows = [];
      for (const item of matches) {
        const round = String(item.round || roundNo || '0');
        const a = String(item.a || '0');
        const b = String(item.b || '0');
        const w = String(item.w || '0');
        const done = Boolean(item.verified || (w && w !== '0'));
        if (!a || !b || a === '0' || b === '0') continue;
        const touchesMine = mine.has(a) || mine.has(b) || (done && mine.has(w));
        if (!touchesMine) continue;
        const won = done && mine.has(w);
        const result = done ? (won ? L('Win','胜') : L('Loss','负')) : L('Pending verification','待验证');
        const resultClass = done ? (won ? 'win' : 'loss') : 'pending';
        const remaining = roundSizes.get(String(round)) || '—';
        let replay = '';
        if (nft) {
          try {
            const ca = cardData(await nft.cardOf(BigInt(a))); ca.tokenId = Number(a);
            const cb = cardData(await nft.cardOf(BigInt(b))); cb.tokenId = Number(b);
            replay = localReplaySummary(ca, cb, done ? BigInt(w) : 0n, !done, mine.has(a) ? a : b);
          } catch {}
        }
        const matchLabel = item.matchIndex !== undefined ? `${L('Match','场次')} #${Number(item.matchIndex) + 1}` : (item.blockNumber ? `block ${item.blockNumber}` : '—');
        const mineToken = mine.has(a) ? a : b;
        const opponent = mine.has(a) ? b : a;
        mineRows.push(`<details class="arena-match-card ${resultClass}">
          <summary>
            <div class="match-round-badge"><span>${L('Round','第')}</span><b>${round}</b></div>
            <div class="match-main"><strong>${arenaLabel}</strong><span>${L('My card','我的卡片')} #${mineToken} vs #${opponent}</span></div>
            <div class="match-result ${resultClass}">${result}</div>
          </summary>
          <div class="match-quick-stats"><span>${L('Remaining before this round','本轮人数')} ${remaining}</span><span>${done ? `${L('Chain winner','链上胜者')} #${w}` : L('Waiting for validator','等待验证者')}</span><span>${matchLabel}</span>${item.validator && !same(item.validator, ZERO) ? `<span>${L('Validator','验证者')} ${short(item.validator)}</span>` : ''}</div>
          ${replay || `<p class="hint">${L('Local replay needs NFT card data.','本地复现需要 NFT 卡片数据。')}</p>`}
        </details>`);
      }
      if (mineRows.length) rows.push(...mineRows);
    }
    if (!rows.length) {
      el.innerHTML = `<article class="empty-state"><h3>${L('No battle for my cards yet','暂无我的卡片对战')}</h3><p>${L('New arenas expose match getters, so this panel can replay your card battles without relying on event logs. Make sure this wallet owned or staked a card in the selected arena.','新版竞技场会暴露比赛 getter，因此本区域无需依赖事件日志即可复现你的卡片对战。请确认当前钱包在该场竞技场中拥有或质押过卡片。')}</p></article>`;
    } else {
      el.innerHTML = rows.join('');
    }
  }

  async function addMySnapshotEntrants(arena, mine, wallet) {
    const count = Number(await arena.entrantCount());
    for (let i = 0; i < Math.min(count, 64); i++) {
      const e = await arena.entrantAt(BigInt(i));
      const tokenId = BigInt(e.tokenId ?? e[0] ?? 0n).toString();
      const owner = e.owner ?? e[1] ?? ZERO;
      if (tokenId !== '0' && same(owner, wallet)) mine.add(tokenId);
    }
  }

  async function loadArenaMatchesFromContract(arena, finished) {
    const roundNow = Number(await arena.currentRoundNumber().catch(() => 0n));
    const finalRound = finished ? Number(await arena.finalRoundNumber().catch(() => BigInt(roundNow))) : roundNow;
    const maxRound = Math.max(1, finalRound || roundNow || 1);
    const out = [];
    for (let r = 1; r <= maxRound; r++) {
      let count = 0;
      try { count = Number(await arena.matchCount(r)); }
      catch {
        if (r === roundNow) count = Number(await arena.currentRoundMatchCount().catch(() => 0n));
      }
      for (let i = 0; i < count; i++) {
        let tokenA = '0', tokenB = '0', winner = '0', loser = '0', verified = false, validator = ZERO;
        try {
          const m = await arena.getMatch(r, BigInt(i));
          tokenA = BigInt(m.tokenA ?? m[2] ?? 0n).toString();
          tokenB = BigInt(m.tokenB ?? m[3] ?? 0n).toString();
          winner = BigInt(m.winner ?? m[4] ?? 0n).toString();
          loser = BigInt(m.loser ?? m[5] ?? 0n).toString();
          verified = Boolean(m.verified ?? m[6]);
          validator = m.validator ?? m[7] ?? ZERO;
        } catch {
          // Current round fallback for contracts that expose matchTokens but do not
          // snapshot unverified matches until validation.
          if (r === roundNow) {
            try {
              const m = await arena.matchTokens(BigInt(i));
              tokenA = BigInt(m.tokenA ?? m[0] ?? 0n).toString();
              tokenB = BigInt(m.tokenB ?? m[1] ?? 0n).toString();
              verified = Boolean(m.verified ?? m[2]);
              winner = BigInt(m.winner ?? m[3] ?? 0n).toString();
            } catch {}
          }
        }
        if (tokenA === '0' || tokenB === '0') continue;
        out.push({ round: String(r), matchIndex: i, a: tokenA, b: tokenB, w: winner, loser, verified, validator, source: 'contract' });
      }
    }
    return out;
  }

  async function computeRoundSizesFromArena(arena, matches) {
    const out = computeRoundSizes(matches);
    try {
      const entrantCount = Number(await arena.entrantCount());
      if (entrantCount > 0) out.set('1', entrantCount);
    } catch {}
    for (const item of matches || []) {
      const r = String(item.round || '0');
      if (out.has(r)) continue;
      const count = (matches || []).filter((x) => String(x.round) === r).length;
      if (count) out.set(r, count * 2);
    }
    return out;
  }

  function computeRoundSizes(logs) {
    const map = new Map();
    for (const item of logs || []) {
      const r = String(item.round || '0');
      if (!map.has(r)) map.set(r, new Set());
      if (item.a && item.a !== '0') map.get(r).add(String(item.a));
      if (item.b && item.b !== '0') map.get(r).add(String(item.b));
      if (item.w && item.w !== '0') map.get(r).add(String(item.w));
    }
    const out = new Map();
    for (const [r, set] of map.entries()) out.set(r, set.size);
    return out;
  }

  async function loadArenaMatchLogs(providerObj, iface, arenaAddr, latestBlock) {
    const events = ['MatchVerified', 'MatchVerifiedByIndex'];
    let all = [];
    for (const evName of events) {
      let topic = '';
      try { topic = iface.getEvent(evName).topicHash; } catch { continue; }
      const scanBlocks = Number(C.eventScanBlocks || 200000);
      const fromBlock = latestBlock > scanBlocks ? latestBlock - scanBlocks : 0;
      let logs = [];
      try { logs = await providerObj.getLogs({ address: arenaAddr, fromBlock, toBlock: 'latest', topics: [topic] }); } catch {}
      if (!logs.length && fromBlock > 0) {
        try { logs = await providerObj.getLogs({ address: arenaAddr, fromBlock: 0, toBlock: 'latest', topics: [topic] }); } catch {}
      }
      for (const raw of logs) {
        try {
          const parsed = iface.parseLog(raw);
          if (parsed.name === 'MatchVerified') {
            all.push({ round: parsed.args.round.toString(), a: parsed.args.tokenA.toString(), b: parsed.args.tokenB.toString(), w: parsed.args.winner.toString(), blockNumber: raw.blockNumber, index: raw.index ?? raw.logIndex ?? 0 });
          } else if (parsed.name === 'MatchVerifiedByIndex') {
            all.push({ round: parsed.args.round.toString(), matchIndex: Number(parsed.args.matchIndex), a: parsed.args.winner.toString(), b: parsed.args.loser.toString(), w: parsed.args.winner.toString(), blockNumber: raw.blockNumber, index: raw.index ?? raw.logIndex ?? 0 });
          }
        } catch {}
      }
    }
    const seen = new Set();
    all = all.sort((x, y) => (x.blockNumber - y.blockNumber) || (x.index - y.index)).filter((x) => {
      const key = `${x.blockNumber}:${x.index}:${x.round}:${x.a}:${x.b}:${x.w}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return all;
  }

  function localReplaySummary(a, b, winner, previewOnly = false, myToken = '') {
    const sim = simulateLocalBattle(a, b);
    const chainWinner = BigInt(winner || 0n);
    const chainLine = chainWinner > 0n ? `${L('On-chain winner','链上胜者')} #${chainWinner}` : L('Pending validation; local preview only','待验证；仅本地预演');
    const agree = chainWinner > 0n ? (BigInt(sim.winner) === chainWinner ? L('Replay matches chain','复现与链上一致') : L('Chain result is authoritative','以链上结果为准')) : '';
    const cardMini = (c, side) => `<div class="replay-card-mini ${String(c.tokenId) === String(myToken) ? 'mine' : ''}">
      <span>${side}</span><b>#${c.tokenId}</b><strong>${nameAt(CLASS_NAMES, c.classId)} × ${nameAt(BEAST_NAMES, c.beast)}</strong>
      <small>ATK ${c.attack} · DEF ${c.defense} · HP ${c.hp} · SPD ${c.speed}</small>
    </div>`;
    return `<div class="local-replay rich-replay">
      <div class="replay-headline"><b>${L('Settlement replay','结算复现')}</b><span>${chainLine}${agree ? ' · ' + agree : ''}</span></div>
      <div class="replay-versus">${cardMini(a, L('Card A','卡片 A'))}<div class="vs-mark">VS</div>${cardMini(b, L('Card B','卡片 B'))}</div>
      <div class="replay-summary-grid">
        <span>${L('Local winner','本地胜者')}<b>#${sim.winner}</b></span>
        <span>${L('Battle rounds','战斗回合')}<b>${sim.rounds}</b></span>
        <span>${L('First mover','先手')}<b>#${sim.firstMover}</b></span>
        <span>${L('Damage model','伤害模型')}<b>${L('On-chain base formula','链上基础公式')}</b></span>
      </div>
      <ol class="replay-steps pretty-steps">${sim.log.map((line) => `<li>${line}</li>`).join('')}</ol>
    </div>`;
  }

  function simulateLocalBattle(cardA, cardB) {
    const a = replayState(cardA);
    const b = replayState(cardB);
    const logLines = [];
    const firstMover = replayFirst(a, b) ? a.tokenId : b.tokenId;
    let round = 0;
    for (round = 1; round <= MAX_REPLAY_ROUNDS; round++) {
      if (a.hp <= 0 || b.hp <= 0) break;
      const firstA = replayFirst(a, b);
      const turns = firstA ? [[a, b], [b, a]] : [[b, a], [a, b]];
      for (const [att, def] of turns) {
        if (att.hp <= 0 || def.hp <= 0) continue;
        const skill = replaySkillForRound(att.card, round);
        const sd = replaySkillData(skill);
        const mult = replayAdjustedMultiplier(att.card, def.card, sd.m);
        const dmg = baseDamage(att.attack, def.defense, mult);
        def.hp = Math.max(0, def.hp - dmg);
        logLines.push(`${L('Round','第')} ${round} · #${att.tokenId} ${nameAt(SKILL_NAMES, skill)} ${Math.round(mult / 100)}% → #${def.tokenId} ${dmg} dmg, HP ${def.hp}/${def.maxHp}`);
      }
      if (a.hp <= 0 || b.hp <= 0) break;
    }
    const winner = replayWinner(a, b);
    return { winner: winner.tokenId, firstMover, rounds: Math.min(round, MAX_REPLAY_ROUNDS), log: logLines.slice(0, 24) };
  }

  function replayState(card) { return { card, tokenId: Number(card.tokenId), attack: Number(card.attack), defense: Number(card.defense), speed: Number(card.speed), hp: Number(card.hp), maxHp: Number(card.hp) }; }
  function replaySkillForRound(card, round) { const k = (round - 1) & 3; return [card.attr, card.starter, card.beastSkill, card.finisher][k] || 0; }
  function replayFirst(a, b) {
    if (a.speed !== b.speed) return a.speed > b.speed;
    if (a.attack !== b.attack) return a.attack > b.attack;
    if (a.defense !== b.defense) return a.defense > b.defense;
    const at = Number(a.card.stakeTime || 0), bt = Number(b.card.stakeTime || 0);
    if (at !== bt) return at < bt;
    const as = Number(a.card.stakeId || 0), bs = Number(b.card.stakeId || 0);
    if (as !== bs) return as < bs;
    return a.tokenId < b.tokenId;
  }
  function replayAdjustedMultiplier(attCard, defCard, base) {
    let m = Number(base || BPS);
    if (Number(attCard.classId) === 0) m = Math.floor(m * 106 / 100);
    if (Number(attCard.classId) === 3) m = Math.floor(m * 101 / 100);
    if (Number(attCard.classId) === 5) m = Math.floor(m * 93 / 100);
    if (Number(attCard.classId) === 6) m = Math.floor(m * 88 / 100);
    if (Number(attCard.classId) === Number(attCard.beast)) m = Math.floor(m * 102 / 100);
    if (Number(attCard.classId) === 6 && Number(attCard.beast) === 6) m = Math.floor(m * 97 / 100);
    return Math.max(0, m);
  }
  function replayWinner(a, b) {
    if (a.hp <= 0 && b.hp > 0) return b;
    if (b.hp <= 0 && a.hp > 0) return a;
    if (a.hp !== b.hp) return a.hp > b.hp ? a : b;
    return replayFirst(a, b) ? a : b;
  }
  function baseDamage(atk, def, mult = BPS) {
    const x = Math.floor(Number(atk) * (4000 + Math.floor(720000 / (120 + Math.max(0, Number(def))))) * Number(mult) / BPS / BPS);
    return x === 0 && mult > 0 ? 1 : Math.max(0, x);
  }

  async function claimArenaReward(kind = 'all') {
    const active = await resolveActiveArena();
    if (!active) throw new Error(L('No arena address found.','未找到竞技场地址。'));
    if (!account) await connectWalletManaged();
    const arena = new (ethersLib().Contract)(active, ABI.arena, await getSigner());
    let tx;
    if (kind === 'battle') {
      const reward = await arena.pendingBattleRewards(account).catch(() => 0n);
      if (reward <= 0n) throw new Error(L('No pending battle reward to claim.','没有可领取的对战奖励。'));
      tx = await arena.claimBattleReward();
    } else if (kind === 'validator') {
      const reward = await arena.pendingValidatorRewards(account).catch(() => 0n);
      if (reward <= 0n) throw new Error(L('No pending validator reward to claim.','没有可领取的验证奖励。'));
      tx = await arena.claimValidatorReward();
    } else {
      const reward = await arena.pendingRewards(account).catch(() => 0n);
      if (reward <= 0n) throw new Error(L('No pending arena reward to claim.','没有可领取的竞技场奖励。'));
      tx = await arena.claimReward();
    }
    log(`Arena reward claim submitted: ${tx.hash}`);
    await tx.wait();
    log('Arena reward claimed.');
    await refreshArenaPage();
  }

  function bindLiveFixActions() {
    document.addEventListener('click', async (e) => {
      const disconnect = e.target.closest('#disconnectWallet');
      if (disconnect) {
        e.preventDefault(); e.stopImmediatePropagation();
        await disconnectWalletManaged().catch((err)=>log(friendlyTxError(err),'error'));
        return;
      }
      const wallet = e.target.closest('#connectWallet');
      if (wallet) {
        e.preventDefault(); e.stopImmediatePropagation();
        await connectWalletManaged().catch(()=>{});
        return;
      }
      const refreshMarket = e.target.closest('#refreshMarketListings');
      if (refreshMarket) { e.preventDefault(); await loadMarketListings().catch((err)=>log(friendlyTxError(err),'error')); return; }
      const buy = e.target.closest('[data-market-buy]');
      if (buy) {
        e.preventDefault(); const old = buy.textContent; buy.disabled = true;
        try { await buyMarketNft(buy.dataset.marketBuy); } catch (err) { log(friendlyTxError(err), 'error'); }
        finally { buy.disabled = false; buy.textContent = old; }
        return;
      }
      const refreshArena = e.target.closest('#refreshArenaLive,#refreshMyArenaCards');
      if (refreshArena) { e.preventDefault(); await refreshArenaPage().catch((err)=>log(friendlyTxError(err),'error')); return; }
      const openArena = e.target.closest('#openDailyArena');
      if (openArena) { e.preventDefault(); const old = openArena.textContent; openArena.disabled = true; openArena.textContent = L('Opening…','开启中…'); try { await openDailyArenaTx(); } catch (err) { openArenaPending = false; log(friendlyTxError(err), 'error'); } finally { openArena.textContent = old; await refreshArenaPage().catch(()=>{}); } return; }
      const indexedVerify = e.target.closest('[data-verify-match-index]');
      if (indexedVerify) { e.preventDefault(); const old = indexedVerify.textContent; indexedVerify.disabled = true; try { await verifyMatchTx(indexedVerify.dataset.verifyMatchIndex); } catch (err) { log(friendlyTxError(err), 'error'); } finally { indexedVerify.disabled = false; indexedVerify.textContent = old; } return; }
      const verifyMatch = e.target.closest('#verifyNextMatch');
      if (verifyMatch) { e.preventDefault(); const old = verifyMatch.textContent; verifyMatch.disabled = true; try { await verifyNextMatchTx(); } catch (err) { log(friendlyTxError(err), 'error'); } finally { verifyMatch.disabled = false; verifyMatch.textContent = old; } return; }
      const advanceRound = e.target.closest('#advanceNextRound');
      if (advanceRound) { e.preventDefault(); const old = advanceRound.textContent; advanceRound.disabled = true; try { await openOrRefreshNextRoundTx(); } catch (err) { log(friendlyTxError(err), 'error'); } finally { advanceRound.disabled = false; advanceRound.textContent = old; } return; }
      const claimBattle = e.target.closest('#claimBattleReward');
      if (claimBattle) {
        e.preventDefault(); const old = claimBattle.textContent; claimBattle.disabled = true;
        try { await claimArenaReward('battle'); } catch (err) { log(friendlyTxError(err), 'error'); }
        finally { claimBattle.disabled = false; claimBattle.textContent = old; }
        return;
      }
      const claimValidator = e.target.closest('#claimValidatorReward');
      if (claimValidator) {
        e.preventDefault(); const old = claimValidator.textContent; claimValidator.disabled = true;
        try { await claimArenaReward('validator'); } catch (err) { log(friendlyTxError(err), 'error'); }
        finally { claimValidator.disabled = false; claimValidator.textContent = old; }
        return;
      }
      const claim = e.target.closest('#claimArenaReward');
      if (claim) {
        e.preventDefault(); const old = claim.textContent; claim.disabled = true;
        try { await claimArenaReward(); } catch (err) { log(friendlyTxError(err), 'error'); }
        finally { claim.disabled = false; claim.textContent = old; }
      }
    }, true);
    waitForEthereum(6000).then((eth) => {
      if (!eth || eth.__goldhavenEventsBound) return;
      eth.__goldhavenEventsBound = true;
      eth.on?.('accountsChanged', (accounts) => {
        // Before the user has connected inside this site, MetaMask account
        // changes must not silently connect the page. After connection, keep the
        // session synced across tabs/pages until the user clicks Disconnect.
        if (localStorage.getItem(LS_CONNECTED) !== '1') {
          account = '';
          signer = undefined;
          updateWalletUI('');
          return;
        }
        account = accounts?.[0] || '';
        signer = undefined;
        if (!account) {
          // Some mobile wallets emit an empty accountsChanged event while
          // navigating between pages. Keep the explicit site session until the
          // user clicks Disconnect, and fall back to the cached account label.
          const cached = localStorage.getItem(LS_ACCOUNT) || '';
          updateWalletUI(cached);
        } else {
          localStorage.setItem(LS_ACCOUNT, account);
          updateWalletUI(account);
          window.GHV_DAPP?.restoreExistingSession?.().catch?.(()=>{});
        }
        if (page() === 'market') loadMarketListings().catch(()=>{});
        if (page() === 'arena') refreshArenaPage().catch(()=>{});
      });
      eth.on?.('chainChanged', () => window.location.reload());
    });
  }

  async function initLiveFixes() {
    bindLiveFixActions();
    await restoreWallet();
    startHomeNftShowcase();
    if (page() === 'market') await loadMarketListings().catch((e)=>log(e.message,'warn'));
    if (page() === 'arena') await refreshArenaPage().catch((e)=>log(e.message,'warn'));
    document.getElementById('langToggle')?.addEventListener('click', () => setTimeout(() => {
      updateWalletUI(account);
      if (page() === 'market') loadMarketListings().catch(()=>{});
      if (page() === 'arena') refreshArenaPage().catch(()=>{});
      if (page() === 'app' && window.GHV_DAPP?.refreshMyNfts) window.GHV_DAPP.refreshMyNfts().catch(()=>{});
    }, 0));
  }

  document.addEventListener('DOMContentLoaded', initLiveFixes);
  window.GHV_LIVE_FIXES = { connectWalletManaged, disconnectWalletManaged, loadMarketListings, refreshArenaPage, claimArenaReward, openDailyArenaTx, verifyNextMatchTx, verifyMatchTx, openOrRefreshNextRoundTx };
})();
