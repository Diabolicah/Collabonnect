function createCollaborationCardTitle(title) {
    const collaborationCardTitle = document.createElement("h2");
    collaborationCardTitle.textContent = title;
    return collaborationCardTitle;
}

function createCollaborationCardLogo(logo, altName) {
    const collaborationCardLogo = document.createElement("img");
    collaborationCardLogo.src = logo;
    collaborationCardLogo.alt = altName;
    return collaborationCardLogo;
}

function createCollaborationCardLogos(developerLogo, brandLogo) {
    const collaborationCardLogos = document.createElement("section");
    collaborationCardLogos.appendChild(createCollaborationCardLogo(developerLogo, "developer_image"));
    collaborationCardLogos.appendChild(createCollaborationCardLogo(brandLogo, "brand_image"));
    return collaborationCardLogos;
}

function createCollaborationCardDetails(upvoteAmount, downvoteAmount, aiReadabilityPercentage) {
    const collaborationCardDetails = document.createElement("section");
    collaborationCardDetails.className = "collaboration_card_details";
    if (upvoteAmount || upvoteAmount === 0) {
        const collaborationCardUpvote = document.createElement("section");
        const img = document.createElement("img");
        img.src = "./images/thumbs_up_black.svg";
        img.alt = "upvote_icon";
        collaborationCardUpvote.appendChild(img);
        const span = document.createElement("span");
        span.textContent = upvoteAmount;
        collaborationCardUpvote.appendChild(span);
        collaborationCardDetails.appendChild(collaborationCardUpvote);
    }

    if (downvoteAmount || downvoteAmount === 0) {
        const collaborationCardDownvote = document.createElement("section");
        const img = document.createElement("img");
        img.src = "./images/thumbs_down_black.svg";
        img.alt = "downvote_icon";
        collaborationCardDownvote.appendChild(img);
        const span = document.createElement("span");
        span.textContent = downvoteAmount;
        collaborationCardDownvote.appendChild(span);
        collaborationCardDetails.appendChild(collaborationCardDownvote);
    }

    if (aiReadabilityPercentage || aiReadabilityPercentage === 0) {
        const collaborationCardAiReadability = document.createElement("section");
        const img = document.createElement("img");
        img.src = "./images/ai_icon.svg";
        img.alt = "ai_icon";
        collaborationCardAiReadability.appendChild(img);
        const span = document.createElement("span");
        span.textContent = `${collaborationCardAiReadability}%`;
        collaborationCardAiReadability.appendChild(span);
        collaborationCardDetails.appendChild(collaborationCardAiReadability);
    }

    return collaborationCardDetails;
}

function createCollaborationCardCircularProgressBar(percentage) {
    if (percentage <= 0)
        return null;
    if (percentage > 100)
        percentage = 100;
    const section = document.createElement("section");
    section.className = "circular_progress_bar";
    section.role = "progressbar";
    updateCircularProgressBar(section, percentage)

    const span = document.createElement("span");
    span.textContent = `${percentage}`;
    section.appendChild(span);

    return section;
}

function createCollaborationCardBrandButtons() {
    const brandButtons = document.createElement("section");
    brandButtons.className = "brand_buttons";

    const rejectButton = document.createElement("button");
    rejectButton.className = "brand_reject_button";
    rejectButton.textContent = "Reject";
    brandButtons.appendChild(rejectButton);

    const approveButton = document.createElement("button");
    approveButton.className = "brand_approve_button";
    approveButton.textContent = "Approve";
    brandButtons.appendChild(approveButton);

    return brandButtons;
}

