let Data = {
    "isBrandReady" : false,
    "isBrandProcessing" : false,
    "isDeveloperReady" : false,
    "isDeveloperProcessing" : false,
};

//Add prototype where if trying to access data before it is ready, it will fetch the data
Data.brands = async function() {
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

Data.developers = async function() {
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
    const brands = await fetch(`${domain}/api/brand/`).then((response) => response.json());
    for (let brand of brands) {
        brand.image = `${domain}/assets/brand_images/${brand.image_name}`;
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
    const developers = await fetch(`${domain}/api/developer/`).then((response) => response.json());
    for (let developer of developers) {
        developer.image = `${domain}/assets/developer_images/${developer.image_name}`;
    }
    Data._developers = developers.reduce((acc, developer) => {
        acc[developer.id] = developer;
        return acc;
    }, {});
    Data.isDeveloperReady = true;
    return Data;
}