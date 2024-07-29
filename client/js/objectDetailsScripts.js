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
    fetch(`${domain}/api/user/${editLog.userId}`)
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
    const containerEditLogs = document.querySelector("#edit_logs");

    editLogs.forEach(element => {
        createCollaborationLog(element)
        .then(result => containerEditLogs.querySelector("hr").after(result));
    });
}

function populateCollaborationParagraphs(paragraphs, isEditMode) {
    const containerParagraphs = document.querySelector("#container_paragraphs");

    paragraphs.forEach(async element => {
        const paragraph = await createParagraph(element, isEditMode);
        containerParagraphs.appendChild(paragraph);
    })
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
    document.querySelector(".circular_progress_bar span").textContent = objectData.aiReadability;
    updateCircularProgressBar(document.querySelector(".circular_progress_bar"), objectData.aiReadability, "#2E2C2C");

    getCollaborationCoWritersProfileImages(objectData)
        .then(populateCollaborationCoWriters);

    getCollaborationEditLogs(objectData)
        .then(populateCollaborationEditLogs);

    const paragraphs = await getCollaborationParagraphs(objectData);
    populateCollaborationParagraphs(paragraphs, false);
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

async function getObjectDetailsFromServer(){
    const urlParams = new URLSearchParams(window.location.search);
    const collaborationId = urlParams.get("id");
    const fromPage = urlParams.get("fromPage");
    updateBreadCrumbs(fromPage);
    const collaboration = await getCollaborationDetails(collaborationId);
    if(collaboration)
        initObjectDetails(collaboration);
    else document.location.replace("./index.html");
}

function deleteObjectDetails(){
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
}

async function changeToEditMode() {
    document.querySelectorAll("#collaboration_edit_delete > img")[1].removeEventListener("click", changeToEditMode);
    const urlParams = new URLSearchParams(window.location.search);
    const collaborationId = urlParams.get("id");
    const collaboration = await getCollaborationDetails(collaborationId);

    document.querySelectorAll("#collaboration_edit_delete > img")[1].src = "./images/edit_mode_icon.svg";
    document.querySelector("#container_paragraphs").innerHTML = `<section id="object_adder"><img src="./images/add_object_icon.svg" alt="plus_circle_icon"></section>`;
    populateCollaborationParagraphs(await getCollaborationParagraphs(collaboration), true);



    document.querySelector("#object_adder").addEventListener("click", () => {
        const addParagraphModal = new bootstrap.Modal('#addParagraphModal', {})
        addParagraphModal.show();
        let paragraphJson;
        document.querySelectorAll(".paragraph_type")[0].addEventListener("click", async () => {
            paragraphJson = {
                "image": null,
                "status": "Pending",
                "text": "",
                "title": "",
                "video": null,
            }
            document.querySelector("#container_paragraphs").appendChild(await createParagraph(paragraphJson, true));
        })
    })
}

function addListeners(){
    document.querySelector("#collaboration_edit_delete img").addEventListener("click", deleteObjectDetails);
    document.querySelectorAll("#collaboration_edit_delete > img")[1].addEventListener("click", changeToEditMode);
}

window.onload = async () => {
    getObjectDetailsFromServer();
    addListeners();
}