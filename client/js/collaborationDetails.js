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
    const brandPromise = fetch(`${domain}/api/brand/${collaboration.brand_id}`)
        .then(response => {
            if(response.status == 200)
                return response.json();
            else return null;
        })
        .then(data => brandLogo = `${domain}/assets/brand_images/${data.image_name}`);

    const developerPromise = fetch(`${domain}/api/developer/${collaboration.developer_id}`)
        .then(response => {
            if(response.status == 200)
                return response.json();
        })
        .then(data => developerLogo = `${domain}/assets/developer_images/${data.image_name}`);

    return await Promise.all([brandPromise, developerPromise]).then(values => {
        return {"brandLogo": values[0], "developerLogo": values[1]};
    });
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

async function getCollaborationWriterProfileImage(collaboration){
    let writerProfileImage = '#';
    await fetch(`${domain}/api/user/${collaboration.writer_id}`)
        .then(response => {
            if(response.status == 200)
                return response.json();
        })
        .then(data => writerProfileImage = `${domain}/assets/profile_images/${data.profile_image}`);

    return writerProfileImage;
}

async function getCollaborationCoWritersProfileImages(collaboration){
    let co_writers = null;
    await fetch(`${domain}/api/collaboration/${collaboration.id}/co_writers_images`)
        .then(response => {
            if(response.status == 200)
                return response.json();
        })
        .then(data => {
            data.forEach(element => {
                element.profile_image = `${domain}/assets/profile_images/${element.profile_image}`;
            });
            co_writers = data;
        });

    return co_writers;
}