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

function createCardTitleLogoSection(title, brandId, developerId) {
    const section = document.createElement("section");
    section.appendChild(createCollaborationCardTitle(title));
    getCollaborationLogos({brandId: brandId, developerId: developerId})
        .then(({developerLogo, brandLogo}) => {
            section.appendChild(createCollaborationCardLogos(developerLogo, brandLogo));
        });
    return section;
}

function createIconTextPair(iconSrc, text) {
    const iconTextPair = document.createElement("section");
    const img = document.createElement("img");
    img.src = iconSrc;
    img.alt = iconSrc.split("/").pop().split(".")[0];
    iconTextPair.appendChild(img);
    const span = document.createElement("span");
    span.textContent = text;
    iconTextPair.appendChild(span);
    return iconTextPair;
}

function createCollaborationCardDetails(upvoteAmount, downvoteAmount, aiReadabilityPercentage) {
    const collaborationCardDetails = document.createElement("section");
    collaborationCardDetails.className = "collaboration_card_details";
    if (upvoteAmount || upvoteAmount === 0) {
        const collaborationCardUpvote = createIconTextPair("./images/thumbs_up_black.svg", upvoteAmount);
        collaborationCardDetails.appendChild(collaborationCardUpvote);
    }

    if (downvoteAmount || downvoteAmount === 0) {
        const collaborationCardDownvote =  createIconTextPair("./images/thumbs_down_black.svg", downvoteAmount);
        collaborationCardDetails.appendChild(collaborationCardDownvote);
    }

    if (aiReadabilityPercentage || aiReadabilityPercentage === 0) {
        const collaborationCardAiReadability = createIconTextPair("./images/ai_icon.svg", `${aiReadabilityPercentage}%`);
        collaborationCardDetails.appendChild(collaborationCardAiReadability);
    }

    return collaborationCardDetails;
}

function createCollaborationCardDescription(description) {
    const section = document.createElement("section");
    const paragraph = document.createElement("p");
    paragraph.textContent = description;
    section.appendChild(paragraph);
    return section;
}

function createCollaborationCardStatus(status) {
    section = document.createElement("section");
    const span = document.createElement("span");
    span.textContent = `Status: ${status}`;
    section.appendChild(span);
    return section;
}

