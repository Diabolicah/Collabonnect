let Data = {
    "isBrandReady" : false,
    "isBrandProcessing" : false,
    "isDeveloperReady" : false,
    "isDeveloperProcessing" : false,
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

async function getBrandsData() {
    Data.isBrandProcessing = true;
    const domain = await Settings.domain();
    const brands = await fetch(`${domain}/api/brands/`).then((response) => response.json());
    for (let brand of brands) {
        brand.image = `${domain}/assets/brandImages/${brand.imagePath}`;
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
        developer.image = `${domain}/assets/developerImages/${developer.imagePath}`;
    }
    Data._developers = developers.reduce((acc, developer) => {
        acc[developer.id] = developer;
        return acc;
    }, {});
    Data.isDeveloperReady = true;
    return Data;
}