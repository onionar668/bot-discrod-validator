const { Client, GatewayIntentBits, Events } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers
    ]
});

const GAME_TO_CHANNEL = {
    "counter-strike 2": "1077641659568885880",  
    "dota 2": "1477202031331639306",
    "valorant": "1478808919571693629",
    "minecraft": "1068527110999789599",
    "PUBG": "1160809646823587882",
    "warface": "1090282605385093140",
    "7 days to die": "1075058882247929876",
    "ARK": "1389177483437412383",
    "Brawl": "1305099236559425577",
    "PEAK": "1428755268971528272",
    "GTA 5": "1429412145304703036",
};

const AFK_CHANNEL_ID = "1068527187977830500"; 
const ALLOWED_ROLES = ["Админ"];  

client.once(Events.ClientReady, () => {
    console.log(`✅ ${client.user.tag} онлайн! Следит за войсами.`);
});

async function checkAndMove(member) {
    if (!member || !member.voice.channelId) return;
    if (ALLOWED_ROLES.some(roleName => member.roles.cache.some(r => r.name === roleName))) return;

    const activities = member.presence?.activities;
    
    const gameActivity = activities?.find(a => a.type === 0 || a.type === 5);
    
    console.log(`[DEBUG] Проверяем ${member.displayName}`);
    console.log('Voice Channel:', member.voice.channel ? member.voice.channel.name : 'Нет войса');
    if (activities?.length > 0) {
        console.log('Activities:', JSON.stringify(activities, null, 2));
    } else {
        console.log('Activities: пусто или нет');
    }

    const currentGame = gameActivity?.name?.toLowerCase() || "none";
    
    console.log(`[DEBUG-DEEP] Юзер: ${member.displayName}`);
    console.log(`[DEBUG-DEEP] Текущий канал ID: ${member.voice.channelId}`);
    console.log(`[DEBUG-DEEP] Игра (сырая): ${gameActivity?.name || "не найдена"}`);
    console.log(`[DEBUG-DEEP] currentGame после toLowerCase: "${currentGame}"`);
    console.log(`[DEBUG-DEEP] GAME_TO_CHANNEL ключи: ${Object.keys(GAME_TO_CHANNEL).join(", ")}`);

    const correctChannelId = GAME_TO_CHANNEL[currentGame];
    
    console.log(`[DEBUG-DEEP] correctChannelId: ${correctChannelId || "не найден"}`);
    console.log(`[DEBUG-DEEP] Сравнение: ${member.voice.channelId} !== ${correctChannelId} → ${member.voice.channelId !== correctChannelId}`);

    if (correctChannelId && member.voice.channelId !== correctChannelId) {
        try {
            await member.voice.setChannel(correctChannelId);
            console.log(` Перекинул ${member.displayName} (${currentGame}) в ${correctChannelId}`);
            member.send(` Перекинул тебя в канал под ${currentGame}!`).catch(() => {});
        } catch (err) {
            console.error(`Ошибка с ${member.displayName}:`, err.message);
        }
    } else if (correctChannelId) {
        console.log(`[OK] ${member.displayName} уже в правильном канале для ${currentGame}`);
    } else {
        console.log(`[WARN] Игра "${currentGame}" не найдена в настройках`);
    }
}

client.on('voiceStateUpdate', (oldState, newState) => checkAndMove(newState.member));
client.on('presenceUpdate', (oldPresence, newPresence) => checkAndMove(newPresence.member));

client.login(process.env.DISCORD_TOKEN);