function videoEditMode(paragraph, paragraphVideo, paragraphDetails){
    paragraphVideo.classList.add("edit_mode");
        paragraphVideo.addEventListener("click", () => {
            const newVideoModal = new bootstrap.Modal('#new_video_modal', {})
            newVideoModal.show();

            const selectVideo = () => {
                const video = document.querySelector("#collaboration_paragraph_videos_data_list").value;
                paragraphVideo.attributes.video.value = video;
                newVideoModal.hide();

                const status = paragraph.querySelector(".status");
                if(!status.classList.contains("Pending") && paragraphVideo.attributes.video.value != paragraphDetails.oldVideo){
                    status.textContent = "Pending";
                    status.classList.add("pending");
                }else if(paragraphVideo.attributes.video.value == paragraphDetails.oldVideo){
                    status.textContent = "Up to date";
                    status.classList.remove("pending");
                }
            }
            document.querySelector("#submit_paragraph_video_button").addEventListener("click", selectVideo);

            newVideoModal._element.addEventListener("hide.bs.modal", () => {
                document.querySelector("#submit_paragraph_video_button").removeEventListener("click", selectVideo);
        });
    });
}

function imageEditMode(paragraph, paragraphImage, paragraphDetails){
    paragraphImage.classList.add("edit_mode");
        paragraphImage.addEventListener("click", () => {
            const newImageModal = new bootstrap.Modal('#new_image_modal', {})
            newImageModal.show();

            const selectImage = () => {
                const image = document.querySelector("#collaboration_paragraph_images_data_list").value;
                paragraphImage.attributes.image.value = image;
                newImageModal.hide();

                const status = paragraph.querySelector(".status");
                if(!status.classList.contains("Pending") && paragraphImage.attributes.image.value != paragraphDetails.oldImage){
                    status.textContent = "Pending";
                    status.classList.add("pending");
                }else if(paragraphImage.attributes.image.value == paragraphDetails.oldImage){
                    status.textContent = "Up to date";
                    status.classList.remove("pending");
                }
            }
            document.querySelector("#submit_paragraph_image_button").addEventListener("click", selectImage);

            newImageModal._element.addEventListener("hide.bs.modal", () => {
                document.querySelector("#submit_paragraph_image_button").removeEventListener("click", selectImage);
        });
    });
}

function createOptionElement(value, text) {
    const option = document.createElement("option");
    option.value = value;
    option.text = text;
    return option;
}

async function populateParagraphImagesSelection() {
    const domain = await Settings.domain();
    const paragraphImagesData = await fetch(`${domain}/api/collaborations/paragraphs/images`).then((response) => response.json());
    const imagesSelect = document.getElementById("collaboration_paragraph_images_data_list");
    const defaultOption = createOptionElement(" ", "Select an image");
    defaultOption.selected = true;
    defaultOption.disabled = true;
    imagesSelect.appendChild(defaultOption);
    for (let image of paragraphImagesData) {
        const option = createOptionElement(image, image);
        imagesSelect.appendChild(option);
    }
}

async function populateParagraphVideosSelection() {
    const domain = await Settings.domain();
    const paragraphVideosData = await fetch(`${domain}/api/collaborations/paragraphs/videos`).then((response) => response.json());
    const videosSelect = document.getElementById("collaboration_paragraph_videos_data_list");
    const defaultOption = createOptionElement(" ", "Select an video");
    defaultOption.selected = true;
    defaultOption.disabled = true;
    videosSelect.appendChild(defaultOption);
    for (let video of paragraphVideosData) {
        const option = createOptionElement(video, video);
        videosSelect.appendChild(option);
    }
}

async function getParagraphs(){
    const urlParams = new URLSearchParams(window.location.search);
    const collaborationId = urlParams.get("id");
    const collaborationData = await Data.collaborations();
    const currentCollaboration = collaborationData[collaborationId];
    return await getCollaborationParagraphs(currentCollaboration);
}

async function populateCollaborationParagraphs(paragraphs, isEditMode, isCollaborationForUser) {
    const containerParagraphs = document.querySelector("#container_paragraphs");
    const arrayParagraphs = new Array(paragraphs.length);
    for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = await createParagraph(paragraphs[i], isEditMode, isCollaborationForUser);
        arrayParagraphs[paragraphs[i].id] = paragraph;
    }
    arrayParagraphs.forEach(paragraph => containerParagraphs.appendChild(paragraph));
}

