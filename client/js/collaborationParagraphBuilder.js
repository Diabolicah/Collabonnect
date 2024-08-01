function createTextParagraph(paragraphDetails, isEditMode, status){
    let paragraphText;
    if(isEditMode) {
        paragraphText = document.createElement("textarea");
        paragraphText.value = paragraphDetails.oldText;
        paragraphText.addEventListener("change", () => {
            if(!status.classList.contains("Pending") && paragraphText.value != paragraphDetails.oldText){
                status.textContent = "Pending";
                status.classList.add("pending");
            }else if(paragraphText.value == paragraphDetails.oldText){
                status.textContent = "Up to date";
                status.classList.remove("pending");
            }
        });
    }else {
        paragraphText = document.createElement("p");
        paragraphText.textContent = paragraphDetails.newText;
    }

    return paragraphText;
}

function createTitleParagraph(paragraphDetails, isEditMode, status){
    let title;
    if(isEditMode) {
        title = document.createElement("input");
        title.value = paragraphDetails.oldTitle;

        title.addEventListener("change", () => {
            if(!status.classList.contains("Pending") && title.value != paragraphDetails.oldTitle){
                status.textContent = "Pending";
                status.classList.add("pending");
            }else if(title.value == paragraphDetails.oldTitle){
                status.textContent = "Up to date";
                status.classList.remove("pending");
            }
        });
    }else {
        title = document.createElement("h2");
        title.textContent = paragraphDetails.newTitle;
    }

    return title;
}

function checkPending(paragraphDetails){
    if(paragraphDetails.newTitle && paragraphDetails.oldTitle && paragraphDetails.newTitle != paragraphDetails.oldTitle)
        return true;
    if(paragraphDetails.newText && paragraphDetails.oldText && paragraphDetails.newText != paragraphDetails.oldText)
        return true;
    if(paragraphDetails.newImage && paragraphDetails.oldImage && paragraphDetails.newImage != paragraphDetails.oldImage)
        return true;
    if(paragraphDetails.newVideo && paragraphDetails.oldVideo && paragraphDetails.newVideo != paragraphDetails.oldVideo)
        return true;
    return false;
}

function createStatusParagraph(paragraphDetails){
    const status = document.createElement("section");
    status.classList.add("status");
    status.textContent = paragraphDetails.status;

    if(checkPending(paragraphDetails)){
        status.classList.add("pending");
    }
    return status;
}

function createDefaultParagraph(paragraphDetails, isEditMode, isCollaborationForUser){
    if(!isCollaborationForUser)
        isEditMode = false;
    isEditMode = isEditMode || false;
    let status;
    const paragraph = document.createElement("section");
    paragraph.classList.add("paragraph");

    const paragraphDetailsId = document.createAttribute("paragraphId");
    paragraphDetailsId.value = paragraphDetails.id;
    paragraph.setAttributeNode(paragraphDetailsId);

    const paragraphTitleStatus = document.createElement("section");
    paragraphTitleStatus.classList.add("paragraph_title_and_status");

    if(isCollaborationForUser)
        status = createStatusParagraph(paragraphDetails);

    let title = createTitleParagraph(paragraphDetails, isEditMode, status);

    let paragraphText = createTextParagraph(paragraphDetails, isEditMode, status);
    if(isCollaborationForUser)
        paragraphTitleStatus.appendChild(status);
    paragraph.appendChild(paragraphTitleStatus);
    paragraphTitleStatus.appendChild(title);
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

async function addImage(paragraph, paragraphDetails, isEditMode, isCollaborationForUser) {
    const domain = await Settings.domain();
    if(!isCollaborationForUser)
        isEditMode = false;
    isEditMode = isEditMode || false;
    let paragraphImageVideo = getElementParagraphImageVideo(paragraph, isEditMode);
    const paragraphImage = document.createElement("img");
    paragraphImage.src = isEditMode ? "./images/upload_placeholder_image.svg": `${domain}/assets/collaborationParagraphImages/${paragraphDetails.newImage}`;
    paragraphImage.alt = "image_placeholder";
    paragraphImage.classList.add("paragraph_image");

    const paragraphAttributeImage = document.createAttribute("image");
    paragraphAttributeImage.value = paragraphDetails.oldImage;
    paragraphImage.setAttributeNode(paragraphAttributeImage);

    if(isEditMode)
        imageEditMode(paragraph, paragraphImage, paragraphDetails);
    else document.querySelector("#collaboration_assets #container_images").appendChild(paragraphImage.cloneNode(true));
    paragraphImageVideo.appendChild(paragraphImage);

    return paragraph;
}

function addVideo(paragraph, paragraphDetails, isEditMode, isCollaborationForUser) {
    if(!isCollaborationForUser)
        isEditMode = false;
    isEditMode = isEditMode || false;
    let paragraphImageVideo = getElementParagraphImageVideo(paragraph, isEditMode);
    const paragraphVideo = document.createElement(`${isEditMode ? "img" : "iframe"}`);
    paragraphVideo.src = isEditMode ? "./images/upload_placeholder_video.svg": `${paragraphDetails.newVideo}`;
    paragraphVideo.alt = "video_placeholder";
    paragraphVideo.classList.add("paragraph_video");

    const paragraphAttributeVideo = document.createAttribute("video");
    paragraphAttributeVideo.value = paragraphDetails.oldVideo;
    paragraphVideo.setAttributeNode(paragraphAttributeVideo);

    if(isEditMode)
        videoEditMode(paragraph, paragraphVideo, paragraphDetails);
    else document.querySelector("#collaboration_assets #container_images").appendChild(paragraphVideo.cloneNode(true));
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

    if(paragraph.querySelector(".paragraph_image_video .paragraph_image"))
        paragraphDetails.newImage = paragraph.querySelector(".paragraph_image_video .paragraph_image").attributes.image.value ? paragraph.querySelector(".paragraph_image_video .paragraph_image").attributes.image.value : " ";
    else paragraphDetails.newImage = null;

    if(paragraph.querySelector(".paragraph_image_video .paragraph_video"))
        paragraphDetails.newVideo = paragraph.querySelector(".paragraph_image_video .paragraph_video").attributes.video.value ? paragraph.querySelector(".paragraph_image_video .paragraph_video").attributes.video.value : " ";
    else paragraphDetails.newVideo = null;


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

async function createParagraph(paragraphDetails, isEditMode, isCollaborationForUser){
    isEditMode = isEditMode || false;
    let paragraph = createDefaultParagraph(paragraphDetails, isEditMode, isCollaborationForUser);
    if(isCollaborationForUser && isEditMode) {
        paragraph = addEditButtons(paragraph, paragraphDetails);
    }
    if(paragraphDetails.oldImage && paragraphDetails.oldVideo){
        return paragraph = await addImageAndVideo(paragraph, paragraphDetails, isEditMode, isCollaborationForUser);
    }else if(paragraphDetails.oldImage){
        return paragraph = await addImage(paragraph, paragraphDetails, isEditMode, isCollaborationForUser);
    }else if(paragraphDetails.oldVideo){
        return paragraph = addVideo(paragraph, paragraphDetails, isEditMode, isCollaborationForUser);
    }

    return paragraph;
}