async function populateFormBrandSelection() {
    const { domain } = await fetch("./data/settings.json").then((response) => response.json());
    const brands = await fetch(`${domain}/api/brand/`).then(response => response.json());

    const brandSelect = document.getElementById("collaborationBrandDataList");
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.text = "Select a brand";
    defaultOption.selected = true;
    defaultOption.disabled = true;
    brandSelect.appendChild(defaultOption);
    brands.forEach(brand => {
        const option = document.createElement("option");
        option.value = brand.id;
        option.text = brand.name;
        brandSelect.appendChild(option);
    });
}

async function populateFormDeveloperSelection() {
    const { domain } = await fetch("./data/settings.json").then((response) => response.json());
    const developers = await fetch(`${domain}/api/developer/`).then(response => response.json());

    const developerSelect = document.getElementById("collaborationDeveloperDataList");
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.text = "Select a developer";
    defaultOption.selected = true;
    defaultOption.disabled = true;
    developerSelect.appendChild(defaultOption);
    developers.forEach(developer => {
        const option = document.createElement("option");
        option.value = developer.id;
        option.text = developer.name;
        developerSelect.appendChild(option);
    });
}

async function populateCollaborationContainer(){
    //Reset the container before populating except for the first card
    const collaborationCards = document.querySelectorAll(".collaboration_card");
    collaborationCards.forEach((card, index) => card.remove());

    const collaborations = await getCollaborationsList();
    collaborations.forEach(async (collaboration) => {
        homePageCollaborationCardBuilder(collaboration)
            .then(collaboration_card => {
                document.getElementById("collaboration_cards_container").appendChild(collaboration_card);
            });
    });

}

window.onload = async () => {
    populateCollaborationContainer();

    populateFormBrandSelection();
    populateFormDeveloperSelection();

    const brandSelect = document.getElementById("collaborationBrandDataList");
    brandSelect.addEventListener("change", async () => {
        const brandId = brandSelect.value;
        const { domain } = await fetch("./data/settings.json").then((response) => response.json());
        const brand = await fetch(`${domain}/api/brand/${brandId}`).then(response => response.json());
        const brandImage = document.getElementById("collaborationBrandLogo");
        brandImage.src = `${domain}/assets/brand_images/${brand?.image_name}`;
    });

    const developerSelect = document.getElementById("collaborationDeveloperDataList");
    developerSelect.addEventListener("change", async () => {
        const developerId = developerSelect.value;
        const { domain } = await fetch("./data/settings.json").then((response) => response.json());
        const developer = await fetch(`${domain}/api/developer/${developerId}`).then(response => response.json());
        const developerImage = document.getElementById("collaborationDeveloperLogo");
        developerImage.src = `${domain}/assets/developer_images/${developer?.image_name}`;
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
        const { domain, user_id} = await fetch("./data/settings.json").then((response) => response.json());
        formData.append("user_id", user_id)
        const requestData = JSON.stringify(Object.fromEntries(formData));
        const response = await fetch(`${domain}/api/collaboration/`, {
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