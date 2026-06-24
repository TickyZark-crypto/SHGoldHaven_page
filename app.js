const SOCIAL_LINKS = (window.GOLDHAVEN_CONFIG && window.GOLDHAVEN_CONFIG.socials) || {
  twitter: 'https://x.com/SHGoldhaven',
  telegram: 'https://t.me/+EacmH8gM5DgyNzE9'
};
const WALLET_CONNECTED_KEY = 'goldhavenWalletConnected';
const WALLET_ACCOUNT_KEY = 'goldhavenWalletAccount';

const LIVE_CONFIG = window.GOLDHAVEN_CONFIG || {};
const LIVE_ADDRESSES = LIVE_CONFIG.addresses || {};
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const isLiveAddress = (key) => /^0x[a-fA-F0-9]{40}$/.test((LIVE_ADDRESSES[key] || '').trim()) && (LIVE_ADDRESSES[key] || '').trim() !== ZERO_ADDRESS;
const liveCoreReady = ['ghvToken', 'goldhavenNFT', 'goldhavenVault', 'ghvHook', 'priceOracle', 'poolManager', 'uniswapV4Router'].every(isLiveAddress);
function livePlaceholder(title, text, actionHtml = '') {
  return `<article class="empty-state"><h3>${title}</h3><p>${text}</p>${actionHtml}</article>`;
}

