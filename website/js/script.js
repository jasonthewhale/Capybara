const topSelector = document.querySelector(".top");
let isMoved = false;

topSelector.addEventListener("click", () => {
    if (!isMoved) {
        topSelector.style.transform = "translateX(50%) translateY(-50%)";
        isMoved = true;
    } else {
        topSelector.style.transform = "translateX(0) translateY(0)";
        isMoved = false;
    }
});
