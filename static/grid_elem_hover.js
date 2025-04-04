document.addEventListener('shown.bs.dropdown', function (event) {
    const dropdownMenu = event.target.closest('.dropdown').querySelector('.dropdown-menu');
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