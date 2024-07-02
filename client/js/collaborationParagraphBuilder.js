function createDefaultParagraph(paragraphDetails, isEditMode){
    isEditMode = isEditMode || false;
    const paragraph = document.createElement("section");
    paragraph.classList.add("paragraph");

    const paragraphTitleStatus = document.createElement("section");
    paragraphTitleStatus.classList.add("paragraph_title_and_status");
    let title;
    if(isEditMode) {
        title = document.createElement("input");
        title.value = paragraphDetails.title;
    }else {
        title = document.createElement("h2");
        title.textContent = paragraphDetails.title;
    }
    const status = document.createElement("section");
    if(paragraphDetails.status == "Pending"){
        status.classList.add("pending");
        status.textContent = paragraphDetails.status;
    }else {
        status.textContent = "Up to date";
    }

    let paragraphText;
    if(isEditMode) {
        paragraphText = document.createElement("textarea");
        paragraphText.value = paragraphDetails.text;
    }else {
        paragraphText = document.createElement("p");
        paragraphText.textContent = paragraphDetails.text;
    }

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

function addImage(paragraph, paragraphDetails, isEditMode) {
    isEditMode = isEditMode || false;
    let paragraphImageVideo = getElementParagraphImageVideo(paragraph, isEditMode);
    const paragraphImg = document.createElement("img");
    paragraphImg.src = isEditMode ? "./images/upload_placeholder_image.svg": `${domain}/assets/paragraph_image/${paragraphDetails.image}`;
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
    paragraphVideo.src = isEditMode ? "./images/upload_placeholder_video.svg": `${paragraphDetails.video}`;
    paragraphVideo.alt = "video_placeholder";
    paragraphVideo.classList.add("paragraph_video");
    if(isEditMode)
        paragraphVideo.classList.add("edit_mode");


    paragraphImageVideo.appendChild(paragraphVideo);

    return paragraph;
}

function addImageAndVideo(paragraph, paragraphDetails, isEditMode){
    const currParagraph = addImage(paragraph, paragraphDetails, isEditMode);
    return addVideo(currParagraph, paragraphDetails, isEditMode);
}

function createParagraph(paragraphDetails, isEditMode){
    isEditMode = isEditMode || false;
    let paragraph = createDefaultParagraph(paragraphDetails, isEditMode);
    if(paragraphDetails.image && paragraphDetails.video){
        return paragraph = addImageAndVideo(paragraph, paragraphDetails, isEditMode);
    }else if(paragraphDetails.image){
        return paragraph = addImage(paragraph, paragraphDetails, isEditMode);
    }else if(paragraphDetails.video){
        return paragraph = addVideo(paragraph, paragraphDetails, isEditMode);
    }

    return paragraph;
}