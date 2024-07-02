window.onload = async () => {
    const collaborations = await getCollaborationsList();
    collaborations.forEach(async (collaboration) => {
        votePageCollaborationCardBuilder(collaboration)
            .then(collaboration_card => {
                const carousel_item_main = document.createElement("div");
                carousel_item_main.className = "carousel-item active";
                carousel_item_main.appendChild(collaboration_card);
                const carousel_item_left = carousel_item_main.cloneNode(true);
                const carousel_item_right = carousel_item_main.cloneNode(true);
                
                document.querySelector("#left_card_carousel .carousel-inner").appendChild(carousel_item_left);
                document.querySelector("#right_card_carousel .carousel-inner").appendChild(carousel_item_right);
                document.querySelector("#middle_card_carousel .carousel-inner").appendChild(carousel_item_main);

                // document.getElementById("collaboration_cards_container").appendChild(collaboration_card);
            });
    });

    const information_button = document.querySelector("#search_bar_container > img");
    information_button.addEventListener("click", () => {
        const newCollaborationModal = new bootstrap.Modal('#cardInformationModal', {})
        newCollaborationModal.show();
    });
}