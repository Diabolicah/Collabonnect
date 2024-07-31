let collaborationMode = {
    "isEditModeReady": true,
}

async function getParagraphs(){
    const urlParams = new URLSearchParams(window.location.search);
    const collaborationId = urlParams.get("id");
    const collaborationData = await Data.collaborations();
    const currentCollaboration = collaborationData[collaborationId];
    return await getCollaborationParagraphs(currentCollaboration);
}

async function populateCollaborationParagraphs(paragraphs, isEditMode) {
    const containerParagraphs = document.querySelector("#container_paragraphs");
    const arrayParagraphs = new Array(paragraphs.length);
    for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = await createParagraph(paragraphs[i], isEditMode);
        arrayParagraphs[paragraphs[i].id] = paragraph;
    }
    arrayParagraphs.forEach(paragraph => containerParagraphs.appendChild(paragraph));
}

async function addParagraphTypeListeners(){
    const paragraphJsonTypes =[{"image": null, "status": "Up to date", "newText": "", "oldText": "", "newTitle": "", "oldTitle": "", "video": null},
        {"image": " ", "status": "Up to date", "newText": "", "oldText": "", "newTitle": "", "oldTitle": "", "video": null},
        {"image": null, "status": "Up to date", "newText": "", "oldText": "", "newTitle": "", "oldTitle": "", "video": " "},
        {"image": " ", "status": "Up to date", "newText": "", "oldText": "", "newTitle": "", "oldTitle": "", "video": " "}
    ];

    const urlParams = new URLSearchParams(window.location.search);
    const collaborationId = urlParams.get("id");

    const defaultParagraph = async () => {
        document.querySelector("#container_paragraphs").appendChild(await createParagraph(paragraphJsonTypes[0], true));
        await addCollaborationParagraph(collaborationId, paragraphJsonTypes[0]);
    }
    const imageParagraph = async () => {
        document.querySelector("#container_paragraphs").appendChild(await createParagraph(paragraphJsonTypes[1], true));
        await addCollaborationParagraph(collaborationId, paragraphJsonTypes[1]);
    }
    const videoParagraph = async () => {
        document.querySelector("#container_paragraphs").appendChild(await createParagraph(paragraphJsonTypes[2], true));
        await addCollaborationParagraph(collaborationId, paragraphJsonTypes[2]);
    }
    const imageVideoParagraph = async () => {
        document.querySelector("#container_paragraphs").appendChild(await createParagraph(paragraphJsonTypes[3], true));
        await addCollaborationParagraph(collaborationId, paragraphJsonTypes[3]);
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

async function changeMode(isEditMode){
    const editButton = document.querySelectorAll("#collaboration_edit_delete > img")[1];
    editButton.src = isEditMode ? "./images/edit_mode_icon.svg" : "./images/edit_icon.svg";
    document.querySelector("#container_paragraphs").innerHTML = isEditMode ? `<section id="object_adder"><img src="./images/add_object_icon.svg" alt="plus_circle_icon"></section>` : "";

    editButton.removeEventListener("click", isEditMode ? changeToEditMode : changeToViewMode);

    if(isEditMode)
        document.querySelector("#object_adder").addEventListener("click", addNewParagraphs);

    populateCollaborationParagraphs(await getParagraphs(), isEditMode);

    editButton.addEventListener("click", isEditMode ? changeToViewMode : changeToEditMode);
}

function getParagraphDetails(paragraph, paragraphDetailsFromServer){
    const paragraphId = paragraph.getAttribute("paragraphId");
    const paragraphTitle = paragraph.querySelector(".paragraph_title_and_status input").value;
    const paragraphStatus = paragraph.querySelector(".paragraph_title_and_status .status").textContent;
    const paragraphText = paragraph.querySelector("textarea").value;
    //const paragraphImage = paragraph.querySelector(".paragraph_image").src;
    //const paragraphVideo = paragraph.querySelector(".paragraph_video").src;

    return {
        id: paragraphId,
        newTitle: paragraphDetailsFromServer.newTitle,
        oldTitle: paragraphTitle,
        status: paragraphStatus,
        newText: paragraphDetailsFromServer.newText,
        oldText: paragraphText,
        newImage: paragraphDetailsFromServer.newImage,
        oldImage: paragraphDetailsFromServer.oldImage,
        newVideo: paragraphDetailsFromServer.newVideo,
        oldVideo: paragraphDetailsFromServer.oldVideo
    };
}

function changeToEditMode() {
    if(!collaborationMode.isEditModeReady)
        return;
    changeMode(true);
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

    updateCollaborationParagraphs(collaborationId, {paragraphs: newParagraphs}, collaborationMode);
    collaborationMode.isEditMode = false;
    changeMode(false);
}