const i18n = {
  en: {
    navHome:'Home', navMintStake:'Mint & Stake', navArena:'Arena', navMarket:'NFT Market', navTester:'Skill Guide', connectWallet:'Connect Wallet', disconnectWallet:'Disconnect',

    homeProtocolEyebrow:'PROTOCOL MAP / 协议结构',
    assetEyebrow:'LIVE MINT / TRADE / STAKE / NFTS', assetTitle:'Goldhaven live asset console.', assetLead:'Manage Hook buy/sell, Goldhaven Token staking, dividend claiming, and NFT arena/market actions from the configured live contracts.', assetTradeTitle:'1. Buy / Sell Goldhaven', assetHookRouter:'Hook + Router', assetMyGoldhaven:'My Goldhaven', assetCurveVault:'Curve ETH vault', assetArenaVault:'Arena ETH vault', assetMaxSupply:'Max supply', assetCurrentMinted:'Current minted', assetMintPrice:'Mint price', assetBurnPrice:'Burn price', assetWallet:'Wallet', assetBuyMint:'Buy / Mint', assetEthAmount:'ETH amount', assetEstimatedGhv:'Estimated GHV', assetArenaTax:'2% arena tax', assetToCurve:'98% to curve', assetNftThreshold:'NFT threshold', assetMinGhvOut:'Minimum GHV out', assetQuote:'Quote', assetSellBurn:'Sell / Burn', assetGhvAmount:'GHV amount', assetEstimatedEth:'Estimated ETH', assetRawEth:'Raw ETH unlocked', assetCooldownAllowance:'Cooldown / allowance', assetMinEthOut:'Minimum ETH out', assetApprove:'Approve', assetStakeTitle:'2. Goldhaven Token Staking', assetMyStaked:'My staked', assetMyAvg24h:'My 24h average', assetTotalStaked:'Total staked', assetValidatorRight:'Validator right', assetPendingDividend:'Pending dividend', assetEpochsToClaim:'Epochs to claim', assetStake:'Stake', assetWalletToVault:'Wallet GHV → Vault', assetStakeAmount:'Stake amount', assetStakeUnstake:'Stake / Unstake', assetWalletVaultBoth:'Wallet ⇄ Vault', assetDividendClaimTitle:'Dividend Claim', assetDividendClaimHint:'Stake rewards', assetDividendClaimDesc:'Claimable epochs are scanned from the Vault and refreshed after every claim.', assetUnstakeClaim:'Unstake & Claim', assetVaultToWallet:'Vault → Wallet', assetUnstakeAmount:'Unstake amount', assetUnstake:'Unstake', assetClaimDividend:'Claim Dividend', assetNftTitle:'3. My NFT Management', assetNftHint:'NFT images are loaded directly from the class × beast image URI. Free NFTs can be sent, burned, listed or put into the arena. Arena NFTs show only Unlock. Listed NFTs show only Cancel Listing.', assetScanLimit:'Scan limit', assetRefreshNfts:'Refresh My NFTs', txLog:'Transaction Log', liveFooter:'Goldhaven on-chain interface for trading, staking, NFT management, arena entry and rewards.',
    marketLiveEyebrow:'LIVE NFT MARKET / 在售 NFT', marketLiveTitle:'Goldhaven NFT listings.', marketLiveLead:'Only live listed NFTs are shown here. Images are loaded directly from each NFT imageURI. Buyers can approve GHV and purchase from the listing card.', marketListedNfts:'Listed NFTs', marketMarketplace:'Marketplace', marketScanLatest:'Scan latest token IDs', marketRefreshListings:'Refresh Listings', marketStatusInitial:'Connect wallet to buy. Listings can still be viewed without connecting.', marketLoadingTitle:'Loading listings…', marketLoadingText:'The page will scan marketplace.listings(tokenId) over the latest token range.', marketFooter:'Goldhaven on-chain interface for NFT listings, purchases and arena rewards.',
    arenaLiveEyebrow:'LIVE ARENA / 竞技场', arenaLiveTitle:'My arena cards, battle progress, and rewards.', arenaLiveLead:'View the cards you put into the arena, their attributes and images, the current round state, your battle history, and your claimable arena reward after settlement.', arenaHookVault:'Hook arena vault', arenaTodayFunding:'Next arena reward', arenaActiveArena:'Active arena', arenaMyPendingReward:'My pending reward', arenaMyBattleReward:'Battle reward', arenaMyValidatorReward:'Validator reward', arenaContractBalance:'Current arena reward balance', arenaClaimBattleReward:'Claim Battle Reward', arenaClaimValidatorReward:'Claim Validator Reward', arenaProgress:'Arena progress', arenaRound:'Round', arenaRemaining:'Current round remaining', arenaStatusLabel:'Status', arenaChampionLabel:'Champion / Top 32', arenaRefresh:'Refresh Arena', arenaClaimMyReward:'Claim My Reward', arenaPutUnlock:'Put / Unlock NFTs', arenaStatusInitial:'Connect wallet to show only your staked cards. Public arena progress can be viewed without connecting if an active arena exists.', arenaMyCards:'My arena cards', arenaVaultTag:'Vault', arenaFallbackScan:'Fallback scan limit', arenaRefreshCards:'Refresh My Cards', arenaConnectTitle:'Connect wallet', arenaConnectText:'Connect to view the NFT cards you have locked into the arena vault.', arenaHistoryTitle:'My battle process / history', arenaEventsTag:'Matches', arenaNoHistoryTitle:'No history loaded', arenaNoHistoryText:'Your arena matches will appear after an active or latest finished arena is found.', arenaSurvivorsTitle:'Current survivors / Top 32', arenaRoundTag:'Round', arenaNoRoundTitle:'No active round', arenaNoRoundText:'Current round queue is shown while running. After finish, top 32 card IDs and owners are shown here.', arenaRoundVerifyProgress:'Round verification', arenaValidatorPanelTitle:'Validator operations', arenaIsValidator:'Validator right', arenaMyVerifyCount:'My verifications', arenaVerifyReady:'Verify button', arenaNextRoundReady:'Next round', arenaOpenDaily:'Open Daily Arena', arenaVerifyNext:'Verify Next Match', arenaOpenNextRound:'Open / Refresh Next Round', arenaValidatorHint:'Validators can open the arena, verify specific current-round matches concurrently, and claim validator rewards separately after settlement.',

    heroEyebrow:'UNISWAP V4 HOOK · TOKEN STAKING · ON-CHAIN BATTLE RPG', heroTitle:'An ink-born protocol where Hook trades summon NFTs and daily arena rewards settle by code.', heroLead:'Goldhaven links a curve-launched token, class-and-beast NFTs, a token staking vault, and an on-chain elimination arena into one game economy.', ctaMintStake:'Mint / Stake', ctaArena:'View Arena', ctaMarket:'Browse Market', trustSupply:'21M max supply', trustTax:'2% trade tax to arena vault', homeShowcaseTag:'NFT Gallery', homeShowcaseCaption:'Random class × beast artwork from the live IPFS image set.',
    routeAppTitle:'Mint, My NFTs & Token Staking', routeAppText:'Buy through the Hook, preview NFT stats, manage owned NFTs, stake GHV token, and claim staking dividends.', routeArenaTitle:'Daily Arena', routeArenaText:'View vault funding, bracket status, validator flow, locked NFTs, rank rewards and claim positions.', routeMarketTitle:'NFT Marketplace', routeMarketText:'List eligible NFTs, cancel listings, buy with Goldhaven Token, and route purchased NFTs back to arena use.',
    mapTitle:'The product is split into three player surfaces.', mapText:'Home explains the system. Mint & Stake handles user assets and token vault actions. Arena handles battle entry, vault information and rewards. Market handles NFT listings and purchases.', flowHook:'98% to curve reserve, 2% to arena vault', flowNft:'Minted above 50U, class × beast image mapping reserved', flowVault:'GHV token staking powers dividends and validator rights', flowArena:'NFT locks fight daily; empty rank rewards roll over', objectsTitle:'Seven classes, seven beasts, one chain-resolved battle engine.',
    appPageTitle:'Mint NFTs, manage your collection, and stake Goldhaven Token in one place.', appPageLead:'NFT locking is only for arena entry. Token staking controls 20% arena dividends, validator eligibility and the defense bonus used during NFT mint.', mintTitle:'Hook Mint', buyAmount:'Buy amount / USDT', avgStake:'24h token vault average / USDT', drawPreview:'Preview NFT Mint', mintHint:'On-chain mint will read Hook trade value and seed. This preview only mirrors the stat formula.', tokenStakeTitle:'Token Staking Vault', stakedGhv:'My staked GHV', avg24h:'My 24h avg', claimableDiv:'Claimable dividend', validatorRights:'Validator rights', active:'Active', stakeAmount:'Stake GHV amount', stakeToken:'Stake Token', unstakeToken:'Unstake', claimDividends:'Claim Dividends', stakeHint:'Dividend shares are based on token-seconds over the last 24h. Validator rewards are claimed on the Arena page.', myNftsTitle:'NFT actions depend on status.', myNftsText:'A free NFT can either be listed on the market or locked for arena. Listed NFTs cannot enter the arena; locked NFTs cannot be listed or transferred until unlocked.', stateFree:'Free', stateFreeText:'Can list on market or lock for arena', stateListed:'Listed', stateListedText:'Can cancel listing, cannot arena-lock', stateLocked:'Arena Locked', stateLockedText:'Can claim rank reward after settlement, then unlock', listMarket:'List on Market', lockArena:'Lock for Arena', cancelListing:'Cancel Listing', claimReward:'Claim Reward', unlockNft:'Unlock NFT', buyListed:'Buy',
    arenaPageTitle:'Track the daily vault, enter NFTs, validate battles, and claim rank rewards.', arenaPageLead:'The arena opens during UTC 12:00–12:10. It can run with fewer than 32 NFTs; unoccupied rank slots roll back to the Hook arena vault for future days.', hookVault:'Hook arena vault', todayFunding:'Today funding 70%', lockedNfts:'Locked NFTs', nextWindow:'Open window', arenaActionsTitle:'My Arena Positions', settled:'Settled', lockMoreNfts:'Lock more NFTs', claimAllArena:'Claim all rewards', arenaClaimHint:'Rank rewards attach to the NFT owner/stake position. After settlement, claim reward first, then unlock NFT.', validatorPanel:'Validator Panel', validatedRounds:'Validated rounds', validatorClaim:'Claimable validator reward', submitRound:'Submit next round', claimValidator:'Claim validator reward', validatorHint:'The first open of the day counts as two validations. Each next-round submission counts once.', bracketTitle:'Under-32 brackets still settle normally.', bracketText:'Bye priority: highest attack + defense, then earlier stake time, then smaller stakeId. Empty reward slots remain unclaimed and roll back.', rewardClaimTitle:'Claim points are separated by reward type.', claimTokenTitle:'Token staking dividend', claimTokenText:'Claim on Mint & Stake page from the Token Vault epoch.', goStakePage:'Go to Stake Page', claimValidatorTitle:'Validator rewards', claimValidatorText:'Claim here by validator address after arena settlement.', claimRankTitle:'NFT rank rewards', claimRankText:'Claim from the NFT position card, then unlock the NFT.', champion:'Champion', semifinal:'Semifinalist', round16:'Round of 16', pending:'Pending',
    marketPageTitle:'List free NFTs, buy with GHV, and keep arena locks separate from listings.', marketPageLead:'The marketplace should prevent double-use: listed NFTs cannot be locked into the arena, and arena-locked NFTs cannot be listed or transferred until unlocked.', searchPlaceholder:'Search class, beast, token ID', filterAll:'All listings', listNft:'List My NFT', marketListingsTitle:'Live Listings', listingFlowTitle:'Listing Flow', listingStep1:'Pick an NFT with status Free.', listingStep2:'Approve marketplace if needed.', listingStep3:'Set price in Goldhaven Token.', listingStep4:'After listing, arena-lock button becomes disabled until canceled.', listingStep5:'Buyer pays GHV and receives NFT; seller receives GHV.', eligibleTitle:'My eligible NFTs', listedBy:'Listed by', price:'Price',
    footerText:'Goldhaven on-chain protocol interface for Hook trading, NFT staking, daily arena battles and community rewards.'
  },
  zh: {
    navHome:'首页', navMintStake:'铸造与质押', navArena:'竞技场', navMarket:'NFT 市场', navTester:'技能说明', connectWallet:'连接钱包', disconnectWallet:'断开连接',

    homeProtocolEyebrow:'协议结构 / PROTOCOL MAP',
    assetEyebrow:'实时铸造 / 交易 / 质押 / NFT', assetTitle:'Goldhaven 实时资产控制台。', assetLead:'在一个实时资产控制台中管理 Hook 买卖、Goldhaven Token 质押、分红领取和 Goldhaven NFT。', assetTradeTitle:'1. 买入 / 卖出 Goldhaven', assetHookRouter:'Hook + 路由', assetMyGoldhaven:'我的 Goldhaven 持仓', assetCurveVault:'曲线 ETH 金库', assetArenaVault:'竞技场 ETH 金库', assetMaxSupply:'总供应上限', assetCurrentMinted:'当前已铸造', assetMintPrice:'Mint 价格', assetBurnPrice:'Burn 价格', assetWallet:'钱包', assetBuyMint:'买入 / 铸造', assetEthAmount:'ETH 数量', assetEstimatedGhv:'预计获得 GHV', assetArenaTax:'2% 竞技场税', assetToCurve:'98% 进入曲线', assetNftThreshold:'NFT 铸造门槛', assetMinGhvOut:'最低 GHV 到账', assetQuote:'报价', assetSellBurn:'卖出 / 销毁', assetGhvAmount:'GHV 数量', assetEstimatedEth:'预计获得 ETH', assetRawEth:'解锁原始 ETH', assetCooldownAllowance:'冷却 / 授权', assetMinEthOut:'最低 ETH 到账', assetApprove:'授权', assetStakeTitle:'2. Goldhaven Token 质押', assetMyStaked:'我的质押数量', assetMyAvg24h:'我的 24h 平均质押', assetTotalStaked:'总质押数量', assetValidatorRight:'验证权限', assetPendingDividend:'待领取分红', assetEpochsToClaim:'可领取 Epoch', assetStake:'质押', assetWalletToVault:'钱包 GHV → 金库', assetStakeAmount:'质押数量', assetStakeUnstake:'质押 / 取出', assetWalletVaultBoth:'钱包 ⇄ 金库', assetDividendClaimTitle:'领取分红', assetDividendClaimHint:'质押收益', assetDividendClaimDesc:'可领取 Epoch 会从 Vault 扫描，并在每次领取后刷新。', assetUnstakeClaim:'取出与领取', assetVaultToWallet:'金库 → 钱包', assetUnstakeAmount:'取出数量', assetUnstake:'取出', assetClaimDividend:'领取分红', assetNftTitle:'3. 我的 NFT 管理', assetNftHint:'NFT 图片直接读取职业 × 神兽 imageURI。空闲 NFT 可发送、销毁、上架或投放竞技场；竞技场 NFT 只显示解锁；已上架 NFT 只显示下架。', assetScanLimit:'扫描范围', assetRefreshNfts:'刷新我的 NFT', txLog:'交易日志', liveFooter:'Goldhaven 链上资产控制台，支持交易、质押、NFT 管理、竞技场报名与奖励领取。',
    marketLiveEyebrow:'在售 NFT / LIVE NFT MARKET', marketLiveTitle:'Goldhaven NFT 在售列表。', marketLiveLead:'这里只展示链上在售 NFT。图片直接读取每个 NFT 的 imageURI；买家可以在卡片上授权 GHV 并购买。', marketListedNfts:'在售 NFT', marketMarketplace:'市场合约', marketScanLatest:'扫描最近 token ID', marketRefreshListings:'刷新挂单', marketStatusInitial:'连接钱包后可购买；未连接也可以查看挂单。', marketLoadingTitle:'正在加载挂单…', marketLoadingText:'页面会扫描最近 token 范围内的 marketplace.listings(tokenId)。', marketFooter:'Goldhaven 链上 NFT 市场界面，支持挂单、购买与竞技场奖励查看。',
    arenaLiveEyebrow:'竞技场 / LIVE ARENA', arenaLiveTitle:'我的参赛卡、战斗进度和奖励。', arenaLiveLead:'查看你投放到竞技场的卡片、属性和图片，当前轮状态、战斗历史，以及结算后可领取的竞技场奖励。', arenaHookVault:'Hook 竞技场金库', arenaTodayFunding:'下一场奖励', arenaActiveArena:'当前竞技场', arenaMyPendingReward:'我的待领奖励', arenaMyBattleReward:'对战奖励', arenaMyValidatorReward:'验证奖励', arenaContractBalance:'本场奖励余额', arenaClaimBattleReward:'领取对战奖励', arenaClaimValidatorReward:'领取验证奖励', arenaProgress:'竞技场进度', arenaRound:'轮次', arenaRemaining:'当前轮剩余人数', arenaStatusLabel:'状态', arenaChampionLabel:'冠军 / 前32强', arenaRefresh:'刷新竞技场', arenaClaimMyReward:'领取我的奖励', arenaPutUnlock:'投放 / 解锁 NFT', arenaStatusInitial:'连接钱包后只显示你的质押卡；如果有当前竞技场，未连接也可以查看公共进度。', arenaMyCards:'我的竞技场卡片', arenaVaultTag:'金库', arenaFallbackScan:'备用扫描范围', arenaRefreshCards:'刷新我的卡片', arenaConnectTitle:'连接钱包', arenaConnectText:'连接后查看你锁入竞技场金库的 NFT 卡片。', arenaHistoryTitle:'我的战斗过程 / 历史', arenaEventsTag:'比赛', arenaNoHistoryTitle:'暂无历史', arenaNoHistoryText:'找到正在进行或最新结束的竞技场后，你的对战会显示在这里。', arenaSurvivorsTitle:'当前存活者 / 前32强', arenaRoundTag:'轮次', arenaNoRoundTitle:'暂无当前轮', arenaNoRoundText:'进行中显示当前轮队列；结束后显示前32强卡片 ID 和 owner 地址。', arenaRoundVerifyProgress:'本轮验证进度', arenaValidatorPanelTitle:'验证者操作', arenaIsValidator:'验证权限', arenaMyVerifyCount:'我的验证数量', arenaVerifyReady:'验证按钮', arenaNextRoundReady:'下一轮', arenaOpenDaily:'开启今日竞技场', arenaVerifyNext:'验证下一场', arenaOpenNextRound:'开启 / 刷新下一轮', arenaValidatorHint:'验证者可以开启竞技场，并发验证当前轮的不同比赛，结算后单独领取验证奖励。',

    heroEyebrow:'UNISWAP V4 HOOK · TOKEN 质押 · 全链上战斗 RPG', heroTitle:'水墨山海风的链上协议：Hook 交易召唤 NFT，每日竞技场用代码结算奖励。', heroLead:'Goldhaven 将曲线发射 Token、职业神兽 NFT、Token 质押金库和全链上淘汰赛竞技场连成一个游戏经济体。', ctaMintStake:'铸造 / 质押', ctaArena:'查看竞技场', ctaMarket:'浏览市场', trustSupply:'2100 万枚上限', trustTax:'2% 交易税进竞技场金库', homeShowcaseTag:'NFT 画廊', homeShowcaseCaption:'从当前 IPFS 图片集中随机播放职业 × 神兽 NFT 图片。',
    routeAppTitle:'铸造、我的 NFT 与 Token 质押', routeAppText:'通过 Hook 买入，预览 NFT 属性，管理我的 NFT，质押 GHV Token 并领取质押分红。', routeArenaTitle:'每日竞技场', routeArenaText:'查看金库金额、赛程状态、验证流程、锁仓 NFT、排名奖励和领取位置。', routeMarketTitle:'NFT 市场', routeMarketText:'上架可用 NFT、取消上架、用 Goldhaven Token 购买，并把买到的 NFT 重新用于竞技场。',
    mapTitle:'产品拆成三个用户操作面。', mapText:'首页解释整体系统；铸造与质押页处理用户资产和 Token 金库；竞技场页处理报名、金库和奖励；市场页处理 NFT 上架和购买。', flowHook:'98% 进入曲线储备，2% 进入竞技场金库', flowNft:'50U 以上铸造 NFT，预留职业 × 神兽图片映射', flowVault:'GHV Token 质押决定分红和验证权', flowArena:'NFT 锁仓参赛，空缺名次奖励回流', objectsTitle:'七个职业、七个神兽，一个链上战斗引擎。',
    appPageTitle:'在一个页面完成 NFT 铸造、我的 NFT 管理和 Goldhaven Token 质押。', appPageLead:'NFT 锁仓只用于竞技场参赛。Token 质押负责 20% 竞技场分红、验证者资格以及 NFT mint 时的防御额外加成。', mintTitle:'Hook 铸造', buyAmount:'买入金额 / USDT', avgStake:'Token 金库 24h 均值 / USDT', drawPreview:'预览 NFT 铸造', mintHint:'链上 mint 会读取 Hook 交易金额和 seed；这里仅复刻属性公式做预览。', tokenStakeTitle:'Token 质押金库', stakedGhv:'我的 GHV 质押', avg24h:'我的 24h 均值', claimableDiv:'可领取分红', validatorRights:'验证者权限', active:'已激活', stakeAmount:'质押 GHV 数量', stakeToken:'质押 Token', unstakeToken:'解除质押', claimDividends:'领取分红', stakeHint:'分红按过去 24h token-seconds 计算。验证者奖励在竞技场页领取。', myNftsTitle:'NFT 操作取决于当前状态。', myNftsText:'空闲 NFT 可以选择上架市场或锁仓参赛。已上架 NFT 不能参赛；已锁仓 NFT 不能上架或转移，直到解锁。', stateFree:'空闲', stateFreeText:'可以上架市场或锁仓参赛', stateListed:'已上架', stateListedText:'可以取消上架，不能锁仓参赛', stateLocked:'竞技场锁仓', stateLockedText:'结算后先领取排名奖励，再解锁 NFT', listMarket:'上架市场', lockArena:'锁仓参赛', cancelListing:'取消上架', claimReward:'领取奖励', unlockNft:'解锁 NFT', buyListed:'购买',
    arenaPageTitle:'查看每日金库、NFT 入场、验证战斗和领取排名奖励。', arenaPageLead:'竞技场在 UTC 12:00–12:10 开启。少于 32 个 NFT 也可正常结算；空缺名次奖励回流 Hook 竞技场金库，之后继续使用。', hookVault:'Hook 竞技场金库', todayFunding:'今日 70% 注入', lockedNfts:'锁仓 NFT', nextWindow:'开启窗口', arenaActionsTitle:'我的竞技场位置', settled:'已结算', lockMoreNfts:'锁仓更多 NFT', claimAllArena:'领取全部奖励', arenaClaimHint:'排名奖励绑定 NFT 所有者/质押位置。结算后先领取奖励，再解锁 NFT。', validatorPanel:'验证者面板', validatedRounds:'已验证轮次', validatorClaim:'可领取验证奖励', submitRound:'提交下一轮', claimValidator:'领取验证奖励', validatorHint:'当日首次开启算 2 次验证；每次发起下一轮算 1 次。', bracketTitle:'少于 32 人也正常跑淘汰赛。', bracketText:'轮空优先级：攻击+防御高者、质押时间早者、stakeId 小者。空缺奖励不发放并回流。', rewardClaimTitle:'不同奖励有不同领取位置。', claimTokenTitle:'Token 质押分红', claimTokenText:'在铸造与质押页从 Token 金库 epoch 领取。', goStakePage:'前往质押页', claimValidatorTitle:'验证者奖励', claimValidatorText:'竞技场结算后按验证者地址在这里领取。', claimRankTitle:'NFT 排名奖励', claimRankText:'从 NFT 位置卡片领取，然后解锁 NFT。', champion:'冠军', semifinal:'四强', round16:'16 强', pending:'待定',
    marketPageTitle:'上架空闲 NFT，用 GHV 购买，并将市场与竞技场锁仓隔离。', marketPageLead:'市场必须防止重复使用：已上架 NFT 不能锁仓参赛，已锁仓 NFT 在解锁前不能上架或转移。', searchPlaceholder:'搜索职业、神兽、Token ID', filterAll:'全部上架', listNft:'上架我的 NFT', marketListingsTitle:'当前上架', listingFlowTitle:'上架流程', listingStep1:'选择状态为空闲的 NFT。', listingStep2:'如有需要，授权市场合约。', listingStep3:'用 Goldhaven Token 设置价格。', listingStep4:'上架后锁仓参赛按钮禁用，直到取消上架。', listingStep5:'买家支付 GHV 并收到 NFT；卖家收到 GHV。', eligibleTitle:'我可上架的 NFT', listedBy:'上架者', price:'价格',
    footerText:'Goldhaven 链上协议界面，连接 Hook 交易、NFT 质押、每日竞技场与社区奖励。'
  }
};

