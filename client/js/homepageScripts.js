function createOptionElement(value, text) {
    const option = document.createElement("option");
    option.value = value;
    option.text = text;
    return option;
}

async function populateFormBrandSelection() {
    const brandsData = await Data.brands();
    const brandSelect = document.getElementById("collaborationBrandDataList");
    const defaultOption = createOptionElement("", "Select a brand");
    defaultOption.selected = true;
    defaultOption.disabled = true;
    brandSelect.appendChild(defaultOption);
    for (let brand of Object.values(brandsData)) {
        const option = createOptionElement(brand.id, brand.name);
        brandSelect.appendChild(option);
    }
}

async function populateFormDeveloperSelection() {
    const developersData = await Data.developers();
    const developerSelect = document.getElementById("collaborationDeveloperDataList");
    const defaultOption = createOptionElement("", "Select a developer");
    defaultOption.selected = true;
    defaultOption.disabled = true;
    developerSelect.appendChild(defaultOption);
    for (let developer of Object.values(developersData)) {
        const option = createOptionElement(developer.id, developer.name);
        developerSelect.appendChild(option);
    }
}

async function populateCollaborationContainer(){
    const collaborationCards = document.querySelectorAll(".collaboration_card");
    collaborationCards.forEach((card, index) => card.remove());

    const collaborations = await getCollaborationsList();
    collaborations.forEach(async (collaboration) => {
        homePageCollaborationCardBuilder(collaboration)
            .then(collaborationCard => {
                document.getElementById("collaboration_cards_container").appendChild(collaborationCard);
            });
    });

}

window.onload = async () => {
    const domain = await Settings.domain();
    const userId = await Settings.userId();
    const BrandData = await Data.brands();
    const DeveloperData = await Data.developers();
    populateCollaborationContainer();

    populateFormBrandSelection();
    populateFormDeveloperSelection();

    const brandSelect = document.getElementById("collaborationBrandDataList");
    brandSelect.addEventListener("change", async () => {
        const brandId = brandSelect.value;
        const brandImage = document.getElementById("collaborationBrandLogo");
        brandImage.src = BrandData[brandId].image;
    });

    const developerSelect = document.getElementById("collaborationDeveloperDataList");
    developerSelect.addEventListener("change", async () => {
        const developerId = developerSelect.value;
        const developerImage = document.getElementById("collaborationDeveloperLogo");
        developerImage.src = DeveloperData[developerId].image;
    });

    const object_adder = document.getElementById("object_adder");
    object_adder.addEventListener("click", () => {
        const newCollaborationModal = new bootstrap.Modal('#newCollaborationModal', {})
        newCollaborationModal.show();
    });

    const information_button = document.querySelector("#search_bar_container > img");
    information_button.addEventListener("click", () => {
        const newCollaborationModal = new bootstrap.Modal('#cardInformationModal', {})
        newCollaborationModal.show();
    });

    const newCollaborationForm = document.querySelector("#newCollaborationModal form");
    const createCollaborationButton = document.getElementById("createCollaborationButton");
    const cancelCollaborationCreationButton = document.getElementById("cancelCollaborationCreationButton");

    createCollaborationButton.addEventListener("click", async () => {
        document.querySelector("#newCollaborationModal form > input").click();
    });

    newCollaborationForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(newCollaborationForm);
        formData.append("userId", userId)
        const requestData = JSON.stringify(Object.fromEntries(formData));
        const response = await fetch(`${domain}/api/collaborations/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: requestData
        });

        if(response.status == 201){
            cancelCollaborationCreationButton.click();
            newCollaborationForm.reset();
            populateCollaborationContainer();
        }
    });
}