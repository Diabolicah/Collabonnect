function updateThresholdProgressBar(progressBar, threshold) {
    const progress_color = threshold < 25 ? "#DC3545" : threshold < 50 ? "#FD7E14" : threshold < 75 ? "#FFC107" : "#20C997"
    progressBar.textContent = `${threshold}%`
    progressBar.style.width = `${threshold}%`;
    progressBar.style.backgroundColor = progress_color;
}

function populateCollaborationCoWriters(coWriters) {
    const containerCoWriters = document.querySelector("#collaboration_co_writers");

    coWriters.forEach(element => {
        const imgCoWriter = document.createElement("img");
        imgCoWriter.src = element.profile_image;
        imgCoWriter.alt = "user_image";
        containerCoWriters.appendChild(imgCoWriter);
    });
}

async function createCollaborationLog(editLog) {
    const sectionLog = document.createElement("section");
    const spanDate = document.createElement("span");
    spanDate.textContent = editLog.date;
    sectionLog.appendChild(spanDate)
    fetch(`${domain}/api/user/${editLog.user_id}`)
        .then(response => {
            if(response.status == 200)
                return response.json();
        })
        .then(data => {
            const imgUser = document.createElement("img");
            imgUser.src = `${domain}/assets/profile_images/${data.profile_image}`;
            imgUser.alt = "user_image";
            spanDate.before(imgUser);
        })
    return sectionLog;
}

function populateCollaborationEditLogs(editLogs) {
    const containerEditLogs = document.querySelector("#edit_logs");

    editLogs.forEach(element => {
        createCollaborationLog(element)
        .then(result => containerEditLogs.querySelector("hr").after(result));
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

    getCollaborationCoWritersProfileImages(objectData)
        .then(populateCollaborationCoWriters);
    
        getCollaborationEditLogs(objectData)
        .then(populateCollaborationEditLogs);
    // console.log(await getCollaborationEditLogs(objectData));

}

async function getObjectDetailsFromServer(){
    const urlParams = new URLSearchParams(window.location.search);
    const collaborationId = urlParams.get("id");
    const collaboration = await getCollaborationDetails(collaborationId);
    if(collaboration)
        initObjectDetails(collaboration);
    else document.location.replace("./index.html");
}

function addListeners(){
    document.querySelector("#collaboration_edit_delete img").addEventListener("click", () => {
        const urlParams = new URLSearchParams(window.location.search);
        const collaborationId = urlParams.get("id");
        const title = document.querySelector("#collaboration_title").textContent;
        const deleteModal = new bootstrap.Modal('#deleteCollaborationModal', {})
        deleteModal.show();
        document.querySelector("#deleteCollaborationModal .modal-body").textContent = `Are you sure you want to delete\n ${title} collaboration`;
        const deleteCollaborationFunc = async () => {
            await deleteCollaboration(collaborationId);
            document.location.replace("./index.html");
        }
        document.getElementById("deleteCollaborationButton").addEventListener("click", deleteCollaborationFunc);

        deleteModal._element.addEventListener("hide.bs.modal", () => {
            document.getElementById("deleteCollaborationButton").removeEventListener("click", deleteCollaborationFunc);
        });
    });
}

window.onload = async () => {
    getObjectDetailsFromServer();
    addListeners();
}