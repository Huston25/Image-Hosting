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
        if (isImagesPage) {
            uploadTab.classList.remove('upload__tab--active');
            imagesTab.classList.add('upload__tab--active');
            uploadForm.style.display = 'none';
            filesWrapper.style.display = 'flex';
        } else {
            imagesTab.classList.remove('upload__tab--active');
            uploadTab.classList.add('upload__tab--active');
            uploadForm.style.display = 'flex';
            filesWrapper.style.display = 'none';

            const params = new URLSearchParams(window.location.search)
            let page = params.get('page') ? params.get('page') : 1;
            let page_size = params.get('page_size') ? params.get('page_size') : 10;

            displayFiles(page, page_size);
        }
    };
    imagesTab.addEventListener('click', () => {
        updateTabStyles(true);
    })
    uploadTab.addEventListener('click', () => {
        updateTabStyles(false);
    })




    async function displayFiles(page, pageSize){

        const result = await fetch(`/get_images/?page=${page}&page_size=${pageSize}`)
        const images = await result.json();
        console.log('Ответ от сервера:', images);

        if (!Array.isArray(images)) {
            console.error('Ожидался массив изображений, но сервер вернул:', images);
            return;
        }

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
        }
    };


    document.addEventListener('click', async (event) => {
        const btn = event.target.closest('.delete-btn');
        if (btn) {
            const filename = btn.dataset.filename;
            await fetchDelete(filename);
        }
    })


    async function fetchDelete(filename) {
        const result = await fetch(`/delete/${filename}`, {
            method: 'DELETE'
        })
        if (result.status !== 204) {
            alert("Failed to delete file");
            return;

        }
        const params = new URLSearchParams(window.location.search)
        let page = params.get('page') ? params.get('page') : 1;
        let page_size = params.get('page_size') ? params.get('page_size') : 10;



        displayFiles(page, page_size)


    }



    async function handleAndStoreFiles(file){
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

    updateTabStyles();
});