const classes = [
  {en:'Warlord', zh:'战将', e:'Earth', ezh:'地', beast:'Huanglong', beastZh:'黄龙', atk:50, def:42, spd:152, hp:112, mark:'枪'},
  {en:'Shadowblade', zh:'影刃', e:'Wind', ezh:'风', beast:'Baize', beastZh:'白泽', atk:56, def:19, spd:600, hp:62, mark:'刃'},
  {en:'Fangshi', zh:'方士', e:'Water', ezh:'水', beast:'Xuanwu', beastZh:'玄武', atk:21, def:52, spd:292, hp:162, mark:'符'},
  {en:'Mountainwarden', zh:'镇岳', e:'Fire', ezh:'火', beast:'Zhuque', beastZh:'朱雀', atk:18, def:86, spd:25, hp:235, mark:'岳'},
  {en:'Divine Archer', zh:'神射', e:'Light', ezh:'光', beast:'Baihu', beastZh:'白虎', atk:76, def:0, spd:330, hp:-10, mark:'弓'},
  {en:'Soulbinder', zh:'御魂', e:'Dark', ezh:'暗', beast:'Nine-Tail', beastZh:'九尾', atk:51, def:35, spd:304, hp:100, mark:'魂'},
  {en:'Phantom', zh:'幻影', e:'Chaos', ezh:'混沌', beast:'Dijiang', beastZh:'帝江', atk:32, def:30, spd:345, hp:86, mark:'幻'}
];
const beasts = ['黄龙','白泽','玄武','朱雀','白虎','九尾','帝江'];
const attrSkills = { 地:['地脉','山骨','厚土','岩镇'], 风:['流云','疾行','风切','回身'], 水:['寒潮','潮生','水镜','迟水'], 火:['赤焰甲','朱火','燎原','火羽'], 光:['神辉','破晓','明镜','裁光'], 暗:['蚀魂','暗蚀','夜行','魂饮'], 混沌:['错相','归墟','无序','裂隙'] };
const starters = {战将:['定影枪','龙压阵','破军踏'],影刃:['背袭','破阵刃','断息'],方士:['玄武阵','缚岳阵','迟水符'],镇岳:['朱雀盾反','镇天壁','赤羽守'],神射:['贯日矢','白虎穿云','破咒箭'],御魂:['九尾咒印','摄魂幡','锁魂灯'],幻影:['无面步','虚实界','断序印']};
const finishers = {战将:['万岳贯枪','黄龙崩阵','山河定杀'],影刃:['绝影杀','双刃追魂','白泽裂隙'],方士:['北海封界','真武归流','水镜镇符'],镇岳:['朱雀镇岳','天火反戈','不灭火羽'],神射:['落星矢','白虎裁决','连珠终矢'],御魂:['三魂咒爆','万鬼归幡','断魄'],幻影:['万象归空','断相裁','归影']};
const fates = ['贪狼','玄甲','疾星','长生','破军','孤星','血战','镇魂','灵慧'];

