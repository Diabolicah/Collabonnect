async function getCollaborationLogos(collaboration) {
    const BrandData = await Data.brands();
    const DeveloperData = await Data.developers();
    return {"brandLogo": BrandData[collaboration.brandId].image, "developerLogo": DeveloperData[collaboration.developerId].image};
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
    await fetch(`${domain}/api/users/${collaboration.writerId}`)
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
    await fetch(`${domain}/api/collaborations/${collaboration.id}/coWritersImages`)
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
    await fetch(`${domain}/api/collaborations/${collaboration.id}/logs`)
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
    await fetch(`${domain}/api/collaborations/${collaboration.id}/paragraphs`)
        .then(response => {
            if(response.status == 200)
                return response.json();
        })
        .then(data => {
            paragraphs = data;
        })

    return paragraphs;
}

async function deleteCollaboration(collaborationId) {
    const domain = await Settings.domain();
    const response = await fetch(`${domain}/api/collaborations/${collaborationId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({userAccessToken: await getUserAccessToken()})
    });
    if(response.status == 200)
        return true;
    return false;
}

async function updateCollaborationVotes(collaborationId, voteType, vote) {
    const domain = await Settings.domain();
    const response = await fetch(`${domain}/api/collaborations/${collaborationId}/${voteType}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"amount": vote, "userAccessToken": await getUserAccessToken()})
    });
    if(response.status == 200)
        return true;
    return false;
}

async function approveCollaboration(collaborationId) {
    const domain = await Settings.domain();
    const response = await fetch(`${domain}/api/collaborations/${collaborationId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"status": "Approved", "userAccessToken": await getUserAccessToken()})
    });
    if(response.status == 200)
        return true;
    return false;
}

async function rejectCollaboration(collaborationId) {
    const domain = await Settings.domain();
    const response = await fetch(`${domain}/api/collaborations/${collaborationId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"status": "Rejected", "userAccessToken": await getUserAccessToken()})
    });
    if(response.status == 200)
        return true;
    return false;
}

async function updateCollaborationParagraphs(collaborationId, paragraphs) {
    paragraphs.userAccessToken = await getUserAccessToken();
    const domain = await Settings.domain();
    const response = await fetch(`${domain}/api/collaborations/${collaborationId}/paragraphs`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(paragraphs),
    });
    if(response.status == 200)
        return true;
    return false;
}

async function approveCollaborationParagraph(collaborationId, paragraphId, paragraph) {
    paragraph.userAccessToken = await getUserAccessToken();
    const domain = await Settings.domain();
    const response = await fetch(`${domain}/api/collaborations/${collaborationId}/paragraphs/${paragraphId}`, {
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
    const response = await fetch(`${domain}/api/collaborations/${collaborationId}/paragraphs/${paragraphId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({userAccessToken: await getUserAccessToken()})
    });
    if(response.status == 200)
        return true;
    return false;
}

async function addCollaborationParagraph(collaborationId, paragraphDetails){
    paragraphDetails.userAccessToken = await getUserAccessToken();
    const domain = await Settings.domain();
    const response = await fetch(`${domain}/api/collaborations/${collaborationId}/paragraphs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(paragraphDetails)
    });
    if(response.status == 201){
        const res = await response.json();
        return res.paragraph[0];
    }
    return null;
}