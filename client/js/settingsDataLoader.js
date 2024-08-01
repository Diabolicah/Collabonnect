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

Settings.domain = async () => {
    if (!Settings.isReady) {
        await getSettingsData();
    }
    return Settings._domain
}