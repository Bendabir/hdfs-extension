function getUpperDirectory(path, sep = "/"){
    if(path === sep){
        return sep;
    } else {
        const upperDirectory = path.split(sep).slice(0, -1).join(sep);
        return (!upperDirectory ? sep : upperDirectory);
    }
}

function generateHierarchy(path, sep = "/"){
    var dirs = [];
    var paths = [];

    if (path === sep) {
        dirs = [""];
        paths = [[sep, ""]];
    } else {
        dirs = path.split(sep);
        // A bit dirty, there is probably a cleaner way to achieve this
        paths = dirs.reduce((path, dir, index) => {
            if (path.length <= index) {
                path.push([]);
            }

            if (index > 0) {
                path[index] = path[index - 1].concat(path[index])
            }

            path[index].push(dir)

            return path
        }, []);
    }

    return paths.map((dirs) => {
        var dir = dirs[dirs.length - 1];

        if (dir.length === 0) {
            dir = sep;
            dirs[dirs.length - 1] = sep;
        }

        return [dir, dirs.join(sep)];
    });
}

function injectBreadcrumbs(){
    const currentPath = document.querySelector("#directory").value;
    const paths = generateHierarchy(currentPath);
    const row = document.querySelector("#directory").parentElement
                                                    .parentElement
                                                    .parentElement;

    let container = document.createElement("ul");
    container.className = "breadcrumb";
    row.insertBefore(container, row.firstElementChild);

    paths.forEach((entry, index) => {
        let [dir, path] = entry;

        if (index === 0){
            dir = "root";
        }

        const element = document.createElement("li");

        if (index === (paths.length - 1)) {
            element.className = "active";
            element.innerHTML = dir;
        } else {
            element.innerHTML = `<a href="#${path}">${dir}</a>`;
        }

        container.appendChild(element);
    });
}

function clearBreadcrumbs(){
    const breadcrumbs = document.querySelector("ul.breadcrumb");

    if (breadcrumbs) {
        breadcrumbs.remove();
    }
}

function injectUpperDirectoryRow(){
    let table = document.querySelector("#panel table.table"),
        currentPath = document.querySelector("#directory").value;
    let newRow = table.insertRow(1);
    newRow.innerHTML = `<tr><td>drwxr-xr-x</td><td>??</td><td>??</td><td>0 B</td><td>??</td><td>0</td><td>0 B</td><td><a style="cursor:pointer" class="explorer-browse-links" href="#${getUpperDirectory(currentPath)}">..</a></td></tr>`;

    clearBreadcrumbs();
    injectBreadcrumbs();
}

function injectReloadButton(){
    let reloadButton = document.createElement("button")
    reloadButton.setAttribute("type", "button")
    reloadButton.className = "btn btn-default"
    reloadButton.innerText = "Reload"
    reloadButton.style = "float: right;"

    // On click, reload the page
    reloadButton.addEventListener("click", () => {
        document.location.reload();
    });

    document.querySelector(".page-header h1").appendChild(reloadButton)
}

const isOnRightPage = document.location.href.includes("explorer.html")
                      && document.querySelector(".navbar-brand")
                      && document.querySelector(".navbar-brand").innerText === "Hadoop";

if(isOnRightPage){
    try {
        injectReloadButton();
        // Try to inject the row directly (in case the array is already
        // loaded)
        injectUpperDirectoryRow();
    } catch(e) {
        // Do nothing, we'll rely on the mutation observer
    } finally {
        // Listening to changes on the panel to dynamically inject a new
        // row with the upper directory
        const observer = new MutationObserver((mutations, observer) => {
            if(mutations){
                for(let m of mutations){
                    if(m.type === "childList"){
                        injectUpperDirectoryRow();
                        break;
                    }
                }
            }
        });

        // Actually listening to mutations
        observer.observe(document.querySelector("#panel"), {childList: true});
    }
}
