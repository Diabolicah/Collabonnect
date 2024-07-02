let Settings = {
    "isReady" : false,
};

async function getSettingsData() {
    const settings = await fetch("./data/settings.json").then((response) => response.json());
    for (const key in settings) {
        Settings[`_${key}`] = settings[key];
    }
    Settings.isReady = true;
    return Settings;
}

Settings.domain = async function() {
    if (!Settings.isReady) {
        await getSettingsData();
    }
    return Settings._domain
}

Settings.user_id = async function() {
    if (!Settings.isReady) {
        await getSettingsData();
    }
    return Settings._user_id
}