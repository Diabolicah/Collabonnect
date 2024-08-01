let Data = {
    "isBrandReady" : false,
    "isBrandProcessing" : false,
    "isDeveloperReady" : false,
    "isDeveloperProcessing" : false,
    "isCollaborationReady" : false,
    "isCollaborationProcessing" : false,
};

Data.brands = async () => {
    if (!Data.isBrandReady) {
        if (!Data.isBrandProcessing) {
            await getBrandsData();
        }
        else {
            while (!Data.isBrandReady) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    }
    return Data._brands;
}

Data.developers = async () => {
    if (!Data.isDeveloperReady) {
        if (!Data.isDeveloperProcessing) {
            await getDevelopersData();
        }
        else {
            while (!Data.isDeveloperReady) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    }
    return Data._developers;
}

Data.collaborations = async () => {
    if (!Data.isCollaborationReady) {
        if (!Data.isCollaborationProcessing) {
            await getCollaborationsData();
        }
        else {
            while (!Data.isCollaborationReady) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    }
    return Data._collaborations;
}

async function getBrandsData() {
    Data.isBrandProcessing = true;
    const domain = await Settings.domain();
    const brands = await fetch(`${domain}/api/brands/`).then((response) => response.json());
    for (let brand of brands) {
        if (!brand.imagePath.startsWith("http"))
            brand.image = `${domain}/assets/brandImages/${brand.imagePath}`;
        else
            brand.image = brand.imagePath;
    }
    Data._brands = brands.reduce((acc, brand) => {
        acc[brand.id] = brand;
        return acc;
    }, {});
    Data.isBrandReady = true;
    return Data;
}

async function getDevelopersData() {
    Data.isDeveloperProcessing = true;
    const domain = await Settings.domain();
    const developers = await fetch(`${domain}/api/developers/`).then((response) => response.json());
    for (let developer of developers) {
        if (!developer.imagePath.startsWith("http"))
            developer.image = `${domain}/assets/developerImages/${developer.imagePath}`;
        else
            developer.image = developer.imagePath;
    }
    Data._developers = developers.reduce((acc, developer) => {
        acc[developer.id] = developer;
        return acc;
    }, {});
    Data.isDeveloperReady = true;
    return Data;
}

async function getCollaborationsData() {
    Data.isCollaborationProcessing = true;
    const domain = await Settings.domain();
    const collaborations = await fetch(`${domain}/api/collaborations/`).then((response) => response.json());
    Data._collaborations = collaborations.reduce((acc, collaboration) => {
        acc[collaboration.id] = collaboration;
        return acc;
    }, {});
    Data.isCollaborationReady = true;
    return Data;
}