// document.addEventListener("DOMContentLoaded", () => {
//     const searchButton = document.getElementById("searchButton");
//     const searchInput = document.getElementById("search");
//     const resultDiv = document.getElementById("result");

//     searchButton.addEventListener("click", async() => {
//         const searchTerm = searchInput.value;
//         if (searchTerm) {
//             try {
//                 const response = await fetch(`/Read/users/${searchTerm}`);
//                 const data = await response.json();
//                 resultDiv.innerHTML = JSON.stringify(data, null, 2);
//             } catch (error) {
//                 console.error("Error fetching data:", error);
//                 resultDiv.innerHTML = "An error occurred.";
//             }
//         } else {
//             resultDiv.innerHTML = "Please enter a search term.";
//         }
//     });
// });
document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.getElementById("searchButton");
    const createButton = document.getElementById("createButton");
    const searchInput = document.getElementById("search");
    const tableBody = document.getElementById("table-body");

    // const fetchData = async() => {
    //     try {
    //         const response = await fetch("http://localhost:3003/data/users");
    //         const data = await response.json();
    //         // console.log(data['took']);
    //         return data;
    //     } catch (error) {
    //         console.error("Error fetching data:", error);
    //         return [];
    //     }
    // };

    const fetchData = async() => {
        try {
            const response = await fetch("http://localhost:3003/data/users");
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            const mydata = data['hits']['hits'];
            return Array.isArray(mydata) ? mydata : [];
        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }
    };


    const renderTable = async() => {
        const data = await fetchData();
        console.log(data);
        tableBody.innerHTML = "";

        data.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item['_source'].nom}</td>
                <td>${item['_source'].email}</td>
                <td>${item['_source'].pays}</td>
                <td>${item['_source'].age}</td>
                <td>${item['_source'].agence}</td>
                <td>${item['_source'].fonction}</td>
                <td>${item['_source'].description}</td>
                <td>${item['_source'].inscription}</td>
                <td>
                    <button type="button" class="btn btn-success" data-id="${item['_source'].id}">Update</button>
                    <button type="button" class="btn btn-warning" data-id="${item['_source'].id}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        const updateButtons = document.querySelectorAll(".update-btn");
        updateButtons.forEach(button => {
            button.addEventListener("click", handleUpdate);
        });

        const deleteButtons = document.querySelectorAll(".delete-btn");
        deleteButtons.forEach(button => {
            button.addEventListener("click", handleDelete);
        });
    };

    const handleUpdate = event => {
        const id = event.target.getAttribute("data-id");
        console.log("Update button clicked for ID:", id);
    };

    const handleDelete = event => {
        const id = event.target.getAttribute("data-id");
        console.log("Delete button clicked for ID:", id);
    };

    searchButton.addEventListener("click", renderTable);
    // createButton.addEventListener("click", handleCreate);

    renderTable();
});