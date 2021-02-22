
let socket = null;
(() => {
    // TODO, change for production
    // const URL = "http://127.0.0.1:3000/";
    const URL = "https://crane-jw42.herokuapp.com/";
    // socket = io(URL, { autoConnect: false });
    socket = io(URL);

    const bootstrap = window.bootstrap;

    const search = async (query) => {

        // const collapse = document.querySelector('#collapseResults');
        // // const bsCollapse =  new bootstrap.Collapse(collapse);
        const resultsContainer = document.querySelector('#resultsContainer');
        
        while (resultsContainer.firstChild) {
            resultsContainer.removeChild(resultsContainer.firstChild);
        }

        const url = `/search?value=${query}`;
        const response = await fetch(url, {
            method: 'GET',
            mode: 'same-origin',
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow',
            referrerPolicy: 'no-referrer', 
        });
        let results = await response.json();
        
        let li = document.createElement('li');
        li.classList.add('list-group-item');
        li.innerHTML = "Users:";
        resultsContainer.appendChild(li);
        if (results.userResults.length < 1) {
            li = document.createElement('li');
            li.classList.add('list-group-item');
            li.innerHTML = "None Found";
            resultsContainer.appendChild(li);
        } else {
            results.userResults.forEach(userName => {
                const li = document.createElement('a');
                li.classList.add('list-group-item');
                li.innerHTML = userName;
                li.href = `/users/${userName}`;
                resultsContainer.appendChild(li);
            });
        }

        li = document.createElement('li');
        li.classList.add('list-group-item');
        li.innerHTML = "Flocks:";
        resultsContainer.appendChild(li);

        if (results.flockResults.length < 1) {
            li = document.createElement('li');
            li.classList.add('list-group-item');
            li.innerHTML = "None Found";
            resultsContainer.appendChild(li);
        } else {
            results.flockResults.forEach(name => {
                li = document.createElement('a');
                li.classList.add('list-group-item');
                li.innerHTML = name;
                li.href = `/flocks/${name}`;
                resultsContainer.appendChild(li);
            });
        }


    }

    const searchForm = document.querySelector('#searchForm');
    const searchField = document.querySelector('#searchInput');
    
    searchForm.addEventListener('submit', e => {
        e.preventDefault();
        search(searchField.value);
    });

    // searchField.addEventListener('change', e => {
    //     search(searchField.value);
    // });

})()
export default socket;
