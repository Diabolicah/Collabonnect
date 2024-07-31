function createTextParagraph(paragraphDetails, isEditMode, status){
    let paragraphText;
    if(isEditMode) {
        paragraphText = document.createElement("textarea");
        paragraphText.value = paragraphDetails.oldText;
    }else {
        paragraphText = document.createElement("p");
        paragraphText.textContent = paragraphDetails.newText;
    }

    paragraphText.addEventListener("change", () => {
        if(!status.classList.contains("Pending") && paragraphText.value != paragraphDetails.oldText){
            status.textContent = "Pending";
            status.classList.add("pending");
        }else if(paragraphText.value == paragraphDetails.oldText){
            status.textContent = "Up to date";
            status.classList.remove("pending");
        }
    });

    return paragraphText;
}

function createTitleParagraph(paragraphDetails, isEditMode, status){
    let title;
    if(isEditMode) {
        title = document.createElement("input");
        title.value = paragraphDetails.oldTitle;
    }else {
        title = document.createElement("h2");
        title.textContent = paragraphDetails.newTitle;
    }

    title.addEventListener("change", () => {
        if(!status.classList.contains("Pending") && title.value != paragraphDetails.oldTitle){
            status.textContent = "Pending";
            status.classList.add("pending");
        }else if(title.value == paragraphDetails.oldTitle){
            status.textContent = "Up to date";
            status.classList.remove("pending");
        }
    });

    return title;
}

function createStatusParagraph(paragraphDetails){
    const status = document.createElement("section");
    status.classList.add("status");
    if(!(paragraphDetails.newText == paragraphDetails.oldText && paragraphDetails.newTitle == paragraphDetails.oldTitle)){
        status.classList.add("pending");
    }
    status.textContent = paragraphDetails.status;
    return status;
}

function createDefaultParagraph(paragraphDetails, isEditMode){
    isEditMode = isEditMode || false;
    const paragraph = document.createElement("section");
    paragraph.classList.add("paragraph");

    const paragraphTitleStatus = document.createElement("section");
    paragraphTitleStatus.classList.add("paragraph_title_and_status");

    const status = createStatusParagraph(paragraphDetails);

    let title = createTitleParagraph(paragraphDetails, isEditMode, status);

    let paragraphText = createTextParagraph(paragraphDetails, isEditMode, status);

    paragraph.appendChild(paragraphTitleStatus);
    paragraphTitleStatus.appendChild(title);
    paragraphTitleStatus.appendChild(status);
    paragraph.appendChild(paragraphText);

    return paragraph;
}

function getElementParagraphImageVideo(paragraph, isEditMode){
    let paragraphImageVideo = paragraph.querySelector(".paragraph_image_video");

    if(!paragraphImageVideo){
        paragraphImageVideo = document.createElement("section");
        paragraphImageVideo.classList.add("paragraph_image_video");
        if(isEditMode){
            paragraph.appendChild(paragraphImageVideo);
            paragraph.classList.add("edit_mode");
        }
        else paragraph.querySelector(".paragraph_title_and_status").after(paragraphImageVideo);
    }

    return paragraphImageVideo;
}

async function addImage(paragraph, paragraphDetails, isEditMode) {
    const domain = await Settings.domain();
    isEditMode = isEditMode || false;
    let paragraphImageVideo = getElementParagraphImageVideo(paragraph, isEditMode);
    const paragraphImg = document.createElement("img");
    paragraphImg.src = isEditMode ? "./images/upload_placeholder_image.svg": `${domain}/assets/paragraphImage/${paragraphDetails.newImage}`;
    paragraphImg.alt = "image_placeholder";
    paragraphImg.classList.add("paragraph_image");
    if(isEditMode)
        paragraphImg.classList.add("edit_mode");

    paragraphImageVideo.appendChild(paragraphImg);

    return paragraph;
}