const demoNfts = [];
const marketItems = [];

let lang = localStorage.getItem('goldhavenLang') || 'en';
const page = document.body?.dataset.page || 'home';
const t = key => (i18n[lang] && i18n[lang][key]) || i18n.en[key] || key;
const pick = a => a[Math.floor(Math.random()*a.length)];
const r = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
function drawClass(){ return Math.random() < .04 ? classes[6] : pick(classes.slice(0,6)); }
function drawBeast(){ return Math.random() < .04 ? '帝江' : pick(beasts.slice(0,6)); }
function makeCard(buy, stake){ const c=drawClass(), b=drawBeast(); return {c,b,atk:120+r(0,20)+Math.floor(Math.sqrt(Math.max(0,buy)))+c.atk,def:10+r(0,5)+Math.floor(Math.sqrt(Math.max(0,stake)))+c.def,spd:300+r(0,80)+c.spd,hp:500+r(0,60)+c.hp,attr:pick(attrSkills[c.ezh]),start:pick(starters[c.zh]),finish:pick(finishers[c.zh]),fate:pick(fates)}; }
function displayName(c){ return lang==='en' ? `${c.en} · ${c.zh}` : `${c.zh} · ${c.en}`; }
function comboName(c,b){ return lang==='en' ? `${c.en} · ${beastEn(b)}` : `${c.zh} · ${b}`; }
function beastEn(b){ return ({黄龙:'Huanglong',白泽:'Baize',玄武:'Xuanwu',朱雀:'Zhuque',白虎:'Baihu',九尾:'Nine-Tail',帝江:'Dijiang'})[b] || b; }
function statusLabel(s){ if(lang==='zh') return {free:'空闲',listed:'已上架',locked:'竞技场锁仓'}[s]; return {free:'Free',listed:'Listed',locked:'Arena Locked'}[s]; }
function nftCard(nft, mode='assets'){
  const locked = nft.status==='locked', listed = nft.status==='listed', free = nft.status==='free';
  const actions = mode==='market' ? `<button class="btn primary">${t('buyListed')}</button>` : `
    <button class="btn line ${!free?'disabled':''}" ${!free?'disabled':''}>${t('listMarket')}</button>
    <button class="btn ghost ${!free?'disabled':''}" ${!free?'disabled':''}>${t('lockArena')}</button>
    ${listed?`<button class="btn line">${t('cancelListing')}</button>`:''}
    ${locked?`<button class="btn primary">${t('claimReward')}</button><button class="btn line">${t('unlockNft')}</button>`:''}`;
  const price = nft.price ? `<p><b>${t('price')}:</b> ${nft.price}</p>` : '';
  return `<article class="nft-tile"><div class="tile-head"><span class="tag">#${nft.id}</span><span class="status-dot ${free?'good':''}">${statusLabel(nft.status||'free')}</span></div><div class="nft-art">${nft.cls.mark}</div><h3>${comboName(nft.cls,nft.beast)}</h3><p>${nft.skills.join('｜')}</p>${price}<div class="tile-actions">${actions}</div></article>`;
}
function marketCard(item){ return `<article class="market-card"><div class="tile-head"><span class="tag">#${item.id}</span><span class="status-dot">${item.price}</span></div><div class="market-thumb">${item.cls.mark}</div><h3>${comboName(item.cls,item.beast)}</h3><p>${item.skills.join('｜')}</p><div class="price"><span>${t('listedBy')}</span><b>${item.seller}</b></div><div class="tile-actions"><button class="btn primary">${t('buyListed')}</button><a class="btn line" href="app.html">${t('navMintStake')}</a></div></article>`; }
function renderClassBoard(){ const el=document.getElementById('classBoard'); if(!el)return; el.innerHTML=classes.map(c=>`<article class="class-card reveal in"><header><h3>${displayName(c)}</h3><span class="tag">${lang==='en'?c.beast:c.beastZh}</span></header><p>${lang==='en'?`${c.e} / ${c.ezh}`:`${c.ezh} / ${c.e}`} · ${lang==='en'?traitText(c.zh):traitTextZh(c.zh)}</p><div class="mini-stats"><span>ATK<b>${c.atk>=0?'+':''}${c.atk}</b></span><span>DEF<b>${c.def>=0?'+':''}${c.def}</b></span><span>SPD<b>${c.spd>=0?'+':''}${c.spd}</b></span><span>HP<b>${c.hp>=0?'+':''}${c.hp}</b></span></div></article>`).join(''); }
function traitTextZh(cls){ return ({战将:'枪阵压制',影刃:'高速刺杀',方士:'减速控制',镇岳:'护盾盾反',神射:'爆发裁决',御魂:'咒印续航',幻影:'错位断序'})[cls]; }
function traitText(cls){ return ({战将:'spear pressure',影刃:'speed assassination',方士:'slow control',镇岳:'shield counter',神射:'burst judgment',御魂:'curse sustain',幻影:'sequence break'})[cls]; }
function renderPreview(card){ const el=document.getElementById('previewCard'); if(!el)return; const best=card.c.beastZh===card.b; el.innerHTML=`<div class="card-top"><span>${best?(lang==='en'?'Best Pair':'最佳适配'):(lang==='en'?'Random Pair':'随机组合')}</span><span>Preview</span></div><div class="sigil">${card.c.mark}</div><h3>${comboName(card.c,card.b)}<small>${card.attr}｜${card.start}｜${card.finish}｜${card.fate}</small></h3><div class="stat-grid"><div><small>ATK</small><b>${card.atk}</b></div><div><small>DEF</small><b>${card.def}</b></div><div><small>SPD</small><b>${card.spd}</b></div><div><small>HP</small><b>${card.hp}</b></div></div>`; }
function renderMyNfts(){
  const el=document.getElementById('myNftGrid'); if(!el || el.dataset.liveManaged==='1')return;
  if(liveCoreReady){
    el.innerHTML = livePlaceholder(
      lang==='en'?'Live NFT read mode':'链上 NFT 读取模式',
      lang==='en'?'Demo NFT cards have been removed. Connect your wallet, enter a token ID in the NFT Arena Lock panel above, then click Read NFT to load owner, stakeId, card attributes and imageURI from the deployed NFT/Vault contracts.':'测试 NFT 卡片已移除。连接钱包后，在上方 NFT Arena Lock 面板输入 tokenId，点击 Read NFT，即可从已部署 NFT/Vault 合约读取 owner、stakeId、卡牌属性和 imageURI。',
      '<button class="btn line" type="button" data-contract-action="readNft">Read NFT by token ID</button>'
    );
  } else {
    el.innerHTML = livePlaceholder(lang==='en'?'Contract config incomplete':'合约配置未完整', lang==='en'?'Fill the core contract addresses before reading NFTs.':'请先补齐核心合约地址后再读取 NFT。');
  }
}
function renderArenaPositions(){
  const el=document.getElementById('arenaPositions'); if(!el)return;
  if(isLiveAddress('activeArena') || isLiveAddress('arenaFactory')){
    el.innerHTML = livePlaceholder(
      lang==='en'?'Live arena mode':'链上竞技场模式',
      lang==='en'?'Demo arena positions have been removed. Use the active arena panel and your NFT stakeId to claim/unlock after settlement.':'测试竞技场位置已移除。结算后请通过 active arena 面板和你的 NFT stakeId 领取/解锁。',
      '<a class="btn line" href="app.html">Manage NFT stakeId</a>'
    );
  } else {
    el.innerHTML = livePlaceholder(
      lang==='en'?'Arena contracts not configured yet':'竞技场合约暂未配置',
      lang==='en'?'arenaFactory and activeArena are empty, so live arena position cards are disabled.':'arenaFactory 和 activeArena 仍为空，因此暂不显示链上竞技场位置。'
    );
  }
}
function renderBracket(){ const el=document.getElementById('bracketGrid'); if(!el)return; const rounds=[['Round 32','24 NFTs + 8 byes'],['Round 16','16 NFTs'],['Quarterfinal','8 NFTs'],['Final','Champion settled']]; el.innerHTML=rounds.map((r,i)=>`<div class="bracket-round"><h3>${r[0]}</h3><div class="battle-row">${r[1]}</div><div class="battle-row">${i<3?'Validator submitted':'Rewards distributed'}</div><div class="battle-row">${i===0?'Empty slots roll over':'On-chain battle engine'}</div></div>`).join(''); }
function renderMarket(){
  const el=document.getElementById('marketGrid');
  if(el){
    if(isLiveAddress('nftMarketplace')){
      el.innerHTML = livePlaceholder(
        lang==='en'?'Live marketplace read mode':'链上市场读取模式',
        lang==='en'?'Demo listings have been removed. Use the Listing Controls panel to read a tokenId listing directly from the marketplace contract.':'测试市场挂单已移除。请使用 Listing Controls 面板按 tokenId 直接读取市场合约挂单。',
        '<button class="btn line" type="button" data-contract-action="readListing">Read Listing</button>'
      );
    } else {
      el.innerHTML = livePlaceholder(
        lang==='en'?'Marketplace not deployed/configured':'市场合约暂未部署/配置',
        lang==='en'?'nftMarketplace is empty in config/contracts.js. Listing, cancel and buy actions are disabled until that address is added.':'config/contracts.js 中 nftMarketplace 仍为空。填写市场合约地址后，才可上架、下架和购买。'
      );
    }
  }
  const eligible=document.getElementById('eligibleListings');
  if(eligible){
    eligible.innerHTML = livePlaceholder(
      lang==='en'?'Use tokenId-based live controls':'使用 tokenId 链上操作',
      lang==='en'?'The frontend no longer shows sample owned NFTs. Enter your tokenId above, approve the marketplace after deployment, then list it.':'前端不再显示测试 NFT。请输入你的 tokenId；市场合约部署后，先授权再上架。'
    );
  }
}
function applyI18n(){ document.documentElement.lang=lang==='en'?'en':'zh-CN'; document.documentElement.dataset.lang=lang; document.querySelectorAll('[data-i18n]').forEach(el=>{ el.textContent=t(el.dataset.i18n); }); document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{ el.placeholder=t(el.dataset.i18nPlaceholder); }); const toggle=document.getElementById('langToggle'); if(toggle) toggle.textContent=lang==='en'?'中文':'EN'; renderClassBoard(); renderMyNfts(); renderArenaPositions(); renderBracket(); renderMarket(); if(page==='app' && document.getElementById('buyUsd')) renderPreview(makeCard(Number(document.getElementById('buyUsd')?.value||900),Number(document.getElementById('avgStakeUsd')?.value||900))); }
function setupSocialLinks(){ ['twitterLink','footerTwitter','homeTwitter'].forEach(id=>{const a=document.getElementById(id); if(a)a.href=SOCIAL_LINKS.twitter;}); ['telegramLink','footerTelegram','homeTelegram'].forEach(id=>{const a=document.getElementById(id); if(a)a.href=SOCIAL_LINKS.telegram;}); }
function setupReveal(){ const els=[...document.querySelectorAll('.reveal')]; if(!('IntersectionObserver' in window)){ els.forEach(e=>e.classList.add('in')); return; } const io=new IntersectionObserver(entries=>entries.forEach(e=>{ if(e.isIntersecting)e.target.classList.add('in'); }),{threshold:.1}); els.forEach(e=>io.observe(e)); }
function setupNav(){ document.querySelectorAll(`[data-nav="${page==='app'?'app':page}"]`).forEach(a=>a.classList.add('active')); const toggle=document.getElementById('menuToggle'), links=document.getElementById('navLinks'); toggle?.addEventListener('click',()=>links?.classList.toggle('open')); links?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>links.classList.remove('open'))); }
function shortAddr(a){ return a ? a.slice(0,6)+'…'+a.slice(-4) : ''; }
function ensureDisconnectButton(){
  const btn=document.getElementById('connectWallet');
  if(!btn) return;
  const wrap=btn.parentElement || document.body;
  if(!wrap.querySelector('#disconnectWallet')){
    const d=document.createElement('button');
    d.className='wallet wallet-disconnect';
    d.id='disconnectWallet';
    d.type='button';
    d.dataset.i18n='disconnectWallet';
    d.textContent=t('disconnectWallet');
    d.style.display='none';
    btn.insertAdjacentElement('afterend',d);
  }
}
function updateSimpleWalletUI(addr){
  ensureDisconnectButton();
  const btn=document.getElementById('connectWallet');
  if(btn){ btn.textContent=addr?shortAddr(addr):t('connectWallet'); btn.classList.toggle('connected',!!addr); }
  const d=document.getElementById('disconnectWallet');
  if(d){ d.textContent=t('disconnectWallet'); d.style.display=addr?'':'none'; }
}
function waitForEthereum(timeout=6000){
  if(window.ethereum) return Promise.resolve(window.ethereum);
  return new Promise(resolve=>{
    let done=false;
    const finish=()=>{ if(done) return; done=true; window.removeEventListener('ethereum#initialized', finish); resolve(window.ethereum||null); };
    window.addEventListener('ethereum#initialized', finish, { once:true });
    const start=Date.now();
    const timer=setInterval(()=>{ if(window.ethereum || Date.now()-start>=timeout){ clearInterval(timer); finish(); } }, 150);
  });
}
async function readWalletAccountsWithRetry(){
  const eth=await waitForEthereum();
  if(!eth) return [];
  for(let i=0;i<8;i++){
    try{
      const accounts=await eth.request({method:'eth_accounts'});
      if(accounts && accounts[0]) return accounts;
      if(eth.selectedAddress) return [eth.selectedAddress];
    }catch{}
    await new Promise(r=>setTimeout(r,250));
  }
  return [];
}
async function connectWallet(){
  const btn=document.getElementById('connectWallet');
  if(!btn)return;
  const eth=await waitForEthereum(8000);
  if(!eth){btn.textContent=lang==='en'?'No Wallet Found':'未检测到钱包';return;}
  try{
    const accounts=await eth.request({method:'eth_requestAccounts'});
    const a=accounts[0]||eth.selectedAddress||'';
    if(a){ localStorage.setItem(WALLET_CONNECTED_KEY,'1'); localStorage.setItem(WALLET_ACCOUNT_KEY,a); updateSimpleWalletUI(a); }
  }catch(e){btn.textContent=lang==='en'?'Connection Failed':'连接失败';}
}
function disconnectWallet(){
  localStorage.removeItem(WALLET_CONNECTED_KEY);
  localStorage.removeItem(WALLET_ACCOUNT_KEY);
  updateSimpleWalletUI('');
}
async function restoreSimpleWallet(){
  ensureDisconnectButton();
  if(localStorage.getItem(WALLET_CONNECTED_KEY)!=='1'){ updateSimpleWalletUI(''); return; }
  const cached=localStorage.getItem(WALLET_ACCOUNT_KEY)||'';
  if(cached) updateSimpleWalletUI(cached);
  try{
    const accounts=await readWalletAccountsWithRetry();
    const a=accounts[0]||cached;
    if(a){ localStorage.setItem(WALLET_ACCOUNT_KEY,a); updateSimpleWalletUI(a); }
  }
  catch{ if(cached) updateSimpleWalletUI(cached); }
}
function init(){ setupSocialLinks(); setupNav(); setupReveal(); ensureDisconnectButton(); applyI18n(); restoreSimpleWallet(); document.getElementById('langToggle')?.addEventListener('click',()=>{ lang=lang==='en'?'zh':'en'; localStorage.setItem('goldhavenLang',lang); applyI18n(); restoreSimpleWallet(); }); document.getElementById('connectWallet')?.addEventListener('click',connectWallet); document.getElementById('disconnectWallet')?.addEventListener('click',disconnectWallet); document.getElementById('drawPreview')?.addEventListener('click',()=>renderPreview(makeCard(Number(document.getElementById('buyUsd')?.value||0),Number(document.getElementById('avgStakeUsd')?.value||0)))); }
document.addEventListener('DOMContentLoaded',init);
