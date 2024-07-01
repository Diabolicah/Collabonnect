function updateThresholdProgressBar(progressBar, threshold) {
    const progress_color = threshold < 25 ? "#DC3545" : threshold < 50 ? "#FD7E14" : threshold < 75 ? "#FFC107" : "#20C997"
    progressBar.textContent = `${threshold}%`
    progressBar.style.width = `${threshold}%`;
    progressBar.style.backgroundColor = progress_color;
}

async function initObjectDetails(objectData){
    const {brandLogo, developerLogo} = await getCollaborationLogos(objectData);
    const writerProfileImage = await getCollaborationWriterProfileImage(objectData);
    const threshold = await getCollaborationThresholdPercentage(objectData);
    document.querySelector("#collaboration_title").textContent = objectData.title;
    document.querySelector(".breadcrumb-item.active").textContent = objectData.title;
    document.querySelector("#collaboration_status").textContent = `Status: ${objectData.status}`;
    document.querySelectorAll("#collaboration_upvotes_downvotes span")[0].textContent = objectData.upvote;
    document.querySelectorAll("#collaboration_upvotes_downvotes span")[1].textContent = objectData.downvote;
    document.querySelector(".circular_progress_bar span").textContent = objectData.ai_readability;
    updateCircularProgressBar(document.querySelector(".circular_progress_bar"), objectData.ai_readability, "#2E2C2C");
    document.querySelector("#collaboration_brand_logo").src = `${brandLogo}`;
    document.querySelector("#collaboration_developer_logo").src = `${developerLogo}`;
    updateThresholdProgressBar(document.querySelector("#container_object_details .progress .progress-bar"), threshold);
    document.querySelector("#collaboration_co_writers img").src = `${writerProfileImage}`;

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