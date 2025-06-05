let alreadyFetchedUsers = [];
let currentSort = { column: null, direction: null };
let currentSearchTerm = "";
let currentGenderFilter = "";

async function fetchUsers() {
  const response = await fetch("https://randomuser.me/api/?results=20");
  const data = await response.json();
  return data.results;
}

function renderUsers(usersToRender) {
  const usersDisplayed = document.getElementById("users-displayed");
  usersDisplayed.textContent = `Number of users displayed: ${usersToRender.length} of ${alreadyFetchedUsers.length}`;
  const tbody = document.querySelector("#tbl-users tbody");
  tbody.innerHTML = "";
  const rows = usersToRender.map((user) => {
    const gender = user.gender === "female" ? "👩" : "👨";
    return `
      <tr>
        <td><img src="${user.picture.thumbnail}" alt="User thumbnail"></td>
        <td>${user.name.first} ${user.name.last}</td>
        <td>${gender}</td>
        <td>${user.email}</td>
        <td>${user.phone}</td>
        <td>${user.dob.age}</td>
      </tr>
    `;
  });
  tbody.innerHTML = rows.join("");
}

function _searchUsersByName(usersList, searchTerm) {
  const _removeAccents = (str) =>
    str
      .normalize("NFD")
      .toLowerCase()
      .replace(/[\u0300-\u036f]/g, "");

  const normalizedSearch = _removeAccents(searchTerm);
  if (!normalizedSearch) return usersList;
  return usersList.filter((user) => {
    const fullName = `${user.name.first} ${user.name.last}`;
    const normalizedFullName = _removeAccents(fullName);
    return normalizedFullName.includes(normalizedSearch);
  });
}

function _filterUsersByGender(usersList) {
  if (!currentGenderFilter) return usersList;
  return usersList.filter((user) => user.gender === currentGenderFilter);
}

function _updateSortIndicators() {
  const ths = document.querySelectorAll("#tbl-users th[data-sort]");
  ths.forEach((th) => {
    th.classList.remove("sorted-asc", "sorted-desc");
    if (th.dataset.sort === currentSort.column && currentSort.direction) {
      th.classList.add(
        currentSort.direction === "asc" ? "sorted-asc" : "sorted-desc"
      );
    }
  });
}

function _sortUsers(processedUsers, currentSort) {
  if (currentSort.column && currentSort.direction) {
    processedUsers = processedUsers.toSorted((a, b) => {
      const getValue = (obj, path) =>
        path
          .split(".")
          .reduce(
            (o, key) =>
              o && typeof o === "object" && key in o ? o[key] : undefined,
            obj
          );
      let valA = getValue(a, currentSort.column);
      let valB = getValue(b, currentSort.column);

      const directionPonderation = currentSort.direction === "asc" ? 1 : -1;
      if (typeof valA === "number" && typeof valB === "number") {
        return (valA - valB) * directionPonderation;
      }

      return String(valA).localeCompare(String(valB)) * directionPonderation;
    });
  }
  return processedUsers;
}

function applyFiltersAndSort() {
  let processedUsers = alreadyFetchedUsers;
  processedUsers = _searchUsersByName(processedUsers, currentSearchTerm);
  processedUsers = _filterUsersByGender(processedUsers, currentGenderFilter);
  processedUsers = _sortUsers(processedUsers, currentSort);
  renderUsers(processedUsers);
  _updateSortIndicators();
}

function handleSortClick(columnToSort) {
  if (currentSort.column !== columnToSort) {
    currentSort.column = columnToSort;
    currentSort.direction = "asc";
  } else if (currentSort.direction === "asc") {
    currentSort.direction = "desc";
  } else if (currentSort.direction === "desc") {
    currentSort.column = null;
    currentSort.direction = null;
  }
  applyFiltersAndSort();
}

document.getElementById("fetch-users").addEventListener("click", async () => {
  const fetchedData = await fetchUsers();
  const existingEmails = new Set(alreadyFetchedUsers.map((u) => u.email));
  const newUsers = fetchedData.filter((u) => !existingEmails.has(u.email));
  alreadyFetchedUsers = [...alreadyFetchedUsers, ...newUsers];

  currentSearchTerm = "";
  currentGenderFilter = "";
  currentSort = { column: null, direction: null };
  const searchInput = document.getElementById("search-users-input");
  if (searchInput) searchInput.value = "";
  document.getElementById("filter-users-by-gender").value = "";

  applyFiltersAndSort();
});

document
  .getElementById("search-users-input")
  .addEventListener("input", (event) => {
    currentSearchTerm = event.target.value;
    applyFiltersAndSort();
  });

document
  .getElementById("filter-users-by-gender")
  .addEventListener("change", (event) => {
    currentGenderFilter = event.target.value;
    applyFiltersAndSort();
  });

document.querySelectorAll("#tbl-users th[data-sort]").forEach((th) => {
  th.addEventListener("click", () => handleSortClick(th.dataset.sort));
});
