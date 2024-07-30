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

async function getCollaborationsData() {
    Data.isCollaborationProcessing = true;
    const domain = await Settings.domain();
    const collaborations = await fetch(`${domain}/api/collaborations/`).then((response) => response.json());
    Data._collaborations = collaborations;
    Data.isCollaborationReady = true;
    return Data;
}

async function findDeveloperIdByName(developerName) {
    const developers = await Data.developers();
    for (let developerId in developers) {
        if (developers[developerId].name === developerName) {
            return developerId;
        }
    }
    return null;
}

async function findBrandIdByName(brandName) {
    const brands = await Data.brands();
    for (let brandId in brands) {
        if (brands[brandId].name === brandName) {
            return brandId;
        }
    }
    return null;
}

async function getBrandImage(brandName) {
    let imagePath = "./images/image_placeholder.svg";
    const brandId = await findBrandIdByName(brandName);
    if (brandId) {
        imagePath = Data._brands[brandId].image;
    }
    else
    {
        const searchResult = await fetch(`https://api.brandfetch.io/v2/search/${brandName}`).then((response) => response.json());
        if (searchResult.length > 0) {
            imagePath = searchResult[0].icon;
        }
    }
    return imagePath;
}

async function getDeveloperImage(developerName) {
    let imagePath = "./images/image_placeholder.svg";
    const developerId = await findDeveloperIdByName(developerName);
    if (developerId) {
        imagePath = Data._developers[developerId].image;
    }
    else
    {
        const searchResult = await fetch(`https://api.brandfetch.io/v2/search/${developerName}`).then((response) => response.json());
        if (searchResult.length > 0) {
            imagePath = searchResult[0].icon;
        }
    }
    return imagePath;
}