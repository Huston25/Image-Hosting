document.addEventListener('DOMContentLoaded', () => {

    const fileListWrapper = document.getElementById('file-list-wrapper');
    const uploadRedirectButton = document.getElementById('upload__tab-btn');
    const fileUpload = document.getElementById('file-upload');
    const imagesButton = document.getElementById('images-tab-btn');
    const dropzone = document.querySelector('.upload__dropzone');
    const currentUploadInput = document.querySelector('.upload__input');
    const copyButton = document.querySelector('.upload__copy');
    const imagesTab = document.getElementById('images-tab-btn');
    const uploadTab = document.getElementById('upload__tab-btn');
    const uploadForm = document.getElementById('upload-form');
    const filesWrapper = document.getElementById('file-list-wrapper');
    const prompt = document.querySelector('.no__content__prompt');
    const filesContainer = document.querySelector('.file-list-container');


    const updateTabStyles = (isImagesPage) => {
        """Manage tab switching between upload and images views"""
        if (isImagesPage) {
            uploadTab.classList.remove('upload__tab--active');
            imagesTab.classList.add('upload__tab--active');
            uploadForm.style.display = 'none';
            filesWrapper.style.display = 'flex';
            
            // Загружаем изображения при переключении на вкладку Images
            displayFiles(1, 10);
        } else {
            imagesTab.classList.remove('upload__tab--active');
            uploadTab.classList.add('upload__tab--active');
            uploadForm.style.display = 'flex';
            filesWrapper.style.display = 'none';
            
            // Удаляем пагинацию при переключении на вкладку Upload
            const existingPaginations = document.querySelectorAll('nav[aria-label="Images pagination"]');
            existingPaginations.forEach(p => p.remove());
        }
    };
    imagesTab.addEventListener('click', () => {
        updateTabStyles(true);
    })
    uploadTab.addEventListener('click', () => {
        updateTabStyles(false);
    })




    async function displayFiles(page, pageSize){
        """Fetch and render images with pagination"""
        console.log('displayFiles called with page:', page, 'pageSize:', pageSize); // Отладка

        const result = await fetch(`/get_images/?page=${page}&page_size=${pageSize}`)
        const data = await result.json();
        console.log('Ответ от сервера:', data);

        if (!data.images || !Array.isArray(data.images)) {
            console.error('Ожидался массив изображений, но сервер вернул:', data);
            return;
        }

        const images = data.images;
        const totalCount = data.total;

        if (images.length !== 0) {
            prompt.style.display = 'none';
            filesContainer.style.display = 'grid';

            const list = document.getElementById('file-list');
            list.innerHTML = '';

            images.forEach((fileData, index) => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-list-item';
                fileItem.innerHTML = `
                    <div class="file-list-ite">
                        <img class="card-img" src="/images/${fileData.filename}" alt="${fileData.original_name}">
                        <div class="card-info">
                            <div class="card-name">${fileData.original_name}</div>
                            <div class="card-meta">${fileData.size} KB • ${fileData.date} • ${fileData.type}</div>
                        </div>     
                        <div class="card-actions">
                            <a target="_blank" href="/images/${fileData.filename}" class="card-link">Open</a>
                            <button class="delete-btn" data-filename="${fileData.filename}">
                                <img class="delete-img" src="/static/Photo/delete.png"></button>
                        </div>
                        
                    </div>   
                `;



                list.appendChild(fileItem);
            });

            const icons = document.querySelectorAll('.file-list-item');
            icons.forEach(icon => {
                icon.addEventListener('mouseover', () => {
                    icon.style.transform = 'scale(1.5)';
                    icon.style.zIndex = '10';
                })
                icon.addEventListener('mouseout', () => {
                    icon.style.transform = 'scale(1)';
                    icon.style.zIndex = '';
                })
            })




            filesContainer.appendChild(list);
            fileListWrapper.appendChild(filesContainer);
        }
        else{
            filesContainer.style.display = 'none';
            prompt.style.display = 'flex';
            prompt.textContent = 'No images uploaded yet.';
        }
        
        // Генерируем пагинацию через JS только для вкладки Images
        if (totalCount > 0) {
            generatePagination();
            const totalPages = Math.ceil(totalCount / pageSize);
            renderPagination(page, totalPages);
        } else {
            // Удаляем пагинацию если нет изображений
            const existingPaginations = document.querySelectorAll('nav[aria-label="Images pagination"]');
            existingPaginations.forEach(p => p.remove());
        }
    };

    function generatePagination() {
        """Create pagination controls dynamically"""
        // Удаляем существующую пагинацию (все экземпляры)
        const existingPaginations = document.querySelectorAll('nav[aria-label="Images pagination"]');
        existingPaginations.forEach(p => p.remove());
        
        // Создаем новую только если есть filesContainer
        if (!filesContainer) return;
        
        const paginationNav = document.createElement('nav');
        paginationNav.setAttribute('aria-label', 'Images pagination');
        paginationNav.innerHTML = '<ul class="pagination justify-content-center" id="pagination"></ul>';
        
        // Вставляем внутрь filesContainer после фотографий
        filesContainer.appendChild(paginationNav);
    }

    function renderPagination(currentPage, totalPages) {
        """Render pagination buttons with active states"""
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';

        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<span class="page-link">Previous</span>`;
        if (currentPage > 1) {
            prevLi.innerHTML = `<a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>`;
        }
        pagination.appendChild(prevLi);


        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            li.innerHTML = i === currentPage
                ? `<span class="page-link" data-page="${i}">${i}<span class="sr-only">(current)</span></span>`
                : `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
            pagination.appendChild(li);
        }

        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<span class="page-link" data-page="${currentPage + 1}">Next</span>`;
        if (currentPage < totalPages) {
            nextLi.innerHTML = `<a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>`;
        }
        pagination.appendChild(nextLi);


    }


    document.addEventListener('click', async (event) => {
        // Обработка кликов по пагинации
        console.log('Click detected on:', event.target); // Отладка
        if (event.target.matches('.page-link[data-page]')) {
            console.log('Pagination link clicked!'); // Отладка
            event.preventDefault();
            const page = parseInt(event.target.dataset.page);
            console.log('Loading page:', page); // Отладка
            displayFiles(page, 10);
            return;
        }
        
        // Обработка кликов по кнопкам удаления
        const btn = event.target.closest('.delete-btn');
        if (btn) {
            const filename = btn.dataset.filename;
            await fetchDelete(filename);
        }
    })


    async function fetchDelete(filename) {
        """Send delete request for image removal"""
        const result = await fetch(`/delete/${filename}`, {
            method: 'DELETE'
        })
        if (result.status !== 204) {
            alert("Failed to delete file");
            return;
        }

        // После удаления перезагружаем текущую страницу
        displayFiles(1, 10)


    }



    async function handleAndStoreFiles(file){
        """Process file uploads with client-side validation"""
        if (!file) {
            return;
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const MAX_SIZE_MB = 5;
        const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

            if (!allowedTypes.includes(file.type) || file.size > MAX_SIZE_BYTES) {
                alert("File type not allowed or file size too large");
                return
            }

            try {
                const response = await fetch('/upload', {
                method: 'POST',
                headers: {'X-Filename': file.name},
                body: file,
                });
                const data = await response.json();
                console.log(data)
                if (currentUploadInput) {
                    currentUploadInput.value = data.url;
                    }


                } catch (error) {
                console.error('Error during upload:', error);
                    }
    };

    if (copyButton && currentUploadInput) {
        copyButton.addEventListener('click', () => {
            const textToCopy = currentUploadInput.value;

            if (textToCopy && textToCopy !== 'https://') {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    copyButton.textContent = 'COPIED!';
                    setTimeout(() => {
                        copyButton.textContent = 'COPY';
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            }
        });
    }


    fileUpload.addEventListener('change', (event) => {

        handleAndStoreFiles(event.target.files[0]);
        event.target.value = '';
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    dropzone.addEventListener('drop', (event) => {
        handleAndStoreFiles(event.dataTransfer.files[0]);
    });

    updateTabStyles(true);
});