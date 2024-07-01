let user_id, domain;



async function getObjectDetailsFromServer(){
    const urlParams = new URLSearchParams(window.location.search);
    const collaborationId = urlParams.get("id");
    await fetch(`${domain}/api/collaboration/${collaborationId}`)
        .then(response => {
            if(response.status == 200)
                return response.json();
            else if(response.status == 404){
                window.location.replace("./index.html");
            }
        })
        .then(initObjectDetails);
}

window.onload = async () => {
    await fetch("./data/settings.json")
        .then((response) => response.json())
        .then(data => {
            user_id = data.user_id;
            domain = data.domain;
        });
    getObjectDetailsFromServer();
}