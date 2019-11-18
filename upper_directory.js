function getUpperDirectory(path, sep = "/"){
    if(path === sep){
        return sep;
    } else {
        const upperDirectory = path.split(sep).slice(0, -1).join(sep);
        return (!upperDirectory ? sep : upperDirectory);
    }
}

function injectUpperDirectoryRow(){
    let table = document.querySelector("#panel table.table"),
        currentPath = document.querySelector("#directory").value;
    let newRow = table.insertRow(1);
    newRow.innerHTML = `<tr><td>drwxr-xr-x</td><td>??</td><td>??</td><td>0 B</td><td>??</td><td>0</td><td>0 B</td><td><a style="cursor:pointer" class="explorer-browse-links" href="#${getUpperDirectory(currentPath)}">..</a></td></tr>`
}

const isOnRightPage = document.location.href.includes("explorer.html")
                      && document.querySelector(".navbar-brand")
                      && document.querySelector(".navbar-brand").innerText === "Hadoop";

if(isOnRightPage){
    // Try to inject the row directly (in case the array is already loaded)
    try {
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
