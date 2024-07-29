async function getCollaborationLogos(collaboration) {
    const BrandData = await Data.brands();
    const DeveloperData = await Data.developers();
    return {"brandLogo": BrandData[collaboration.brandId].image, "developerLogo": DeveloperData[collaboration.developerId].image};
}

async function getCollaborationDetails(collaborationId) {
    const domain = await Settings.domain();
    const response = await fetch(`${domain}/api/collaboration/${collaborationId}`);
    if(response.status == 200)
        return await response.json();
    return null;
}

async function getCollaborationThresholdPercentage(collaboration) {
    const brandData = await Data.brands();
    let threshold = brandData[collaboration.brandId].threshold;
    if(threshold == 0)
        return 0;
    return Math.floor(((collaboration.upvote - collaboration.downvote) / threshold) * 100);
}

async function getCollaborationWriterProfileImage(collaboration){
    const domain = await Settings.domain();
    let writerProfileImage = '#';
    await fetch(`${domain}/api/user/${collaboration.writerId}`)
        .then(response => {
            if(response.status == 200)
                return response.json();
        })
        .then(data => writerProfileImage = `${domain}/assets/profileImages/${data.profileImage}`);

    return writerProfileImage;
}

async function getCollaborationCoWritersProfileImages(collaboration){
    const domain = await Settings.domain();
    let coWriters = null;
    await fetch(`${domain}/api/collaboration/${collaboration.id}/coWritersImages`)
        .then(response => {
            if(response.status == 200)
                return response.json();
        })
        .then(data => {
            data.forEach(element => {
                element.profileImage = `${domain}/assets/profileImages/${element.profileImage}`;
            });
            coWriters = data;
        });

    return coWriters;
}

async function getCollaborationEditLogs(collaboration){
    const domain = await Settings.domain();
    let editLogs = null;
    await fetch(`${domain}/api/collaboration/${collaboration.id}/logs`)
        .then(response => {
            if(response.status == 200)
                return response.json();
        })
        .then(data => {
            data.forEach(element => {
                const date = new Date(element.date);
                element.date = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getFullYear()}`;
            })
            editLogs = data;
        })

    return editLogs;
}

async function getCollaborationParagraphs(collaboration) {
    const domain = await Settings.domain();
    let paragraphs = null;
    await fetch(`${domain}/api/collaboration/${collaboration.id}/paragraphs`)
        .then(response => {
            if(response.status == 200)
                return response.json();
        })
        .then(data => {
            paragraphs = data;
        })

    return paragraphs;
}

async function getCollaborationsList() {
    const domain = await Settings.domain();
    const response = await fetch(`${domain}/api/collaboration`);
    if(response.status == 200)
        return await response.json();
    return null;
}

async function deleteCollaboration(collaborationId) {
    const domain = await Settings.domain();
    const response = await fetch(`${domain}/api/collaboration/${collaborationId}`, {
        method: 'DELETE'
    });
    if(response.status == 200)
        return true;
    return false;
}

async function approveCollaboration(collaborationId) {
    const domain = await Settings.domain();
    const response = await fetch(`${domain}/api/collaboration/${collaborationId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"status": "Approved"})
    });
    if(response.status == 200)
        return true;
    return false;
}

async function rejectCollaboration(collaborationId) {
    const domain = await Settings.domain();
    const response = await fetch(`${domain}/api/collaboration/${collaborationId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"status": "Rejected"})
    });
    if(response.status == 200)
        return true;
    return false;
}

async function approveCollaborationParagraph(collaborationId, paragraphId, paragraph) {
    const domain = await Settings.domain();
    const response = await fetch(`${domain}/api/collaboration/${collaborationId}/paragraphs/${paragraphId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(paragraph)
    });
    if(response.status == 200)
        return true;
    return false;
}

async function deleteCollaborationParagraph(collaborationId, paragraphId){
    const domain = await Settings.domain();
    const response = await fetch(`${domain}/api/collaboration/${collaborationId}/paragraphs/${paragraphId}`, {
        method: 'DELETE'
    });
    if(response.status == 200)
        return true;
    return false;
}

async function addCollaborationParagraph(){
    
}