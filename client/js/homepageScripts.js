window.onload = async () => {
    const collaborations = await getCollaborationsList();
    collaborations.forEach(async (collaboration) => {
        homePageCollaborationCardBuilder(collaboration)
            .then(collaboration_card => {
                document.getElementById("collaboration_cards_container").appendChild(collaboration_card);
            });
    });
}