async function homePageCollaborationCardBuilder(details) {
    const { id, title, description, upvote, downvote, status, aiReadability } = details;
    const collaborationCard = document.createElement("section");
    collaborationCard.className = "collaboration_card";

    const firstSection = document.createElement("section");
    firstSection.appendChild(createCollaborationCardTitle(title));
    getCollaborationLogos({brandId: details.brandId, developerId: details.developerId})
        .then(({developerLogo, brandLogo}) => {
            firstSection.appendChild(createCollaborationCardLogos(developerLogo, brandLogo));
        });
        collaborationCard.appendChild(firstSection);

        collaborationCard.appendChild(createCollaborationCardDetails(upvote, downvote, aiReadability));

    const thirdSection = document.createElement("section");
    const descriptionParagraph = document.createElement("p");
    descriptionParagraph.textContent = description;
    thirdSection.appendChild(descriptionParagraph);
    collaborationCard.appendChild(thirdSection);

    const fourthSection = document.createElement("section");
    const collaborationCardStatus = document.createElement("section");
    const statusSpan = document.createElement("span");
    statusSpan.textContent = `Status: ${status}`;
    collaborationCardStatus.appendChild(statusSpan);
    fourthSection.appendChild(collaborationCardStatus);

    getCollaborationThresholdPercentage(details)
        .then(percentage => {
            const circularProgressBar = createCollaborationCardCircularProgressBar(percentage);
            fourthSection.appendChild(circularProgressBar);
        });
    collaborationCard.appendChild(fourthSection);

    const fifthSection = document.createElement("section");
    const lastEditSpan = document.createElement("span");
    getCollaborationEditLogs(details)
        .then(logs => {
            if (logs.length > 0)
                lastEditSpan.textContent = `Last Edit: ${logs[logs.length - 1].date}`;
            else
            lastEditSpan.textContent = `Last Edit: Never`;
        });
        fifthSection.appendChild(lastEditSpan);

    const lowerButtonSection = document.createElement("section");
    const deleteImg = document.createElement("img");
    deleteImg.src = "./images/delete_icon_black.svg";
    deleteImg.alt = "delete_icon";
    lowerButtonSection.appendChild(deleteImg);

    const editImg = document.createElement("img");
    editImg.src = "./images/edit_icon_black.svg";
    editImg.alt = "edit_icon";
    lowerButtonSection.appendChild(editImg);

    fifthSection.appendChild(lowerButtonSection);
    collaborationCard.appendChild(fifthSection);

    collaborationCard.addEventListener("click", () => {
        window.location.href = `./objectDetails.html?id=${id}`;
    });

    editImg.addEventListener("click", (event) => {
        event.stopPropagation();
        window.location.href = `./objectDetails.html?id=${id}&edit=true`;
    });

    deleteImg.addEventListener("click", (event) => {
        event.stopPropagation();
        const deleteModal = new bootstrap.Modal('#deleteCollaborationModal', {})
        deleteModal.show();
        document.querySelector("#deleteCollaborationModal .modal-body").textContent = `Are you sure you want to delete\n ${title} collaboration`;
        const deleteCollaborationFunc = async () => {
            await deleteCollaboration(id);
            collaborationCard.remove();
            deleteModal.hide();
        }
        document.getElementById("deleteCollaborationButton").addEventListener("click", deleteCollaborationFunc);

        deleteModal._element.addEventListener("hide.bs.modal", () => {
            document.getElementById("deleteCollaborationButton").removeEventListener("click", deleteCollaborationFunc);
        });
    });

    return collaborationCard;
}

async function votePageCollaborationCardBuilder(details) {
    const { id, title, description, upvote, downvote, status, aiReadability } = details;
    const collaborationCard = document.createElement("section");
    collaborationCard.className = "collaboration_card";

    const firstSection = document.createElement("section");
    firstSection.appendChild(createCollaborationCardTitle(title));
    getCollaborationLogos({brandId: details.brandId, developerId: details.developerId})
        .then(({developerLogo, brandLogo}) => {
            firstSection.appendChild(createCollaborationCardLogos(developerLogo, brandLogo));
        });
        collaborationCard.appendChild(firstSection);

        collaborationCard.appendChild(createCollaborationCardDetails(upvote, downvote));

    const thirdSection = document.createElement("section");
    const descriptionParagraph = document.createElement("p");
    descriptionParagraph.textContent = description;
    thirdSection.appendChild(descriptionParagraph);
    collaborationCard.appendChild(thirdSection);

    const fourthSection = document.createElement("section");
    collaborationCard.appendChild(fourthSection);

    const fifthSection = document.createElement("section");
    collaborationCard.appendChild(fifthSection);

    collaborationCard.addEventListener("click", () => {
        window.location.href = `./objectDetails.html?id=${id}&fromPage=Vote&vote=true`;
    });

    return collaborationCard;
}

