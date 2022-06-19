const drawnImagesContainer = document.querySelector(".container__draw-image");
const addToCollectionBtn = document.querySelector("#add-to-collection-button");
const drawAnotherBtn = document.querySelector("#draw-another-button");
const removeAllSelectedBtn = document.querySelector(".container__collection-remove-selected");

const collectionElementsAmountOutput = document.querySelector("#collection-elements-amount");
const collectionImagesContainer = document.querySelector(".container__collection-images");
const collectionElementTemplate = document.querySelector(".container__collection-template");
const collectionImagePreviewOutput = document.querySelector(".container__draw-preview");

const usedIdNumbers = JSON.parse(localStorage.getItem("usedIdNumbers")) || [];

let drawnImageSource = "";
let collectionElementsAmount = localStorage.collectionElementsAmount || 0;
let currentCollectionElementImageSource = "";
let collectionElementId = 0;

//Initial state based on the local storage.
const setSavedElementsAmount = () => {
    collectionElementsAmountOutput.textContent = collectionElementsAmount;
};

const setSavedCollectionElements = () => {
    if (localStorage.collectionHTML === undefined) return;
    collectionImagesContainer.innerHTML = localStorage.collectionHTML;
};

setSavedElementsAmount();
setSavedCollectionElements();

const toggleLoader = (option) => {
    const loader = document.querySelector(".container__loader");
    if (option == "on") {
        loader.style.display = "block";
    } else {
        loader.style.display = "none";
    }
};

const setNewImageSource = () => {
    toggleLoader("on");
    fetch("https://api.thecatapi.com/v1/images/search")
        .then((response) => response.json())
        .then((data) => {
            drawnImageSource = data[0].url;
            drawnImagesContainer.style.backgroundImage = `url(${drawnImageSource})`;
            toggleLoader("off");
        });
};

//setNewImageSource();

const wasIdUsed = () => {
    if (isElementInCollection === true) return;
    const isIdInArray = () => {
        return usedIdNumbers.some((item) => item === collectionElementId);
    };

    while (isIdInArray() && usedIdNumbers !== 0) {
        collectionElementId++;
    }

    usedIdNumbers.push(collectionElementId);
    localStorage.setItem("usedIdNumbers", JSON.stringify(usedIdNumbers));
};

const addToCollection = () => {
    wasIdUsed();
    const collectionElement = collectionElementTemplate.content.cloneNode(true);
    collectionElement.querySelector(".container__collection-image").style.backgroundImage = `url("${drawnImageSource}")`;
    collectionElement.querySelector(".container__collection-image").setAttribute("id", collectionElementId);
    collectionElement
        .querySelector("#remove-image")
        .setAttribute("onclick", `event.stopPropagation(); removeCollectionElement(${collectionElementId});`);
    collectionElement
        .querySelector("#preview-image")
        .setAttribute("onclick", `event.stopPropagation(); previewCollectionImage("${drawnImageSource}");`);
    collectionElement
        .querySelector(".container__collection-image")
        .setAttribute("onclick", `markAsSelected(${collectionElementId})`);

    if (isElementInCollection() === false) {
        setCollectionElementsAmount();
        collectionImagesContainer.appendChild(collectionElement);
    } else {
        alert("You've already added this cat!");
    }

    saveCollectionToLocalStorage();
};

let selectedCollectionElements = [];

const markAsSelected = (collectionElementId) => {
    const selectedElement = document.getElementById(collectionElementId);
    if (selectedElement.style.border === "") {
        selectedElement.style.border = "4px solid var(--yellow-accent)";
        selectedCollectionElements.push(collectionElementId);
    } else {
        selectedElement.style.border = "";
        const afterDeselect = selectedCollectionElements.filter((item) => item !== collectionElementId);
        selectedCollectionElements = afterDeselect;
    }
    console.log(selectedCollectionElements);
    setRemoveSelectedButton();
};

const setRemoveSelectedButton = () => {
    if (selectedCollectionElements.length > 0) {
        removeAllSelectedBtn.style.display = "block";
    } else {
        removeAllSelectedBtn.style.display = "none";
    }
};

const removeAllSelected = () => {
    const confirmSelectedRemoval = confirm("Are you sure you want to remove all selected cats?");
    if (confirmSelectedRemoval) {
        selectedCollectionElements.forEach((element) => {
            removeSelectedCollectionElements(element);
        });
        selectedCollectionElements.length = 0;
        setRemoveSelectedButton();
    }
};

const isElementInCollection = () => {
    if (currentCollectionElementImageSource != `url("${drawnImageSource}")`) {
        currentCollectionElementImageSource = `url("${drawnImageSource}")`;
        collectionElementId++;
        collectionElementsAmount++;
        localStorage.collectionElementsAmount = collectionElementsAmount;
        return false;
    } else {
        return true;
    }
};

const removeSelectedCollectionElements = (collectionElementId) => {
    const collectionElementToRemove = document.getElementById(collectionElementId);
    collectionElementToRemove.remove();
    collectionElementsAmount--;
    localStorage.collectionElementsAmount = collectionElementsAmount;
    setCollectionElementsAmount();
    checkIfCanAddAgain(collectionElementToRemove);
    saveCollectionToLocalStorage();
    resetIfPossible();
};

const removeCollectionElement = (collectionElementId) => {
    const confirmSingleRemoval = confirm("Are you sure you want to remove this cat?");
    if (confirmSingleRemoval) {
        const collectionElementToRemove = document.getElementById(collectionElementId);
        collectionElementToRemove.remove();
        collectionElementsAmount--;
        localStorage.collectionElementsAmount = collectionElementsAmount;
        setCollectionElementsAmount();
        checkIfCanAddAgain(collectionElementToRemove);
        saveCollectionToLocalStorage();
        const afterDeselect = selectedCollectionElements.filter((item) => item !== collectionElementId);
        selectedCollectionElements = afterDeselect;
        setRemoveSelectedButton();

        resetIfPossible();
    }
};

const checkIfCanAddAgain = (collectionElementToRemove) => {
    if (collectionElementToRemove.style.backgroundImage == currentCollectionElementImageSource)
        currentCollectionElementImageSource = "";
};

const resetIfPossible = () => {
    if (collectionElementsAmount === 0) {
        usedIdNumbers.length = 0;
        collectionElementId = 0;
    }
};

const saveCollectionToLocalStorage = () => {
    localStorage.collectionHTML = collectionImagesContainer.innerHTML;
};

const previewCollectionImage = (drawnImageSource) => {
    collectionImagePreviewOutput.style.backgroundImage = `url("${drawnImageSource}")`;
};

const setCollectionElementsAmount = () => {
    collectionElementsAmountOutput.textContent = collectionElementsAmount;
};

removeAllSelectedBtn.addEventListener("click", removeAllSelected);
drawAnotherBtn.addEventListener("click", setNewImageSource);
addToCollectionBtn.addEventListener("click", () => {
    if (drawnImageSource === "") return;
    addToCollection();
});
