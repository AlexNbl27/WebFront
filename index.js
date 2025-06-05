let users = [];
let pristineFetchedUsers = [];
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
  usersDisplayed.textContent = `Number of users displayed: ${usersToRender.length} of ${pristineFetchedUsers.length}`;
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

function searchUsersByName(usersList, searchTerm) {
  const _removeAccents = (str) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const normalizedSearch = _removeAccents(searchTerm.toLowerCase());
  if (!normalizedSearch) return usersList;
  return usersList.filter((user) => {
    const fullName = `${user.name.first} ${user.name.last}`;
    const normalizedFullName = _removeAccents(fullName.toLowerCase());
    return normalizedFullName.includes(normalizedSearch);
  });
}

function filterUsersByGender(usersList, gender) {
  if (gender === "male" || gender === "female") {
    return usersList.filter((user) => user.gender === gender);
  }
  return usersList;
}

function updateSortIndicators() {
  const ths = document.querySelectorAll("#tbl-users th[data-sort]");
  ths.forEach(th => {
    th.classList.remove("sorted-asc", "sorted-desc");
    if (th.dataset.sort === 'dob.age') {
      th.textContent = 'Age'; // Base text
    }

    if (th.dataset.sort === currentSort.column && currentSort.direction) {
      th.classList.add(currentSort.direction === "asc" ? "sorted-asc" : "sorted-desc");
      const arrow = currentSort.direction === "asc" ? " ↑" : " ↓";
      if (th.dataset.sort === 'dob.age') {
        th.textContent = `Age${arrow}`;
      }
    }
  });
}

function applyFiltersAndSort() {
  let processedUsers = [...pristineFetchedUsers];

  // 1. Apply Search Filter
  processedUsers = searchUsersByName(processedUsers, currentSearchTerm);

  // 2. Apply Gender Filter
  processedUsers = filterUsersByGender(processedUsers, currentGenderFilter);

  // 3. Apply Sorting
  if (currentSort.column && currentSort.direction) {
    processedUsers.sort((a, b) => {
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

      if (currentSort.column === "dob.age") {
        valA = Number(valA);
        valB = Number(valB);
      } else if (typeof valA === "string" && typeof valB === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      } else {
        if (valA === undefined || valA === null) return currentSort.direction === "asc" ? -1 : 1;
        if (valB === undefined || valB === null) return currentSort.direction === "asc" ? 1 : -1;
      }

      if (valA < valB) return currentSort.direction === "asc" ? -1 : 1;
      if (valA > valB) return currentSort.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  users = processedUsers;
  renderUsers(users);
  updateSortIndicators();
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
  const existingEmails = new Set(pristineFetchedUsers.map(u => u.email));
  const newUsers = fetchedData.filter(u => !existingEmails.has(u.email));
  pristineFetchedUsers = [...pristineFetchedUsers, ...newUsers];

  currentSearchTerm = "";
  currentGenderFilter = "";
  currentSort = { column: null, direction: null };
  const searchInput = document.getElementById("search-users-input");
  if (searchInput) searchInput.value = "";
  document.getElementById("filter-users-by-gender").value = "";

  applyFiltersAndSort();
});

const searchInputElement = document.getElementById("search-users-input") || document.getElementById("search-users");
searchInputElement.addEventListener("input", (event) => {
  currentSearchTerm = event.target.value;
  applyFiltersAndSort();
});

document.getElementById("filter-users-by-gender").addEventListener("change", (event) => {
  currentGenderFilter = event.target.value;
  applyFiltersAndSort();
});

document.querySelectorAll("#tbl-users th[data-sort]").forEach((th) => {
  th.addEventListener("click", () => handleSortClick(th.dataset.sort));
});