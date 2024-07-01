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
        .then(data => brandLogo = `${domain}/assets/brand_images/${data.image_name}`);

    await fetch(`${domain}/api/developer/${collaboration.developer_id}`)
        .then(response => {
            if(response.status == 200)
                return response.json();
        })
        .then(data => developerLogo = `${domain}/assets/developer_images/${data.image_name}`);

    return {brandLogo, developerLogo};
}

async function getCollaborationDetails(collaborationId) {
    const response = await fetch(`${domain}/api/collaboration/${collaborationId}`);
    if(response.status == 200)
        return await response.json();
    return null;
}

async function getCollaborationThresholdPercentage(collaboration) {
    let threshold = 0;
    await fetch(`${domain}/api/brand/${collaboration.brand_id}`)
        .then(response => {
            if(response.status == 200)
                return response.json();
        })
        .then(data => threshold = data.threshold);

    if(threshold == 0)
        return 0;

    return Math.floor(((collaboration.upvote - collaboration.downvote) / threshold) * 100);
}