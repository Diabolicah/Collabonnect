function filterCollaborationsOnSearch(event){
    const searchInput = event.target
    const collaborationCards = document.querySelectorAll(".collaboration_card");
    collaborationCards.forEach((card) => {
        const collaborationName = card.querySelector("h2").textContent;
        if(collaborationName.toLowerCase().includes(searchInput.value.toLowerCase())){
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}