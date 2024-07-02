async function populateFormBrandSelection() {
    const { domain } = await fetch("./data/settings.json").then((response) => response.json());
    const brands = await fetch(`${domain}/api/brand/`).then(response => response.json());

    const brandSelect = document.getElementById("collaborationBrandDataList");
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

    const developerSelect = document.getElementById("collaborationDeveloperDatalistOptions");
    developers.forEach(developer => {
        const option = document.createElement("option");
        option.value = developer.id;
        option.text = developer.name;
        developerSelect.appendChild(option);
    });
}

window.onload = async () => {
    const collaborations = await getCollaborationsList();
    collaborations.forEach(async (collaboration) => {
        homePageCollaborationCardBuilder(collaboration)
            .then(collaboration_card => {
                document.getElementById("collaboration_cards_container").appendChild(collaboration_card);
            });
    });

    populateFormBrandSelection();
    populateFormDeveloperSelection();

    const object_adder = document.getElementById("object_adder");
    object_adder.addEventListener("click", () => {
        const newCollaborationModal = new bootstrap.Modal('#newCollaborationModal', {})
        newCollaborationModal.show();
    });
}