function createCollaborationCardCircularProgressBar(percentage) {
    if (percentage < 0)
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

function createCollaborationCardBrandReject(collaborationCard, id, title) {
    const rejectButton = document.createElement("button");
    rejectButton.className = "brand_reject_button";
    rejectButton.textContent = "Reject";

    rejectButton.addEventListener("click", async (event) => {
        event.stopPropagation();
        const updateCollaborationStatusModal = new bootstrap.Modal('#update_collaboration_status_modal', {})
        updateCollaborationStatusModal.show();
        document.querySelector("#update_collaboration_status_modal .modal-body").textContent = `Are you sure you want to reject\n "${title}"`;
        const rejectCollaborationFunc = async () => {
            await rejectCollaboration(id);
            collaborationCard.remove();
            updateCollaborationStatusModal.hide();
        }
        document.getElementById("update_collaboration_status_button").addEventListener("click", rejectCollaborationFunc);
        updateCollaborationStatusModal._element.addEventListener("hide.bs.modal", () => {
            document.getElementById("update_collaboration_status_button").removeEventListener("click", rejectCollaborationFunc);
        });
    });
    return rejectButton;
}

function createCollaborationCardBrandApprove(collaborationCard, id, title) {
    const approveButton = document.createElement("button");
    approveButton.className = "brand_approve_button";
    approveButton.textContent = "Approve";

    approveButton.addEventListener("click", async (event) => {
        event.stopPropagation();
        const updateCollaborationStatusModal = new bootstrap.Modal('#update_collaboration_status_modal', {})
        updateCollaborationStatusModal.show();
        document.querySelector("#update_collaboration_status_modal .modal-body").textContent = `Are you sure you want to approve\n "${title}"`;
        const approveCollaborationFunc = async () => {
            await approveCollaboration(id);
            collaborationCard.remove();
            updateCollaborationStatusModal.hide();
        }
        document.getElementById("update_collaboration_status_button").addEventListener("click", approveCollaborationFunc);
        updateCollaborationStatusModal._element.addEventListener("hide.bs.modal", () => {
            document.getElementById("update_collaboration_status_button").removeEventListener("click", approveCollaborationFunc);
        });
    });

    return approveButton;
}

function createCollaborationCardBrandButtons(collaborationCard, id, title) {
    const brandButtons = document.createElement("section");
    brandButtons.className = "brand_buttons";

    const rejectButton = createCollaborationCardBrandReject(collaborationCard, id, title);
    brandButtons.appendChild(rejectButton);

    const approveButton = createCollaborationCardBrandApprove(collaborationCard, id, title);
    brandButtons.appendChild(approveButton);

    return brandButtons;
}

function createCollaborationDeleteButton(collaborationCard, title, id) {
    const deleteImg = document.createElement("img");
    deleteImg.src = "./images/delete_icon_black.svg";
    deleteImg.alt = "delete_icon";
    deleteImg.addEventListener("click", (event) => {
        event.stopPropagation();
        const deleteModal = new bootstrap.Modal('#delete_collaboration_modal', {})
        if(!deleteModal)
            return;
        deleteModal.show();
        document.querySelector("#delete_collaboration_modal .modal-body").textContent = `Are you sure you want to delete\n ${title} collaboration`;
        const deleteCollaborationFunc = async () => {
            await deleteCollaboration(id);
            collaborationCard.remove();
            deleteModal.hide();
        }
        document.getElementById("delete_collaboration_button").addEventListener("click", deleteCollaborationFunc);
        deleteModal._element.addEventListener("hide.bs.modal", () => {
            document.getElementById("delete_collaboration_button").removeEventListener("click", deleteCollaborationFunc);
        });
    });
    return deleteImg;
}

function createCollaborationEditButton(id) {
    const editImg = document.createElement("img");
    editImg.src = "./images/edit_icon_black.svg";
    editImg.alt = "edit_icon";
    editImg.addEventListener("click", (event) => {
        event.stopPropagation();
        window.location.href = `./collaborationDetails.html?id=${id}&edit=true`;
    });
    return editImg;
}

async function homePageCollaborationCardBuilder(details) {
    const { id, title, description, upvote, downvote, status, aiReadability, brandId, developerId } = details;
    const collaborationCard = document.createElement("section");
    collaborationCard.className = "collaboration_card";

    const titleLogoSection = createCardTitleLogoSection(title, brandId, developerId);
    collaborationCard.appendChild(titleLogoSection);

    const collaborationCardDetails = createCollaborationCardDetails(upvote, downvote, aiReadability);
    collaborationCard.appendChild(collaborationCardDetails);

    const collaborationDescription = createCollaborationCardDescription(description);
    collaborationCard.appendChild(collaborationDescription);

    const collaborationStatusProgress = document.createElement("section");
    const collaborationCardStatus = createCollaborationCardStatus(status);
    collaborationStatusProgress.appendChild(collaborationCardStatus);
    getCollaborationThresholdPercentage(details).then(percentage => collaborationStatusProgress.appendChild(createCollaborationCardCircularProgressBar(percentage)));
    collaborationCard.appendChild(collaborationStatusProgress);

    const collaborationFooter = document.createElement("section");
    const lastEditSpan = document.createElement("span");
    getCollaborationEditLogs(details).then(logs => { lastEditSpan.textContent = `Last Edit: ${logs.length > 0 ? logs[logs.length - 1].date : "Never"}`; });
    collaborationFooter.appendChild(lastEditSpan);

    const lowerButtonSection = document.createElement("section");
    const deleteImg = createCollaborationDeleteButton(collaborationCard, title, id);
    lowerButtonSection.appendChild(deleteImg);
    const editImg = createCollaborationEditButton(id);
    lowerButtonSection.appendChild(editImg);

    collaborationFooter.appendChild(lowerButtonSection);
    collaborationCard.appendChild(collaborationFooter);

    collaborationCard.addEventListener("click", () => {
        window.location.href = `./collaborationDetails.html?id=${id}`;
    });

    return collaborationCard;
}

async function votePageCollaborationCardBuilder(details) {
    const { id, title, description, upvote, downvote, brandId, developerId } = details;
    const collaborationCard = document.createElement("section");
    collaborationCard.className = "collaboration_card";

    const titleLogoSection = createCardTitleLogoSection(title, brandId, developerId);
    collaborationCard.appendChild(titleLogoSection);

    const collaborationCardDetails = createCollaborationCardDetails(upvote, downvote);
    collaborationCard.appendChild(collaborationCardDetails);

    const collaborationDescription = createCollaborationCardDescription(description);
    collaborationCard.appendChild(collaborationDescription);

    const fourthSection = document.createElement("section");
    collaborationCard.appendChild(fourthSection);

    const fifthSection = document.createElement("section");
    collaborationCard.appendChild(fifthSection);

    collaborationCard.addEventListener("click", () => {
        window.location.href = `./collaborationDetails.html?id=${id}&fromPage=Vote&vote=true`;
    });

    return collaborationCard;
}

async function brandPageCollaborationCardBuilder(details) {
    const { id, title, description, upvote, downvote, brandId, developerId } = details;
    const collaborationCard = document.createElement("section");
    collaborationCard.className = "collaboration_card";

    const titleLogoSection = createCardTitleLogoSection(title, brandId, developerId);
    collaborationCard.appendChild(titleLogoSection);

    const collaborationCardDetails = createCollaborationCardDetails(upvote, downvote)
    collaborationCard.appendChild(collaborationCardDetails);
    getCollaborationThresholdPercentage(details).then(percentage => collaborationCardDetails.appendChild(createCollaborationCardCircularProgressBar(percentage)));

    const collaborationDescription = createCollaborationCardDescription(description);
    collaborationCard.appendChild(collaborationDescription);

    const collaborationBrandButtons = createCollaborationCardBrandButtons(collaborationCard, id, title);
    collaborationCard.appendChild(collaborationBrandButtons);

    const fifthSection = document.createElement("section");
    collaborationCard.appendChild(fifthSection);

    collaborationCard.addEventListener("click", () => {
        window.location.href = `./collaborationDetails.html?id=${id}&fromPage=Brand`;
    });

    return collaborationCard;
}