async function brandPageCollaborationCardBuilder(details) {
    const { id, title, description, upvote, downvote, status, aiReadability } = details;
    const collaborationCard = document.createElement("section");
    collaborationCard.className = "collaboration_card";

    const firstSection = document.createElement("section");
    firstSection.appendChild(createCollaborationCardTitle(title));
    getCollaborationLogos({brandId: details.brandId, developerId: details.developerId})
        .then(({developerLogo, brandLogo}) => {
            firstSection.appendChild(createCollaborationCardLogos(developerLogo, brandLogo));
        });
        collaborationCard.appendChild(firstSection);

    const secondSection = createCollaborationCardDetails(upvote, downvote)
    collaborationCard.appendChild(secondSection);

    getCollaborationThresholdPercentage(details)
    .then(percentage => {
        const circularProgressBar = createCollaborationCardCircularProgressBar(percentage);
        if (circularProgressBar)
            secondSection.appendChild(circularProgressBar);
    });

    const thirdSection = document.createElement("section");
    const descriptionParagraph = document.createElement("p");
    descriptionParagraph.textContent = description;
    thirdSection.appendChild(descriptionParagraph);
    collaborationCard.appendChild(thirdSection);

    const fourthSection = createCollaborationCardBrandButtons();
    collaborationCard.appendChild(fourthSection);

    const fifthSection = document.createElement("section");
    collaborationCard.appendChild(fifthSection);

    collaborationCard.addEventListener("click", () => {
        window.location.href = `./objectDetails.html?id=${id}&fromPage=Brand`;
    });

    //Add event listeners to the buttons
    const rejectButton = collaborationCard.querySelector(".brand_reject_button");
    const approveButton = collaborationCard.querySelector(".brand_approve_button");
    rejectButton.addEventListener("click", async (event) => {
        event.stopPropagation();
        const updateCollaborationStatusModal = new bootstrap.Modal('#updateCollaborationStatusModal', {})
        updateCollaborationStatusModal.show();
        document.querySelector("#updateCollaborationStatusModal .modal-body").textContent = `Are you sure you want to reject\n "${title}"`;
        const rejectCollaborationFunc = async () => {
            await rejectCollaboration(id);
            collaborationCard.remove();
            updateCollaborationStatusModal.hide();
        }
        document.getElementById("updateCollaborationStatusButton").addEventListener("click", rejectCollaborationFunc);
        updateCollaborationStatusModal._element.addEventListener("hide.bs.modal", () => {
            document.getElementById("updateCollaborationStatusButton").removeEventListener("click", rejectCollaborationFunc);
        });
    });

    approveButton.addEventListener("click", async (event) => {
        event.stopPropagation();
        const updateCollaborationStatusModal = new bootstrap.Modal('#updateCollaborationStatusModal', {})
        updateCollaborationStatusModal.show();
        document.querySelector("#updateCollaborationStatusModal .modal-body").textContent = `Are you sure you want to approve\n "${title}"`;
        const approveCollaborationFunc = async () => {
            await approveCollaboration(id);
            collaborationCard.remove();
            updateCollaborationStatusModal.hide();
        }
        document.getElementById("updateCollaborationStatusButton").addEventListener("click", approveCollaborationFunc);
        updateCollaborationStatusModal._element.addEventListener("hide.bs.modal", () => {
            document.getElementById("updateCollaborationStatusButton").removeEventListener("click", approveCollaborationFunc);
        });
    });

    return collaborationCard;
}