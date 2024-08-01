
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
}

async function populateDeveloperSelection() {
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
}

function invalidLoginDetails() {
    //set the username and password fields to have red border
    document.querySelector("#login_form #login_username").style.border = "1px solid red";
    document.querySelector("#login_form #login_password").style.border = "1px solid red";
}

async function loginUserForm(event) {
    event.preventDefault();
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
    });
}

function addListeners() {
    document.querySelector("#container_register_login #login_button").addEventListener("click", () => {
        document.querySelector("#login_form > input").click();
    });

    document.querySelector("#login_form").addEventListener("submit", loginUserForm);

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
    addListeners();
}