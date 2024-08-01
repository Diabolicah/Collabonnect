
function createOptionElement(value, text) {
    const option = document.createElement("option");
    option.value = value;
    option.text = text;
    return option;
}

async function populateBrandSelection() {
    const brandsData = await Data.brands();
    const brandsSelect = document.getElementById("brand_data_list");
    const defaultOption = createOptionElement("", "Select a brand");
    defaultOption.selected = true;
    defaultOption.disabled = true;
    brandsSelect.appendChild(defaultOption);
    for (let brand in brandsData) {
        const option = createOptionElement(brand, brandsData[brand].name);
        brandsSelect.appendChild(option);
    }

    brandsSelect.addEventListener("change", async (event) => {
        const selectedBrand = event.target.value;
        const brandImage = document.getElementById("brand_image");
        brandImage.src = brandsData[selectedBrand].image;
    });
}

async function populateDeveloperSelection() {
    const domain = await Settings.domain();
    const developersData = await Data.developers();
    const developersSelect = document.getElementById("developer_data_list");
    const defaultOption = createOptionElement("", "Select a developer");
    defaultOption.selected = true;
    defaultOption.disabled = true;
    developersSelect.appendChild(defaultOption);
    for (let developer in developersData) {
        const option = createOptionElement(developer, developersData[developer].name);
        developersSelect.appendChild(option);
    }

    developersSelect.addEventListener("change", async (event) => {
        const selectedDeveloper = event.target.value;
        const developerImage = document.getElementById("developer_image");
        developerImage.src = developersData[selectedDeveloper].image;
    });
}

async function populateProfileImagesSelection() {
    const domain = await Settings.domain();
    const profileImagesData = await fetch(`${domain}/api/users/images`).then(response => response.json());
    const profileImagesSelect = document.getElementById("profile_image_data_list");
    const defaultOption = createOptionElement("", "Select a profile image");
    defaultOption.selected = true;
    defaultOption.disabled = true;
    profileImagesSelect.appendChild(defaultOption);

    for (let profileImage in profileImagesData) {
        const option = createOptionElement(profileImagesData[profileImage], profileImagesData[profileImage]);
        profileImagesSelect.appendChild(option);
    }

    profileImagesSelect.addEventListener("change", async (event) => {
        const selectedProfileImage = event.target.value;
        const profileImage = document.getElementById("profile_image");
        profileImage.src = `${domain}/assets/profileImages/${selectedProfileImage}`;
    });
}

function invalidLoginDetails() {
    document.querySelector("#login_form #login_username").style.border = "1px solid red";
    document.querySelector("#login_form #login_password").style.border = "1px solid red";
}

function invalidRegisterDetails() {
    document.querySelector("#register_form #register_username").style.border = "1px solid red";
}

let loginDebounce = false;
async function loginUserForm(event) {
    event.preventDefault();
    if (loginDebounce) {
        return;
    }
    loginDebounce = true;
    const formData = new FormData(document.querySelector("#login_form"));
    const domain = await Settings.domain();

    const requestData = JSON.stringify(Object.fromEntries(formData));
    fetch(`${domain}/api/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: requestData
    }).then(response => {
        if (response.status == 200) {
            response.json().then(data => {
                sessionStorage.setItem("userAccessToken", data.userAccessToken)
                window.location.href = "./index.html";
            });
        }else {
            invalidLoginDetails();
        }
        loginDebounce = false;
    });
}

let registerDebounce = false;
async function registerUserForm(event) {
    event.preventDefault();
    if (registerDebounce) {
        return;
    }
    registerDebounce = true;
    const formData = new FormData(document.querySelector("#register_form"));
    const domain = await Settings.domain();

    const requestData = Object.fromEntries(formData);

    if (!document.querySelectorAll("#register_form .form-check-input")[0].checked) {
        requestData.brand = null;
    }
    if (!document.querySelectorAll("#register_form .form-check-input")[1].checked) {
        requestData.developer = null;
    }
    fetch(`${domain}/api/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    }).then(response => {
        if (response.status == 201) {
            response.json().then(data => {
                sessionStorage.setItem("userAccessToken", data.userAccessToken)
                window.location.href = "./index.html";
            });
        }else {
            invalidRegisterDetails();
        }
        registerDebounce = false;
    });
}

function clickLoginFormatSubmit(){
    document.querySelector("#login_form > input").click();
}

function clickRegisterFormatSubmit(){
    document.querySelector("#register_form > input").click();
}

function loginMode(){
    document.querySelector("#container_loginDetails #login_form").style.display = "block";
    document.querySelector("#container_loginDetails #register_form").style.display = "none";
    const leftButton = document.querySelector("#container_register_login #register_button");
    const rightButton = document.querySelector("#container_register_login #login_button");
    leftButton.innerHTML = "Register";
    leftButton.removeEventListener("click", loginMode);
    rightButton.innerHTML = "Login";
    rightButton.removeEventListener("click", clickRegisterFormatSubmit);

    leftButton.addEventListener("click", registerMode);
    rightButton.addEventListener("click", clickLoginFormatSubmit);
}

function registerMode(){
    document.querySelector("#container_loginDetails #login_form").style.display = "none";
    document.querySelector("#container_loginDetails #register_form").style.display = "block";
    const leftButton = document.querySelector("#container_register_login #register_button");
    const rightButton = document.querySelector("#container_register_login #login_button");
    leftButton.innerHTML = "Cancel";
    leftButton.removeEventListener("click", registerMode);
    rightButton.innerHTML = "Register";
    rightButton.removeEventListener("click", clickLoginFormatSubmit);

    leftButton.addEventListener("click", loginMode);
    rightButton.addEventListener("click", clickRegisterFormatSubmit);

}

function addListeners() {
    document.querySelector("#container_register_login #login_button").addEventListener("click", clickLoginFormatSubmit);
    document.querySelector("#login_form").addEventListener("submit", loginUserForm);
    document.querySelector("#register_form").addEventListener("submit", registerUserForm);

    document.querySelector("#container_register_login #register_button").addEventListener("click",registerMode);

    document.querySelectorAll("#register_form .form-check-input")[0].addEventListener("click", () => {
        document.querySelector("#register_form #select_brand").style.display = document.querySelectorAll("#register_form .form-check-input")[0].checked ? "block" : "none";
    });
    document.querySelectorAll("#register_form .form-check-input")[1].addEventListener("click", () => {
        document.querySelector("#register_form #select_developer").style.display = document.querySelectorAll("#register_form .form-check-input")[1].checked ? "block" : "none";
    });

}

window.onload = async () => {
    populateBrandSelection();
    populateDeveloperSelection();
    populateProfileImagesSelection();
    addListeners();
}