function updateThresholdProgressBar(progressBar, threshold) {
    const progress_color = threshold < 25 ? "#DC3545" : threshold < 50 ? "#FD7E14" : threshold < 75 ? "#FFC107" : "#20C997"
    progressBar.textContent = `${threshold}%`
    progressBar.style.width = `${threshold}%`;
    progressBar.style.backgroundColor = progress_color;
}

function populateCollaborationCoWriters(coWriters) {
    const containerCoWriters =  document.querySelector("#collaboration_co_writers");

    coWriters.forEach(element => {
        const img = document.createElement("img");
        img.src = element.profile_image;
        img.alt = "co_writer_image";
        containerCoWriters.appendChild(img);
    });
}

async function initObjectDetails(objectData){
    getCollaborationLogos(objectData)
        .then(({brandLogo, developerLogo}) => {
            document.querySelector("#collaboration_brand_logo").src = `${brandLogo}`;
            document.querySelector("#collaboration_developer_logo").src = `${developerLogo}`;
        });
    getCollaborationWriterProfileImage(objectData)
        .then(writerProfileImage => document.querySelector("#collaboration_co_writers img").src = `${writerProfileImage}`);
    getCollaborationThresholdPercentage(objectData)
        .then(threshold => updateThresholdProgressBar(document.querySelector("#container_object_details .progress .progress-bar"), threshold));

    document.querySelector("#collaboration_title").textContent = objectData.title;
    document.querySelector(".breadcrumb-item.active").textContent = objectData.title;
    document.querySelector("#collaboration_status").textContent = `Status: ${objectData.status}`;
    document.querySelectorAll("#collaboration_upvotes_downvotes span")[0].textContent = objectData.upvote;
    document.querySelectorAll("#collaboration_upvotes_downvotes span")[1].textContent = objectData.downvote;
    document.querySelector(".circular_progress_bar span").textContent = objectData.ai_readability;
    updateCircularProgressBar(document.querySelector(".circular_progress_bar"), objectData.ai_readability, "#2E2C2C");

    populateCollaborationCoWriters(await getCollaborationCoWritersProfileImages(objectData));

}

async function getObjectDetailsFromServer(){
    const urlParams = new URLSearchParams(window.location.search);
    const collaborationId = urlParams.get("id");
    const collaboration = await getCollaborationDetails(collaborationId);
    if(collaboration)
        initObjectDetails(collaboration);
    else document.location.replace("./index.html");
}

window.onload = async () => {
    getObjectDetailsFromServer();
}