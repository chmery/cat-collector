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

// Initial state based on the local storage
const setSavedElementsAmount = () => (collectionElementsAmountOutput.textContent = collectionElementsAmount);

const setSavedCollectionElements = () => {
    if (localStorage.collectionHTML === undefined) return;
    collectionImagesContainer.innerHTML = localStorage.collectionHTML;
};

const toggleLoader = (option) => {
    const loader = document.querySelector(".container__loader");
    option === "on" ? (loader.style.display = "block") : (loader.style.display = "none");
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

const setUsedId = () => {
    if (elementInCollection()) return;
    const isIdUsed = () => usedIdNumbers.includes(collectionElementId);

    while (isIdUsed() && usedIdNumbers !== 0) {
        collectionElementId++;
    }

    usedIdNumbers.push(collectionElementId);
    localStorage.setItem("usedIdNumbers", JSON.stringify(usedIdNumbers));
};

const elementInCollection = () => currentCollectionElementImageSource === `url("${drawnImageSource}")`;

const addToCollection = () => {
    setUsedId();
    const collectionElement = collectionElementTemplate.content.cloneNode(true);

    const setBackgroundImage = () =>
        (collectionElement.querySelector(
            ".container__collection-image"
        ).style.backgroundImage = `url("${drawnImageSource}")`);

    const setCollectionElementId = () =>
        collectionElement.querySelector(".container__collection-image").setAttribute("id", collectionElementId);

    if (isElementInCollection()) {
        alert("You've already added this cat!");
    } else {
        setBackgroundImage();
        setCollectionElementId();
        collectionImagesContainer.appendChild(collectionElement);
    }

    saveCollectionToLocalStorage();
};

const isElementInCollection = () => {
    if (currentCollectionElementImageSource != `url("${drawnImageSource}")`) {
        currentCollectionElementImageSource = `url("${drawnImageSource}")`;
        collectionElementId++;
        collectionElementsAmount++;
        setCollectionElementsAmount();
        return false;
    } else {
        return true;
    }
};

let selectedCollectionElements = [];

const markElementAsSelected = (collectionElementId) => {
    const selectedElement = document.getElementById(collectionElementId);

    if (selectedElement.style.boxShadow) {
        selectedElement.style.boxShadow = "";
        removeIdFromArraySelected(collectionElementId);
    } else {
        selectedElement.style.boxShadow = "0px 0px 0px 4px #F9D252";
        selectedCollectionElements.push(collectionElementId);
    }
    toggleRemoveSelectedBtn();
};

const toggleRemoveSelectedBtn = () => {
    selectedCollectionElements.length > 0
        ? (removeAllSelectedBtn.style.display = "block")
        : (removeAllSelectedBtn.style.display = "none");
};

const removeAllSelected = () => {
    const confirmSelectedRemoval = confirm("Are you sure you want to remove all selected cats?");
    if (confirmSelectedRemoval) {
        selectedCollectionElements.forEach((element) => {
            removeCollectionElement(element);
        });
        selectedCollectionElements.length = 0;
        toggleRemoveSelectedBtn();
    }
};

const removeSingleElementById = (collectionElementId) => {
    const confirmRemoval = confirm("Are you sure you want to delete this cat?");
    if (confirmRemoval) removeCollectionElement(collectionElementId);
};

const removeCollectionElement = (collectionElementId) => {
    const collectionElementToRemove = document.getElementById(collectionElementId);
    removeElement(collectionElementToRemove);
    setCollectionElementsAmount();
    saveCollectionToLocalStorage();
    setAsNotInCollection(collectionElementToRemove);
    removeIdFromArraySelected(collectionElementId);
    toggleRemoveSelectedBtn();
    resetIfPossible();
};

const removeElement = (collectionElementToRemove) => {
    collectionElementToRemove.remove();
    collectionElementsAmount--;
};

const removeIdFromArraySelected = (collectionElementId) => {
    const afterDeselect = selectedCollectionElements.filter((item) => item !== collectionElementId);
    selectedCollectionElements = afterDeselect;
};

const setAsNotInCollection = (collectionElementToRemove) => {
    if (collectionElementToRemove.style.backgroundImage == currentCollectionElementImageSource)
        currentCollectionElementImageSource = "";
};

const resetIfPossible = () => {
    if (collectionElementsAmount === 0) {
        usedIdNumbers.length = 0;
        collectionElementId = 0;
    }
};

const saveCollectionToLocalStorage = () => (localStorage.collectionHTML = collectionImagesContainer.innerHTML);

const previewCollectionImage = (drawnImageSource) =>
    (collectionImagePreviewOutput.style.backgroundImage = `${drawnImageSource}`);

const setCollectionElementsAmount = () => {
    localStorage.collectionElementsAmount = collectionElementsAmount;
    collectionElementsAmountOutput.textContent = collectionElementsAmount;
};

removeAllSelectedBtn.addEventListener("click", removeAllSelected);
drawAnotherBtn.addEventListener("click", setNewImageSource);
addToCollectionBtn.addEventListener("click", () => {
    if (drawnImageSource === "") return;
    addToCollection();
});

collectionImagesContainer.addEventListener("click", (event) => {
    const element = event.target;
    const { tagName, className } = element;

    const classNames = {
        removeButtonClass: "container__btn container__collection-image-btn container__collection-image-btn--remove",
        removeIconClass: "container__remove-icon",
        containerClass: "container__collection-image",
    };

    const { removeButtonClass, removeIconClass, containerClass } = classNames;

    const closestContainer = element.closest(`.${containerClass}`);

    const elementContainerId = closestContainer.id;
    const elementContainerClass = closestContainer.className;
    const elementContainerImageSource = closestContainer.style.backgroundImage;

    if (tagName === "BUTTON" || tagName === "IMG") {
        if (className === removeButtonClass || className === removeIconClass) {
            removeSingleElementById(elementContainerId);
        } else {
            previewCollectionImage(elementContainerImageSource);
        }
    }

    if (elementContainerClass === containerClass && tagName === "DIV") {
        markElementAsSelected(elementContainerId);
    }
});

setSavedElementsAmount();
setSavedCollectionElements();
