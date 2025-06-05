document.addEventListener('shown.bs.dropdown', function (event) {
    const dropdown = event.target.closest('.dropdown');
    if (!dropdown) return;

    const dropdownMenu = dropdown.querySelector('.dropdown-menu');
    if (!dropdownMenu) return;
    const items = dropdownMenu.querySelectorAll('.slate-elem-dropdown-item');
    items.forEach(item => {
        item.addEventListener('mouseover', () => {
            const elemId = item.getAttribute('elem-id');
            const targetDiv = document.querySelector(`div[id='${elemId}']`);
            if (targetDiv) targetDiv.classList.add('highlight');
        });
        item.addEventListener('mouseout', () => {
            const elemId = item.getAttribute('elem-id');
            const targetDiv = document.querySelector(`div[id='${elemId}']`);
            if (targetDiv) targetDiv.classList.remove('highlight');
        });
    });
});

$(document).on('click', '.delete-grid-interaction', function () {
    $(this).closest('li').remove();
});

function addGridInteraction(gelem_target, selectedValue, selectedValueUrl, loopIndex, urlParams) {
    const newGI = document.createElement("div");
    newGI.className = "clarama-post-embedded clarama-replaceable";
    newGI.setAttribute("url", `/template/render/explorer/steps/grid_edit_interaction?current_element=${selectedValue}&target=${gelem_target}&current_element_url=${selectedValueUrl}&loop_index=${loopIndex}&current_element_params=${urlParams}`);
    return newGI;
}