async function addParagraphTypeListeners(){
    const urlParams = new URLSearchParams(window.location.search);
    const collaborationId = urlParams.get("id");

    const defaultParagraph = async () => {
        const paragraph = await addCollaborationParagraph(collaborationId, {paragraphType: "DefaultParagraph"});
        document.querySelector("#container_paragraphs").appendChild(await createParagraph(paragraph, true, await isCollaborationForCurrentUser()));
    }
    const imageParagraph = async () => {
        const paragraph = await addCollaborationParagraph(collaborationId, {paragraphType: "ImageParagraph"});
        document.querySelector("#container_paragraphs").appendChild(await createParagraph(paragraph, true, await isCollaborationForCurrentUser()));
    }
    const videoParagraph = async () => {
        const paragraph = await addCollaborationParagraph(collaborationId, {paragraphType: "VideoParagraph"});
        document.querySelector("#container_paragraphs").appendChild(await createParagraph(paragraph, true, await isCollaborationForCurrentUser()));
    }
    const imageVideoParagraph = async () => {
        const paragraph = await addCollaborationParagraph(collaborationId, {paragraphType: "ImageVideoParagraph"});
        document.querySelector("#container_paragraphs").appendChild(await createParagraph(paragraph, true, await isCollaborationForCurrentUser()));
    }

    return [defaultParagraph, imageParagraph, videoParagraph, imageVideoParagraph];
}

async function addNewParagraphs(){
    const addParagraphModal = new bootstrap.Modal('#add_paragraph_modal', {})
        addParagraphModal.show();
        const paragraphTypeFunc = await addParagraphTypeListeners();

        document.querySelectorAll(".paragraph_type")[0].addEventListener("click", paragraphTypeFunc[0]);
        document.querySelectorAll(".paragraph_type")[1].addEventListener("click", paragraphTypeFunc[1]);
        document.querySelectorAll(".paragraph_type")[2].addEventListener("click", paragraphTypeFunc[2]);
        document.querySelectorAll(".paragraph_type")[3].addEventListener("click", paragraphTypeFunc[3]);

        addParagraphModal._element.addEventListener("hide.bs.modal", () => {
            document.querySelectorAll(".paragraph_type")[0].removeEventListener("click", paragraphTypeFunc[0]);
            document.querySelectorAll(".paragraph_type")[1].removeEventListener("click", paragraphTypeFunc[1]);
            document.querySelectorAll(".paragraph_type")[2].removeEventListener("click", paragraphTypeFunc[2]);
            document.querySelectorAll(".paragraph_type")[3].removeEventListener("click", paragraphTypeFunc[3]);
        });
}

async function changeMode(isEditMode, isCollaborationForUser){
    if(isCollaborationForUser){
        const editButton = document.querySelectorAll("#collaboration_edit_delete_vote > img")[1];
        editButton.src = (isCollaborationForUser && isEditMode) ? "./images/edit_mode_icon.svg" : "./images/edit_icon.svg";
        document.querySelector("#container_paragraphs").innerHTML = (isCollaborationForUser && isEditMode) ? `<section id="object_adder"><img src="./images/add_object_icon.svg" alt="plus_circle_icon"></section>` : "";
    
        editButton.removeEventListener("click", isEditMode ? changeToEditMode : changeToViewMode);
    
        if(isCollaborationForUser && isEditMode)
            document.querySelector("#object_adder").addEventListener("click", addNewParagraphs);

        editButton.addEventListener("click", isEditMode ? changeToViewMode : changeToEditMode);
    }
    populateCollaborationParagraphs(await getParagraphs(), isEditMode, isCollaborationForUser);
}

function getParagraphDetails(paragraph, paragraphDetailsFromServer){
    const paragraphId = paragraph.getAttribute("paragraphId");
    const paragraphTitle = paragraph.querySelector(".paragraph_title_and_status input").value;
    const paragraphStatus = paragraph.querySelector(".paragraph_title_and_status .status").textContent;
    const paragraphText = paragraph.querySelector("textarea").value;
    const paragraphImage = paragraph.querySelector(".paragraph_image") ? paragraph.querySelector(".paragraph_image").attributes.image.value : paragraphDetailsFromServer.oldImage;
    const paragraphVideo = paragraph.querySelector(".paragraph_video") ? paragraph.querySelector(".paragraph_video").attributes.video.value : paragraphDetailsFromServer.oldVideo;

    return {
        id: paragraphId,
        newTitle: paragraphDetailsFromServer.newTitle,
        oldTitle: paragraphTitle,
        status: paragraphStatus,
        newText: paragraphDetailsFromServer.newText,
        oldText: paragraphText,
        newImage: paragraphDetailsFromServer.newImage,
        oldImage: paragraphImage,
        newVideo: paragraphDetailsFromServer.newVideo,
        oldVideo: paragraphVideo
    };
}

async function changeToEditMode() {
    changeMode(true, await isCollaborationForCurrentUser());
}

async function changeToViewMode(){
    const urlParams = new URLSearchParams(window.location.search);
    const collaborationId = urlParams.get("id");

    const paragraphs = await getParagraphs();
    const paragraphElements = document.querySelectorAll(".paragraph");
    const newParagraphs = [];
    paragraphElements.forEach((paragraphElement, index) => {
        const paragraph = getParagraphDetails(paragraphElement, paragraphs[index]);
        newParagraphs.push(paragraph);
    });

    await updateCollaborationParagraphs(collaborationId, {paragraphs: newParagraphs});
    if(window.location.search.includes("edit")){
        const url = window.location.href.split("?")[0];
        window.history.pushState({}, document.title, url + "?id=" + collaborationId);
    }
    window.location.reload();
    changeMode(false, await isCollaborationForCurrentUser());
}