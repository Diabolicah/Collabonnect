let user_id, domain;

(async () => {
    await fetch("./data/settings.json")
        .then((response) => response.json())
        .then(data => {
            user_id = data.user_id;
            domain = data.domain;
        });
})();

async function getCollaborationLogos(collaboration) {
    let brandLogo = '#', developerLogo = '#';
    await fetch(`${domain}/api/brand/${collaboration.brand_id}`)
        .then(response => {
            if(response.status == 200)
                return response.json();
            else return null;
        })
        .then(data => brandLogo = data.image_name);

    await fetch(`${domain}/api/developer/${collaboration.developer_id}`)
        .then(response => {
            if(response.status == 200)
                return response.json();
        })
        .then(data => developerLogo = data.image_name);

    console.log(developerLogo, brandLogo);

    return {brandLogo, developerLogo};
}

async function getCollaborationDetails(collaborationId) {
    const response = await fetch(`${domain}/api/collaboration/${collaborationId}`);
    if(response.status == 200)
        return await response.json();
    return null;
}