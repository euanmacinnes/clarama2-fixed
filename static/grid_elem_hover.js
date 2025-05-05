document.addEventListener('shown.bs.dropdown', function (event) {
    const dropdown = event.target.closest('.dropdown');
    if (!dropdown) return;

    const gridStackItem = dropdown.closest('.grid-stack-item');
    if (!gridStackItem) {
        console.log('Grid Stack Item not found');
        return;
    } 

    // console.log("found grid-stack-item", gridStackItem)

    const triggerIcon = event.relatedTarget;
    // console.log(triggerIcon)
    const elems = triggerIcon?.getAttribute('elems');
    const data = window[elems + "elements"];
    const target = triggerIcon?.getAttribute('target');
    if (!data || !target) return;
    
    const selectElement = dropdown.querySelector('#add_content_interactions-' + target);

    if (selectElement) {
        selectElement.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.textContent = 'Add';
        defaultOption.selected = true;
        defaultOption.disabled = true;
        selectElement.appendChild(defaultOption);

        let hasOptions = false;

        const targetLinks = data[target]?.links || [];
        for (const [elem, value] of Object.entries(data)) {
            if (elem === target) continue;
            if (targetLinks.includes(elem)) continue;
            const option = document.createElement('option');
            // option.className = "slate-elem-dropdown-item";
            option.value = elem;
            option.setAttribute('elem-id', target);
            option.innerHTML = value['url'];
            option.addEventListener('click', () => link_elements(target, elem));
            selectElement.appendChild(option);
            hasOptions = true;
        }

        document.getElementById("grid-menu-select-"+target).style.display = hasOptions ? 'flex' : 'none';
    }
    
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

$(document).on('click', '.grid-interaction-add', function (e) {
    e.stopPropagation();

    const select = $(this).siblings('select').get(0); 
    if (!select) {
        console.log('No select sibling found');
        return;
    }

    const selectedValue = select.value;
    const gelem_target = $(this).closest('.dropdown-item').attr('target');
    if (!gelem_target) {
        console.log('No target found');
        return;
    }

    if (selectedValue && selectedValue !== 'Add') {
        link_elements(gelem_target, selectedValue);
        let grid_element_target = $(this).closest('div').parent().siblings('#grid_element_target-'+gelem_target);
        grid_element_target[0].appendChild(addGridInteraction(gelem_target, selectedValue));
        enable_interactions($("#grid_element_target-" + gelem_target));
        select.selectedIndex = 0; 
    }
});

$(document).on('click', '.delete-grid-interaction', function () {
    $(this).closest('li').remove();
});

function addGridInteraction(gelem_target, selectedValue) {
    const newGI = document.createElement("div");
    newGI.className = "clarama-post-embedded clarama-replaceable";
    newGI.setAttribute("url", `/template/render/explorer/steps/grid_edit_interaction?element=${selectedValue}&target=${gelem_target}`);
    return newGI;
}