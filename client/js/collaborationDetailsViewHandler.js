function updateThresholdProgressBar(progressBar, threshold) {
    const progressColor = threshold < 25 ? "#DC3545" : threshold < 50 ? "#FD7E14" : threshold < 75 ? "#FFC107" : "#20C997"
    progressBar.textContent = `${threshold}%`
    progressBar.style.width = `${threshold}%`;
    progressBar.style.backgroundColor = progressColor;
}

function populateCollaborationCoWriters(coWriters) {
    const containerCoWriters = document.querySelector("#collaboration_co_writers");

    coWriters.forEach(element => {
        const imgCoWriter = document.createElement("img");
        imgCoWriter.src = element.profileImage;
        imgCoWriter.alt = "userImage";
        containerCoWriters.appendChild(imgCoWriter);
    });
}

async function createCollaborationLog(editLog) {
    const domain = await Settings.domain();
    const sectionLog = document.createElement("section");
    const spanDate = document.createElement("span");
    spanDate.textContent = editLog.date;
    sectionLog.appendChild(spanDate)
    fetch(`${domain}/api/users/${editLog.userId}`)
        .then(response => {
            if(response.status == 200)
                return response.json();
        })
        .then(data => {
            const imgUser = document.createElement("img");
            imgUser.src = `${domain}/assets/profileImages/${data.profileImage}`;
            imgUser.alt = "userImage";
            spanDate.before(imgUser);
        })
    return sectionLog;
}

function populateCollaborationEditLogs(editLogs) {
    const containerEditLogs = document.querySelector("#edit_logs #container_edit_logs");

    editLogs.forEach(element => {
        createCollaborationLog(element)
        .then(result => containerEditLogs.append(result));
    });
}

async function initCollaborationDetails(collaborationData){
    getCollaborationLogos(collaborationData)
        .then(({brandLogo, developerLogo}) => {
            document.querySelector("#collaboration_brand_logo").src = `${brandLogo}`;
            document.querySelector("#collaboration_developer_logo").src = `${developerLogo}`;
        });
    getCollaborationWriterProfileImage(collaborationData)
        .then(writerProfileImage => document.querySelector("#collaboration_co_writers img").src = `${writerProfileImage}`);
    getCollaborationThresholdPercentage(collaborationData)
        .then(threshold => updateThresholdProgressBar(document.querySelector("#container_object_details .progress .progress-bar"), threshold));

    document.querySelector("#collaboration_title").textContent = collaborationData.title;
    document.querySelector(".breadcrumb-item.active").textContent = collaborationData.title;
    document.querySelector("#collaboration_status").textContent = `Status: ${collaborationData.status}`;
    document.querySelectorAll("#collaboration_upvotes_downvotes span")[0].textContent = collaborationData.upvote;
    document.querySelectorAll("#collaboration_upvotes_downvotes span")[1].textContent = collaborationData.downvote;
    updateCircularProgressBar(document.querySelector(".circular_progress_bar"), collaborationData.aiReadability);

    getCollaborationCoWritersProfileImages(collaborationData)
        .then(populateCollaborationCoWriters);

    getCollaborationEditLogs(collaborationData)
        .then(populateCollaborationEditLogs);

    const urlParams = new URLSearchParams(window.location.search);
    const editMode = urlParams.get("edit") == "true" ? true : false;
    changeMode(editMode);
}

function updateBreadCrumbs(fromPage){
    document.querySelector(".breadcrumb-item a").text = fromPage ? fromPage : document.querySelector(".breadcrumb-item a").text;
    switch (fromPage) {
        case "Vote":
            document.querySelector(".breadcrumb-item a").href = "./votePage.html";
            break;
        default:
            document.querySelector(".breadcrumb-item a").href = "./index.html";
    }
}

async function getCollaborationDetailsFromServer(){
    const urlParams = new URLSearchParams(window.location.search);
    const collaborationId = urlParams.get("id");
    const fromPage = urlParams.get("fromPage");

    updateBreadCrumbs(fromPage);

    const collaborationData = await Data.collaborations();
    const currentCollaboration = collaborationData[collaborationId];

    if(currentCollaboration)
        initCollaborationDetails(currentCollaboration);
    else document.location.replace("./index.html");
}

function deleteObjectDetails(){
    const urlParams = new URLSearchParams(window.location.search);
    const collaborationId = urlParams.get("id");
    const title = document.querySelector("#collaboration_title").textContent;
    const deleteModal = new bootstrap.Modal('#delete_collaboration_modal', {})
    deleteModal.show();
    document.querySelector("#delete_collaboration_modal .modal-body").textContent = `Are you sure you want to delete\n ${title} collaboration`;
    const deleteCollaborationFunc = async () => {
        await deleteCollaboration(collaborationId);
        document.location.replace("./index.html");
    }
    document.getElementById("delete_collaboration_button").addEventListener("click", deleteCollaborationFunc);

    deleteModal._element.addEventListener("hide.bs.modal", () => {
        document.getElementById("delete_collaboration_button").removeEventListener("click", deleteCollaborationFunc);
    });
}

async function addListeners(){
    document.querySelector("#collaboration_edit_delete img").addEventListener("click", deleteObjectDetails);
    document.querySelectorAll("#collaboration_edit_delete > img")[1].addEventListener("click", changeToEditMode);
    document.querySelectorAll("#container_object_details .dropdown-menu li").forEach((element, idx) => {
        element.addEventListener("click", () => {
            document.querySelector("#container_object_details .dropdown-menu .active").classList.remove("active");
            element.classList.add("active");
            document.querySelectorAll(".containerr .row > section").forEach(section => section.style.display = "none");
            if(idx == 0)
                document.querySelectorAll(".containerr .row > section")[0].style.display = "block";
            else document.querySelectorAll(".containerr .row > section")[idx].style.display = "flex";
        });
    });

}

//function to be executed when page size changes
function onResize(){
    if(window.innerWidth > 992){
        document.querySelectorAll(".containerr .row > section").forEach((section, idx) => {
            if(idx == 0)
                document.querySelectorAll(".containerr .row > section")[0].style.display = "block";
            else document.querySelectorAll(".containerr .row > section")[idx].style.display = "flex";
        });
        document.querySelector("#container_object_details .dropdown-menu .active").classList.remove("active");
        document.querySelector("#container_object_details .dropdown-menu li").classList.add("active");
    }else {
        document.querySelectorAll(".containerr .row > section").forEach((section, idx) => {
            if(idx == 0)
                document.querySelectorAll(".containerr .row > section")[0].style.display = "block";
            else document.querySelectorAll(".containerr .row > section")[idx].style.display = "none";
        });
    }
}

window.addEventListener("resize", onResize);

window.onload = async () => {
    getCollaborationDetailsFromServer();
    populateParagraphImagesSelection();
    populateParagraphVideosSelection();
    addListeners();
}