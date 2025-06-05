let users = [];

async function fetchUsers() {
  const response = await fetch("https://randomuser.me/api/?results=20");
  const data = await response.json();
  users = data.results;
  return users;
}

function renderUsers(renderedUsers) {
  const usersDisplayed = document.getElementById("users-displayed");
  usersDisplayed.textContent = `Number of users displayed: ${renderedUsers.length} on ${users.length}`;
  const tbody = document.querySelector("#tbl-users tbody");
  tbody.innerHTML = "";
  const rows = renderedUsers.map((user) => {
    const gender = user.gender === "female" ? "👩" : "👨";
    return `
            <tr>
                <td><img src="${user.picture.thumbnail}" alt=""></td>
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

function searchUsersByName(users, searchTerm) {
  const _removeAccents = (str) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const normalizedSearch = _removeAccents(searchTerm.toLowerCase());
  return users.filter((user) => {
    const fullName = `${user.name.first} ${user.name.last}`;
    const normalizedFullName = _removeAccents(fullName.toLowerCase());
    return normalizedFullName.includes(normalizedSearch);
  });
}

function filterUsersByGender(users, gender) {
  if (gender === "male" || gender === "female") {
    return users.filter((user) => user.gender === gender);
  }
  return users;
}

let currentSort = { column: null, direction: null };

function sortTable(columnToSort) {
  const ths = document.querySelectorAll("#tbl-users th");
  ths.forEach((th) => {
    th.classList.remove("sorted-asc", "sorted-desc");
  });

  if (currentSort.column !== columnToSort) {
    currentSort.column = columnToSort;
    currentSort.direction = "asc";
  } else if (currentSort.direction === "asc") {
    currentSort.direction = "desc";
  } else if (currentSort.direction === "desc") {
    currentSort.column = null;
    currentSort.direction = null;
  }

  let usersToDisplay;
  if (currentSort.direction) {
    users.sort((a, b) => {
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
        if (valA === undefined || valA === null)
          return currentSort.direction === "asc" ? -1 : 1;
        if (valB === undefined || valB === null)
          return currentSort.direction === "asc" ? 1 : -1;
      }
      if (valA < valB) return currentSort.direction === "asc" ? -1 : 1;
      if (valA > valB) return currentSort.direction === "asc" ? 1 : -1;
      return 0;
    });
    usersToDisplay = users;
    const activeTh = document.querySelector(
      `#tbl-users th[data-sort="${currentSort.column}"]`
    );
    if (activeTh) {
      activeTh.classList.add(
        currentSort.direction === "asc" ? "sorted-asc" : "sorted-desc"
      );
      activeTh.textContent = activeTh.textContent = ` ${
        currentSort.direction === "asc" ? "Age ↑" : " Age ↓"
      }`;
    }
  } else {
    users = [...pristineFetchedUsers];
    usersToDisplay = users;
    activeTh.textContent = activeTh.textContent = ` ${"Age"}`;
  }
  renderUsers(usersToDisplay);
}

document.querySelectorAll("#tbl-users th[data-sort]").forEach((th) => {
  th.addEventListener("click", () => sortTable(th.dataset.sort));
});

document.getElementById("fetch-users").addEventListener("click", async () => {
  users = await fetchUsers();
  renderUsers(users);
});

document
  .getElementById("search-users")
  .addEventListener("input", async (event) => {
    const searchTerm = event.target.value;
    const filteredUsers = searchUsersByName(users, searchTerm);
    renderUsers(filteredUsers);
  });

document
  .getElementById("filter-users")
  .addEventListener("change", async (event) => {
    const selectedOption = event.target.value;
    const filteredUsers = filterUsersByGender(users, selectedOption);
    renderUsers(filteredUsers);
  });
