document.addEventListener('shown.bs.dropdown', function (event) {
    const dropdown = event.target.closest('.dropdown');
    if (!dropdown) return;
    const triggerIcon = event.relatedTarget;
    const elements = triggerIcon?.getAttribute('elems');
    const target = triggerIcon?.getAttribute('target');
    if (!elements || !target) return;
    let data;
    try {
        const jsonStr = elements.replace(/'/g, '"');
        data = JSON.parse(jsonStr);
    } catch (err) {
        console.error("Invalid JSON in 'elems':", err);
        return;
    }
    
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
            option.className = "slate-elem-dropdown-item";
            option.value = elem;
            option.setAttribute('elem-id', target);
            option.innerHTML = value['url'];
            option.addEventListener('click', () => link_elements(target, elem));
            selectElement.appendChild(option);
            hasOptions = true;
        }

        console.log("hasOptions", hasOptions)
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

// $('.bi-plus-circle').on('click', function () {
//     const select = $(this).siblings('select').get(0); // Get the sibling <select> element
//     const selectedValue = select.value;
//     const target = $(this).closest('.dropdown-item').attr('id').split('-')[2]; // Get the target from the parent div id
//     console.log("target aaa", target)
//     if (selectedValue && selectedValue !== 'Add') {
//         console.log("target", target);
//         console.log("selectedValue", selectedValue);
//         link_elements(target, selectedValue);
//         select.selectedIndex = 0; // Reset the select element
//     }
//  });

$(document).on('click', '.grid-interaction-add', function (e) {
    e.stopPropagation();

    const select = $(this).siblings('select').get(0); 
    if (!select) {
        console.log('No select sibling found');
        return;
    }

    const selectedValue = select.value;
    const target = $(this).closest('.dropdown-item').attr('target');
    if (!target) {
        console.log('No target found');
        return;
    }

    if (selectedValue && selectedValue !== 'Add') {
        link_elements(target, selectedValue);
        // let grid_element_target = $(this).closest('div').parent().siblings('#grid_element_target-'+target);
        // console.log("grid_element_target", grid_element_target[0])
        // grid_element_target[0].appendChild(addGridInteraction());
        // enable_interactions($("#grid_element_target-"+target)); // This loads the URL defined in the DIV
        select.selectedIndex = 0; 
    }
});

function addGridInteraction() {
    const newSG = document.createElement("div");
    newSG.className = "clarama-replaceable"; // clarama-replaceable means that the div itself gets replaced.
    newSG.setAttribute("url", `/template/render/explorer/steps/grid_edit_interaction`);
    return newSG;
}

document.querySelectorAll('.slate-elem-dropdown-item').forEach(item => {
    item.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', this.getAttribute('elem-id'));
        e.dropEffect = 'move';
    });
});