function addVideo(paragraph, paragraphDetails, isEditMode) {
    isEditMode = isEditMode || false;
    let paragraphImageVideo = getElementParagraphImageVideo(paragraph, isEditMode);
    const paragraphVideo = document.createElement(`${isEditMode ? "img" : "iframe"}`);
    paragraphVideo.src = isEditMode ? "./images/upload_placeholder_video.svg": `${paragraphDetails.newVideo}`;
    paragraphVideo.alt = "video_placeholder";
    paragraphVideo.classList.add("paragraph_video");
    if(isEditMode)
        paragraphVideo.classList.add("edit_mode");


    paragraphImageVideo.appendChild(paragraphVideo);

    return paragraph;
}

async function addImageAndVideo(paragraph, paragraphDetails, isEditMode){
    const currParagraph = await addImage(paragraph, paragraphDetails, isEditMode);
    return addVideo(currParagraph, paragraphDetails, isEditMode);
}

async function approveParagraph(paragraph, paragraphDetails){
    if(paragraph.querySelector(".pending") == null) return;
    const urlParams = new URLSearchParams(window.location.search);
    const collaborationId = urlParams.get("id");

    paragraphDetails.newTitle = paragraph.querySelector("input").value;
    paragraphDetails.oldTitle = paragraphDetails.newTitle;
    paragraphDetails.status = "Up to date";
    paragraphDetails.newText = paragraph.querySelector("textarea").value;
    paragraphDetails.oldText = paragraphDetails.newText;

    if(await approveCollaborationParagraph(collaborationId, paragraphDetails.id, paragraphDetails)){
        paragraph.querySelector(".pending").textContent = "Up to date";
        paragraph.querySelector(".pending").classList.remove("pending");
    }
}

async function deleteParagraph(paragraph, paragraphDetails){
    const urlParams = new URLSearchParams(window.location.search);
    const collaborationId = urlParams.get("id");
    const title = paragraph.querySelector(".paragraph_title_and_status input").value;
    const deleteModal = new bootstrap.Modal('#delete_collaboration_modal', {})
    deleteModal.show();
    document.querySelector("#delete_collaboration_modal .modal-body").textContent = `Are you sure you want to delete\n ${title} paragraph`;
    const deleteCollaborationFunc = async () => {
        await deleteCollaborationParagraph(collaborationId, paragraphDetails.id);
        paragraph.remove();
        deleteModal.hide();
    }
    document.getElementById("delete_collaboration_button").addEventListener("click", deleteCollaborationFunc);

    deleteModal._element.addEventListener("hide.bs.modal", () => {
        document.getElementById("delete_collaboration_button").removeEventListener("click", deleteCollaborationFunc);
    });
}

function addEditButtons(paragraph, paragraphDetails){
    const paragraphApproveDelete = document.createElement("section");
    paragraphApproveDelete.classList.add("paragraph_approve_and_delete");

    const paragraphApproveIcon = document.createElement("img");
    paragraphApproveIcon.src = "./images/approval_icon.svg"
    paragraphApproveIcon.alt = "approval_icon";

    const paragraphDeleteIcon = document.createElement("img");;
    paragraphDeleteIcon.src = "./images/delete_icon.svg";
    paragraphDeleteIcon.alt = "delete_icon";

    paragraphApproveDelete.appendChild(paragraphApproveIcon);
    paragraphApproveDelete.appendChild(paragraphDeleteIcon);
    paragraph.querySelector(".paragraph_title_and_status").appendChild(paragraphApproveDelete);

    paragraphDeleteIcon.addEventListener("click", () => deleteParagraph(paragraph, paragraphDetails));
    paragraphApproveIcon.addEventListener("click", () => approveParagraph(paragraph, paragraphDetails));

    return paragraph;
}

async function createParagraph(paragraphDetails, isEditMode){
    isEditMode = isEditMode || false;
    let paragraph = createDefaultParagraph(paragraphDetails, isEditMode);
    if(isEditMode) {
        paragraph = addEditButtons(paragraph, paragraphDetails);
    }
    if(paragraphDetails.newImage && paragraphDetails.newVideo){
        return paragraph = await addImageAndVideo(paragraph, paragraphDetails, isEditMode);
    }else if(paragraphDetails.newImage){
        return paragraph = await addImage(paragraph, paragraphDetails, isEditMode);
    }else if(paragraphDetails.newVideo){
        return paragraph = addVideo(paragraph, paragraphDetails, isEditMode);
    }

    return paragraph;
}